import { useAppKit } from '@reown/appkit/react'

export function ConnectWalletButton() {
  const { open } = useAppKit()

  return (
    <div className='flex items-center justify-center h-screen w-full'>
      <button
        className='px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition'
        onClick={() => open({ namespace: 'eip155' })}
      >
        Connect Wallet
      </button>
    </div>
  )
}
