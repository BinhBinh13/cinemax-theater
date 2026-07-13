package fu.se.cinemaxtheaterbe.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalException {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatus(ResponseStatusException exception) {
        return new ResponseEntity<>(exception.getReason(), HttpStatus.valueOf(exception.getStatusCode().value()));
    }

    // Covers both @RequestBody @Valid (MethodArgumentNotValidException) and
    // @ModelAttribute @Valid failures — MethodArgumentNotValidException extends BindException.
    @ExceptionHandler(BindException.class)
    public ResponseEntity<String> handleValidation(BindException exception) {
        String message = exception.getFieldError() != null
                ? exception.getFieldError().getDefaultMessage()
                : "Validation failed";
        return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
    }
}
