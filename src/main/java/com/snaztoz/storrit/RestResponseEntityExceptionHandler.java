/* 
** Copyright (c) 2020 snaztoz.
** This project is under MIT License.
*/

package com.snaztoz.storrit;

import java.util.List;

import org.springframework.data.rest.core.RepositoryConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.validation.Errors;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Class ini bertujuan agar exception yang dilempar oleh Spring dapat dihandle
 * dengan benar ketika terdapat kesalahan pada input.
 * 
 * Sebagai contoh, tanpa adanya class ini, status http yang dihasilkan ketika
 * terjadi error berupa 500 (internal server error), serta pesan yang dihasilkan
 * pun juga kurang berarti.
 *
 * @author snaztoz
 */
@ControllerAdvice
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Menghandle exception yang dihasilkan ketika input dari API yang diterima
     * tidak berhasil melewati tahap validasi.
     *
     * @param ex Exception yang terjadi.
     * @param request Object dari request.
     * @return HTTP response yang memuat pesan error (secara default, JSON).
     */
    @ExceptionHandler(value={RepositoryConstraintViolationException.class})
    protected ResponseEntity<Object> handleRest(RuntimeException ex, WebRequest request) {
        StringBuffer errBuff = new StringBuffer();

        Errors objErrors = ((RepositoryConstraintViolationException) ex).getErrors();
        for (ObjectError err : objErrors.getAllErrors()) {
            errBuff.append(err.getDefaultMessage());
        }

        String response = String.format("{\"errors\":\"%s\"}", errBuff.toString());

        return handleExceptionInternal(ex, response, new HttpHeaders(),
                HttpStatus.BAD_REQUEST, request);
    }

}