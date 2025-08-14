# 런타임 전용 이미지 (JAR만 복사)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# 빌드 산출물(JAR)만 복사 – JAR이 하나라는 가정
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
EXPOSE 8081
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
