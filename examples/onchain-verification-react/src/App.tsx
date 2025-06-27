import { CustomProofParams, CustomProofParamsBuilder, ZkProof } from '@rarimo/zk-passport'
import ZkPassportQrCode, { ProofRequestStatuses } from '@rarimo/zk-passport-react'
import { useAppKitAccount, useAppKitEvents } from '@reown/appkit/react'
import { useEffect, useState } from 'react'
import { toHex } from 'viem'
import { useDisconnect } from 'wagmi'

import { ConnectWalletButton } from './components/ConnectWalletButton'
import { CopyButton } from './components/CopyButton'
import { DocsLink } from './components/DocsLink'
import { Header } from './components/Header'
import Spinner from './components/Spinner'
import { config } from './config'
import useClaimableToken from './useClaimableToken'

export default function App() {
  const [status, setStatus] = useState(ProofRequestStatuses.RequestInitiated)
  const [proof, setProof] = useState<ZkProof | null>(null)
  const [verificationOpts, setVerificationOpts] = useState<CustomProofParams | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [isEstimateError, setIsEstimateError] = useState(false)
  const [isBuildingOpts, setIsBuildingOpts] = useState(false)
  const [isEstimatingProof, setIsEstimatingProof] = useState(false)

  const { disconnect } = useDisconnect()
  const { isConnected, status: ethStatus, address } = useAppKitAccount({ namespace: 'eip155' })
  const events = useAppKitEvents()

  const { getSelector, getEventData, getEventId, isClaimed, refetchIsClaimed, estimateClaim } =
    useClaimableToken()

  const isInitializing =
    events.data.event === 'MODAL_CREATED' ||
    ethStatus === 'connecting' ||
    ethStatus === 'reconnecting'

  async function buildOptions() {
    if (!address) return
    setIsEstimateError(false)
    setIsBuildingOpts(true)

    try {
      const [selectorRaw, eventData, rawEventId] = await Promise.all([
        getSelector(),
        getEventData(),
        getEventId(address as `0x${string}`),
      ])

      const selector = parseInt(selectorRaw.toString()).toString()
      const eventIdHex = toHex(rawEventId)
      const eventDataHex = toHex(eventData)

      const options = new CustomProofParamsBuilder()
        .withSelector(selector)
        .withEventId(eventIdHex)
        .withIdentityCounterBounds({ lower: '0', upper: '1' })
        .withBirthDateBounds({ lower: '010101', upper: '020202' })
        .withEventData(eventDataHex)
        .withExpirationDateBounds({ lower: '240101', upper: '250101' })
        .withTimestampBounds({ lower: '1620000000', upper: '1629999999' })
        .build()

      setVerificationOpts(options)
      setEventId(eventIdHex)
    } catch (e) {
      console.error('Failed to build options:', e)
    } finally {
      setIsBuildingOpts(false)
    }
  }

  useEffect(() => {
    if (!proof) return

    const tryToClaim = async () => {
      setIsEstimatingProof(true)
      try {
        const canClaim = await estimateClaim(proof)
        if (!canClaim) {
          setIsEstimateError(true)
          return
        }
        console.log('Refetching isClaimed...')
        await refetchIsClaimed()
      } finally {
        setIsEstimatingProof(false)
      }
    }

    tryToClaim()
  }, [proof])

  if (isInitializing) return <Spinner />
  if (!isConnected) return <ConnectWalletButton />
  if (isClaimed) return <ClaimedNotice address={address!} onDisconnect={disconnect} />

  return (
    <>
      <Header address={address!} onDisconnect={disconnect} />
      <main className='flex flex-col md:flex-row gap-10 md:gap-16 items-start justify-center w-full max-w-6xl px-4 mx-auto py-10'>
        <section className='w-full md:w-1/2 space-y-6'>
          <header>
            <h1 className='text-2xl font-bold text-gray-800'>🛡️ ZK Passport Example</h1>
            <p className='text-sm text-gray-500'>
              Requesting verification with the following parameters:
            </p>
          </header>

          <button
            className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50'
            disabled={isBuildingOpts}
            onClick={buildOptions}
          >
            {isBuildingOpts ? 'Building...' : 'Build Verification Options'}
          </button>

          {verificationOpts && eventId && (
            <VerificationDetails verificationOpts={verificationOpts} eventId={eventId} />
          )}

          <ProofStatusBlock status={status} proof={proof} />

          {isEstimatingProof && <p className='text-sm text-gray-500'>Checking gas requirements…</p>}

          {isEstimateError && (
            <p className='text-sm text-red-500'>
              Could not estimate gas. Please ensure your wallet has sufficient funds and the proof
              is valid.
            </p>
          )}

          <DocsLink />
        </section>

        {verificationOpts && (
          <aside className='w-full md:w-auto flex justify-center items-center'>
            <div className='border border-neutral-200 shadow-md rounded-xl p-4 bg-white'>
              <ZkPassportQrCode
                apiUrl={config.API_URL}
                requestId={eventId ?? ''}
                verificationOptions={verificationOpts}
                qrProps={{ size: 256 }}
                className='w-full max-w-[256px]'
                onStatusChange={setStatus}
                onSuccess={setProof}
                onError={console.error}
              />
            </div>
          </aside>
        )}
      </main>
    </>
  )
}

function ClaimedNotice({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center h-screen w-full text-center px-4'>
      <div className='text-4xl mb-4'>🎉 Already Claimed</div>
      <p className='text-sm text-gray-600 max-w-sm'>
        This token has already been claimed using your address:
      </p>
      <p className='font-mono break-all text-sm text-indigo-600'>{address}</p>
      <button
        className='mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition'
        onClick={onDisconnect}
      >
        Disconnect Wallet
      </button>
    </div>
  )
}

function VerificationDetails({
  verificationOpts,
  eventId,
}: {
  verificationOpts: CustomProofParams
  eventId: string
}) {
  return (
    <div className='space-y-3 bg-neutral-100 rounded-xl p-4 border border-neutral-200 shadow-sm'>
      <p className='text-sm'>
        <span className='font-semibold'>Event ID:</span>{' '}
        <code className='text-xs text-indigo-600'>{eventId}</code>
      </p>
      <p className='text-sm'>
        <span className='font-semibold'>API URL:</span>{' '}
        <code className='text-xs text-indigo-600'>{config.API_URL}</code>
      </p>
      <div>
        <p className='font-semibold text-sm mb-1'>Verification Options:</p>
        <pre className='text-xs bg-white p-2 rounded-md border border-neutral-300 overflow-auto max-h-64'>
          {JSON.stringify(verificationOpts, null, 2)}
        </pre>
        <CopyButton label='Options' content={JSON.stringify(verificationOpts, null, 2)} />
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
          {proof ? JSON.stringify(proof, null, 2) : '–'}
        </pre>
        {proof && <CopyButton label='Proof' content={JSON.stringify(proof, null, 2)} />}
      </div>
    </div>
  )
}
