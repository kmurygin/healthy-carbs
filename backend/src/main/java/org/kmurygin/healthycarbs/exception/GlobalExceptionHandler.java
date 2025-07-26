package org.kmurygin.healthycarbs.exception;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;


@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return buildErrorResponse(ex.getMessage(), req, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> conflict(ResourceAlreadyExistsException ex, HttpServletRequest req) {
        return buildErrorResponse(ex.getMessage(), req, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField,
                        e -> e.getDefaultMessage() == null ? "Invalid value" : e.getDefaultMessage(),
                        (a, b) -> a + "; " + b));
        return buildErrorResponse("Validation failed", req, HttpStatus.BAD_REQUEST, fieldErrors);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> typeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        assert ex.getRequiredType() != null;
        String msg = "Parameter '%s' should be of type '%s'"
                .formatted(ex.getName(), ex.getRequiredType().getSimpleName());
        return buildErrorResponse(msg, req, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({ExpiredJwtException.class, SignatureException.class})
    public ResponseEntity<ErrorResponse> jwt(RuntimeException ex, HttpServletRequest req) {
        return buildErrorResponse("Invalid or expired JWT", req, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> unhandled(Exception ex, HttpServletRequest req) {
        return buildErrorResponse("An unexpected error occurred", req, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(
            String msg, HttpServletRequest req, HttpStatus status) {
        return buildErrorResponse(msg, req, status, null);
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(
            String msg, HttpServletRequest req, HttpStatus status,
            Map<String, String> fieldErrors) {

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .type(status.getReasonPhrase())
                .message(msg)
                .path(req.getRequestURI())
                .fieldErrors(fieldErrors)
                .build();

        return ResponseEntity.status(status).body(body);
    }
}

