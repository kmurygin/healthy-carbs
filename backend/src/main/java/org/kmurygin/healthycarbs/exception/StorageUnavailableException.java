package org.kmurygin.healthycarbs.exception;

import org.springframework.http.HttpStatus;

public class StorageUnavailableException extends BaseException {

    public StorageUnavailableException(String message) {
        super(message, HttpStatus.SERVICE_UNAVAILABLE);
    }

    public StorageUnavailableException(String message, Throwable cause) {
        super(message, cause, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
