package utils

import (
	"log"
	"os"
)

// @INFO GetEnv reads environment variables, prioritizing `_FILE` variants.
// If the `_FILE` variant exists, it reads the value from the file.
// Otherwise, it falls back to the standard environment variable.
func GetEnv(key string) string {
	fileKey := key + "_FILE"
	if filePath, exists := os.LookupEnv(fileKey); exists {
		content, err := os.ReadFile(filePath)
		if err != nil {
			log.Printf("Error reading file for %s: %v", fileKey, err)
			return ""
		}
		return string(content)
	}
	return os.Getenv(key)
}
