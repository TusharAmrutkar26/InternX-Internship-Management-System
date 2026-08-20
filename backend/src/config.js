import 'dotenv/config'

const nodeEnv = process.env.NODE_ENV || 'development'
const jwtSecret = process.env.JWT_SECRET
if (nodeEnv === 'production' && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.')
}

export const config = {
  nodeEnv,
  port: Number(process.env.PORT || 4000),
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((url) => url.trim()).filter(Boolean),
  jwtSecret: jwtSecret || 'development-only-change-me-before-deploying',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
}
