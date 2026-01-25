package org.kmurygin.healthycarbs.storage;

import org.kmurygin.healthycarbs.exception.StorageValidationException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Set;

@Service
public class StorageFolderValidator {

    private final Set<String> allowedFolders;

    public StorageFolderValidator(StorageProperties storageProperties) {
        String userProfileImagePrefix = storageProperties.getUserProfileImagePrefix();
        String blogPostImagePrefix = storageProperties.getBlogPostImagePrefix();

        if (!StringUtils.hasText(userProfileImagePrefix) || !StringUtils.hasText(blogPostImagePrefix)) {
            throw new IllegalStateException("Storage folder prefixes are not configured.");
        }
        this.allowedFolders = Set.of(
                userProfileImagePrefix,
                blogPostImagePrefix
        );
    }

    public String normalizeFolder(String folder) {
        if (!StringUtils.hasText(folder)) {
            throw new StorageValidationException("Invalid target folder: " + folder);
        }

        String trimmedFolder = normalizePath(folder);
        if (trimmedFolder.contains("..")) {
            throw new StorageValidationException("Invalid target folder: " + folder);
        }

        String[] segments = trimmedFolder.split("/");
        if (segments.length == 0 || !StringUtils.hasText(segments[0]) || !allowedFolders.contains(segments[0])) {
            throw new StorageValidationException("Invalid target folder: " + folder);
        }
        for (String segment : segments) {
            if (!StringUtils.hasText(segment)) {
                throw new StorageValidationException("Invalid target folder: " + folder);
            }
        }
        return trimmedFolder;
    }

    public void validateObjectPath(String objectPath) {
        if (!StringUtils.hasText(objectPath)) {
            throw new StorageValidationException("Invalid object path: " + objectPath);
        }

        String normalizedPath = normalizePath(objectPath);

        int pathSeparatorIndex = normalizedPath.indexOf('/');
        if (pathSeparatorIndex <= 0) {
            throw new StorageValidationException("Invalid object path: " + objectPath);
        }

        String folder = normalizedPath.substring(0, pathSeparatorIndex);
        normalizeFolder(folder);
    }

    private String normalizePath(String value) {
        String normalized = value.trim().replace("\\", "/");
        if (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        return normalized;
    }

}
