package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {

	// Load environment variables from .env file
	if os.Getenv("ENV") == "dev" {
		log.Println("Loading environment variables from .env file")
		if err := godotenv.Load(); err != nil {
			panic("Error loading .env file")
		}
	} else {
		if err := godotenv.Load(); err != nil {
			log.Println("Error loading .env file")
		}
		log.Println("Loading environment variables from system")
	}

	secretHash := GenerateHash(os.Getenv("ADMIN_SECRET"))
	log.Println("Secret Hash: ", secretHash)

	log.Println("Starting Email Service...")
	StartServer()
}
