export async function submitFormData(formData: FormData) {
  const res = await fetch(`http://13.201.25.88:8080/api/upload`, {
    method: "POST",
    body: formData,
    // do NOT set Content-Type when sending FormData (boundary is required)
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    return {
      success: false,
      message: data?.message ?? `Upload failed (${res.status})`,
      data: data ?? null,
    }
  }

  return data // should already be { success, message, data } from your Go API
}
