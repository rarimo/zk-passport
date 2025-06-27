import { CustomProofParamsBuilder, ZkProof } from '@rarimo/zk-passport'
import ZkPassportQrCode, { ProofRequestStatuses } from '@rarimo/zk-passport-react'
import { useAppKit, useAppKitAccount, useAppKitEvents } from '@reown/appkit/react'
import { useState } from 'react'
import { useDisconnect } from 'wagmi'

const API_URL = 'https://api.orgs.app.stage.rarime.com'
const REQUEST_ID = '0x0B6B2C52283C5857871682084498D8151Ce9b059'

const RAW_SELECTOR = '000100000100001'
const selector = parseInt(RAW_SELECTOR, 2).toString()

const verificationOpts = new CustomProofParamsBuilder()
  .withSelector(selector)
  .withEventId('1')
  .withCitizenshipMask('UKR')
  .withSex('M')
  .withIdentityCounterBounds({ lower: '0', upper: '1' })
  .withBirthDateBounds({ lower: '010101', upper: '020202' })
  .withEventData('0xabcdef1234')
  .withExpirationDateBounds({ lower: '240101', upper: '250101' })
  .withTimestampBounds({ lower: '1620000000', upper: '1629999999' })
  .build()

export default function App() {
  const [status, setStatus] = useState(ProofRequestStatuses.RequestInitiated)
  const [proof, setProof] = useState<ZkProof | null>(null)

  const { open } = useAppKit()
  const { disconnect } = useDisconnect()
  const { isConnected, status: ethStatus } = useAppKitAccount({
    namespace: 'eip155',
  })
  const { address } = useAppKitAccount({ namespace: 'eip155' })

  const events = useAppKitEvents()

  const isInitializing =
    events.data.event === 'MODAL_CREATED' ||
    ethStatus === 'connecting' ||
    ethStatus === 'reconnecting'

  if (isInitializing) {
    return (
      <div className='flex items-center justify-center h-screen w-full'>
        <div className='w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (!isConnected) {
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

  return (
    <>
      <header className='w-full flex justify-end px-4 py-4 bg-neutral-50 border-b border-neutral-200'>
        <div className='flex items-center gap-4 p-2 bg-white rounded-xl shadow-sm border border-neutral-200'>
          <span className='text-xs text-gray-700 truncate max-w-[150px]'>{address}</span>
          <button
            className='text-sm px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition'
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </div>
      </header>

      <main className='flex flex-col md:flex-row gap-10 md:gap-16 items-start justify-center w-full max-w-6xl px-4 mx-auto py-10'>
        <section className='w-full md:w-1/2 space-y-6'>
          <header>
            <h1 className='text-2xl font-bold text-gray-800'>🛡️ ZK Passport Example</h1>
            <p className='text-sm text-gray-500'>
              Requesting verification with the following parameters:
            </p>
          </header>

          <VerificationDetails />
          <ProofStatusBlock status={status} proof={proof} />
          <DocsLink />
        </section>

        <aside className='w-full md:w-auto flex justify-center items-center'>
          <div className='border border-neutral-200 shadow-md rounded-xl p-4 bg-white'>
            <ZkPassportQrCode
              apiUrl={API_URL}
              requestId={REQUEST_ID}
              verificationOptions={verificationOpts}
              qrProps={{ size: 256 }}
              className='w-full max-w-[256px]'
              onStatusChange={setStatus}
              onSuccess={setProof}
              onError={error => console.error(error)}
            />
          </div>
        </aside>
      </main>
    </>
  )
}

function VerificationDetails() {
  return (
    <div className='space-y-3 bg-neutral-100 rounded-xl p-4 border border-neutral-200 shadow-sm'>
      <p className='text-sm'>
        <span className='font-semibold'>Request ID:</span>{' '}
        <code className='text-xs text-indigo-600'>{REQUEST_ID}</code>
      </p>
      <p className='text-sm'>
        <span className='font-semibold'>API URL:</span>{' '}
        <code className='text-xs text-indigo-600'>{API_URL}</code>
      </p>
      <div>
        <p className='font-semibold text-sm mb-1'>Verification Options:</p>
        <pre className='text-xs bg-white p-2 rounded-md border border-neutral-300 overflow-auto max-h-64'>
          {JSON.stringify(verificationOpts, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function ProofStatusBlock({ status, proof }: { status: string; proof: ZkProof | null }) {
  return (
    <div className='space-y-2'>
      <p className='text-sm'>
        <span className='font-semibold'>Status:</span>{' '}
        <span className='text-gray-700'>{status}</span>
      </p>
      <div>
        <p className='font-semibold text-sm mb-1'>Proof:</p>
        <pre className='text-xs bg-white p-2 rounded-md border border-neutral-300 overflow-auto max-h-64'>
          {proof ? JSON.stringify(proof, null, 2) : 'null'}
        </pre>
      </div>
    </div>
  )
}

function DocsLink() {
  return (
    <div className='pt-2'>
      <a
        href='https://rarimo.github.io/verificator-svc/#tag/Advanced-verification/operation/getVerificationLinkV2'
        target='_blank'
        rel='noopener noreferrer'
        className='inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline'
      >
        View API Documentation
      </a>
    </div>
  )
}
