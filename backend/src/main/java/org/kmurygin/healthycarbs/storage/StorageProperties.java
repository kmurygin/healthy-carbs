package org.kmurygin.healthycarbs.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "application.storage")
public class StorageProperties {
    private String bucketName;
    private String publicBaseUrl;
    private String userProfileImagePrefix = "user-profile-images";
    private String blogPostImagePrefix = "blog-post-images";
    private String localUploadDir = "uploads";
    private String localBaseUrl = "/api/v1/files";
    private String cacheControl = "public, max-age=1209600";
    private long maxFileSizeBytes = 5L * 1024 * 1024;
    private int maxImageDimension = 5000;
    private java.util.List<SupportedImageType> allowedContentTypes = java.util.List.of(
            SupportedImageType.JPEG,
            SupportedImageType.PNG,
            SupportedImageType.GIF,
            SupportedImageType.WEBP
    );

    public void setPublicBaseUrl(String publicBaseUrl) {
        this.publicBaseUrl = cleanUpPath(publicBaseUrl);
    }

    public void setLocalBaseUrl(String localBaseUrl) {
        this.localBaseUrl = cleanUpPath(localBaseUrl);
    }

    private String cleanUpPath(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return value.endsWith("/")
                ? value.substring(0, value.length() - 1)
                : value;
    }
}
