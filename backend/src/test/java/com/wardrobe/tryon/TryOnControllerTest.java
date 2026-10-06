package com.wardrobe.tryon;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wardrobe.avatar.dto.AvatarResponse;
import com.wardrobe.avatar.entity.Avatar;
import com.wardrobe.avatar.repository.AvatarRepository;
import com.wardrobe.avatar.service.AvatarService;
import com.wardrobe.common.storage.StorageService;
import com.wardrobe.outfit.dto.CreateOutfitRequest;
import com.wardrobe.outfit.entity.Outfit;
import com.wardrobe.outfit.repository.OutfitRepository;
import com.wardrobe.outfit.service.OutfitService;
import com.wardrobe.tryon.dto.CreateSingleItemTryOnRequest;
import com.wardrobe.tryon.dto.CreateTryOnJobRequest;
import com.wardrobe.tryon.entity.TryOnJobStatus;
import com.wardrobe.tryon.repository.TryOnJobRepository;
import com.wardrobe.user.auth.dto.RegisterRequest;
import com.wardrobe.user.repository.UserRepository;
import com.wardrobe.wardrobe.dto.CreateWardrobeItemRequest;
import com.wardrobe.wardrobe.dto.WardrobeItemResponse;
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
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TryOnControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private AvatarRepository avatarRepository;

        @Autowired
        private WardrobeItemRepository wardrobeRepository;

        @Autowired
        private OutfitRepository outfitRepository;

        @Autowired
        private TryOnJobRepository tryOnJobRepository;

        @Autowired
        private AvatarService avatarService;

        @Autowired
        private WardrobeService wardrobeService;

        @Autowired
        private OutfitService outfitService;

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

        private UUID user1AvatarId;
        private UUID user1TopId;
        private UUID user1BottomId;
        private UUID user1OutfitId;

        @BeforeEach
        void setUp() throws Exception {
                tryOnJobRepository.deleteAll();
                outfitRepository.deleteAll();
                wardrobeRepository.deleteAll();
                avatarRepository.deleteAll();
                userRepository.deleteAll();

                when(storageService.getObjectUrl(anyString())).thenAnswer(
                                invocation -> "http://localhost:9000/wardrobe-storage/" + invocation.getArgument(0));
                doNothing().when(storageService).uploadFile(anyString(), any(), anyLong(), anyString());
                doNothing().when(storageService).deleteFile(anyString());

                // Register User 1
                RegisterRequest u1 = RegisterRequest.builder()
                                .email("tryon1@example.com")
                                .password("password123")
                                .name("Try-On User 1")
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
                                .email("tryon2@example.com")
                                .password("password123")
                                .name("Try-On User 2")
                                .build();
                MvcResult res2 = mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(u2)))
                                .andExpect(status().isCreated())
                                .andReturn();
                JsonNode root2 = objectMapper.readTree(res2.getResponse().getContentAsString());
                user2Token = root2.path("data").path("token").asText();
                user2Id = UUID.fromString(root2.path("data").path("userId").asText());

                // Create Avatar for User 1
                MockMultipartFile avatarFile = new MockMultipartFile("file", "avatar.jpg", "image/jpeg",
                                "dummy-avatar-bytes".getBytes());
                AvatarResponse avatarResp = avatarService.uploadAvatar(user1Id, avatarFile);
                user1AvatarId = avatarResp.getId();

                // Populate User 1 Wardrobe & Outfit
                MockMultipartFile dummyImg = new MockMultipartFile("frontImage", "img.jpg", "image/jpeg",
                                "content".getBytes());

                WardrobeItemResponse top = wardrobeService.createItem(user1Id, CreateWardrobeItemRequest.builder()
                                .category("TOPS").subcategory("t-shirt").color("Navy Blue").build(), dummyImg, null);
                user1TopId = top.getId();

                WardrobeItemResponse bottom = wardrobeService.createItem(user1Id, CreateWardrobeItemRequest.builder()
                                .category("BOTTOMS").subcategory("jeans").color("Blue").build(), dummyImg, null);
                user1BottomId = bottom.getId();

                user1OutfitId = outfitService.createManualOutfit(user1Id, CreateOutfitRequest.builder()
                                .name("Weekend Set")
                                .itemIds(Arrays.asList(user1TopId, user1BottomId))
                                .build()).getId();
        }

        @Test
        void testCreateTryOnJobSuccessWithCanonicalAvatar() throws Exception {
                // avatarId is omitted; should auto-select canonical avatar
                CreateTryOnJobRequest req = CreateTryOnJobRequest.builder()
                                .outfitId(user1OutfitId)
                                .build();

                mockMvc.perform(post("/api/try-ons")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.outfitId").value(user1OutfitId.toString()))
                                .andExpect(jsonPath("$.data.avatarId").value(user1AvatarId.toString()))
                                .andExpect(jsonPath("$.data.status").value("PENDING"))
                                .andExpect(jsonPath("$.data.userId").value(user1Id.toString()));
        }

        @Test
        void testCreateTryOnJobWithExplicitAvatar() throws Exception {
                CreateTryOnJobRequest req = CreateTryOnJobRequest.builder()
                                .outfitId(user1OutfitId)
                                .avatarId(user1AvatarId)
                                .build();

                mockMvc.perform(post("/api/try-ons")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.outfitId").value(user1OutfitId.toString()))
                                .andExpect(jsonPath("$.data.avatarId").value(user1AvatarId.toString()))
                                .andExpect(jsonPath("$.data.status").value("PENDING"));
        }

        @Test
        void testCreateSingleItemTryOnJob() throws Exception {
                CreateSingleItemTryOnRequest req = CreateSingleItemTryOnRequest.builder()
                                .itemId(user1TopId)
                                .build();

                mockMvc.perform(post("/api/try-ons/single-item")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.avatarId").value(user1AvatarId.toString()))
                                .andExpect(jsonPath("$.data.status").value("PENDING"))
                                .andExpect(jsonPath("$.data.outfitId").exists());
        }

        @Test
        void testCreateTryOnJobFailsWhenNoAvatarAvailable() throws Exception {
                // User 2 has no avatars uploaded
                MockMultipartFile dummyImg = new MockMultipartFile("frontImage", "img.jpg", "image/jpeg",
                                "content".getBytes());
                WardrobeItemResponse u2Top = wardrobeService.createItem(user2Id, CreateWardrobeItemRequest.builder()
                                .category("TOPS").subcategory("polo").color("Red").build(), dummyImg, null);
                UUID u2OutfitId = outfitService.createManualOutfit(user2Id, CreateOutfitRequest.builder()
                                .name("U2 Set")
                                .itemIds(Arrays.asList(u2Top.getId()))
                                .build()).getId();

                CreateTryOnJobRequest req = CreateTryOnJobRequest.builder()
                                .outfitId(u2OutfitId)
                                .build();

                mockMvc.perform(post("/api/try-ons")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value(
                                                "No avatar found. Please upload an avatar photo before initiating a try-on."));
        }

        @Test
        void testCreateTryOnJobFailsWithOtherUserOutfit() throws Exception {
                // User 2 tries to create job on User 1's outfit
                CreateTryOnJobRequest req = CreateTryOnJobRequest.builder()
                                .outfitId(user1OutfitId)
                                .build();

                mockMvc.perform(post("/api/try-ons")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value(
                                                "Outfit not found or does not belong to you: " + user1OutfitId));
        }

        @Test
        void testListAndGetTryOnJobs() throws Exception {
                CreateTryOnJobRequest req = CreateTryOnJobRequest.builder()
                                .outfitId(user1OutfitId)
                                .build();

                MvcResult res = mockMvc.perform(post("/api/try-ons")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();

                UUID jobId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString())
                                .path("data").path("id").asText());

                // List jobs
                mockMvc.perform(get("/api/try-ons")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(1))
                                .andExpect(jsonPath("$.data[0].id").value(jobId.toString()));

                // Filter by status=PENDING
                mockMvc.perform(get("/api/try-ons?status=PENDING")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(1));

                // Filter by status=COMPLETED (should be 0)
                mockMvc.perform(get("/api/try-ons?status=COMPLETED")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(0));

                // Get single job
                mockMvc.perform(get("/api/try-ons/" + jobId)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.id").value(jobId.toString()))
                                .andExpect(jsonPath("$.data.status").value("PENDING"));
        }

        @Test
        void testCrossUserJobIsolation() throws Exception {
                CreateTryOnJobRequest req = CreateTryOnJobRequest.builder()
                                .outfitId(user1OutfitId)
                                .build();

                MvcResult res = mockMvc.perform(post("/api/try-ons")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();

                UUID user1JobId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString())
                                .path("data").path("id").asText());

                // User 2 cannot view User 1's try-on job
                mockMvc.perform(get("/api/try-ons/" + user1JobId)
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());
        }

        @Test
        void testCreateTryOnJob_quotaExceeded_returns400() throws Exception {
                // Default daily limit is 5. Create 5 jobs first.
                CreateTryOnJobRequest req = CreateTryOnJobRequest.builder()
                                .outfitId(user1OutfitId)
                                .build();

                for (int i = 0; i < 5; i++) {
                        mockMvc.perform(post("/api/try-ons")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(req))
                                        .header("Authorization", "Bearer " + user1Token))
                                        .andExpect(status().isCreated());
                }

                // 6th request should be rejected with 400
                mockMvc.perform(post("/api/try-ons")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value(
                                                containsString("Daily try-on limit")));
        }

        @Test
        void testCreateSingleItemTryOnJob_quotaExceeded_returns400() throws Exception {
                // Exhaust the daily quota using single-item try-ons
                CreateSingleItemTryOnRequest singleReq = CreateSingleItemTryOnRequest.builder()
                                .itemId(user1TopId)
                                .build();

                for (int i = 0; i < 5; i++) {
                        mockMvc.perform(post("/api/try-ons/single-item")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(singleReq))
                                        .header("Authorization", "Bearer " + user1Token))
                                        .andExpect(status().isCreated());
                }

                // 6th single-item try-on should also be rejected
                mockMvc.perform(post("/api/try-ons/single-item")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(singleReq))
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value(
                                                containsString("Daily try-on limit")));
        }
}
