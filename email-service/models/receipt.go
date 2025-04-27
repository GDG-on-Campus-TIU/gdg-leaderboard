package models

type ReceiptDTO struct {
	StudentId      string  `json:"studentId" binding:"required"`
	OrderId        string  `json:"orderId" binding:"required"`
	Name           string  `json:"name" binding:"required"`
	Phone          string  `json:"phone" binding:"required"`
	ConfirmationSS string  `json:"confirmationSS" binding:"required,url"`
	Status         string  `json:"status" binding:"required"`
	Email          string  `json:"email" binding:"required"`
	Amount         float64 `json:"amount" binding:"required"`
	Items          string  `json:"items" binding:"required"`
}
