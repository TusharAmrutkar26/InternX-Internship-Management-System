import assert from 'node:assert/strict'
import test from 'node:test'
import http from 'node:http'
import app from '../src/app.js'
import { certificateIdentifier, certificateQrPayload, studentIdentifier } from '../src/utils/identifiers.js'

test('generated public identifiers have stable formats', () => {
  const studentId = studentIdentifier(); const certificateCode = certificateIdentifier()
  assert.match(studentId, /^STU-\d{4}-[A-F0-9]{8}$/)
  assert.match(certificateCode, /^IX-[A-F0-9]{12}$/)
  assert.equal(certificateQrPayload(certificateCode), `internx://certificate/${certificateCode}`)
})

test('health endpoint is available without a database query', async () => {
  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { status: 'ok' })
  } finally { await new Promise((resolve) => server.close(resolve)) }
})
