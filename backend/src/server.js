import app from './app.js'
import { config } from './config.js'
import { prisma } from './lib/prisma.js'

const server = app.listen(config.port, () => console.log(`InternX API listening at http://localhost:${config.port}`))

async function shutdown(signal) {
  console.log(`${signal} received; closing InternX API.`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
