# Build stage
FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git ca-certificates openssl

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/email-service .

# -------------------------------------------------------

FROM scratch

# Copy the CA certificates from the builder stage
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

COPY --from=builder /app/email-service /app/
COPY --from=builder /app/assets/* /app/assets/
COPY --from=builder /app/templates/* /app/templates/
COPY --from=builder /app/output/* /app/output/
COPY --from=builder /app/output/resized_pfp/ /app/output/resized_pfp/

ENV GO_PORT=":8080"
ENV APP_PASSWORD=${APP_PASSWORD}
ENV ADMIN_SECRET=${ADMIN_SECRET}
ENV HASH=${HASH} 

WORKDIR /app

EXPOSE 8080

CMD ["./email-service"]