package com.wardrobe.outfit.service;

import com.wardrobe.common.exception.BadRequestException;
import com.wardrobe.outfit.dto.GenerateAutomaticOutfitRequest;
import com.wardrobe.outfit.dto.OccasionType;
import com.wardrobe.wardrobe.entity.WardrobeItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Component
public class AutomaticOutfitRuleEngine {

    private static final Set<String> NEUTRAL_COLORS = new HashSet<>(Arrays.asList(
            "black", "white", "gray", "charcoal gray", "light gray",
            "beige", "tan", "cream", "navy blue", "dark slate gray", "brown"));

    private static final Map<OccasionType, List<String>> OCCASION_TOP_PREFERENCES = Map.of(
            OccasionType.CASUAL, List.of("t-shirt", "polo", "hoodie", "sweater", "shirt", "top"),
            OccasionType.FORMAL, List.of("shirt", "button-down", "blouse", "polo"),
            OccasionType.WORK, List.of("shirt", "button-down", "blouse", "polo", "sweater"),
            OccasionType.PARTY, List.of("blouse", "shirt", "top", "polo"),
            OccasionType.SUMMER, List.of("t-shirt", "polo", "tank", "short-sleeve", "shirt"),
            OccasionType.WINTER, List.of("sweater", "hoodie", "cardigan", "turtleneck", "thermal"),
            OccasionType.MINIMAL, List.of("t-shirt", "shirt", "sweater", "polo"),
            OccasionType.LOUNGEWEAR, List.of("hoodie", "t-shirt", "sweater"),
            OccasionType.ACTIVEWEAR, List.of("t-shirt", "tank", "hoodie"));

    private static final Map<OccasionType, List<String>> OCCASION_BOTTOM_PREFERENCES = Map.of(
            OccasionType.CASUAL, List.of("jeans", "shorts", "chinos", "joggers", "pants"),
            OccasionType.FORMAL, List.of("trousers", "slacks", "skirt", "pants"),
            OccasionType.WORK, List.of("trousers", "slacks", "chinos", "skirt", "pants"),
            OccasionType.PARTY, List.of("skirt", "trousers", "jeans", "pants"),
            OccasionType.SUMMER, List.of("shorts", "skirt", "linen pants", "jeans"),
            OccasionType.WINTER, List.of("jeans", "trousers", "pants", "wool trousers"),
            OccasionType.MINIMAL, List.of("trousers", "jeans", "chinos", "pants"),
            OccasionType.LOUNGEWEAR, List.of("joggers", "sweatpants", "shorts"),
            OccasionType.ACTIVEWEAR, List.of("shorts", "joggers", "leggings"));

