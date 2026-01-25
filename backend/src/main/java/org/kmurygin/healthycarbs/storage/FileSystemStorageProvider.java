package org.kmurygin.healthycarbs.storage;

import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.exception.StorageAccessDeniedException;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Slf4j
@Service
@Profile("dev")
public class FileSystemStorageProvider extends AbstractStorageProvider {

    private final Path baseDir;

    public FileSystemStorageProvider(StorageProperties storageProperties,
                                     StorageFolderValidator storageFolderValidator,
                                     ImageValidator imageValidator
    ) {
        super(storageProperties, storageFolderValidator, imageValidator);
        this.baseDir = resolveBaseDir(storageProperties);
    }

    private static Path resolveBaseDir(StorageProperties storageProperties) {
        String uploadDir = storageProperties.getLocalUploadDir();
        if (!StringUtils.hasText(uploadDir)) {
            throw new IllegalStateException("Storage property 'localUploadDir' is not configured.");
        }
        return Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    protected String doUpload(
            String folder, String filename, InputStream inputStream, String contentType
    )
            throws IOException {
        Path targetDir = baseDir.resolve(folder);
        Path targetPath = targetDir.resolve(filename);
        if (!targetPath.normalize().startsWith(baseDir)) {
            throw new StorageAccessDeniedException("Invalid file path: " + targetPath);
        }

        Files.createDirectories(targetDir);
        Path tempPath = Files.createTempFile(targetDir, filename, ".tmp");
        try {
            Files.copy(inputStream, tempPath, StandardCopyOption.REPLACE_EXISTING);
            try {
                Files.move(tempPath, targetPath, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException ex) {
                Files.move(tempPath, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } finally {
            Files.deleteIfExists(tempPath);
        }

        return buildUrl(getBaseUrl(), folder, filename);
    }

    @Override
    protected void doDelete(String folder, String filename) throws IOException {
        Path target = baseDir.resolve(folder).resolve(filename);
        if (!target.normalize().startsWith(baseDir)) {
            throw new StorageAccessDeniedException("Invalid file path: " + target);
        }
        Files.deleteIfExists(target);
    }

    @Override
    protected String getBaseUrl() {
        return storageProperties.getLocalBaseUrl();
    }

}