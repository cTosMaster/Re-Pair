# ---------- build stage ----------
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app

# Wrapper & 의존성 먼저 (캐시 효율↑)
COPY mvnw ./
COPY .mvn .mvn
COPY pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline

# 실제 소스
COPY src ./src

# 패키징
RUN ./mvnw -q -DskipTests package

# ---------- run stage ----------
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# 빌드 결과물 복사
COPY --from=builder /app/target/*.jar app.jar

# (선택) 비루트 실행 – K8s에서 securityContext 쓰면 생략 가능
# RUN addgroup --system app && adduser --system --ingroup app app
# USER app

EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]