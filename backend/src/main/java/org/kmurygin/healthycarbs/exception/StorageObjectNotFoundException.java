package org.kmurygin.healthycarbs.exception;

import org.springframework.http.HttpStatus;

public class StorageObjectNotFoundException extends BaseException {

    public StorageObjectNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }

    public StorageObjectNotFoundException(String message, Throwable cause) {
        super(message, cause, HttpStatus.NOT_FOUND);
    }
}
