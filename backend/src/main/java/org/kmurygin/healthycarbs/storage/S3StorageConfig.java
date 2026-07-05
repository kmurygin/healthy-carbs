package org.kmurygin.healthycarbs.storage;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.util.Assert;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.checksums.RequestChecksumCalculation;
import software.amazon.awssdk.core.checksums.ResponseChecksumValidation;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Configuration
@Profile("prod")
public class S3StorageConfig {

    @Bean
    public S3Client s3Client(StorageProperties storageProperties) {
        StorageProperties.S3 s3 = storageProperties.getS3();
        Assert.hasText(s3.getEndpoint(), "S3 storage endpoint is not configured (STORAGE_S3_ENDPOINT).");
        Assert.hasText(s3.getRegion(), "S3 storage region is not configured (STORAGE_S3_REGION).");
        Assert.hasText(s3.getAccessKey(), "S3 storage access key is not configured (STORAGE_S3_ACCESS_KEY).");
        Assert.hasText(s3.getSecretKey(), "S3 storage secret key is not configured (STORAGE_S3_SECRET_KEY).");

        return S3Client.builder()
                .endpointOverride(URI.create(s3.getEndpoint()))
                .region(Region.of(s3.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(s3.getAccessKey(), s3.getSecretKey())
                ))
                .forcePathStyle(true)
                .requestChecksumCalculation(RequestChecksumCalculation.WHEN_REQUIRED)
                .responseChecksumValidation(ResponseChecksumValidation.WHEN_REQUIRED)
                .build();
    }
}
