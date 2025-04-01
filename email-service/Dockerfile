# Build stage
FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/email-service .

# -------------------------------------------------------

FROM scratch

COPY --from=builder /app/email-service /app/
COPY --from=builder /app/assets/* /app/assets/
COPY --from=builder /app/templates/* /app/templates/

ENV PORT=":8080"
ENV APP_PASSWORD=${APP_PASSWORD}
ENV ADMIN_SECRET=${ADMIN_SECRET}
ENV HASH=${HASH} 

WORKDIR /app

EXPOSE 8080

CMD ["./email-service"]