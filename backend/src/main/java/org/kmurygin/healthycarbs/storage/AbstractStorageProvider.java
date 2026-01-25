package org.kmurygin.healthycarbs.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.exception.StorageUnavailableException;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@RequiredArgsConstructor
public abstract class AbstractStorageProvider implements StorageProvider {

    private static final Pattern FILENAME_PATTERN = Pattern.compile("[a-zA-Z0-9._-]+");

    protected final StorageProperties storageProperties;
    protected final StorageFolderValidator storageFolderValidator;
    protected final ImageValidator imageValidator;

    protected abstract String doUpload(
            String folder, String filename, InputStream inputStream, String contentType
    ) throws IOException;

    protected abstract void doDelete(String folder, String filename) throws IOException;

    protected abstract String getBaseUrl();

    @Override
    public StorageUploadResult uploadFile(MultipartFile file, String folder) {
        String detectedType = imageValidator.validate(file);
        String targetFolder = storageFolderValidator.normalizeFolder(folder);

        try {
            String contentTypeExtension = imageValidator.extensionForContentType(detectedType);
            String safeFileName = UUID.randomUUID() + "." + contentTypeExtension;

            try (InputStream inputStream = file.getInputStream()) {
                String url = doUpload(targetFolder, safeFileName, inputStream, detectedType);
                String key = buildStorageKey(targetFolder, safeFileName);
                return new StorageUploadResult(url, key, detectedType);
            }
        } catch (IOException e) {
            throw new StorageUnavailableException("Failed to store file.", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (!StringUtils.hasText(fileUrl)) {
            throw new BadRequestException("Invalid file URL: " + fileUrl);
        }

        String baseUrl = getBaseUrl();
        if (!StringUtils.hasText(baseUrl) || !fileUrl.startsWith(baseUrl)) {
            throw new BadRequestException("Invalid file URL.");
        }

        String relativePath = extractRelativePath(fileUrl, baseUrl);
        deleteFileByKey(relativePath);
    }

    @Override
    public void deleteFileByKey(String key) {
        if (!StringUtils.hasText(key)) {
            throw new BadRequestException("Invalid file key: " + key);
        }
        String normalizedKey = key.trim();
        storageFolderValidator.validateObjectPath(normalizedKey);

        int pathSeparatorIndex = normalizedKey.lastIndexOf('/');
        if (pathSeparatorIndex <= 0 || pathSeparatorIndex == normalizedKey.length() - 1) {
            throw new BadRequestException("Invalid file key format: " + normalizedKey);
        }

        String folder = storageFolderValidator.normalizeFolder(normalizedKey.substring(0, pathSeparatorIndex));
        String filename = validateFilename(normalizedKey.substring(pathSeparatorIndex + 1));

        try {
            doDelete(folder, filename);
        } catch (IOException ex) {
            throw new StorageUnavailableException("Failed to delete file: " + normalizedKey, ex);
        }
    }

    private String extractRelativePath(String fileUrl, String baseUrl) {
        String relative = fileUrl.substring(baseUrl.length());
        return StringUtils.trimLeadingCharacter(relative, '/');
    }

    private String validateFilename(String filename) {
        if (!StringUtils.hasText(filename)) {
            throw new BadRequestException("Invalid filename: " + filename);
        }
        String normalized = filename.trim();
        if (normalized.contains("..") || !FILENAME_PATTERN.matcher(normalized).matches()) {
            throw new BadRequestException("Invalid filename: " + filename);
        }
        return normalized;
    }

    protected String buildUrl(String base, String... parts) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(base);
        for (String part : parts) {
            builder.pathSegment(StringUtils.trimLeadingCharacter(part, '/'));
        }
        return builder.build().toUriString();
    }

    protected String buildStorageKey(String folder, String filename) {
        return folder + "/" + filename;
    }
}
