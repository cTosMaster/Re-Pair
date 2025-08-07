package com.example.asplatform.common.testutil;

import com.example.asplatform.common.enums.Role;
import com.example.asplatform.user.domain.User;

public class TestUserFactory {
	
	public static User admin() {
        return User.builder()
                .id(1L)
                .name("관리자A")
                .role(Role.ADMIN)
                .isActive(true)
                .build();
    }

    public static User engineer() {
        return User.builder()
                .id(2L)
                .name("수리기사B")
                .role(Role.ENGINEER)
                .isActive(true)
                .build();
    }

    public static User clientUser() {
        return User.builder()
                .id(3L)
                .name("고객C")
                .role(Role.USER)
                .isActive(true)
                .build();
    }
}
