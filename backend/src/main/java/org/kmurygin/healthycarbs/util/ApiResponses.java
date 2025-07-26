package org.kmurygin.healthycarbs.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ApiResponses {
    public static <T> ResponseEntity<ApiResponse<T>> success(T data) {
        ApiResponse<T> body = ApiResponse.<T>builder()
                .status(true)
                .data(data)
                .build();
        return ResponseEntity.ok(body);
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(HttpStatus status, T data, String message) {
        ApiResponse<T> body = ApiResponse.<T>builder()
                .status(true)
                .message(message)
                .data(data)
                .build();
        return ResponseEntity.status(status).body(body);
    }

    public static <T> ResponseEntity<ApiResponse<T>> failure(HttpStatus status, String error) {
        ApiResponse<T> body = ApiResponse.<T>builder()
                .status(false)
                .error(error)
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
