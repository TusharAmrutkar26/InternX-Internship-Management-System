import crypto from 'node:crypto'

export function studentIdentifier() {
  return `STU-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
}

export function certificateIdentifier() {
  return `IX-${crypto.randomBytes(6).toString('hex').toUpperCase()}`
}

export function certificateQrPayload(code) {
  return `internx://certificate/${code}`
}
