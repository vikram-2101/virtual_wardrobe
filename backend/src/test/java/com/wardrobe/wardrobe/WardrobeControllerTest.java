package com.wardrobe.wardrobe;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wardrobe.common.storage.StorageService;
import com.wardrobe.user.auth.dto.RegisterRequest;
import com.wardrobe.user.repository.UserRepository;
import com.wardrobe.wardrobe.repository.WardrobeItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.HttpMethod;
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
class WardrobeControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private WardrobeItemRepository wardrobeRepository;

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
                wardrobeRepository.deleteAll();
                userRepository.deleteAll();

                when(storageService.getObjectUrl(anyString())).thenAnswer(
                                invocation -> "http://localhost:9000/wardrobe-storage/" + invocation.getArgument(0));
                doNothing().when(storageService).uploadFile(anyString(), any(), anyLong(), anyString());
                doNothing().when(storageService).deleteFile(anyString());

                // Register User 1
                RegisterRequest u1 = RegisterRequest.builder()
                                .email("wardrobeuser1@example.com")
                                .password("password123")
                                .name("Wardrobe User 1")
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
                                .email("wardrobeuser2@example.com")
                                .password("password123")
                                .name("Wardrobe User 2")
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
        void testCreateWardrobeItemSuccess() throws Exception {
                MockMultipartFile frontImage = new MockMultipartFile(
                                "frontImage", "shirt_front.jpg", "image/jpeg", "front image content".getBytes());
                MockMultipartFile backImage = new MockMultipartFile(
                                "backImage", "shirt_back.jpg", "image/jpeg", "back image content".getBytes());

                mockMvc.perform(multipart("/api/wardrobe/items")
                                .file(frontImage)
                                .file(backImage)
                                .param("category", "T-SHIRT")
                                .param("subcategory", "Graphic Tee")
                                .param("color", "Black")
                                .param("pattern", "Graphic")
                                .param("fit", "Oversized")
                                .param("material", "Cotton")
                                .param("season", "Summer")
                                .param("notes", "Favorite concert tee")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.id").isNotEmpty())
                                .andExpect(jsonPath("$.data.category").value("T-SHIRT"))
                                .andExpect(jsonPath("$.data.color").value("Black"))
                                .andExpect(jsonPath("$.data.images.length()").value(2))
                                .andExpect(jsonPath("$.data.primaryImageUrl").isNotEmpty());
        }

        @Test
        void testCreateWardrobeItemValidationFails() throws Exception {
                // Missing front image
                mockMvc.perform(multipart("/api/wardrobe/items")
                                .param("category", "T-SHIRT")
                                .param("color", "Black")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void testListAndFilterWardrobeItems() throws Exception {
                // Create Item 1: T-Shirt
                MockMultipartFile img1 = new MockMultipartFile("frontImage", "tshirt.jpg", "image/jpeg",
                                "img1".getBytes());
                mockMvc.perform(multipart("/api/wardrobe/items")
                                .file(img1)
                                .param("category", "T-SHIRT")
                                .param("color", "White")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated());

                // Create Item 2: Jeans
                MockMultipartFile img2 = new MockMultipartFile("frontImage", "jeans.jpg", "image/jpeg",
                                "img2".getBytes());
                mockMvc.perform(multipart("/api/wardrobe/items")
                                .file(img2)
                                .param("category", "JEANS")
                                .param("color", "Blue")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated());

                // List all items for User 1 (2 items)
                mockMvc.perform(get("/api/wardrobe/items")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(2));

                // Filter by category JEANS (1 item)
                mockMvc.perform(get("/api/wardrobe/items?category=JEANS")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(1))
                                .andExpect(jsonPath("$.data[0].category").value("JEANS"));
        }

        @Test
        void testGetUpdateAndDeleteWardrobeItem() throws Exception {
                MockMultipartFile front = new MockMultipartFile("frontImage", "front.png", "image/png",
                                "img".getBytes());
                MvcResult res = mockMvc.perform(multipart("/api/wardrobe/items")
                                .file(front)
                                .param("category", "HOODIE")
                                .param("color", "Grey")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();

                UUID itemId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).path("data")
                                .path("id").asText());

                // Get single item
                mockMvc.perform(get("/api/wardrobe/items/" + itemId)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.id").value(itemId.toString()))
                                .andExpect(jsonPath("$.data.category").value("HOODIE"));

                // Update item
                mockMvc.perform(multipart(HttpMethod.PUT, "/api/wardrobe/items/" + itemId)
                                .param("color", "Dark Grey")
                                .param("fit", "Slim")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.color").value("Dark Grey"))
                                .andExpect(jsonPath("$.data.fit").value("Slim"));

                // Delete item
                mockMvc.perform(delete("/api/wardrobe/items/" + itemId)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isOk());

                // Verify deleted item is not found
                mockMvc.perform(get("/api/wardrobe/items/" + itemId)
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isNotFound());
        }

        @Test
        void testCrossUserWardrobeIsolation() throws Exception {
                // User 1 creates an item
                MockMultipartFile front = new MockMultipartFile("frontImage", "jacket.png", "image/png",
                                "jacket".getBytes());
                MvcResult res = mockMvc.perform(multipart("/api/wardrobe/items")
                                .file(front)
                                .param("category", "JACKET")
                                .param("color", "Brown")
                                .header("Authorization", "Bearer " + user1Token))
                                .andExpect(status().isCreated())
                                .andReturn();

                UUID u1ItemId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString())
                                .path("data").path("id").asText());

                // User 2 cannot access User 1's item
                mockMvc.perform(get("/api/wardrobe/items/" + u1ItemId)
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());

                // User 2 cannot update User 1's item
                mockMvc.perform(multipart(HttpMethod.PUT, "/api/wardrobe/items/" + u1ItemId)
                                .param("color", "Black")
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());

                // User 2 cannot delete User 1's item
                mockMvc.perform(delete("/api/wardrobe/items/" + u1ItemId)
                                .header("Authorization", "Bearer " + user2Token))
                                .andExpect(status().isNotFound());
        }
}
