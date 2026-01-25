package org.kmurygin.healthycarbs.storage;

import org.springframework.web.multipart.MultipartFile;

public interface ImageValidator {
    String validate(MultipartFile file);

    String extensionForContentType(String contentType);
}
