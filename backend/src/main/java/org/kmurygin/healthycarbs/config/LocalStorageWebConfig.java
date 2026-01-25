package org.kmurygin.healthycarbs.config;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.storage.StorageProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class LocalStorageWebConfig implements WebMvcConfigurer {

    private final StorageProperties storageProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String baseUrl = normalizeBaseUrl(storageProperties.getLocalBaseUrl());
        String location = Path.of(storageProperties.getLocalUploadDir())
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();
        registry.addResourceHandler(baseUrl + "/**")
                .addResourceLocations(location)
                .setCachePeriod(0);
    }

    private String normalizeBaseUrl(String baseUrl) {
        if (!StringUtils.hasText(baseUrl)) {
            throw new IllegalStateException("Storage property 'localBaseUrl' is not configured.");
        }
        String normalizedUrl = baseUrl.startsWith("/")
                ? baseUrl
                : "/" + baseUrl;
        return normalizedUrl.replaceAll("/+$", "");
    }
}
