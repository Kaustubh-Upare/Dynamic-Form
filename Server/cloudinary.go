package main

import (
	"context"
	"fmt"
	"log"
	"mime/multipart"
	"os"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

func MustInitCloudinary() {
	var err error
	cld, err = InitCloudinary()
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Cloudinary configured cloud=%s", cld.Config.Cloud.CloudName)
}

func InitCloudinary() (*cloudinary.Cloudinary, error) {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		return nil, fmt.Errorf("Cloudinary credentials not set")
	}
	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return nil, err
	}

	return cld, nil
}

func UploadToCloudinary(file *multipart.FileHeader) (string, string, error) {
	if cld == nil {
		var err error
		cld, err = InitCloudinary()
		if err != nil {
			return "", "", err
		}
	}

	// Open the file
	src, err := file.Open()
	if err != nil {
		return "", "", err
	}
	defer src.Close()

	// Determine resource type (image or video)
	resourceType := "image"
	contentType := file.Header.Get("Content-Type")
	if strings.HasPrefix(contentType, "video/") {
		resourceType = "video"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Upload to Cloudinary
	uploadResult, err := cld.Upload.Upload(ctx, src, uploader.UploadParams{
		Folder:       "form-submissions",
		ResourceType: resourceType,
	})
	if err != nil {
		return "", "", err
	}
	log.Printf("cloudinary result: public_id=%s secure_url=%q url=%q bytes=%d resource_type=%s format=%s",
		uploadResult.PublicID,
		uploadResult.SecureURL,
		uploadResult.URL,
		uploadResult.Bytes,
		uploadResult.ResourceType,
		uploadResult.Format,
	)

	return uploadResult.SecureURL, resourceType, nil
}
