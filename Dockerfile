FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY LoopRideApp.java .

RUN javac -d . LoopRideApp.java

ENV PORT=10000

EXPOSE 10000

CMD ["sh", "-c", "java project.LoopRideApp \"$PORT\""]
