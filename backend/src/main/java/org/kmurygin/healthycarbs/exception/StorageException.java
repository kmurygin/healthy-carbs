package org.kmurygin.healthycarbs.exception;

import org.springframework.http.HttpStatus;

public class StorageException extends BaseException {

    public StorageException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public StorageException(String message, Throwable cause) {
        super(message, cause, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
