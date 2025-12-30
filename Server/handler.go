package main

type UploadResponse struct {
	Success bool           `json:"success"`
	Data    FormSubmission `json:"data,omitempty"`
	Message string         `json:"message,omitempty"`
}
