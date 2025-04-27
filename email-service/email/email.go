package email

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
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
	cfg := config.NewConfig()

	tmplPath := filepath.Join("templates", "email_template.html")
	tmpl, err := template.ParseFiles(tmplPath)
	if err != nil {
		return fmt.Errorf("failed to parse email template: %w", err)
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, student); err != nil {
		return fmt.Errorf("failed to execute email template: %w", err)
	}

	m := gomail.NewMessage()
	m.SetHeader("From", cfg.SenderEmail)
	m.SetHeader("To", student.Email)
	m.SetHeader("Subject", "Your Student ID Card")
	m.SetBody("text/html", body.String())

	idCardPath, err := card.GenerateIDCard(student)
	m.Attach(idCardPath)

	d := gomail.NewDialer(cfg.SMTPServer, cfg.SMTPPort, cfg.SenderEmail, cfg.AppPassword)

	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Println("Email sent successfully to", student.Email)
	return nil
}

// SendEmailWithReceipt composes and sends an email with an attached receipt image.
func SendEmailWithReceipt(receipt models.ReceiptDTO) error {
	cfg := config.NewConfig()

	tmplPath := filepath.Join("templates", "receipt_email.html")
	tmpl, err := template.ParseFiles(tmplPath)
	if err != nil {
		return fmt.Errorf("failed to parse receipt email template: %w", err)
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, receipt); err != nil {
		return fmt.Errorf("failed to execute receipt email template: %w", err)
	}

	m := gomail.NewMessage()
	m.SetHeader("From", cfg.SenderEmail)
	m.SetHeader("To", receipt.Email)
	m.SetHeader("Subject", "Your Purchase Receipt")
	m.SetBody("text/html", body.String())

	receiptImgPath, err := card.GenerateReceiptImage(receipt)
	if err == nil {
		m.Attach(receiptImgPath)
	}

	d := gomail.NewDialer(cfg.SMTPServer, cfg.SMTPPort, cfg.SenderEmail, cfg.AppPassword)

	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send receipt email: %w", err)
	}

	log.Println("Receipt email sent successfully to", receipt.Email)
	return nil
}
