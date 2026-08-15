import { initializeDatabase, db } from '../src/database.js'
await initializeDatabase()
console.log(`Database seeded safely at ${db.name}`)
db.close()
