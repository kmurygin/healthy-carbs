package org.kmurygin.healthycarbs.storage;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Service
@Profile("prod")
public class S3StorageProvider extends AbstractStorageProvider {

    private final S3Client s3Client;

    @SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
    public S3StorageProvider(S3Client s3Client,
                             StorageProperties storageProperties,
                             StorageFolderValidator storageFolderValidator,
                             ImageValidator imageValidator
    ) {
        super(storageProperties, storageFolderValidator, imageValidator);
        this.s3Client = s3Client;
    }

    @PostConstruct
    void validateConfiguration() {
        getBucketName();
        getBaseUrl();
    }

    @Override
    protected String doUpload(
            String folder, String filename, InputStream inputStream, String contentType
    )
            throws IOException {
        String bucketName = getBucketName();
        String objectName = buildObjectName(folder, filename);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectName)
                .contentType(contentType)
                .cacheControl(storageProperties.getCacheControl())
                .build();

        byte[] content = inputStream.readAllBytes();
        s3Client.putObject(request, RequestBody.fromBytes(content));

        return buildPublicUrl(objectName);
    }

    @Override
    protected void doDelete(String folder, String filename) {
        String bucketName = getBucketName();
        String objectName = buildObjectName(folder, filename);

        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(objectName)
                .build());
    }

    @Override
    protected String getBaseUrl() {
        String base = storageProperties.getPublicBaseUrl();
        if (base == null || base.isBlank()) {
            throw new IllegalStateException("Storage public base URL is not configured.");
        }
        return base;
    }

    private String getBucketName() {
        String bucketName = storageProperties.getBucketName();
        if (bucketName == null || bucketName.isBlank()) {
            throw new IllegalStateException("Storage bucket name is not configured.");
        }
        return bucketName;
    }

    private String buildObjectName(String folder, String filename) {
        return "%s/%s".formatted(folder, filename);
    }

    private String buildPublicUrl(String objectName) {
        return buildUrl(getBaseUrl(), objectName);
    }
}
