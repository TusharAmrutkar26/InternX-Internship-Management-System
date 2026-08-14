export function notFound(request, response) {
  response.status(404).json({ message: `Route ${request.method} ${request.path} was not found.` })
}

export function errorHandler(error, request, response, next) { // eslint-disable-line no-unused-vars
  console.error(error)
  if (error?.name === 'ZodError') {
    return response.status(400).json({
      message: 'Please correct the highlighted fields.',
      errors: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    })
  }
  if (error?.code?.startsWith('SQLITE_CONSTRAINT')) return response.status(409).json({ message: 'That record already exists or conflicts with existing data.' })
  response.status(error.status || 500).json({ message: error.message || 'An unexpected server error occurred.' })
}
