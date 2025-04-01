package email

import (
	"bytes"
	"fmt"
	"html/template"
	"path/filepath"

	"gopkg.in/gomail.v2"

	"email-service/card"
	"email-service/config"
	"email-service/models"
)

// SendEmail composes and sends an email with an attached ID card.
// It uses the gomail package to handle SMTP communication.
// The email body is generated from an HTML template file, which is populated with student data.
// The ID card is generated using the card package and attached to the email.
// The function returns an error if any step in the process fails.
// The function takes a student object as input, which contains the student's information.
// The function uses the config package to load SMTP server configuration.
func SendEmail(student models.Student) error {
	// Load configuration
	cfg := config.NewConfig()

	// Load the HTML email template file
	tmplPath := filepath.Join("templates", "email_template.html")
	tmpl, err := template.ParseFiles(tmplPath)
	if err != nil {
		return fmt.Errorf("failed to parse email template: %w", err)
	}

	// Execute the template with student data
	var body bytes.Buffer
	if err := tmpl.Execute(&body, student); err != nil {
		return fmt.Errorf("failed to execute email template: %w", err)
	}

	// Generate the personalized ID card
	idCardPath, err := card.GenerateIDCard(student)
	if err != nil {
		return fmt.Errorf("failed to generate ID card: %w", err)
	}

	// Set up the email message
	m := gomail.NewMessage()
	m.SetHeader("From", cfg.SenderEmail)
	m.SetHeader("To", student.Email)
	m.SetHeader("Subject", "Your Student ID Card")
	m.SetBody("text/html", body.String())
	m.Attach(idCardPath)

	// Configure the SMTP dialer
	d := gomail.NewDialer(cfg.SMTPServer, cfg.SMTPPort, cfg.SenderEmail, cfg.AppPassword)

	// Send the email
	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	fmt.Println("Email sent successfully to", student.Email)
	return nil
}
