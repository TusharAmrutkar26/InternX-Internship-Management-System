import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
if (!process.argv.includes('--confirm')) { console.error('Refusing to delete data. Run: npm run reset-db'); process.exit(1) }
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','data')
for(const suffix of ['internx.db','internx.db-wal','internx.db-shm']){const target=path.join(root,suffix);if(fs.existsSync(target))fs.unlinkSync(target)}
console.log('Database reset. Run npm run seed (or npm start) to create a fresh database and demo data.')
