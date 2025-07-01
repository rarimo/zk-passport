export const asciiToHex = (s: string) =>
  '0x' +
  Array.from(s)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')

export const hexToAscii = (hex: string) => {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2)
  }

  let str = ''
  for (let i = 0; i < hex.length; i += 2) {
    const chunk = hex.slice(i, i + 2)
    str += String.fromCharCode(parseInt(chunk, 16))
  }

  return str.trim()
}

export function encodePassportDate(date: Date): string {
  const year = date.getUTCFullYear() % 100
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()

  return [year, month, day].map(n => n.toString().padStart(2, '0')).join('')
}
