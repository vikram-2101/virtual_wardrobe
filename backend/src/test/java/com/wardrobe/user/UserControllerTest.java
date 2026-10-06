package com.wardrobe.user;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wardrobe.user.auth.dto.RegisterRequest;
import com.wardrobe.user.profile.dto.UpdateProfileRequest;
import com.wardrobe.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import software.amazon.awssdk.services.s3.S3Client;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @MockBean
        private RedisConnectionFactory redisConnectionFactory;

        @MockBean
        private S3Client s3Client;

        private String jwtToken;

        @BeforeEach
        void setUp() throws Exception {
                userRepository.deleteAll();

                RegisterRequest registerReq = RegisterRequest.builder()
                                .email("profileuser@example.com")
                                .password("password123")
                                .name("Profile User")
                                .height(172.0)
                                .weight(68.0)
                                .gender("FEMALE")
                                .build();

                MvcResult result = mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registerReq)))
                                .andExpect(status().isCreated())
                                .andReturn();

                JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
                jwtToken = root.path("data").path("token").asText();
        }

        @Test
        void testGetCurrentUserUnauthenticatedFails() throws Exception {
                mockMvc.perform(get("/api/users/me"))
                                .andExpect(status().isForbidden());
        }

        @Test
        void testGetCurrentUserAuthenticated() throws Exception {
                mockMvc.perform(get("/api/users/me")
                                .header("Authorization", "Bearer " + jwtToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.email").value("profileuser@example.com"))
                                .andExpect(jsonPath("$.data.name").value("Profile User"))
                                .andExpect(jsonPath("$.data.height").value(172.0))
                                .andExpect(jsonPath("$.data.weight").value(68.0))
                                .andExpect(jsonPath("$.data.gender").value("FEMALE"));
        }

        @Test
        void testUpdateUserProfile() throws Exception {
                UpdateProfileRequest updateReq = UpdateProfileRequest.builder()
                                .name("Updated Name")
                                .height(175.0)
                                .weight(66.5)
                                .gender("FEMALE")
                                .stylePreferences("Minimal, Streetwear")
                                .build();

                mockMvc.perform(put("/api/users/me")
                                .header("Authorization", "Bearer " + jwtToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateReq)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.name").value("Updated Name"))
                                .andExpect(jsonPath("$.data.height").value(175.0))
                                .andExpect(jsonPath("$.data.weight").value(66.5))
                                .andExpect(jsonPath("$.data.stylePreferences").value("Minimal, Streetwear"));
        }
}
