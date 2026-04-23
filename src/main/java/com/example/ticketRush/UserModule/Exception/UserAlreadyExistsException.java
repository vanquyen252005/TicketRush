package com.example.ticketRush.UserModule.Exception;

/**
 * Exception khi người dùng đăng ký với email đã tồn tại.
 */
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
