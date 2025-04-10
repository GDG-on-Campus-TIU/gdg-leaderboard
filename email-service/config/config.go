package config

import (
	"email-service/utils"
)

// Config holds configuration values for the email service.
type Config struct {
	SMTPServer  string
	SMTPPort    int
	SenderEmail string
	AppPassword string
}

// NewConfig returns a new configuration instance.
func NewConfig() *Config {
	return &Config{
		SMTPServer:  "smtp.gmail.com",
		SMTPPort:    587,
		SenderEmail: utils.GetEnv("SENDER_EMAIL"),
		AppPassword: utils.GetEnv("APP_PASSWORD"),
	}
}
