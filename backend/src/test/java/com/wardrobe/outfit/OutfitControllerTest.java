package com.wardrobe.outfit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wardrobe.common.storage.StorageService;
import com.wardrobe.outfit.dto.CreateOutfitRequest;
import com.wardrobe.outfit.dto.GenerateControlledOutfitRequest;
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

import java.util.Arrays;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class OutfitControllerTest {

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

        private String user1Token;
        private UUID user1Id;
        private String user2Token;
        private UUID user2Id;

        private UUID user1TopId;
        private UUID user1BottomId;
        private UUID user1ShoeId;
        private UUID user1OuterwearId;

        private UUID user2TopId;

        @BeforeEach
        void setUp() throws Exception {
                outfitRepository.deleteAll();
                wardrobeRepository.deleteAll();
                userRepository.deleteAll();

                when(storageService.getObjectUrl(anyString())).thenAnswer(
                                invocation -> "http://localhost:9000/wardrobe-storage/" + invocation.getArgument(0));
                doNothing().when(storageService).uploadFile(anyString(), any(), anyLong(), anyString());
                doNothing().when(storageService).deleteFile(anyString());

                // Register User 1
                RegisterRequest u1 = RegisterRequest.builder()
                                .email("outfituser1@example.com")
                                .password("password123")
                                .name("Outfit User 1")
                                .build();
                MvcResult res1 = mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(u1)))
                                .andExpect(status().isCreated())
                                .andReturn();
                JsonNode root1 = objectMapper.readTree(res1.getResponse().getContentAsString());
                user1Token = root1.path("data").path("token").asText();
                user1Id = UUID.fromString(root1.path("data").path("userId").asText());

                // Register User 2
                RegisterRequest u2 = RegisterRequest.builder()
                                .email("outfituser2@example.com")
                                .password("password123")
                                .name("Outfit User 2")
                                .build();
                MvcResult res2 = mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(u2)))
                                .andExpect(status().isCreated())
                                .andReturn();
                JsonNode root2 = objectMapper.readTree(res2.getResponse().getContentAsString());
                user2Token = root2.path("data").path("token").asText();
                user2Id = UUID.fromString(root2.path("data").path("userId").asText());

                // Populate User 1 Wardrobe
                MockMultipartFile dummyImg = new MockMultipartFile("frontImage", "img.jpg", "image/jpeg",
                                "content".getBytes());

                user1TopId = wardrobeService.createItem(user1Id, CreateWardrobeItemRequest.builder()
                                .category("TOPS").subcategory("t-shirt").color("Navy Blue").build(), dummyImg, null)
                                .getId();

                user1BottomId = wardrobeService.createItem(user1Id, CreateWardrobeItemRequest.builder()
                                .category("BOTTOMS").subcategory("jeans").color("Blue").build(), dummyImg, null)
                                .getId();

                user1ShoeId = wardrobeService.createItem(user1Id, CreateWardrobeItemRequest.builder()
                                .category("SHOES").subcategory("sneakers").color("White").build(), dummyImg, null)
                                .getId();

                user1OuterwearId = wardrobeService.createItem(user1Id, CreateWardrobeItemRequest.builder()
                                .category("OUTERWEAR").subcategory("jacket").color("Black").build(), dummyImg, null)
                                .getId();

                // Populate User 2 Wardrobe
                user2TopId = wardrobeService.createItem(user2Id, CreateWardrobeItemRequest.builder()
                                .category("TOPS").subcategory("polo").color("Red").build(), dummyImg, null).getId();
        }

        @Test
        void testGenerateControlledOutfitSuccess() throws Exception {
                GenerateControlledOutfitRequest req = GenerateControlledOutfitRequest.builder()
                                .name("Summer Casual")
                                .categories(Arrays.asList("TOPS", "BOTTOMS"))
                                .build();

                mockMvc.perform(post("/api/outfits/generate-controlled")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.name").value("Summer Casual"))
                                .andExpect(jsonPath("$.data.source").value("CONTROLLED_GENERATION"))
                                .andExpect(jsonPath("$.data.items.length()").value(2))
                                .andExpect(jsonPath("$.data.items[?(@.category == 'TOPS')]").exists())
                                .andExpect(jsonPath("$.data.items[?(@.category == 'BOTTOMS')]").exists())
                                .andExpect(jsonPath("$.data.items[?(@.category == 'SHOES')]").doesNotExist())
                                .andExpect(jsonPath("$.data.items[?(@.category == 'OUTERWEAR')]").doesNotExist());
        }

        @Test
        void testGenerateControlledOutfitThreeCategories() throws Exception {
                GenerateControlledOutfitRequest req = GenerateControlledOutfitRequest.builder()
                                .categories(Arrays.asList("TOPS", "BOTTOMS", "SHOES"))
                                .build();

                mockMvc.perform(post("/api/outfits/generate-controlled")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.items.length()").value(3))
                                .andExpect(jsonPath("$.data.items[?(@.category == 'TOPS')]").exists())
                                .andExpect(jsonPath("$.data.items[?(@.category == 'BOTTOMS')]").exists())
                                .andExpect(jsonPath("$.data.items[?(@.category == 'SHOES')]").exists())
                                .andExpect(jsonPath("$.data.items[?(@.category == 'OUTERWEAR')]").doesNotExist());
        }

        @Test
        void testGenerateControlledOutfitMissingCategoryFails() throws Exception {
                GenerateControlledOutfitRequest req = GenerateControlledOutfitRequest.builder()
                                .categories(Arrays.asList("TOPS", "DRESSES")) // User 1 has no DRESSES
                                .build();

                mockMvc.perform(post("/api/outfits/generate-controlled")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value(
                                                "No wardrobe items found for category 'DRESSES'. Please add an item in this category first."));
        }

        @Test
        void testGenerateControlledOutfitEmptyCategoriesFails() throws Exception {
                GenerateControlledOutfitRequest req = GenerateControlledOutfitRequest.builder()
                                .categories(Collections.emptyList())
                                .build();

                mockMvc.perform(post("/api/outfits/generate-controlled")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void testCreateManualOutfitSuccess() throws Exception {
                CreateOutfitRequest req = CreateOutfitRequest.builder()
                                .name("My Custom Set")
                                .itemIds(Arrays.asList(user1TopId, user1OuterwearId, user1ShoeId))
                                .build();

                mockMvc.perform(post("/api/outfits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.name").value("My Custom Set"))
                                .andExpect(jsonPath("$.data.source").value("MANUAL"))
                                .andExpect(jsonPath("$.data.items.length()").value(3));
        }

        @Test
        void testCreateManualOutfitRejectsOtherUserItem() throws Exception {
                // User 1 tries to add User 2's top
                CreateOutfitRequest req = CreateOutfitRequest.builder()
                                .name("Hacked Outfit")
                                .itemIds(Arrays.asList(user1TopId, user2TopId))
                                .build();

                mockMvc.perform(post("/api/outfits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value(
                                                "Wardrobe item not found or does not belong to you: " + user2TopId));
        }

        @Test
        void testListAndGetOutfits() throws Exception {
                // Create 2 outfits for User 1
                CreateOutfitRequest req1 = CreateOutfitRequest.builder()
                                .name("Outfit 1")
                                .itemIds(Arrays.asList(user1TopId, user1BottomId))
                                .build();
                MvcResult res1 = mockMvc.perform(post("/api/outfits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req1))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();
                UUID outfit1Id = UUID.fromString(objectMapper.readTree(res1.getResponse().getContentAsString())
                                .path("data").path("id").asText());

                CreateOutfitRequest req2 = CreateOutfitRequest.builder()
                                .name("Outfit 2")
                                .itemIds(Arrays.asList(user1TopId, user1OuterwearId))
                                .build();
                mockMvc.perform(post("/api/outfits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req2))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated());

                // List outfits (should contain 2)
                mockMvc.perform(get("/api/outfits")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(2));

                // Get single outfit
                mockMvc.perform(get("/api/outfits/" + outfit1Id)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.id").value(outfit1Id.toString()))
                                .andExpect(jsonPath("$.data.name").value("Outfit 1"))
                                .andExpect(jsonPath("$.data.items.length()").value(2));
        }

        @Test
        void testDeleteOutfitPreservesWardrobeItems() throws Exception {
                CreateOutfitRequest req = CreateOutfitRequest.builder()
                                .name("Outfit to Delete")
                                .itemIds(Arrays.asList(user1TopId, user1BottomId))
                                .build();
                MvcResult res = mockMvc.perform(post("/api/outfits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();
                UUID outfitId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString())
                                .path("data").path("id").asText());

                // Delete outfit
                mockMvc.perform(delete("/api/outfits/" + outfitId)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Outfit deleted successfully"));

                // Verify outfit is 404
                mockMvc.perform(get("/api/outfits/" + outfitId)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isNotFound());

                // Verify underlying wardrobe items are still present and intact
                mockMvc.perform(get("/api/wardrobe/items/" + user1TopId)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk());

                mockMvc.perform(get("/api/wardrobe/items/" + user1BottomId)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk());
        }

        @Test
        void testCrossUserOutfitIsolation() throws Exception {
                CreateOutfitRequest req = CreateOutfitRequest.builder()
                                .name("User 1 Outfit")
                                .itemIds(Arrays.asList(user1TopId, user1BottomId))
                                .build();
                MvcResult res = mockMvc.perform(post("/api/outfits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();
                UUID user1OutfitId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString())
                                .path("data").path("id").asText());

                // User 2 cannot get User 1's outfit
                mockMvc.perform(get("/api/outfits/" + user1OutfitId)
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());

                // User 2 cannot delete User 1's outfit
                mockMvc.perform(delete("/api/outfits/" + user1OutfitId)
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());
        }
}
