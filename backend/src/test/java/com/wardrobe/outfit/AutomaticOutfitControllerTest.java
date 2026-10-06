package com.wardrobe.outfit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wardrobe.common.storage.StorageService;
import com.wardrobe.outfit.dto.GenerateAutomaticOutfitRequest;
import com.wardrobe.outfit.repository.OutfitRepository;
import com.wardrobe.user.auth.dto.RegisterRequest;
import com.wardrobe.user.repository.UserRepository;
import com.wardrobe.wardrobe.dto.CreateWardrobeItemRequest;
import com.wardrobe.wardrobe.repository.WardrobeItemRepository;
import com.wardrobe.wardrobe.service.WardrobeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import software.amazon.awssdk.services.s3.S3Client;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AutomaticOutfitControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private WardrobeItemRepository wardrobeRepository;

        @Autowired
        private OutfitRepository outfitRepository;

        @Autowired
        private WardrobeService wardrobeService;

        @MockBean
        private StorageService storageService;

        @MockBean
        private RedisConnectionFactory redisConnectionFactory;

        @MockBean
        private S3Client s3Client;

        private String userToken;
        private UUID userId;

        @BeforeEach
        void setUp() throws Exception {
                outfitRepository.deleteAll();
                wardrobeRepository.deleteAll();
                userRepository.deleteAll();

                when(storageService.getObjectUrl(anyString())).thenAnswer(
                                invocation -> "http://localhost:9000/wardrobe-storage/" + invocation.getArgument(0));
                doNothing().when(storageService).uploadFile(anyString(), any(), anyLong(), anyString());
                doNothing().when(storageService).deleteFile(anyString());

                RegisterRequest req = RegisterRequest.builder()
                                .email("autooutfit@example.com")
                                .password("password123")
                                .name("Auto Outfit User")
                                .build();
                MvcResult res = mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isCreated())
                                .andReturn();
                JsonNode root = objectMapper.readTree(res.getResponse().getContentAsString());
                userToken = root.path("data").path("token").asText();
                userId = UUID.fromString(root.path("data").path("userId").asText());
        }

        private void seedRichWardrobe() {
                MockMultipartFile dummyImg = new MockMultipartFile("frontImage", "img.jpg", "image/jpeg",
                                "content".getBytes());

                // Tops
                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("TOPS").subcategory("t-shirt").color("Navy Blue").pattern("solid")
                                .fit("regular").season("SUMMER").build(), dummyImg, null);
                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("TOPS").subcategory("button-down shirt").color("White").pattern("solid")
                                .fit("slim").season("ALL_SEASON").build(), dummyImg, null);
                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("TOPS").subcategory("sweater").color("Charcoal Gray").pattern("solid")
                                .fit("regular").season("WINTER").build(), dummyImg, null);

                // Bottoms
                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("BOTTOMS").subcategory("jeans").color("Blue").pattern("solid").fit("regular")
                                .season("ALL_SEASON").build(), dummyImg, null);
                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("BOTTOMS").subcategory("trousers").color("Black").pattern("solid").fit("slim")
                                .season("ALL_SEASON").build(), dummyImg, null);
                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("BOTTOMS").subcategory("shorts").color("Beige").pattern("solid")
                                .fit("regular").season("SUMMER").build(), dummyImg, null);

                // Outerwear
                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("OUTERWEAR").subcategory("blazer").color("Navy Blue").pattern("solid")
                                .fit("slim").season("ALL_SEASON").build(), dummyImg, null);
                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("OUTERWEAR").subcategory("coat").color("Black").pattern("solid")
                                .fit("regular").season("WINTER").build(), dummyImg, null);

                // Shoes
                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("SHOES").subcategory("sneakers").color("White").pattern("solid")
                                .fit("regular").season("ALL_SEASON").build(), dummyImg, null);
                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("SHOES").subcategory("oxfords").color("Brown").pattern("solid").fit("regular")
                                .season("ALL_SEASON").build(), dummyImg, null);
        }

        @Test
        void testGenerateAutomaticCasualOutfit() throws Exception {
                seedRichWardrobe();

                GenerateAutomaticOutfitRequest req = GenerateAutomaticOutfitRequest.builder()
                                .occasion("CASUAL")
                                .includeShoes(true)
                                .build();

                mockMvc.perform(post("/api/outfits/generate-automatic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + userToken))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.source").value("AUTOMATIC_RULE_ENGINE"))
                                .andExpect(jsonPath("$.data.items.length()").value(3)) // Top + Bottom + Shoes
                                .andExpect(jsonPath("$.data.items[?(@.category == 'TOPS')]").exists())
                                .andExpect(jsonPath("$.data.items[?(@.category == 'BOTTOMS')]").exists())
                                .andExpect(jsonPath("$.data.items[?(@.category == 'SHOES')]").exists());
        }

        @Test
        void testGenerateAutomaticFormalOutfitWithBlazer() throws Exception {
                seedRichWardrobe();

                GenerateAutomaticOutfitRequest req = GenerateAutomaticOutfitRequest.builder()
                                .occasion("FORMAL")
                                .includeOuterwear(true)
                                .includeShoes(true)
                                .name("Office Presentation")
                                .build();

                mockMvc.perform(post("/api/outfits/generate-automatic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + userToken))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.name").value("Office Presentation"))
                                .andExpect(jsonPath("$.data.source").value("AUTOMATIC_RULE_ENGINE"))
                                .andExpect(jsonPath("$.data.items.length()").value(4)) // Top + Bottom + Outerwear +
                                                                                       // Shoes
                                .andExpect(jsonPath("$.data.items[?(@.category == 'OUTERWEAR')]").exists());
        }

        @Test
        void testGenerateAutomaticWinterOutfitAutoIncludesOuterwear() throws Exception {
                seedRichWardrobe();

                GenerateAutomaticOutfitRequest req = GenerateAutomaticOutfitRequest.builder()
                                .occasion("WINTER")
                                .build();

                mockMvc.perform(post("/api/outfits/generate-automatic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + userToken))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.items[?(@.category == 'OUTERWEAR')]").exists());
        }

        @Test
        void testGenerateAutomaticMinimalOutfitPrefersNeutrals() throws Exception {
                seedRichWardrobe();

                GenerateAutomaticOutfitRequest req = GenerateAutomaticOutfitRequest.builder()
                                .occasion("MINIMAL")
                                .build();

                mockMvc.perform(post("/api/outfits/generate-automatic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + userToken))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.items.length()").value(2));
        }

        @Test
        void testGenerateAutomaticPartyWithDress() throws Exception {
                MockMultipartFile dummyImg = new MockMultipartFile("frontImage", "img.jpg", "image/jpeg",
                                "content".getBytes());

                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("DRESSES").subcategory("cocktail dress").color("Crimson Red").pattern("solid")
                                .build(), dummyImg, null);

                GenerateAutomaticOutfitRequest req = GenerateAutomaticOutfitRequest.builder()
                                .occasion("PARTY")
                                .build();

                mockMvc.perform(post("/api/outfits/generate-automatic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + userToken))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.items[0].category").value("DRESSES"));
        }

        @Test
        void testGenerateAutomaticInsufficientWardrobeFails() throws Exception {
                MockMultipartFile dummyImg = new MockMultipartFile("frontImage", "img.jpg", "image/jpeg",
                                "content".getBytes());

                // User only has a top, no bottoms and no dresses
                wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("TOPS").subcategory("t-shirt").color("Navy Blue").build(), dummyImg, null);

                GenerateAutomaticOutfitRequest req = GenerateAutomaticOutfitRequest.builder()
                                .occasion("CASUAL")
                                .build();

                mockMvc.perform(post("/api/outfits/generate-automatic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + userToken))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value(
                                                "Insufficient wardrobe items to generate a complete outfit. You need at least a top and bottom, or a dress."));
        }

        @Test
        void testGenerateAutomaticEmptyWardrobeFails() throws Exception {
                // No items in wardrobe
                GenerateAutomaticOutfitRequest req = GenerateAutomaticOutfitRequest.builder()
                                .occasion("CASUAL")
                                .build();

                mockMvc.perform(post("/api/outfits/generate-automatic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + userToken))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value(
                                                "Your wardrobe is empty. Please upload some clothing items before generating outfits."));
        }

        @Test
        void testGenerateAutomaticUnauthorized() throws Exception {
                GenerateAutomaticOutfitRequest req = GenerateAutomaticOutfitRequest.builder()
                                .occasion("CASUAL")
                                .build();

                mockMvc.perform(post("/api/outfits/generate-automatic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isForbidden());
        }
}
