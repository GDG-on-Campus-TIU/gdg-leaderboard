package utils

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"cloud.google.com/go/storage"
	"google.golang.org/api/option"
)

// Uplod to gcs
// return the public url
func UploadPFPToGCS(bucketName, imagePath string, isPfp bool) error {
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

	var objectPath string
	if isPfp {
		objectPath = fmt.Sprintf("resized_pfp/%s", objectName)
	} else {
		objectPath = fmt.Sprintf("id_card/%s", objectName)
	}

	wc := client.Bucket(bucketName).Object(objectPath).NewWriter(ctx)
	wc.ContentType = fmt.Sprintf("image/%s", format)

	if _, err = io.Copy(wc, file); err != nil {
		return fmt.Errorf("failed to write to bucket: %v", err)
	}

	if err := wc.Close(); err != nil {
		return fmt.Errorf("failed to close writer: %v", err)
	}

	log.Printf("Image uploaded to %s/%s\n", bucketName, objectPath)
	return nil
}
