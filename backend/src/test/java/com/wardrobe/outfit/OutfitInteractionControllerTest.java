package com.wardrobe.outfit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wardrobe.common.storage.StorageService;
import com.wardrobe.outfit.dto.CreateOutfitRequest;
import com.wardrobe.outfit.dto.GenerateAutomaticOutfitRequest;
import com.wardrobe.outfit.dto.GenerateControlledOutfitRequest;
import com.wardrobe.outfit.dto.UpdateOutfitRequest;
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
public class OutfitInteractionControllerTest {

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

        private UUID user1Top1Id;
        private UUID user1Top2Id;
        private UUID user1BottomId;
        private UUID user1ShoeId;

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
                                .email("interaction1@example.com")
                                .password("password123")
                                .name("Interaction User 1")
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
                                .email("interaction2@example.com")
                                .password("password123")
                                .name("Interaction User 2")
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

                user1Top1Id = wardrobeService.createItem(user1Id, CreateWardrobeItemRequest.builder()
                                .category("TOPS").subcategory("t-shirt").color("Navy Blue").pattern("solid")
                                .fit("regular")
                                .season("SUMMER").build(), dummyImg, null).getId();

                user1Top2Id = wardrobeService.createItem(user1Id, CreateWardrobeItemRequest.builder()
                                .category("TOPS").subcategory("polo").color("White").pattern("solid").fit("regular")
                                .season("SUMMER").build(), dummyImg, null).getId();

                user1BottomId = wardrobeService.createItem(user1Id, CreateWardrobeItemRequest.builder()
                                .category("BOTTOMS").subcategory("jeans").color("Blue").pattern("solid").fit("regular")
                                .season("ALL_SEASON").build(), dummyImg, null).getId();

