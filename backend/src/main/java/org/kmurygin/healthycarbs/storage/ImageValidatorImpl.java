package org.kmurygin.healthycarbs.storage;

import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.apache.tika.mime.MimeTypeException;
import org.apache.tika.mime.MimeTypes;
import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.exception.StorageValidationException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PushbackInputStream;
import java.util.Iterator;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ImageValidatorImpl implements ImageValidator {

    private static final int HEADER_BUFFER_SIZE_BYTES = 8 * 1024;
    private static final double BYTES_IN_MB = 1024.0 * 1024.0;
    private static final Tika TIKA = new Tika();

    private final StorageProperties storageProperties;

    @Override
    public String validate(MultipartFile file) {
        validateNotEmpty(file);
        validateSize(file);

        int bufferSize = HEADER_BUFFER_SIZE_BYTES;
        try (
                InputStream rawInput = file.getInputStream();
                PushbackInputStream pushbackInput = new PushbackInputStream(rawInput, bufferSize)
        ) {
            String originalFilename = file.getOriginalFilename();
            String detectedType = detectContentType(pushbackInput, bufferSize, originalFilename);
            validateContentType(detectedType);

            try (ImageInputStream imageStream = ImageIO.createImageInputStream(pushbackInput)) {
                validateImageDimensions(imageStream, detectedType, originalFilename);
            }
            return detectedType;
        } catch (IOException e) {
            throw new BadRequestException("Error reading file content during validation: "
                    + file.getOriginalFilename());
        }
    }

    @Override
    public String extensionForContentType(String contentType) {
        if (contentType == null) {
            throw new StorageValidationException("Content type must not be null");
        }
        String preferredExtension = SupportedImageType.fromMimeType(contentType)
                .map(SupportedImageType::getExtension)
                .orElse(null);
        if (preferredExtension != null) {
            return preferredExtension;
        }
        try {
            String mimeExtension = MimeTypes
                    .getDefaultMimeTypes()
                    .forName(contentType.toLowerCase())
                    .getExtension();
            if (mimeExtension == null || mimeExtension.isBlank()) {
                throw new StorageValidationException("Unsupported content type: " + contentType);
            }
            return mimeExtension.startsWith(".")
                    ? mimeExtension.substring(1)
                    : mimeExtension;
        } catch (MimeTypeException e) {
            throw new StorageValidationException("Unsupported content type: " + contentType, e);
        }
    }

    private double convertBytesToMB(long bytes) {
        return bytes / BYTES_IN_MB;
    }

    private void validateNotEmpty(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            String filename = file == null
                    ? "null"
                    : file.getOriginalFilename();
            throw new BadRequestException("File is empty or null: " + filename);
        }
    }

    private void validateSize(MultipartFile file) {
        long fileSize = file.getSize();
        long maxFileSize = storageProperties.getMaxFileSizeBytes();
        if (fileSize > maxFileSize) {
            double sizeMb = convertBytesToMB(fileSize);
            double maxMb = convertBytesToMB(maxFileSize);
            throw new BadRequestException("File too large (" + String.format("%.2f", sizeMb)
                    + " MB). Max is " + String.format("%.2f", maxMb) + " MB.");
        }
    }

    private String detectContentType(PushbackInputStream pushbackInput, int bufferSize, String filename)
            throws IOException {
        byte[] header = pushbackInput.readNBytes(bufferSize);
        String detectedType = TIKA.detect(header, filename);
        pushbackInput.unread(header);
        return detectedType;
    }

    private void validateContentType(String detectedType) {
        Set<String> allowedContentTypes = getAllowedContentTypes();
        if (!allowedContentTypes.contains(detectedType)) {
            throw new BadRequestException("Invalid file type: " + detectedType
                    + ". Allowed: " + formatAllowedContentTypes());
        }
    }

    private void validateImageDimensions(
            ImageInputStream imageStream,
            String detectedType,
            String originalFilename
    ) throws IOException {
        if (imageStream == null) {
            throw new BadRequestException("Invalid image file: cannot read image stream: "
                    + originalFilename);
        }

        Iterator<ImageReader> readers = ImageIO.getImageReaders(imageStream);
        if (!readers.hasNext()) {
            throw new BadRequestException("Invalid image file: unsupported format: "
                    + detectedType);
        }

        ImageReader reader = readers.next();
        try {
            reader.setInput(imageStream, true, true);
            int width = reader.getWidth(0);
            int height = reader.getHeight(0);
            int maxDimension = storageProperties.getMaxImageDimension();
            if (width <= 0 || height <= 0) {
                throw new BadRequestException("Invalid image file: empty dimensions. "
                        + width + "x" + height);
            }
            if (width > maxDimension || height > maxDimension) {
                throw new BadRequestException("Image dimensions too large: " + width + "x"
                        + height + ". Max is " + maxDimension + "x" + maxDimension + ".");
            }
        } finally {
            reader.dispose();
        }
    }

    private Set<String> getAllowedContentTypes() {
        return storageProperties.getAllowedContentTypes()
                .stream()
                .map(SupportedImageType::getMimeType)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    private String formatAllowedContentTypes() {
        return storageProperties.getAllowedContentTypes()
                .stream()
                .map(SupportedImageType::getFriendlyName)
                .collect(Collectors.joining(", "));
    }
}
