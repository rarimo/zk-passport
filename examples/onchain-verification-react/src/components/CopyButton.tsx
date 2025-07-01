import { useState } from 'react'

export function CopyButton({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      console.error('Failed to copy:', e)
    }
  }

  return (
    <button
      className='mt-2 text-xs px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition'
      onClick={handleClick}
    >
      {copied ? 'Copied!' : `Copy ${label}`}
    </button>
  )
}