                user1ShoeId = wardrobeService.createItem(user1Id, CreateWardrobeItemRequest.builder()
                                .category("SHOES").subcategory("sneakers").color("White").pattern("solid")
                                .fit("regular")
                                .season("ALL_SEASON").build(), dummyImg, null).getId();
        }

        private UUID createSampleOutfit(String name) throws Exception {
                CreateOutfitRequest req = CreateOutfitRequest.builder()
                                .name(name)
                                .itemIds(Arrays.asList(user1Top1Id, user1BottomId))
                                .build();
                MvcResult res = mockMvc.perform(post("/api/outfits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();
                return UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString())
                                .path("data").path("id").asText());
        }

        @Test
        void testToggleFavoriteOutfit() throws Exception {
                UUID outfitId = createSampleOutfit("Favorite Test Outfit");

                // Initial state isFavorite = false
                mockMvc.perform(get("/api/outfits/" + outfitId)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.isFavorite").value(false));

                // Toggle to true
                mockMvc.perform(put("/api/outfits/" + outfitId + "/favorite")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.isFavorite").value(true));

                // Toggle back to false
                mockMvc.perform(put("/api/outfits/" + outfitId + "/favorite")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.isFavorite").value(false));

                // Set explicitly to true via query param
                mockMvc.perform(put("/api/outfits/" + outfitId + "/favorite?isFavorite=true")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.isFavorite").value(true));
        }

        @Test
        void testSaveAndRejectOutfit() throws Exception {
                UUID outfitId = createSampleOutfit("Status Test Outfit");

                // Reject outfit
                mockMvc.perform(put("/api/outfits/" + outfitId + "/reject")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.status").value("REJECTED"));

                // Save outfit again
                mockMvc.perform(put("/api/outfits/" + outfitId + "/save")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.status").value("SAVED"));
        }

        @Test
        void testUpdateOutfitDetails() throws Exception {
                UUID outfitId = createSampleOutfit("Initial Name");

                UpdateOutfitRequest updateReq = UpdateOutfitRequest.builder()
                                .name("Updated Name")
                                .isFavorite(true)
                                .status("ARCHIVED")
                                .build();

                mockMvc.perform(put("/api/outfits/" + outfitId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateReq))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.name").value("Updated Name"))
                                .andExpect(jsonPath("$.data.isFavorite").value(true))
                                .andExpect(jsonPath("$.data.status").value("ARCHIVED"));
        }

        @Test
        void testFilterOutfitsByStatusFavoriteAndSource() throws Exception {
                // Outfit 1: SAVED, favorite, MANUAL
                UUID o1 = createSampleOutfit("Outfit 1");
                mockMvc.perform(put("/api/outfits/" + o1 + "/favorite?isFavorite=true")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk());

                // Outfit 2: REJECTED, not favorite, MANUAL
                UUID o2 = createSampleOutfit("Outfit 2");
                mockMvc.perform(put("/api/outfits/" + o2 + "/reject")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk());

                // Outfit 3: SAVED, not favorite, AUTOMATIC
                GenerateAutomaticOutfitRequest autoReq = GenerateAutomaticOutfitRequest.builder()
                                .occasion("CASUAL")
                                .build();
                mockMvc.perform(post("/api/outfits/generate-automatic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(autoReq))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated());

                // 1. All outfits = 3
                mockMvc.perform(get("/api/outfits")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(3));

                // 2. Filter by status=REJECTED = 1
                mockMvc.perform(get("/api/outfits?status=REJECTED")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(1))
                                .andExpect(jsonPath("$.data[0].id").value(o2.toString()));

                // 3. Filter by isFavorite=true = 1
                mockMvc.perform(get("/api/outfits?isFavorite=true")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(1))
                                .andExpect(jsonPath("$.data[0].id").value(o1.toString()));

                // 4. Filter by source=AUTOMATIC_RULE_ENGINE = 1
                mockMvc.perform(get("/api/outfits?source=AUTOMATIC_RULE_ENGINE")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(1))
                                .andExpect(jsonPath("$.data[0].source").value("AUTOMATIC_RULE_ENGINE"));

                // 5. Filter by source=MANUAL & status=SAVED = 1 (o1)
                mockMvc.perform(get("/api/outfits?source=MANUAL&status=SAVED")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(1))
                                .andExpect(jsonPath("$.data[0].id").value(o1.toString()));
        }

        @Test
        void testRegenerateOutfitAutomatic() throws Exception {
                GenerateAutomaticOutfitRequest autoReq = GenerateAutomaticOutfitRequest.builder()
                                .occasion("CASUAL")
                                .name("Original Casual")
                                .build();
                MvcResult res = mockMvc.perform(post("/api/outfits/generate-automatic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(autoReq))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();
                UUID originalId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString())
                                .path("data").path("id").asText());

                // Regenerate
                mockMvc.perform(post("/api/outfits/" + originalId + "/regenerate")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.data.source").value("AUTOMATIC_RULE_ENGINE"))
                                .andExpect(jsonPath("$.data.name").value("Regenerated Original Casual"))
                                .andExpect(jsonPath("$.data.items.length()").value(2));
        }

        @Test
        void testRegenerateOutfitControlled() throws Exception {
                GenerateControlledOutfitRequest ctrlReq = GenerateControlledOutfitRequest.builder()
                                .name("Controlled Set")
                                .categories(Arrays.asList("TOPS", "BOTTOMS"))
                                .build();
                MvcResult res = mockMvc.perform(post("/api/outfits/generate-controlled")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(ctrlReq))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();
                UUID originalId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString())
                                .path("data").path("id").asText());

                // Regenerate
                mockMvc.perform(post("/api/outfits/" + originalId + "/regenerate")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.data.source").value("CONTROLLED_GENERATION"))
                                .andExpect(jsonPath("$.data.name").value("Regenerated Controlled Set"))
                                .andExpect(jsonPath("$.data.items.length()").value(2));
        }

        @Test
        void testCrossUserInteractionProtection() throws Exception {
                UUID user1OutfitId = createSampleOutfit("User 1 Outfit");

                // User 2 cannot favorite User 1's outfit
                mockMvc.perform(put("/api/outfits/" + user1OutfitId + "/favorite")
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());

                // User 2 cannot save User 1's outfit
                mockMvc.perform(put("/api/outfits/" + user1OutfitId + "/save")
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());

                // User 2 cannot reject User 1's outfit
                mockMvc.perform(put("/api/outfits/" + user1OutfitId + "/reject")
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());

                // User 2 cannot regenerate User 1's outfit
                mockMvc.perform(post("/api/outfits/" + user1OutfitId + "/regenerate")
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());

                // User 2 cannot update User 1's outfit
                UpdateOutfitRequest updateReq = UpdateOutfitRequest.builder()
                                .name("Hacked Name")
                                .build();
                mockMvc.perform(put("/api/outfits/" + user1OutfitId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateReq))
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());
        }
}
