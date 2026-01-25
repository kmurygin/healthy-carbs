package org.kmurygin.healthycarbs.exception;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.catalina.connector.ClientAbortException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

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
        String requiredType = ex.getRequiredType() != null
                ? ex.getRequiredType().getSimpleName()
                : "unknown";
        String msg = "Parameter '%s' should be of type '%s'".formatted(ex.getName(), requiredType);
        return buildErrorResponse(msg, req, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({ExpiredJwtException.class, SignatureException.class})
    public ResponseEntity<ErrorResponse> jwt(RuntimeException ex, HttpServletRequest req) {
        return buildErrorResponse("Invalid or expired JWT", req, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(InvalidOldPasswordException.class)
    public ResponseEntity<ErrorResponse> invalidOldPassword(InvalidOldPasswordException ex, HttpServletRequest req) {
        return buildErrorResponse("Invalid old password", req, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> unauthorized(UnauthorizedException ex, HttpServletRequest req) {
        return buildErrorResponse(ex.getMessage(), req, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> forbidden(ForbiddenException ex, HttpServletRequest req) {
        return buildErrorResponse(ex.getMessage(), req, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> accessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return buildErrorResponse("Access denied", req, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler({OptimisticLockingFailureException.class, DataIntegrityViolationException.class})
    public ResponseEntity<ErrorResponse> conflict(RuntimeException ex, HttpServletRequest req) {
        return buildErrorResponse("Conflict: " + ex.getMessage(), req, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> illegalState(IllegalStateException ex, HttpServletRequest req) {
        return buildErrorResponse(ex.getMessage(), req, HttpStatus.BAD_GATEWAY);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxSizeException(
            MaxUploadSizeExceededException ex, HttpServletRequest req
    ) {
        return buildErrorResponse(ex.getMessage(), req, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    @ExceptionHandler(InvalidOtpException.class)
    public ResponseEntity<ErrorResponse> invalidOtpException(
            InvalidOtpException ex, HttpServletRequest req
    ) {
        return buildErrorResponse(ex.getMessage(), req, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> badRequestException(
            BadRequestException ex, HttpServletRequest req
    ) {
        return buildErrorResponse(ex.getMessage(), req, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(StorageException.class)
    public ResponseEntity<ErrorResponse> storageException(
            StorageException ex, HttpServletRequest req
    ) {
        logger.error("Storage error: {}", ex.getMessage(), ex);
        return buildErrorResponse(ex.getMessage(), req, ex.getStatus());
    }

    @ExceptionHandler({
            StorageAccessDeniedException.class,
            StorageObjectNotFoundException.class,
            StorageUnavailableException.class,
            StorageValidationException.class
    })
    public ResponseEntity<ErrorResponse> storageSpecialized(
            BaseException ex, HttpServletRequest req
    ) {
        logger.error("Storage error: {}", ex.getMessage(), ex);
        return buildErrorResponse(ex.getMessage(), req, ex.getStatus());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> unhandled(Exception ex, HttpServletRequest req) {
        logger.error("Unhandled exception at {}: {}", req.getRequestURI(), ex.getMessage(), ex);
        return buildErrorResponse(ex.getMessage(), req, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private String generateTraceId() {
        return UUID.randomUUID().toString();
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(
            String msg, HttpServletRequest req, HttpStatus status) {
        return buildErrorResponse(msg, req, status, null);
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(
            String msg, HttpServletRequest req, HttpStatus status,
            Map<String, String> fieldErrors) {

        ErrorResponse body = ErrorResponse.builder()
                .traceId(generateTraceId())
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
