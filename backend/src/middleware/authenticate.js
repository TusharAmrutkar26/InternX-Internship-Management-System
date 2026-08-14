import jwt from 'jsonwebtoken'
import { db } from '../database.js'
import { config } from '../config.js'
import { readToken } from '../auth.js'

export function authenticate(request, response, next) {
  const token = readToken(request)
  if (!token) return response.status(401).json({ message: 'Authentication is required.' })

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const user = db.prepare('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?').get(payload.sub)
    if (!user || !user.is_active) return response.status(401).json({ message: 'Your account is unavailable.' })
    request.user = user
    next()
  } catch {
    return response.status(401).json({ message: 'Your session is invalid or has expired.' })
  }
}

export function authorize(...roles) {
  return (request, response, next) => roles.includes(request.user.role)
    ? next()
    : response.status(403).json({ message: 'You do not have permission for this action.' })
}
