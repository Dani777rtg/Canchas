package com.canchas.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 72)
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).+$", message = "La contrasena debe incluir mayuscula, minuscula y numero")
        String password,
        @NotBlank @Size(min = 3, max = 180) String fullName,
        @Size(max = 30) String phone
) {
}
