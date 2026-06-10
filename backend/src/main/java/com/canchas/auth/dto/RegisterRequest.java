package com.canchas.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank
        @Email(
                regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                message = "El correo debe tener un formato valido (ej. nombre@correo.com)"
        )
        String email,
        @NotBlank @Size(min = 8, max = 72)
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).+$", message = "La contrasena debe incluir mayuscula, minuscula y numero")
        String password,
        @NotBlank @Size(min = 3, max = 180) String fullName,
        @Pattern(
                regexp = "^3\\d{9}$",
                message = "El telefono debe tener 10 digitos numericos y comenzar con 3 (ej. 3001234567)"
        )
        @Size(max = 10)
        String phone
) {
}
