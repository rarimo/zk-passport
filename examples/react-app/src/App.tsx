import { RequestVerificationLinkOpts, ZkProof } from '@rarimo/zk-passport'
import ZkPassportWrapper, { ProofRequestStatuses } from '@rarimo/zk-passport-react'
import { useState } from 'react'

const requestId = 'account-1'
const apiUrl = 'https://api.app.rarime.com'
const verificationOpts: RequestVerificationLinkOpts = {
  ageLowerBound: 18,
  uniqueness: true,
  nationalityCheck: true,
  eventId: '123',
}

export default function App() {
  const [status, setStatus] = useState(ProofRequestStatuses.RequestInitiated)
  const [proof, setProof] = useState<ZkProof | null>(null)

  return (
    <div className='flex flex-col md:flex-row gap-8 md:gap-20 justify-center md:max-w-[760px] w-full mx-4 md:mx-auto my-6 md:my-24'>
      <div className='flex flex-col'>
        <h1 className='text-xl font-bold'>ZK Passport example</h1>
        <p className='text-neutral-500'>Requesting verification based on the following options:</p>
        <div className='flex flex-col gap-1 mt-2'>
          <p className='flex gap-1 text-sm'>
            <span className='font-medium'>Request ID:</span>
            <code>{requestId}</code>
          </p>
          <p className='flex gap-1 text-sm'>
            <span className='font-medium'>API URL:</span>
            <code>{apiUrl}</code>
          </p>
          <div>
            <p className='text-sm font-medium'>Verification options:</p>
            <pre className='text-xs'>{JSON.stringify(verificationOpts, null, 2)}</pre>
          </div>
        </div>

        <p className='mt-4 flex gap-1'>
          <span className='text-sm font-medium'>Status:</span>
          <span className='text-sm'>{status}</span>
        </p>
        <div className='mt-4'>
          <p className='text-sm font-medium'>Proof:</p>
          <pre className='text-xs'>{proof ? JSON.stringify(proof, null, 2) : 'null'}</pre>
        </div>
      </div>
      <ZkPassportWrapper
        apiUrl={apiUrl}
        requestId={requestId}
        verificationOptions={verificationOpts}
        qrProps={{ size: 256 }}
        className='max-w-[256px] w-full'
        onStatusChange={status => setStatus(status)}
        onSuccess={proof => setProof(proof)}
        onError={error => console.error(error)}
      />
    </div>
  )
}
