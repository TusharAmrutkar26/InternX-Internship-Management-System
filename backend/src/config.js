import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/internx?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'development-only-change-me-before-deploying',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@internx.local').toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
}
