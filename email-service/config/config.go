package config

import (
	"os"
)

// Config holds configuration values for the email service.
type Config struct {
	SMTPServer  string
	SMTPPort    int
	SenderEmail string
	AppPassword string
}

// NewConfig returns a new configuration instance.
// In production, consider reading these from environment variables or a config file.
func NewConfig() *Config {

	return &Config{
		SMTPServer:  "smtp.gmail.com",
		SMTPPort:    587,
		SenderEmail: "gdgoncampustiu@gmail.com",
		AppPassword: os.Getenv("APP_PASSWORD"),
	}
}
