import { CustomProofParamsBuilder, ZkProof } from '@rarimo/zk-passport'
import ZkPassportQrCode, { ProofRequestStatuses } from '@rarimo/zk-passport-react'
import { useState } from 'react'

const apiUrl = 'https://api.orgs.app.stage.rarime.com'
const requestId = '0x0B6B2C52283C5857871682084498D8151Ce9b059'

const rawSelector = '000100000100001'
const selector = parseInt(rawSelector, 2).toString()

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

  return (
    <main className='flex flex-col md:flex-row gap-10 md:gap-16 items-start justify-center w-full max-w-6xl px-4 mx-auto py-10'>
      <section className='w-full md:w-1/2 space-y-6'>
        <header>
          <h1 className='text-2xl font-bold text-gray-800'>🛡️ ZK Passport Example</h1>
          <p className='text-sm text-gray-500'>
            Requesting verification with the following parameters:
          </p>
        </header>

        <div className='space-y-3 bg-neutral-100 rounded-xl p-4 border border-neutral-200 shadow-sm'>
          <p className='text-sm'>
            <span className='font-semibold'>Request ID:</span>{' '}
            <code className='text-xs text-indigo-600'>{requestId}</code>
          </p>
          <p className='text-sm'>
            <span className='font-semibold'>API URL:</span>{' '}
            <code className='text-xs text-indigo-600'>{apiUrl}</code>
          </p>
          <div>
            <p className='font-semibold text-sm mb-1'>Verification Options:</p>
            <pre className='text-xs bg-white p-2 rounded-md border border-neutral-300 overflow-auto max-h-64'>
              {JSON.stringify(verificationOpts, null, 2)}
            </pre>
          </div>
        </div>

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
      </section>

      <aside className='w-full md:w-auto flex justify-center items-center'>
        <div className='border border-neutral-200 shadow-md rounded-xl p-4 bg-white'>
          <ZkPassportQrCode
            apiUrl={apiUrl}
            requestId={requestId}
            verificationOptions={verificationOpts}
            qrProps={{ size: 256 }}
            className='w-full max-w-[256px]'
            onStatusChange={status => setStatus(status)}
            onSuccess={proof => setProof(proof)}
            onError={error => console.error(error)}
          />
        </div>
      </aside>
    </main>
  )
}
