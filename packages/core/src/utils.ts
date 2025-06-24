export const ASCIItoHex = (s: string) =>
  '0x' +
  Array.from(s)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
