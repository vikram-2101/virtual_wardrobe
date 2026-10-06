package com.wardrobe.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wardrobe.user.auth.dto.LoginRequest;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import software.amazon.awssdk.services.s3.S3Client;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

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

        @BeforeEach
        void setUp() {
                userRepository.deleteAll();
        }

        @Test
        void testRegisterSuccess() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .email("newuser@example.com")
                                .password("password123")
                                .name("New User")
                                .height(178.5)
                                .weight(74.0)
                                .gender("MALE")
                                .build();

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.token").isNotEmpty())
                                .andExpect(jsonPath("$.data.email").value("newuser@example.com"))
                                .andExpect(jsonPath("$.data.name").value("New User"));
        }

        @Test
        void testRegisterDuplicateEmailFails() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .email("duplicate@example.com")
                                .password("password123")
                                .name("First User")
                                .build();

                // First registration
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated());

                // Duplicate registration
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message")
                                                .value("User already exists with email: duplicate@example.com"));
        }

        @Test
        void testLoginSuccess() throws Exception {
                RegisterRequest registerReq = RegisterRequest.builder()
                                .email("loginuser@example.com")
                                .password("securePassword456")
                                .name("Login User")
                                .build();

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registerReq)))
                                .andExpect(status().isCreated());

                LoginRequest loginReq = LoginRequest.builder()
                                .email("loginuser@example.com")
                                .password("securePassword456")
                                .build();

                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginReq)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.token").isNotEmpty())
                                .andExpect(jsonPath("$.data.email").value("loginuser@example.com"))
                                .andExpect(jsonPath("$.data.name").value("Login User"));
        }

        @Test
        void testLoginInvalidCredentials() throws Exception {
                LoginRequest loginReq = LoginRequest.builder()
                                .email("nonexistent@example.com")
                                .password("wrongpassword")
                                .build();

                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginReq)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value("Invalid email or password"));
        }

        @Test
        void testGoogleAuthSuccess() throws Exception {
                var googleReq = com.wardrobe.user.auth.dto.GoogleAuthRequest.builder()
                                .email("googleuser@example.com")
                                .name("Google User")
                                .googleId("g-123456789")
                                .build();

                mockMvc.perform(post("/api/auth/google")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(googleReq)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.token").isNotEmpty())
                                .andExpect(jsonPath("$.data.email").value("googleuser@example.com"))
                                .andExpect(jsonPath("$.data.name").value("Google User"));
        }
}
