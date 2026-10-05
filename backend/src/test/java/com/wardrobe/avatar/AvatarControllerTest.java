package com.wardrobe.avatar;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wardrobe.avatar.repository.AvatarRepository;
import com.wardrobe.common.storage.StorageService;
import com.wardrobe.user.auth.dto.RegisterRequest;
import com.wardrobe.user.repository.UserRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AvatarControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private AvatarRepository avatarRepository;

        @MockBean
        private StorageService storageService;

        @MockBean
        private RedisConnectionFactory redisConnectionFactory;

        @MockBean
        private S3Client s3Client;

        private String user1Token;
        private String user2Token;

        @BeforeEach
        void setUp() throws Exception {
                avatarRepository.deleteAll();
                userRepository.deleteAll();

                when(storageService.getObjectUrl(anyString())).thenAnswer(
                                invocation -> "http://localhost:9000/wardrobe-storage/" + invocation.getArgument(0));
                doNothing().when(storageService).uploadFile(anyString(), any(), anyLong(), anyString());
                doNothing().when(storageService).deleteFile(anyString());

                // Register User 1
                RegisterRequest u1 = RegisterRequest.builder()
                                .email("user1@example.com")
                                .password("password123")
                                .name("User One")
                                .build();
                MvcResult res1 = mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(u1)))
                                .andExpect(status().isCreated())
                                .andReturn();
                JsonNode root1 = objectMapper.readTree(res1.getResponse().getContentAsString());
                user1Token = root1.path("data").path("token").asText();

                // Register User 2
                RegisterRequest u2 = RegisterRequest.builder()
                                .email("user2@example.com")
                                .password("password123")
                                .name("User Two")
                                .build();
                MvcResult res2 = mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(u2)))
                                .andExpect(status().isCreated())
                                .andReturn();
                JsonNode root2 = objectMapper.readTree(res2.getResponse().getContentAsString());
                user2Token = root2.path("data").path("token").asText();
        }

        @Test
        void testUploadAvatarSuccess() throws Exception {
                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "avatar.jpg",
                                "image/jpeg",
                                "test image content".getBytes());

                mockMvc.perform(multipart("/api/avatars/upload")
                                .file(file)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.id").isNotEmpty())
                                .andExpect(jsonPath("$.data.isCanonical").value(true)) // First avatar is canonical
                                .andExpect(jsonPath("$.data.imageUrl").isNotEmpty());
        }

        @Test
        void testUploadInvalidFileTypeFails() throws Exception {
                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "document.pdf",
                                "application/pdf",
                                "pdf content".getBytes());

                mockMvc.perform(multipart("/api/avatars/upload")
                                .file(file)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message")
                                                .value("Invalid file format. Allowed formats are: JPG, PNG, WEBP"));
        }

        @Test
        void testListAndCanonicalAvatarFlow() throws Exception {
                // Upload avatar 1
                MockMultipartFile file1 = new MockMultipartFile("file", "photo1.png", "image/png", "img1".getBytes());
                MvcResult res1 = mockMvc.perform(multipart("/api/avatars/upload")
                                .file(file1)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();
                UUID avatar1Id = UUID.fromString(objectMapper.readTree(res1.getResponse().getContentAsString())
                                .path("data").path("id").asText());

                // Upload avatar 2
                MockMultipartFile file2 = new MockMultipartFile("file", "photo2.png", "image/png", "img2".getBytes());
                MvcResult res2 = mockMvc.perform(multipart("/api/avatars/upload")
                                .file(file2)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();
                UUID avatar2Id = UUID.fromString(objectMapper.readTree(res2.getResponse().getContentAsString())
                                .path("data").path("id").asText());

                // List avatars
                mockMvc.perform(get("/api/avatars")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(2));

                // Get canonical (should be avatar 1 initially)
                mockMvc.perform(get("/api/avatars/canonical")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.id").value(avatar1Id.toString()))
                                .andExpect(jsonPath("$.data.isCanonical").value(true));

                // Set avatar 2 as canonical
                mockMvc.perform(put("/api/avatars/" + avatar2Id + "/canonical")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.id").value(avatar2Id.toString()))
                                .andExpect(jsonPath("$.data.isCanonical").value(true));

                // Verify canonical is now avatar 2
                mockMvc.perform(get("/api/avatars/canonical")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.id").value(avatar2Id.toString()));
        }

        @Test
        void testCrossUserAuthorizationIsolation() throws Exception {
                // User 1 uploads an avatar
                MockMultipartFile file = new MockMultipartFile("file", "u1.png", "image/png", "u1img".getBytes());
                MvcResult res = mockMvc.perform(multipart("/api/avatars/upload")
                                .file(file)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();
                UUID u1AvatarId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString())
                                .path("data").path("id").asText());

                // User 2 attempts to set User 1's avatar as canonical -> Should return 404 (not
                // found for user 2)
                mockMvc.perform(put("/api/avatars/" + u1AvatarId + "/canonical")
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());

                // User 2 attempts to delete User 1's avatar -> Should return 404
                mockMvc.perform(delete("/api/avatars/" + u1AvatarId)
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());

                // User 1 deletes their own avatar -> Should succeed
                mockMvc.perform(delete("/api/avatars/" + u1AvatarId)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk());
        }
}
