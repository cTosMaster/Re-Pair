package com.example.asplatform.common.testutil;

import com.example.asplatform.common.enums.Role;
import com.example.asplatform.user.domain.User;

public class TestUserFactory {
	
	public static User user() {
        return User.builder()
                .id(1L)
                .name("홍길동")
                .role(Role.USER)
                .isActive(true)
                .build();
    }
	
	public static User user2() {
        return User.builder()
                .id(2L)
                .name("김영희")
                .role(Role.USER)
                .isActive(true)
                .build();
    }
	
    public static User engineer() {
        return User.builder()
                .id(3L)
                .name("엔지니어1")
                .role(Role.ENGINEER)
                .isActive(true)
                .build();
    }
	
	
	public static User Customer() {
        return User.builder()
                .id(4L)
                .name("고객사관리자1")
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();
    }
	
	public static User admin() {
        return User.builder()
                .id(5L)
                .name("플랫폼관리자1")
                .role(Role.ADMIN)
                .isActive(true)
                .build();
    }

}
