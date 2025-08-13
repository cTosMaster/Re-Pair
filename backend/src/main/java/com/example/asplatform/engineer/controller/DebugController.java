package com.example.asplatform.engineer.controller;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/_debug")
public class DebugController {
    @GetMapping("/whoami")
    public Map<String, Object> whoami() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        return Map.of(
                "name", a.getName(),
                "authorities", a.getAuthorities().toString(),
                "principal", a.getPrincipal().getClass().getSimpleName()
        );
    }
}