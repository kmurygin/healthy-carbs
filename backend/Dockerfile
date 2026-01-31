FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true -Dliquibase.skip=true

FROM eclipse-temurin:21-jdk-jammy
ENV JAVA_TOOL_OPTIONS="-Djava.awt.headless=true"
COPY --from=builder /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
