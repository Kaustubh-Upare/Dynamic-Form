export const submitFormData=(formData:FormData)=>{
    try {
    const totalRows = Number.parseInt(formData.get("totalRows") as string)

    const rows = []

    for (let i = 0; i < totalRows; i++) {
      const description = formData.get(`row_${i}_description`) as string
      const mediaCount = Number.parseInt(formData.get(`row_${i}_mediaCount`) as string)

      const mediaFiles = []
      for (let j = 0; j < mediaCount; j++) {
        const mediaFile = formData.get(`row_${i}_media_${j}`) as File
        if (mediaFile) {
          mediaFiles.push({
            name: mediaFile.name,
            size: mediaFile.size,
            type: mediaFile.type,
            isVideo: mediaFile.type.startsWith("video/"),
            isImage: mediaFile.type.startsWith("image/"),
          })
        }
      }

      rows.push({
        description,
        mediaFiles,
        mediaCount,
      })
    }

    console.log("[v0] Form data received on server:", {
      totalRows,
      rows,
    })

    // Here you would typically:
    // 1. Validate the data
    // 2. Save to database
    // 3. Upload media files (images/videos) to storage (e.g., Vercel Blob)
    // 4. Return success/error response

    return {
      success: true,
      message: "Form data with images and videos received successfully",
      data: { totalRows, rows },
    }
  } catch (error) {
    console.error("[v0] Error processing form data:", error)
    return {
      success: false,
      message: "Failed to process form data",
    }
  }
}