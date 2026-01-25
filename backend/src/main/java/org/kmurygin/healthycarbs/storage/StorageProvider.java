package org.kmurygin.healthycarbs.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageProvider {
    StorageUploadResult uploadFile(MultipartFile file, String folder);

    void deleteFile(String fileUrl);

    void deleteFileByKey(String key);
}
