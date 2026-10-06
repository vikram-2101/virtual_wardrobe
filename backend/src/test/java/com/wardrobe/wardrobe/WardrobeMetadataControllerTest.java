package com.wardrobe.wardrobe;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wardrobe.common.security.JwtService;
import com.wardrobe.common.storage.StorageService;
import com.wardrobe.user.auth.dto.RegisterRequest;
import com.wardrobe.user.repository.UserRepository;
import com.wardrobe.wardrobe.dto.SuggestMetadataResponse;
import com.wardrobe.wardrobe.service.AiServiceClient;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class WardrobeMetadataControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @MockBean
        private AiServiceClient aiServiceClient;

        @MockBean
        private StorageService storageService;

        @MockBean
        private RedisConnectionFactory redisConnectionFactory;

        @MockBean
        private S3Client s3Client;

        private String token;

        @BeforeEach
        void setUp() throws Exception {
                userRepository.deleteAll();

                RegisterRequest req = RegisterRequest.builder()
                                .email("metadata-user@example.com")
                                .password("password123")
                                .name("Metadata User")
                                .build();

                MvcResult res = mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isCreated())
                                .andReturn();

                JsonNode root = objectMapper.readTree(res.getResponse().getContentAsString());
                token = "Bearer " + root.path("data").path("token").asText();
        }

        @Test
        void testSuggestMetadataSuccess() throws Exception {
                SuggestMetadataResponse mockAiResponse = SuggestMetadataResponse.builder()
                                .category("TOPS")
                                .subCategory("t-shirt")
                                .color("Navy Blue")
                                .pattern("solid")
                                .fit("regular")
                                .season("SUMMER")
                                .confidence(0.94)
                                .detectedTags(Arrays.asList("casual", "short-sleeved", "dark-toned"))
                                .isAiGenerated(true)
                                .build();

                when(aiServiceClient.extractMetadata(any())).thenReturn(mockAiResponse);

                MockMultipartFile imageFile = new MockMultipartFile(
                                "file",
                                "tshirt.jpg",
                                "image/jpeg",
                                "dummy jpeg image content".getBytes());

                mockMvc.perform(multipart("/api/wardrobe/suggest-metadata")
                                .file(imageFile)
                                .header("Authorization", token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.category").value("TOPS"))
                                .andExpect(jsonPath("$.data.subCategory").value("t-shirt"))
                                .andExpect(jsonPath("$.data.color").value("Navy Blue"))
                                .andExpect(jsonPath("$.data.pattern").value("solid"))
                                .andExpect(jsonPath("$.data.fit").value("regular"))
                                .andExpect(jsonPath("$.data.season").value("SUMMER"))
                                .andExpect(jsonPath("$.data.confidence").value(0.94))
                                .andExpect(jsonPath("$.data.isAiGenerated").value(true))
                                .andExpect(jsonPath("$.data.detectedTags[0]").value("casual"));
        }

        @Test
        void testSuggestMetadataItemsSubpath() throws Exception {
                SuggestMetadataResponse mockAiResponse = SuggestMetadataResponse.builder()
                                .category("BOTTOMS")
                                .subCategory("jeans")
                                .color("Black")
                                .pattern("solid")
                                .fit("slim")
                                .season("ALL_SEASON")
                                .confidence(0.91)
                                .detectedTags(Collections.singletonList("denim"))
                                .isAiGenerated(true)
                                .build();

                when(aiServiceClient.extractMetadata(any())).thenReturn(mockAiResponse);

                MockMultipartFile imageFile = new MockMultipartFile(
                                "file",
                                "jeans.png",
                                "image/png",
                                "dummy png image content".getBytes());

                mockMvc.perform(multipart("/api/wardrobe/items/suggest-metadata")
                                .file(imageFile)
                                .header("Authorization", token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.category").value("BOTTOMS"))
                                .andExpect(jsonPath("$.data.subCategory").value("jeans"))
                                .andExpect(jsonPath("$.data.color").value("Black"));
        }

        @Test
        void testSuggestMetadataEmptyFile() throws Exception {
                MockMultipartFile emptyFile = new MockMultipartFile(
                                "file",
                                "empty.jpg",
                                "image/jpeg",
                                new byte[0]);

                mockMvc.perform(multipart("/api/wardrobe/suggest-metadata")
                                .file(emptyFile)
                                .header("Authorization", token))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        void testSuggestMetadataInvalidMimeType() throws Exception {
                MockMultipartFile textFile = new MockMultipartFile(
                                "file",
                                "doc.txt",
                                "text/plain",
                                "some plain text".getBytes());

                mockMvc.perform(multipart("/api/wardrobe/suggest-metadata")
                                .file(textFile)
                                .header("Authorization", token))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value(
                                                "Invalid file type. Only JPG, PNG, and WEBP images are allowed."));
        }

        @Test
        void testSuggestMetadataAiFallback() throws Exception {
                SuggestMetadataResponse fallbackResponse = SuggestMetadataResponse.builder()
                                .category("TOPS")
                                .subCategory("clothing-item")
                                .color("Unknown")
                                .pattern("solid")
                                .fit("regular")
                                .season("ALL_SEASON")
                                .confidence(0.0)
                                .detectedTags(Collections.emptyList())
                                .isAiGenerated(false)
                                .build();

                when(aiServiceClient.extractMetadata(any())).thenReturn(fallbackResponse);

                MockMultipartFile imageFile = new MockMultipartFile(
                                "file",
                                "garment.webp",
                                "image/webp",
                                "dummy webp image content".getBytes());

                mockMvc.perform(multipart("/api/wardrobe/suggest-metadata")
                                .file(imageFile)
                                .header("Authorization", token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.category").value("TOPS"))
                                .andExpect(jsonPath("$.data.isAiGenerated").value(false));
        }

        @Test
        void testSuggestMetadataUnauthorized() throws Exception {
                MockMultipartFile imageFile = new MockMultipartFile(
                                "file",
                                "garment.jpg",
                                "image/jpeg",
                                "dummy content".getBytes());

                mockMvc.perform(multipart("/api/wardrobe/suggest-metadata")
                                .file(imageFile))
                                .andExpect(status().isForbidden());
        }
}
