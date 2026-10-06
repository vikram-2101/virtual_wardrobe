package com.wardrobe.tryon;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wardrobe.avatar.dto.AvatarResponse;
import com.wardrobe.avatar.repository.AvatarRepository;
import com.wardrobe.avatar.service.AvatarService;
import com.wardrobe.common.storage.StorageService;
import com.wardrobe.outfit.dto.CreateOutfitRequest;
import com.wardrobe.outfit.repository.OutfitRepository;
import com.wardrobe.outfit.service.OutfitService;
import com.wardrobe.tryon.dto.CreateTryOnJobRequest;
import com.wardrobe.tryon.dto.TryOnCallbackRequest;
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

import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class InternalTryOnCallbackTest {

        private static final String INTERNAL_SECRET = "dev_internal_secret_key_12345";

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

        private String userToken;
        private UUID userId;
        private UUID jobId;

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

                // Register User
                RegisterRequest u = RegisterRequest.builder()
                                .email("callback@example.com")
                                .password("password123")
                                .name("Callback User")
                                .build();
                MvcResult res = mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(u)))
                                .andExpect(status().isCreated())
                                .andReturn();
                JsonNode root = objectMapper.readTree(res.getResponse().getContentAsString());
                userToken = root.path("data").path("token").asText();
                userId = UUID.fromString(root.path("data").path("userId").asText());

                // Upload Avatar
                MockMultipartFile avatarFile = new MockMultipartFile("file", "avatar.jpg", "image/jpeg",
                                "avatar".getBytes());
                avatarService.uploadAvatar(userId, avatarFile);

                // Upload Item & Outfit
                MockMultipartFile dummyImg = new MockMultipartFile("frontImage", "img.jpg", "image/jpeg",
                                "item".getBytes());
                WardrobeItemResponse top = wardrobeService.createItem(userId, CreateWardrobeItemRequest.builder()
                                .category("TOPS").subcategory("hoodie").color("Black").build(), dummyImg, null);
                UUID outfitId = outfitService.createManualOutfit(userId, CreateOutfitRequest.builder()
                                .name("Hoodie Set")
                                .itemIds(Arrays.asList(top.getId()))
                                .build()).getId();

                // Create Try-On Job
                CreateTryOnJobRequest req = CreateTryOnJobRequest.builder()
                                .outfitId(outfitId)
                                .build();
                MvcResult jobRes = mockMvc.perform(post("/api/try-ons")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req))
                                .header("Authorization", "Bearer " + userToken))
                                .andExpect(status().isCreated())
                                .andReturn();
                jobId = UUID.fromString(objectMapper.readTree(jobRes.getResponse().getContentAsString())
                                .path("data").path("id").asText());
        }

        @Test
        void testCallbackSuccessCompleted() throws Exception {
                TryOnCallbackRequest callbackReq = TryOnCallbackRequest.builder()
                                .jobId(jobId)
                                .status(TryOnJobStatus.COMPLETED)
                                .resultImageKey("tryon/" + userId + "/" + jobId + ".jpg")
                                .resultImageUrl("http://localhost:9000/wardrobe-storage/tryon/" + userId + "/" + jobId
                                                + ".jpg")
                                .startedAt(Instant.now().minusSeconds(10))
                                .completedAt(Instant.now())
                                .build();

                mockMvc.perform(post("/api/internal/try-ons/callback")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(callbackReq))
                                .header("X-Internal-Secret", INTERNAL_SECRET))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.id").value(jobId.toString()))
                                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                                .andExpect(jsonPath("$.data.resultImageKey")
                                                .value("tryon/" + userId + "/" + jobId + ".jpg"))
                                .andExpect(jsonPath("$.data.resultImageUrl").exists());

                // Verify status is reflected when user queries job
                mockMvc.perform(get("/api/try-ons/" + jobId)
                                .header("Authorization", "Bearer " + userToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                                .andExpect(jsonPath("$.data.resultImageUrl").exists());
        }

        @Test
        void testCallbackSuccessFailed() throws Exception {
                TryOnCallbackRequest callbackReq = TryOnCallbackRequest.builder()
                                .jobId(jobId)
                                .status(TryOnJobStatus.FAILED)
                                .errorCode("VTON_PREPROCESSING_ERROR")
                                .errorMessage("Human parsing failed: person silhouette too small")
                                .build();

                mockMvc.perform(post("/api/internal/try-ons/callback")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(callbackReq))
                                .header("X-Internal-Secret", INTERNAL_SECRET))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.status").value("FAILED"))
                                .andExpect(jsonPath("$.data.errorCode").value("VTON_PREPROCESSING_ERROR"))
                                .andExpect(jsonPath("$.data.errorMessage")
                                                .value("Human parsing failed: person silhouette too small"));
        }

        @Test
        void testCallbackInvalidSecretFails() throws Exception {
                TryOnCallbackRequest callbackReq = TryOnCallbackRequest.builder()
                                .jobId(jobId)
                                .status(TryOnJobStatus.COMPLETED)
                                .build();

                // Wrong secret header
                mockMvc.perform(post("/api/internal/try-ons/callback")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(callbackReq))
                                .header("X-Internal-Secret", "wrong_secret_123"))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false));

                // Missing secret header
                mockMvc.perform(post("/api/internal/try-ons/callback")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(callbackReq)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        void testCallbackNonexistentJobFails() throws Exception {
                UUID fakeJobId = UUID.randomUUID();
                TryOnCallbackRequest callbackReq = TryOnCallbackRequest.builder()
                                .jobId(fakeJobId)
                                .status(TryOnJobStatus.COMPLETED)
                                .build();

                mockMvc.perform(post("/api/internal/try-ons/callback")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(callbackReq))
                                .header("X-Internal-Secret", INTERNAL_SECRET))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.success").value(false));
        }
}
