// src/main/java/com/example/asplatform/user/controller/UserController.java
package com.example.asplatform.user.controller;

import com.example.asplatform.auth.dto.responseDTO.MessageResponse;
import com.example.asplatform.user.dto.requestDTO.RegisterRequest;
import com.example.asplatform.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** 회원가입 */
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(
            @Valid @RequestBody RegisterRequest req
    ) {
        userService.register(req);
        return ResponseEntity.ok(
                new MessageResponse("회원가입이 완료되었습니다.")
        );
    }
}
