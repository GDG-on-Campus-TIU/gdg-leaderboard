package models

// Student represents the structure of the incoming JSON payload.
type Student struct {
	Name  string `json:"name" binding:"required"`
	Email string `json:"email" binding:"required,email"`
	ClgID string `json:"clg_id" binding:"required"`
	Dept  string `json:"dept" binding:"required"`
}
