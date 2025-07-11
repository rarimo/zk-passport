import { CustomProofParamsBuilder, encodePassportDate, ZkProof } from '@rarimo/zk-passport'
import ZkPassportQrCode, { ProofRequestStatuses } from '@rarimo/zk-passport-react'
import { useState } from 'react'

const requestId = 'account-1'
const apiUrl = 'https://api.app.rarime.com'

const proofParams = new CustomProofParamsBuilder()
  .withSelector('0x9E61')
  .withEventId('12345')
  .withEventData('0x1234567890abcdef')
  .withCitizenshipMask('UKR')
  .withSex('M')
  .withBirthDateBounds({
    lower: '000000', // No lower limit
    upper: '040101', // 1 Jan 2004
  })
  .withExpirationDateBounds({
    lower: encodePassportDate(new Date()), // Current date
    upper: '000000', // No upper limit
  })
  .withTimestampBounds({
    lower: '0', // No lower limit
    upper: Math.floor(Date.now() / 1000).toString(), // Current timestamp
  })
  .withIdentityCounterBounds({
    lower: '0', // No lower limit
    upper: '9999999999999999', // Arbitrary upper limit
  })
  .build()

export default function App() {
  const [status, setStatus] = useState(ProofRequestStatuses.RequestInitiated)
  const [proof, setProof] = useState<ZkProof | null>(null)

  return (
    <div className='flex flex-col md:flex-row gap-8 md:gap-20 justify-center md:max-w-[760px] w-full mx-4 md:mx-auto my-6 md:my-24'>
      <div className='flex flex-col'>
        <h1 className='text-xl font-bold'>Advanced verification example</h1>
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
            <p className='text-sm font-medium'>Proof params:</p>
            <pre className='text-xs'>{JSON.stringify(proofParams, null, 2)}</pre>
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
      <ZkPassportQrCode
        apiUrl={apiUrl}
        requestId={requestId}
        verificationOptions={proofParams}
        qrProps={{ size: 256 }}
        className='max-w-[256px] w-full'
        onStatusChange={status => setStatus(status)}
        onSuccess={proof => setProof(proof)}
        onError={error => console.error(error)}
      />
    </div>
  )
}
