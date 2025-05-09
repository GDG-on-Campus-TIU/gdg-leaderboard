package main

import (
	"crypto/sha256"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"email-service/email"
	"email-service/models"
)

func GenerateHash(input string) string {
	hash := sha256.Sum256([]byte(input))
	return fmt.Sprintf("%x", hash)
}

// StartServer initializes the Gin router and defines the API endpoint.
func StartServer() {
	router := gin.Default()

	// @INFO cors middleware to allow requests from any origin
	router.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "" {
			c.Next()
			return
		}

		// Allow only gdgtiu.dev and its subdomains + localhost
		if origin == "http://localhost:3001" || origin == "http://localhost:5173" || strings.HasSuffix(origin, ".gdgtiu.dev") || origin == "https://gdgtiu.dev" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true") // @NOTE only if the origin is trusted and not a wildcard
		}

		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// @INFO health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// @INFO POST endpoint to process email sending
	router.POST("/api/id-card/send", func(c *gin.Context) {
		var student models.Student
		if err := c.ShouldBindJSON(&student); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Process the email sending concurrently
		log.Printf("Sending email to %s\n", student.Email)
		go func(s models.Student) {
			if err := email.SendEmail(s); err != nil {
				log.Printf("Error sending email to %s: %v\n", s.Email, err)
			}
		}(student)

		c.JSON(http.StatusOK, gin.H{"message": "Email is being processed"})
	})

	router.POST("/api/receipt/send", func(c *gin.Context) {
		var receipt models.ReceiptDTO
		if err := c.ShouldBindJSON(&receipt); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		log.Printf("Sending receipt for %s\n", receipt.Email)
		go func(r models.ReceiptDTO) {
			if err := email.SendEmailWithReceipt(r); err != nil {
				log.Printf("Error sending receipt for %s: %v\n", r.Email, err)
			}
		}(receipt)

		c.JSON(http.StatusOK, gin.H{"message": "Receipt is being processed"})
	})

	// Start the server on port :8080
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
