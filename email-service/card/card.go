package card

import (
	"context"
	"fmt"
	"image"
	"image/jpeg"
	_ "image/jpeg"
	"image/png"
	_ "image/png"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"cloud.google.com/go/storage"
	"github.com/fogleman/gg"
	"github.com/nfnt/resize"
	"google.golang.org/api/option"

	"email-service/models"
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

	pfp := downloadPFP(student.ProfileImageURL, student)

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

	return outputPath, nil
}

func downloadPFP(url string, std models.Student) image.Image {
	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("failed to download image: %v\n", err)
		return nil
	}

	defer resp.Body.Close()

	img, format, err := image.Decode(resp.Body)
	if err != nil {
		fmt.Printf("failed to decode image: %v\n", err)
		return nil
	}

	// Resize the image to 200x200
	img = resize.Resize(200, 200, img, resize.Lanczos3)

	outputPath := filepath.Join("output", "resized_pfp", fmt.Sprintf("%s_pfp.%s", std.ClgID, format))
	outFile, err := os.Create(outputPath)

	if err != nil {
		fmt.Printf("failed to create output file: %v\n", err)
		return nil
	}
	defer outFile.Close()

	switch format {
	case "jpeg":
		if err := jpeg.Encode(outFile, img, nil); err != nil {
			fmt.Printf("failed to encode image: %v\n", err)
			return nil
		}
	case "png":
		if err := png.Encode(outFile, img); err != nil {
			fmt.Printf("failed to encode image: %v\n", err)
			return nil
		}
	default:
		fmt.Printf("unsupported image format: %s\n", format)
		return nil
	}

	// upload to gcs on another thread
	go uploadPFPToGCS(os.Getenv("BUCKET_NAME"), outputPath)

	log.Println("Image saved to", outputPath)

	return img
}

// Uplod to gcs
// return the public url
func uploadPFPToGCS(bucketName, imagePath string) error {
	objectName := strings.Split(imagePath, "/")[len(strings.Split(imagePath, "/"))-1]
	format := strings.Split(objectName, ".")[1]

	ctx := context.Background()

	client, err := storage.NewClient(ctx, option.WithCredentialsFile("credentials.json"))
	if err != nil {
		return fmt.Errorf("failed to create client: %v", err)
	}
	defer client.Close()

	file, err := os.Open(imagePath)
	if err != nil {
		return fmt.Errorf("failed to open file: %v", err)
	}
	defer file.Close()

	objectPath := fmt.Sprintf("resized_pfp/%s", objectName)

	wc := client.Bucket(bucketName).Object(objectPath).NewWriter(ctx)
	wc.ContentType = fmt.Sprintf("image/%s", format)

	if _, err = io.Copy(wc, file); err != nil {
		return fmt.Errorf("failed to write to bucket: %v", err)
	}

	if err := wc.Close(); err != nil {
		return fmt.Errorf("failed to close writer: %v", err)
	}

	fmt.Printf("Image uploaded to %s/%s\n", bucketName, objectPath)
	return nil
}
