package card

import (
	"fmt"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/fogleman/gg"

	"email-service/models"
	"email-service/utils"
)

// GenerateIDCard function takes a student object as input and generates an ID card image.
// It uses the gg library to draw text on a template image and saves the output as a PNG file.
// The function returns the path to the generated ID card image or an error if any step fails.
//
// Example usage:
//
//	student := models.Student{
//	    Name:  "John Doe",
//	    ClgID: "123456",
//	    Dept:  "Computer Science",
//	    Email: "example@google.com",
//	}
//
//	idCardPath, err := GenerateIDCard(student)
//
//	if err != nil {
//	    log.Fatalf("Error generating ID card: %v", err)
//	}
//
//	fmt.Println("ID card generated at:", idCardPath)
//
// @param student models.Student - The student object containing information to be displayed on the ID card.
// @return string - The path to the generated ID card image.
func GenerateIDCard(student models.Student) (string, error) {
	templatePath := filepath.Join("assets", "id_temp.png")
	img, err := gg.LoadImage(templatePath)
	if err != nil {
		return "", fmt.Errorf("failed to load ID card template: %w", err)
	}

	ctx := gg.NewContextForImage(img)

	pfp := utils.DownloadAndResize(student.ProfileImageURL, student)

	// Draw the rounded profile picture directly onto the ID card template
	ctx.DrawImageAnchored(pfp, 300, 300, 0.5, 0.5)

	poppinsFontPath := filepath.Join("assets", "poppins.ttf")
	if err := ctx.LoadFontFace(poppinsFontPath, 62); err != nil {
		return "", fmt.Errorf("failed to load Poppins font: %w", err)
	}
	ctx.SetRGB(1, 1, 1)
	ctx.DrawStringAnchored(strings.Split(student.Name, " ")[0], 530, 700, 1, 0.5)
	ctx.DrawStringAnchored(strings.Split(student.Name, " ")[1], 530, 760, 1, 0.5)

	spaceMonoFontPath := filepath.Join("assets", "space-mono.ttf")
	if err := ctx.LoadFontFace(spaceMonoFontPath, 28); err != nil {
		return "", fmt.Errorf("failed to load Space Mono font: %w", err)
	}
	ctx.SetRGB(1, 1, 1)
	ctx.DrawStringAnchored(student.Dept, 530, 820, 1, 0.5)

	ctx.SetRGB(1, 1, 1)
	ctx.DrawStringAnchored(student.ClgID, 530, 860, 1, 0.5)

	outputPath := filepath.Join("output", fmt.Sprintf("%s_id_card.png", student.ClgID))
	if err := ctx.SavePNG(outputPath); err != nil {
		return "", fmt.Errorf("failed to save ID card: %w", err)
	}

	go utils.UploadPFPToGCS(os.Getenv("BUCKET_NAME"), outputPath, false, false)

	return outputPath, nil
}

// GenerateReceiptImage generates a receipt image for the given receipt DTO,
// saves it to output/receipt_{OrderId}.png, and uploads it to GCS.
func GenerateReceiptImage(receipt models.ReceiptDTO) (string, error) {
	templatePath := filepath.Join("assets", "receipt_temp.png")
	img, err := gg.LoadImage(templatePath)
	if err != nil {
		return "", fmt.Errorf("failed to load receipt template: %w", err)
	}

	ctx := gg.NewContextForImage(img)

	// Load font
	fontPath := filepath.Join("assets", "poppins.ttf")
	if err := ctx.LoadFontFace(fontPath, 36); err != nil {
		return "", fmt.Errorf("failed to load font: %w", err)
	}
	ctx.SetRGB(1, 1, 1)

	// Draw receipt fields (adjust positions as needed)
	ctx.DrawStringAnchored(fmt.Sprintf("Name: %s", receipt.Name), 400, 250, 0.5, 0.5)
	ctx.DrawStringAnchored(fmt.Sprintf("Email: %s", receipt.Email), 400, 320, 0.5, 0.5)
	ctx.DrawStringAnchored(fmt.Sprintf("Phone: %s", receipt.Phone), 400, 390, 0.5, 0.5)
	ctx.DrawStringAnchored(fmt.Sprintf("Order ID: %s", receipt.OrderId), 400, 460, 0.5, 0.5)
	ctx.DrawStringAnchored(fmt.Sprintf("Amount: %s", strconv.Itoa(int(receipt.Amount))), 400, 530, 0.5, 0.5)
	ctx.DrawStringAnchored(fmt.Sprintf("Items: %s", receipt.Items), 400, 600, 0.5, 0.5)
	ctx.DrawStringAnchored(fmt.Sprintf("Status: %s", receipt.Status), 400, 670, 0.5, 0.5)

	outputPath := filepath.Join("output", fmt.Sprintf("%s_receipt.png", receipt.OrderId))
	if err := ctx.SavePNG(outputPath); err != nil {
		return "", fmt.Errorf("failed to save receipt image: %w", err)
	}

	go utils.UploadPFPToGCS(os.Getenv("BUCKET_NAME"), outputPath, false, true)

	return outputPath, nil
}
