<<<<<<< HEAD
package main

import (
	"crypto/sha256"
	"fmt"
	"log"
	"net/http"
	"os"

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

	// @INFO health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// @INFO POST endpoint to process email sending
	router.POST("/api/id-card/send", func(c *gin.Context) {
		queryHash := c.Query("h")
		secretHash := GenerateHash(os.Getenv("ADMIN_SECRET"))
		if queryHash != secretHash {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

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

	// Start the server on port :8080
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
=======
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

		// Allow only gdgtiu.org and its subdomains + localhost
		if origin == "http://localhost:3001" || strings.HasSuffix(origin, ".gdgtiu.org") || origin == "https://gdgtiu.org" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true") // only if needed
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
		// queryHash := c.Query("h")
		// secretHash := GenerateHash(utils.GetEnv("ADMIN_SECRET"))
		// if queryHash != secretHash {
		// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		// 	return
		// }

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

	// Start the server on port :8080
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
>>>>>>> 1bcc234c578f82fb7578181fb457d74e32a5fe49
