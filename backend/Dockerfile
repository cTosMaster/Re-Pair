# 런타임 전용 이미지 (JAR만 복사)
FROM eclipse-temurin:21-jre-jammy

# ✨ 핵심: 시스템 CA + Java cacerts 동기화
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates ca-certificates-java && \
    update-ca-certificates -f && \
    /var/lib/dpkg/info/ca-certificates-java.postinst configure && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 빌드 산출물(JAR)만 복사 – JAR이 하나라는 가정
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
EXPOSE 8081
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
