
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { X, Plus, Upload, Trash2, Video } from "lucide-react"
import { submitFormData } from "./actions"


type FormRow = {
  id: string
  description: string
  media: File[]
}

export default function DynamicForm() {
  const [rows, setRows] = useState<FormRow[]>([{ id: crypto.randomUUID(), description: "", media: [] }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addRows = () => {
    const newRows = Array.from({ length: 5 }, () => ({
      id: crypto.randomUUID(),
      description: "",
      media: [],
    }))
    setRows([...rows, ...newRows])
  }

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id))
    }
  }

  const updateDescription = (id: string, description: string) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, description } : row)))
  }

  const handleMediaChange = (id: string, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setRows(rows.map((row) => (row.id === id ? { ...row, media: [...row.media, ...fileArray] } : row)))
    }
  }

  const removeMedia = (rowId: string, mediaIndex: number) => {
    setRows(
      rows.map((row) => (row.id === rowId ? { ...row, media: row.media.filter((_, i) => i !== mediaIndex) } : row)),
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()

      // rows.forEach((row, index) => {
      //   formData.append(`row_${index}_description`, row.description)
      //   row.media.forEach((file, fileIndex) => {
      //     formData.append(`row_${index}_media_${fileIndex}`, file)
      //   })
      //   formData.append(`row_${index}_mediaCount`, row.media.length.toString())
      // })

      rows.forEach((row)=>{
        formData.append("descriptions", row.description)
        formData.append("fileCount", String(row.media.length))
        row.media.forEach((file) => {
          formData.append("files", file)
        })
      })

      // formData.append("totalRows", rows.length.toString())

      const result = await submitFormData(formData)

      if (result.success) {
        alert("Form submitted successfully!")
        setRows([{ id: crypto.randomUUID(), description: "", media: [] }])
      } else {
        alert("Error submitting form: " + result.message)
      }
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
      alert("An error occurred while submitting the form")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isVideoFile = (file: File) => {
    return file.type.startsWith("video/")
  }

  return (
    <div className="space-y-6">
      {rows.map((row, index) => (
        <Card key={row.id} className="p-6 border-1 border-[#afafaf]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Row {index + 1}</h3>
            {rows.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRow(row.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Description Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter a detailed description..."
                value={row.description}
                onChange={(e) => updateDescription(row.id, e.target.value)}
                className="min-h-[200px] resize-y"
              />
            </div>

            {/* Multi Image & Video Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Multi Image & Video Upload</label>
              <div className="space-y-4">
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-6 transition-colors hover:bg-muted">
                  <label className="flex cursor-pointer flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload images & videos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => handleMediaChange(row.id, e.target.files)}
                    />
                  </label>
                </div>

                {/* Image & Video Preview */}
                {row.media.length > 0 && (
                  <div className="grid grid-cols-5 gap-3">
                    {row.media.map((file, mediaIndex) => (
                      <div
                        key={mediaIndex}
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                      >
                        {isVideoFile(file) ? (
                          <div className="relative h-full w-full">
                            <video src={URL.createObjectURL(file)} className="h-full w-full object-cover" controls />
                            <div className="absolute left-2 top-2 rounded-full bg-blue-500 p-1.5">
                              <Video className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={`Preview ${mediaIndex + 1}`}
                            className="h-full w-full object-cover"
                          />
                        )}
                        <button
                          onClick={() => removeMedia(row.id, mediaIndex)}
                          className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-center text-xs text-white truncate">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <Button onClick={addRows} variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
          <Plus className="mr-2 h-4 w-4" />
          Add 5 More Rows
        </Button>

        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
          {isSubmitting ? "Sending..." : "Send to Server"}
        </Button>
      </div>
    </div>
  )
}
