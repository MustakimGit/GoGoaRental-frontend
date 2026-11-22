// Turns the normalized API error (see client.js) into one line for a toast.
export function errorMessage(error, fallback = 'Something went wrong') {
  if (!error) return fallback
  if (error.detail) return error.detail
  const firstFieldError = Object.values(error.errors ?? {})[0]?.[0]
  return firstFieldError ?? error.title ?? fallback
}

// Copies the API's field validation errors (ProblemDetails.errors, PascalCase keys) onto a react-hook-form form.
export function applyFieldErrors(error, setError) {
  for (const [field, messages] of Object.entries(error?.errors ?? {})) {
    const name = field.charAt(0).toLowerCase() + field.slice(1)
    setError(name, { message: messages[0] })
  }
}
