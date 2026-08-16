import app from './app.js'
import { config } from './config.js'
import { initializeDatabase } from './database.js'

await initializeDatabase()
app.listen(config.port, () => console.log(`InternX API listening at http://localhost:${config.port}`))
