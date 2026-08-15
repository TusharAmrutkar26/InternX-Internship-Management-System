import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import authRouter from './routes/auth.js'
import studentRouter from './routes/students.js'
import industryRouter from './routes/industry.js'
import adminRouter from './routes/admin.js'
import recordsRouter from './routes/records.js'
import publicRouter from './routes/public.js'
import { errorHandler, notFound } from './middleware/errors.js'

const app = express()
app.use(cors({ origin: config.clientUrl, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.get('/api/health', (request, response) => response.json({ status: 'ok' }))
app.use('/api/auth', authRouter)
app.use('/api/students', studentRouter)
app.use('/api/industry', industryRouter)
app.use('/api/admin', adminRouter)
app.use('/api/public', publicRouter)
app.use('/api', recordsRouter)
app.use(notFound)
app.use(errorHandler)

export default app
