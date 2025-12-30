package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
)

type UploadResponse struct {
	Success bool           `json:"success"`
	Data    FormSubmission `json:"data,omitempty"`
	Message string         `json:"message,omitempty"`
}

func HandleUpload(c *fiber.Ctx) error {
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(UploadResponse{
			Success: false,
			Message: "Failed to parse form data",
		})
	}

	files := form.File["files"]
	descriptions := form.Value["descriptions"]

	if len(descriptions) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(UploadResponse{
			Success: false,
			Message: "No descriptions provided",
		})
	}

	// Create form submission
	submission := FormSubmission{
		Rows: make([]FormRow, len(descriptions)),
	}

	// Process each row
	fileIndex := 0
	for i, description := range descriptions {
		submission.Rows[i] = FormRow{
			Description: description,
			Media:       []MediaFile{},
		}

		// Get file count for this row
		var fileCountStr string
		if len(form.Value["fileCount"]) > i {
			fileCountStr = form.Value["fileCount"][i]
		}

		var fileCount int
		if fileCountStr != "" {
			_, err := fmt.Sscanf(fileCountStr, "%d", &fileCount)
			if err == nil {
				// Upload files for this row
				for j := 0; j < fileCount && fileIndex < len(files); j++ {
					file := files[fileIndex]
					fileIndex++

					// Upload to Cloudinary
					log.Printf("Uploading: filename=%s size=%d content-type=%s",
						file.Filename, file.Size, file.Header.Get("Content-Type"))
					url, mediaType, err := UploadToCloudinary(file)
					if err != nil {
						log.Printf("Error uploading file: %v", err)
						continue
					}

					submission.Rows[i].Media = append(submission.Rows[i].Media, MediaFile{
						URL:  url,
						Type: mediaType,
					})
				}
			}
		}
	}

	// Save to MongoDB
	if err := SaveFormSubmission(&submission); err != nil {
		log.Printf("Error saving to MongoDB: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(UploadResponse{
			Success: false,
			Message: "Failed to save to database",
		})
	}

	log.Printf("Successfully saved submission with ID: %s", submission.ID.Hex())

	return c.JSON(UploadResponse{
		Success: true,
		Data:    submission,
		Message: "Form submitted successfully",
	})
}
