package org.kmurygin.healthycarbs.storage;

import com.google.cloud.WriteChannel;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.channels.Channels;

@Slf4j
@Service
@Profile("prod")
public class GcsStorageProvider extends AbstractStorageProvider {

    private static final String DEFAULT_PUBLIC_URL_BASE = "https://storage.googleapis.com";

    private final Storage storage;

    public GcsStorageProvider(Storage storage,
                              StorageProperties storageProperties,
                              StorageFolderValidator storageFolderValidator,
                              ImageValidator imageValidator
    ) {
        super(storageProperties, storageFolderValidator, imageValidator);
        this.storage = storage;
    }

    @PostConstruct
    void validateConfiguration() {
        getBucketName();
    }

    @Override
    protected String doUpload(
            String folder, String filename, InputStream inputStream, String contentType
    )
            throws IOException {
        String bucketName = getBucketName();
        String objectName = buildObjectName(folder, filename);

        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, objectName)
                .setContentType(contentType)
                .setCacheControl(storageProperties.getCacheControl())
                .build();

        try (WriteChannel writer = storage.writer(blobInfo)) {
            inputStream.transferTo(Channels.newOutputStream(writer));
        }

        return buildPublicUrl(objectName);
    }

    @Override
    protected void doDelete(String folder, String filename) {
        String bucketName = getBucketName();
        String objectName = buildObjectName(folder, filename);

        boolean deleted = storage.delete(bucketName, objectName);
        if (!deleted) {
            log.debug("GCS object not found or already deleted: {}", objectName);
        }
    }

    @Override
    protected String getBaseUrl() {
        String base = storageProperties.getPublicBaseUrl();
        String bucketName = getBucketName();
        if (base == null || base.isBlank()) {
            return DEFAULT_PUBLIC_URL_BASE + "/" + bucketName;
        }
        return base;
    }

    private String getBucketName() {
        String bucketName = storageProperties.getBucketName();
        if (bucketName == null || bucketName.isBlank()) {
            throw new IllegalStateException("GCS bucket name is not configured.");
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
