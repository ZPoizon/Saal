FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN mvn -B -ntp -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN groupadd -r saal && useradd -r -g saal -u 10001 saal
COPY --from=build /workspace/target/saal-api-0.1.0-SNAPSHOT.jar /app/app.jar
USER saal
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
