# Spring Boot API. Multi-stage: the JDK and the Maven cache stay in the builder,
# only the fat jar reaches the runtime image.
#
# Java 25 -- matches <java.version> in pom.xml and .github/workflows/ci.yml.

FROM eclipse-temurin:25-jdk AS build
WORKDIR /build

# Copy the wrapper and pom first so dependency resolution is cached and only
# re-runs when pom.xml actually changes.
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src ./src
RUN ./mvnw -B -q clean package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app

# Never run as root.
RUN useradd --system --create-home --uid 1001 spring
USER spring

COPY --from=build --chown=spring:spring /build/target/*.jar app.jar

# Oracle wallet is mounted at runtime, never baked in (docs/OCI-setup.md section 6).
ENV TNS_ADMIN=/app/wallet

EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
