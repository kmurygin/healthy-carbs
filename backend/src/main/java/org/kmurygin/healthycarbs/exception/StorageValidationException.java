package org.kmurygin.healthycarbs.exception;

import org.springframework.http.HttpStatus;

public class StorageValidationException extends BaseException {

    public StorageValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }

    public StorageValidationException(String message, Throwable cause) {
        super(message, cause, HttpStatus.BAD_REQUEST);
    }
}
