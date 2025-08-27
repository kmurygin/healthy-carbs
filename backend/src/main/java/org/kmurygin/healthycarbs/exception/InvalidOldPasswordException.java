package org.kmurygin.healthycarbs.exception;

import org.springframework.http.HttpStatus;

public class InvalidOldPasswordException extends BaseException {
    public InvalidOldPasswordException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