    public List<WardrobeItem> generateOutfit(List<WardrobeItem> wardrobe, GenerateAutomaticOutfitRequest request) {
        if (wardrobe == null || wardrobe.isEmpty()) {
            throw new BadRequestException(
                    "Your wardrobe is empty. Please upload some clothing items before generating outfits.");
        }

        OccasionType occasion = OccasionType.fromString(request.getOccasion());
        String targetSeason = request.getSeason() != null ? request.getSeason().trim().toUpperCase() : null;

        Map<String, List<WardrobeItem>> byCategory = wardrobe.stream()
                .filter(item -> item.getCategory() != null)
                .collect(Collectors.groupingBy(item -> item.getCategory().trim().toUpperCase()));

        List<WardrobeItem> tops = byCategory.getOrDefault("TOPS", Collections.emptyList());
        List<WardrobeItem> bottoms = byCategory.getOrDefault("BOTTOMS", Collections.emptyList());
        List<WardrobeItem> dresses = byCategory.getOrDefault("DRESSES", Collections.emptyList());
        List<WardrobeItem> outerwears = byCategory.getOrDefault("OUTERWEAR", Collections.emptyList());
        List<WardrobeItem> shoes = byCategory.getOrDefault("SHOES", Collections.emptyList());

        boolean hasTwoPiece = !tops.isEmpty() && !bottoms.isEmpty();
        boolean hasDress = !dresses.isEmpty();

        if (!hasTwoPiece && !hasDress) {
            throw new BadRequestException(
                    "Insufficient wardrobe items to generate a complete outfit. You need at least a top and bottom, or a dress.");
        }

        List<WardrobeItem> selectedItems = new ArrayList<>();

        // Determine whether to use Dress or Top+Bottom
        boolean chooseDress = hasDress
                && (occasion == OccasionType.PARTY || !hasTwoPiece || (ThreadLocalRandom.current().nextDouble() < 0.3));

        if (chooseDress) {
            WardrobeItem bestDress = pickBestSingleItem(dresses, occasion, targetSeason);
            selectedItems.add(bestDress);
        } else {
            // Find best matching Top + Bottom pair
            Pair<WardrobeItem, WardrobeItem> bestPair = findBestTopBottomPair(tops, bottoms, occasion, targetSeason);
            selectedItems.add(bestPair.first);
            selectedItems.add(bestPair.second);
        }

        // Add Outerwear if requested or appropriate for occasion (e.g. Winter / Formal)
        boolean shouldIncludeOuterwear = Boolean.TRUE.equals(request.getIncludeOuterwear())
                || occasion == OccasionType.WINTER;
        if (shouldIncludeOuterwear && !outerwears.isEmpty()) {
            WardrobeItem bestOuter = pickBestComplementaryItem(outerwears, selectedItems, occasion, targetSeason);
            if (bestOuter != null) {
                selectedItems.add(bestOuter);
            }
        }

        // Add Shoes if requested
        if (Boolean.TRUE.equals(request.getIncludeShoes()) && !shoes.isEmpty()) {
            WardrobeItem bestShoes = pickBestComplementaryItem(shoes, selectedItems, occasion, targetSeason);
            if (bestShoes != null) {
                selectedItems.add(bestShoes);
            }
        }

        return selectedItems;
    }

    private Pair<WardrobeItem, WardrobeItem> findBestTopBottomPair(
            List<WardrobeItem> tops,
            List<WardrobeItem> bottoms,
            OccasionType occasion,
            String targetSeason) {

        List<ScoredPair> scoredPairs = new ArrayList<>();

        for (WardrobeItem top : tops) {
            for (WardrobeItem bottom : bottoms) {
                double score = scoreItemPair(top, bottom, occasion, targetSeason);
                // add slight random jitter for variety when scores are close
                score += ThreadLocalRandom.current().nextDouble(0.0, 2.0);
                scoredPairs.add(new ScoredPair(top, bottom, score));
            }
        }

        scoredPairs.sort((a, b) -> Double.compare(b.score, a.score));
        ScoredPair best = scoredPairs.get(0);
        return new Pair<>(best.top, best.bottom);
    }

    private double scoreItemPair(WardrobeItem top, WardrobeItem bottom, OccasionType occasion, String targetSeason) {
        double score = 50.0;

        // Color harmony
        score += scoreColorHarmony(top.getColor(), bottom.getColor(), occasion);

        // Season affinity
        if (targetSeason != null) {
            if (matchesSeason(top.getSeason(), targetSeason))
                score += 15.0;
            if (matchesSeason(bottom.getSeason(), targetSeason))
                score += 15.0;
        } else if (occasion == OccasionType.SUMMER) {
            if (matchesSeason(top.getSeason(), "SUMMER"))
                score += 12.0;
            if (matchesSeason(bottom.getSeason(), "SUMMER"))
                score += 12.0;
        } else if (occasion == OccasionType.WINTER) {
            if (matchesSeason(top.getSeason(), "WINTER"))
                score += 12.0;
            if (matchesSeason(bottom.getSeason(), "WINTER"))
                score += 12.0;
        }

        // Subcategory occasion preferences
        List<String> topPrefs = OCCASION_TOP_PREFERENCES.getOrDefault(occasion, Collections.emptyList());
        if (top.getSubcategory() != null && matchesSubcategory(top.getSubcategory(), topPrefs)) {
            score += 10.0;
        }

        List<String> bottomPrefs = OCCASION_BOTTOM_PREFERENCES.getOrDefault(occasion, Collections.emptyList());
        if (bottom.getSubcategory() != null && matchesSubcategory(bottom.getSubcategory(), bottomPrefs)) {
            score += 10.0;
        }

        // Pattern harmony: Avoid clashing busy patterns (e.g. striped top + graphic
        // bottom)
        if (isBusyPattern(top.getPattern()) && isBusyPattern(bottom.getPattern())) {
            score -= 15.0;
        }

        return score;
    }

