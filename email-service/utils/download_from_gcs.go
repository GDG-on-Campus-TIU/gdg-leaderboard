package utils

import (
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/jpeg"
	"image/png"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/nfnt/resize"

	"email-service/models"
)

func DownloadAndResize(url string, std models.Student) image.Image {
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("failed to download image: %v\n", err)
		return nil
	}

	defer resp.Body.Close()

	img, format, err := image.Decode(resp.Body)
	if err != nil {
		log.Printf("failed to decode image: %v\n", err)
		return nil
	}

	// Resize the image to 200x200
	img = resize.Resize(200, 200, img, resize.Lanczos3)

	// @INFO Create directory if it doesn't exist
	if err := os.MkdirAll("output/resized_pfp", os.ModePerm); err != nil {
		log.Printf("failed to create directory: %v\n", err)
		return nil
	}

	outputPath := filepath.Join("output", "resized_pfp", fmt.Sprintf("%s_pfp.%s", std.ClgID, format))

	// @NOTE: WARNING, don't ever try to mess with the code below
	// @NOTE: WARNING, it is best to leave it as is
	// @NOTE: WARNING, if you have any problem, mail me <dev.bosepiush@gmail.com>
	// --------------------------------------------------------------------------
	// Create a circular mask
	diameter := img.Bounds().Dx()
	mask := image.NewAlpha(image.Rect(0, 0, diameter, diameter))
	draw.Draw(mask, mask.Bounds(), &image.Uniform{color.Alpha{0}}, image.Point{}, draw.Src)

	// Draw a white filled circle on the mask
	for y := range diameter {
		for x := range diameter {
			dx := float64(x - diameter/2)
			dy := float64(y - diameter/2)
			distance := dx*dx + dy*dy
			radius := float64(diameter / 2)
			if distance <= radius*radius {
				mask.SetAlpha(x, y, color.Alpha{255})
			}
		}
	}

	// Apply the mask to the image
	circImg := image.NewRGBA(img.Bounds())
	draw.DrawMask(circImg, circImg.Bounds(), img, image.Point{}, mask, image.Point{}, draw.Over)

	// Create a new rounded image with a green background to add the border
	borderSize := 5 // Adjust the border size as needed
	borderedDiameter := diameter + 2*borderSize
	borderedImg := image.NewRGBA(image.Rect(0, 0, borderedDiameter, borderedDiameter))

	// Fill the green background
	green := color.RGBA{200, 220, 60, 255}
	draw.Draw(borderedImg, borderedImg.Bounds(), &image.Uniform{green}, image.Point{}, draw.Src)

	// Create a circular mask for the green background
	borderMask := image.NewAlpha(image.Rect(0, 0, borderedDiameter, borderedDiameter))
	draw.Draw(borderMask, borderMask.Bounds(), &image.Uniform{color.Alpha{0}}, image.Point{}, draw.Src)
	for y := range borderedDiameter {
		for x := range borderedDiameter {
			dx := float64(x - borderedDiameter/2)
			dy := float64(y - borderedDiameter/2)
			distance := dx*dx + dy*dy
			radius := float64(borderedDiameter / 2)
			if distance <= radius*radius {
				borderMask.SetAlpha(x, y, color.Alpha{255})
			}
		}
	}

	// Apply the circular mask to the green background
	roundedBorderedImg := image.NewRGBA(borderedImg.Bounds())
	draw.DrawMask(roundedBorderedImg, roundedBorderedImg.Bounds(), borderedImg, image.Point{}, borderMask, image.Point{}, draw.Over)

	// Draw the circular image onto the rounded green background
	offset := image.Pt(borderSize, borderSize)
	draw.Draw(roundedBorderedImg, circImg.Bounds().Add(offset), circImg, image.Point{}, draw.Over)

	// Save the final bordered image
	outFile, err := os.Create(outputPath)
	if err != nil {
		log.Printf("failed to create output file: %v\n", err)
		return nil
	}
	defer outFile.Close()

	switch format {
	case "jpeg":
		if err := jpeg.Encode(outFile, roundedBorderedImg, nil); err != nil { // Save roundedBorderedImg
			log.Printf("failed to encode image: %v\n", err)
			return nil
		}
	case "png":
		if err := png.Encode(outFile, roundedBorderedImg); err != nil { // Save roundedBorderedImg
			log.Printf("failed to encode image: %v\n", err)
			return nil
		}
	default:
		log.Printf("unsupported image format: %s\n", format)
		return nil
	}
	// --------------------------------------------------------------------------
	// @NOTE: Now the caution is over, you can mess with the code below

	// upload to gcs on another thread
	go UploadPFPToGCS(os.Getenv("BUCKET_NAME"), outputPath, true)

	log.Println("Image saved to", outputPath)

	return roundedBorderedImg
}
