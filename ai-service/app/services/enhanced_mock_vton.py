"""
Enhanced Mock VTON
==================
A significantly improved mock that attempts to composite a real garment image
onto a real avatar photo using PIL. Used when no real VTON API key is configured.

Improvements over original mock:
- Downloads the actual avatar and garment images when URLs are provided
- Overlays the garment image onto the torso area of the avatar
- Applies alpha blending for a natural composite look
- Falls back gracefully to the stylised silhouette if downloads fail
"""
import io
import logging
import time
from typing import Dict, Any, List

import httpx
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

from app.services import storage

logger = logging.getLogger("ai-service.enhanced_mock_vton")

# --- Torso placement ratios (relative to image size) ---
# These define where on the avatar the garment is composited.
_TORSO_TOP_RATIO = 0.25      # garment top edge starts at 25% down from top
_TORSO_HEIGHT_RATIO = 0.45   # garment covers 45% of image height
_TORSO_WIDTH_RATIO = 0.70    # garment covers 70% of image width


async def generate_enhanced_mock_tryon(
    job_id: str,
    user_id: str,
    avatar_url: str | None = None,
    garments: List[Dict[str, Any]] | None = None,
) -> Dict[str, Any]:
    """
    Generates an enhanced mock virtual try-on composite image.

    1. Downloads the avatar image (if URL provided and reachable).
    2. Downloads the primary garment image (if URL provided and reachable).
    3. Composites the garment onto the avatar's torso area.
    4. Uploads result to MinIO/S3 and returns key + URL.
    """
    start_time = time.time()
    width, height = 640, 854  # Portrait 3:4 ratio

    # --- Step 1: Get the base avatar ---
    base_img, avatar_loaded = await _load_avatar(avatar_url, width, height)
    draw = ImageDraw.Draw(base_img)

    # --- Step 2: Overlay the primary garment ---
    garment_overlaid = False
    if garments:
        primary_garment = garments[0]
        garment_url = primary_garment.get("imageUrl")
        if garment_url:
            garment_overlaid = await _overlay_garment(
                base_img, garment_url, width, height
            )

    # --- Step 3: Render informational overlay ---
    _draw_overlay(draw, job_id, garments or [], width, height, avatar_loaded, garment_overlaid)

    # --- Step 4: Final image post-processing ---
    # Slight sharpening for a crisper composite
    base_img = ImageEnhance.Sharpness(base_img).enhance(1.1)

    # --- Step 5: Encode and upload ---
    buffer = io.BytesIO()
    base_img.save(buffer, format="JPEG", quality=88, optimize=True)
    img_bytes = buffer.getvalue()

    result_key = f"tryon/{user_id}/{job_id}.jpg"
    storage.upload_bytes(img_bytes, result_key, content_type="image/jpeg")
    result_url = storage.get_object_url(result_key)

    elapsed_ms = int((time.time() - start_time) * 1000)
    logger.info(
        f"Enhanced mock try-on for job {job_id}: "
        f"avatar_loaded={avatar_loaded}, garment_overlaid={garment_overlaid}, "
        f"elapsed={elapsed_ms}ms"
    )

    return {
        "result_image_key": result_key,
        "result_image_url": result_url,
        "processing_time_ms": elapsed_ms,
    }


async def _load_avatar(
    avatar_url: str | None, width: int, height: int
) -> tuple[Image.Image, bool]:
    """Downloads the avatar image or generates a stylised silhouette fallback."""
    if avatar_url:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(avatar_url)
                if resp.status_code == 200:
                    raw = Image.open(io.BytesIO(resp.content)).convert("RGB")
                    # Resize to canvas while preserving aspect ratio
                    raw.thumbnail((width, height), Image.LANCZOS)
                    canvas = Image.new("RGB", (width, height), (245, 245, 247))
                    offset_x = (width - raw.width) // 2
                    offset_y = (height - raw.height) // 2
                    canvas.paste(raw, (offset_x, offset_y))
                    logger.debug(f"Avatar loaded from {avatar_url}")
                    return canvas, True
        except Exception as e:
            logger.debug(f"Could not download avatar: {e}")

    # Fallback: gradient canvas with stylised mannequin silhouette
    canvas = Image.new("RGB", (width, height), (245, 245, 247))
    draw = ImageDraw.Draw(canvas)
    for y in range(height):
        r = int(240 - (y / height) * 15)
        g = int(242 - (y / height) * 12)
        b = int(250 - (y / height) * 10)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Head
    cx = width // 2
    draw.ellipse([cx - 65, 60, cx + 65, 190], fill=(215, 200, 185), outline=(190, 175, 165), width=2)
    # Neck
    draw.rectangle([cx - 20, 190, cx + 20, 220], fill=(215, 200, 185))
    # Shoulders + torso (trapezoidal)
    draw.polygon(
        [(cx - 120, 225), (cx + 120, 225), (cx + 100, 480), (cx - 100, 480)],
        fill=(185, 195, 215)
    )
    # Arms
    draw.rounded_rectangle([cx - 155, 225, cx - 115, 430], radius=18, fill=(200, 190, 175))
    draw.rounded_rectangle([cx + 115, 225, cx + 155, 430], radius=18, fill=(200, 190, 175))
    # Legs
    draw.rounded_rectangle([cx - 90, 480, cx - 20, 740], radius=15, fill=(165, 175, 200))
    draw.rounded_rectangle([cx + 20, 480, cx + 90, 740], radius=15, fill=(165, 175, 200))
    return canvas, False


