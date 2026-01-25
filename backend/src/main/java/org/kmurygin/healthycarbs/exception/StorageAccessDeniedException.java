package org.kmurygin.healthycarbs.exception;

import org.springframework.http.HttpStatus;

public class StorageAccessDeniedException extends BaseException {

    public StorageAccessDeniedException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }

    public StorageAccessDeniedException(String message, Throwable cause) {
        super(message, cause, HttpStatus.FORBIDDEN);
    }
}
