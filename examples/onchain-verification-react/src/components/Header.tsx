import { shortenAddress } from '../utils'

export function Header({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
  return (
    <header className='w-full flex justify-end px-4 py-4 bg-neutral-50 border-b border-neutral-200'>
      <div className='flex items-center gap-4 p-2 bg-white rounded-xl shadow-sm border border-neutral-200'>
        <span className='text-xs text-gray-700 truncate max-w-[150px]'>
          {shortenAddress(address)}
        </span>
        <button
          className='text-sm px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition'
          onClick={onDisconnect}
        >
          Disconnect
        </button>
      </div>
    </header>
  )
}
