package fu.se.cinemaxtheaterbe.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalException {

    private static final Logger log = LoggerFactory.getLogger(GlobalException.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatus(ResponseStatusException exception) {
        return new ResponseEntity<>(exception.getReason(), HttpStatus.valueOf(exception.getStatusCode().value()));
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<String> handleValidation(BindException exception) {
        String message = exception.getFieldError() != null
                ? exception.getFieldError().getDefaultMessage()
                : "Validation failed";
        return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAll(Exception exception) {
        log.error("Unhandled exception", exception);
        return new ResponseEntity<>("Internal error: " + exception.getClass().getSimpleName() + " - " + exception.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
