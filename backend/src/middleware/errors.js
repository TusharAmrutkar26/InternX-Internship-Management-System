export function notFound(request, response) {
  response.status(404).json({ message: `Route ${request.method} ${request.path} was not found.` })
}

export function errorHandler(error, request, response, next) { // eslint-disable-line no-unused-vars
  if (process.env.NODE_ENV !== 'test') console.error(error)
  if (error?.name === 'ZodError') {
    return response.status(400).json({
      message: 'Please correct the highlighted fields.',
      errors: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    })
  }
  if (error?.code === 'P2002') return response.status(409).json({ message: 'That record already exists or conflicts with existing data.' })
  if (error?.code === 'P2025') return response.status(404).json({ message: 'The requested record was not found.' })
  const status = Number.isInteger(error.status) ? error.status : 500
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected server error occurred.'
    : (error.message || 'An unexpected server error occurred.')
  response.status(status).json({ message })
}