    private double scoreColorHarmony(String color1, String color2, OccasionType occasion) {
        if (color1 == null || color2 == null)
            return 5.0;

        String c1 = color1.trim().toLowerCase();
        String c2 = color2.trim().toLowerCase();

        boolean c1Neutral = NEUTRAL_COLORS.contains(c1);
        boolean c2Neutral = NEUTRAL_COLORS.contains(c2);

        if (occasion == OccasionType.MINIMAL) {
            // Minimal prefers neutrals
            if (c1Neutral && c2Neutral)
                return 20.0;
            if (c1Neutral || c2Neutral)
                return 8.0;
            return 2.0;
        }

        // Neutral + Accent is the most versatile combination
        if ((c1Neutral && !c2Neutral) || (!c1Neutral && c2Neutral)) {
            return 18.0;
        }

        // Both neutrals (e.g. Navy + White, Black + Gray)
        if (c1Neutral && c2Neutral) {
            return 15.0;
        }

        // Monochromatic non-neutral (e.g. dark blue top + blue jeans)
        if (c1.contains(c2) || c2.contains(c1)) {
            return 12.0;
        }

        return 5.0;
    }

    private WardrobeItem pickBestSingleItem(List<WardrobeItem> items, OccasionType occasion, String targetSeason) {
        List<WardrobeItem> candidates = new ArrayList<>(items);
        candidates.sort((a, b) -> {
            double scoreA = scoreSingleItem(a, occasion, targetSeason);
            double scoreB = scoreSingleItem(b, occasion, targetSeason);
            return Double.compare(scoreB, scoreA);
        });
        return candidates.get(0);
    }

    private WardrobeItem pickBestComplementaryItem(
            List<WardrobeItem> candidates,
            List<WardrobeItem> currentOutfit,
            OccasionType occasion,
            String targetSeason) {

        if (candidates.isEmpty())
            return null;

        WardrobeItem best = null;
        double bestScore = -1.0;

        for (WardrobeItem item : candidates) {
            double score = scoreSingleItem(item, occasion, targetSeason);
            for (WardrobeItem base : currentOutfit) {
                score += scoreColorHarmony(item.getColor(), base.getColor(), occasion);
            }
            if (score > bestScore) {
                bestScore = score;
                best = item;
            }
        }

        return best;
    }

    private double scoreSingleItem(WardrobeItem item, OccasionType occasion, String targetSeason) {
        double score = 20.0;
        if (targetSeason != null && matchesSeason(item.getSeason(), targetSeason)) {
            score += 15.0;
        }
        if (item.getColor() != null && NEUTRAL_COLORS.contains(item.getColor().trim().toLowerCase())) {
            score += 5.0;
        }
        return score;
    }

    private boolean matchesSeason(String itemSeason, String targetSeason) {
        if (itemSeason == null || itemSeason.isBlank())
            return true;
        String s = itemSeason.trim().toUpperCase();
        return s.equals(targetSeason) || s.equals("ALL_SEASON") || s.equals("ALL");
    }

    private boolean matchesSubcategory(String subcategory, List<String> preferences) {
        if (subcategory == null || subcategory.isBlank())
            return false;
        String sub = subcategory.trim().toLowerCase();
        for (String pref : preferences) {
            if (sub.contains(pref))
                return true;
        }
        return false;
    }

    private boolean isBusyPattern(String pattern) {
        if (pattern == null)
            return false;
        String p = pattern.trim().toLowerCase();
        return p.contains("stripe") || p.contains("plaid") || p.contains("graphic") || p.contains("floral");
    }

    private static class Pair<A, B> {
        final A first;
        final B second;

        Pair(A first, B second) {
            this.first = first;
            this.second = second;
        }
    }

    private static class ScoredPair {
        final WardrobeItem top;
        final WardrobeItem bottom;
        final double score;

        ScoredPair(WardrobeItem top, WardrobeItem bottom, double score) {
            this.top = top;
            this.bottom = bottom;
            this.score = score;
        }
    }
}
