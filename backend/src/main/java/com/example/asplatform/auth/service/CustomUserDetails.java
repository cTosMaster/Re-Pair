// src/main/java/com/example/asplatform/auth/service/CustomUserDetails.java
package com.example.asplatform.auth.service;

import com.example.asplatform.common.enums.Role;
import com.example.asplatform.user.domain.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

@Getter
public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(user.getIsActive());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // — 편의 메서드 —
    public Long getId() {
        return user.getId();
    }

    public String getName() {
        return user.getName();
    }

    public String getImageUrl() {
        return user.getImageUrl();
    }
    
    public Long getCustomerId() {
    	 return (user.getCustomer() != null) ? user.getCustomer().getId() : null;
    }

    public boolean isPlatformAdmin() {
    	return user.getRole() == Role.ADMIN;
    }
}
