import jwt from 'jsonwebtoken'
import { config } from './config.js'
import { generateStudentId } from './database.js'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.cookieSecure,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}

export function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })
}

export function setAuthCookie(response, token) {
  response.cookie('internx_token', token, cookieOptions)
}

export function clearAuthCookie(response) {
  response.clearCookie('internx_token', { httpOnly: true, sameSite: 'lax', secure: config.cookieSecure, path: '/' })
}

export function readToken(request) {
  const bearer = request.headers.authorization?.startsWith('Bearer ') ? request.headers.authorization.slice(7) : null
  return request.cookies?.internx_token || bearer
}
