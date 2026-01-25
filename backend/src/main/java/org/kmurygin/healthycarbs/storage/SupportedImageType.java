package org.kmurygin.healthycarbs.storage;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum SupportedImageType {
    JPEG("image/jpeg", "jpg", "JPEG"),
    PNG("image/png", "png", "PNG"),
    GIF("image/gif", "gif", "GIF"),
    WEBP("image/webp", "webp", "WEBP");

    private final String mimeType;
    private final String extension;
    private final String friendlyName;

    SupportedImageType(String mimeType, String extension, String friendlyName) {
        this.mimeType = mimeType;
        this.extension = extension;
        this.friendlyName = friendlyName;
    }

    public static Optional<SupportedImageType> fromMimeType(String mimeType) {
        if (mimeType == null) {
            return Optional.empty();
        }
        return Arrays.stream(values())
                .filter(type -> type.mimeType.equalsIgnoreCase(mimeType))
                .findFirst();
    }
}
