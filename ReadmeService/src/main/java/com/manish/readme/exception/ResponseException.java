package com.manish.readme.exception;

import com.manish.readme.dto.GeneralFailResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ResponseException {
    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<GeneralFailResponseDTO> handleApplicationException(ApplicationException e){
        return new ResponseEntity<>(new GeneralFailResponseDTO(e.getMessage()), HttpStatus.BAD_REQUEST);
    }
}
