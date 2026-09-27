package com.wardrobe.common.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Client s3Client;

    @Value("${storage.s3.bucket:wardrobe-storage}")
    private String defaultBucket;

    @Value("${storage.s3.endpoint:http://localhost:9000}")
    private String s3Endpoint;

    public void ensureBucketExists(String bucketName) {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
        } catch (NoSuchBucketException e) {
            log.info("Bucket {} does not exist. Creating...", bucketName);
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
        } catch (Exception e) {
            log.warn("Could not check/create bucket {}: {}", bucketName, e.getMessage());
        }
    }

    public void uploadFile(String key, InputStream inputStream, long contentLength, String contentType) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(defaultBucket)
                .key(key)
                .contentType(contentType)
                .build();

        s3Client.putObject(request, RequestBody.fromInputStream(inputStream, contentLength));
        log.info("Uploaded object {} to bucket {}", key, defaultBucket);
    }

    public void deleteFile(String key) {
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(defaultBucket)
                    .key(key)
                    .build();
            s3Client.deleteObject(request);
            log.info("Deleted object {} from bucket {}", key, defaultBucket);
        } catch (Exception e) {
            log.warn("Failed to delete object {} from S3: {}", key, e.getMessage());
        }
    }

    public String getObjectUrl(String key) {
        if (key == null || key.isBlank()) {
            return null;
        }
        return String.format("%s/%s/%s", s3Endpoint.replaceAll("/$", ""), defaultBucket, key);
    }

    public boolean checkHealth() {
        try {
            s3Client.listBuckets();
            return true;
        } catch (Exception e) {
            log.error("S3 Health check failed: {}", e.getMessage());
            return false;
        }
    }
}
