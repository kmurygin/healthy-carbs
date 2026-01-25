package org.kmurygin.healthycarbs.storage;

public record StorageUploadResult(
        String url,
        String key,
        String contentType
) {
}