async def _overlay_garment(
    base_img: Image.Image, garment_url: str, width: int, height: int
) -> bool:
    """
    Downloads the garment image and composites it onto the torso region
    of the base avatar image. Returns True if the overlay succeeded.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(garment_url)
            if resp.status_code != 200:
                return False

        garment = Image.open(io.BytesIO(resp.content)).convert("RGBA")

        # Calculate target placement on the torso
        target_w = int(width * _TORSO_WIDTH_RATIO)
        target_h = int(height * _TORSO_HEIGHT_RATIO)
        garment.thumbnail((target_w, target_h), Image.LANCZOS)

        # Center horizontally; position vertically at torso top
        paste_x = (width - garment.width) // 2
        paste_y = int(height * _TORSO_TOP_RATIO)

        # Soften the garment edges for a more natural blend
        garment = _soften_edges(garment, radius=12)

        # Apply slight transparency for blending effect
        r, g, b, a = garment.split()
        a = ImageEnhance.Brightness(a).enhance(0.88)
        garment = Image.merge("RGBA", (r, g, b, a))

        # Composite onto base (which is RGB; convert temporarily)
        base_rgba = base_img.convert("RGBA")
        base_rgba.alpha_composite(garment, dest=(paste_x, paste_y))
        base_img.paste(base_rgba.convert("RGB"), (0, 0))

        logger.debug(f"Garment overlaid from {garment_url} at ({paste_x}, {paste_y})")
        return True

    except Exception as e:
        logger.debug(f"Could not overlay garment from {garment_url}: {e}")
        return False


def _soften_edges(img: Image.Image, radius: int) -> Image.Image:
    """Applies a feathered edge to the alpha channel of an RGBA image."""
    r, g, b, a = img.split()
    a_blurred = a.filter(ImageFilter.GaussianBlur(radius=radius))
    # Use the minimum of original and blurred to avoid expanding bright edges
    import PIL.ImageChops as chops
    a_soft = chops.darker(a, a_blurred)
    return Image.merge("RGBA", (r, g, b, a_soft))


def _draw_overlay(
    draw: ImageDraw.ImageDraw,
    job_id: str,
    garments: List[Dict[str, Any]],
    width: int,
    height: int,
    avatar_loaded: bool,
    garment_overlaid: bool,
) -> None:
    """Draws informational overlay badges and labels onto the result image."""
    # Top badge
    draw.rounded_rectangle([12, 12, width - 12, 58], radius=8, fill=(15, 23, 42))
    draw.text((24, 22), "✦ AI VIRTUAL WARDROBE  ·  TRY-ON PREVIEW", fill=(248, 250, 252))
    draw.text((width - 160, 24), f"#{job_id[:8].upper()}", fill=(100, 116, 139))

    # Mode indicator badge
    mode_text = "REAL COMPOSITE" if (avatar_loaded and garment_overlaid) else (
        "AVATAR LOADED" if avatar_loaded else "MOCK MODE"
    )
    mode_color = (16, 185, 129) if (avatar_loaded and garment_overlaid) else (
        (59, 130, 246) if avatar_loaded else (107, 114, 128)
    )
    badge_w = 160
    draw.rounded_rectangle(
        [width - badge_w - 12, 66, width - 12, 92],
        radius=6, fill=mode_color
    )
    draw.text((width - badge_w - 4, 72), f"  {mode_text}", fill=(255, 255, 255))

    # Bottom garment info panel
    if garments:
        panel_top = height - 100
        draw.rounded_rectangle(
            [12, panel_top, width - 12, height - 12],
            radius=8, fill=(255, 255, 255, 230)
        )
        draw.text((24, panel_top + 10), f"OUTFIT ({len(garments)} item{'s' if len(garments) != 1 else ''}):", fill=(51, 65, 85))

        x_pos = 24
        for g in garments[:4]:
            cat = g.get("category", "ITEM").upper()
            sub = g.get("subcategory") or ""
            label = f"• {cat}" + (f"  ({sub})" if sub else "")
            draw.text((x_pos, panel_top + 34), label, fill=(15, 23, 42))
            x_pos += max(len(label) * 7 + 20, 140)

    # Footer watermark
    draw.text(
        (24, height - 28),
        "Virtual Wardrobe — Enhanced Mock VTON  |  Phase 10",
        fill=(148, 163, 184)
    )

