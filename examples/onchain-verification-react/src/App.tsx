import { ZkProof } from '@rarimo/zk-passport'
import ZkPassportQrCode, { ProofRequestStatuses } from '@rarimo/zk-passport-react'
import { useAppKitAccount, useAppKitEvents } from '@reown/appkit/react'
import { useEffect, useState } from 'react'
import { Chain } from 'viem'
import { useDisconnect } from 'wagmi'

import { ConnectWalletButton } from './components/ConnectWalletButton'
import { CopyButton } from './components/CopyButton'
import { DocsLink } from './components/DocsLink'
import { Header } from './components/Header'
import Spinner from './components/Spinner'
import { config } from './config'
import useClaimableToken from './useClaimableToken'
import { rarimoL2AppKitChain } from './wagmi.config'

type ErrorType = 'estimate' | 'claim'

export default function App() {
  const [status, setStatus] = useState(ProofRequestStatuses.RequestInitiated)
  const [proof, setProof] = useState<ZkProof | null>(null)
  const [errorType, setErrorType] = useState<null | ErrorType>(null)
  const [isEstimatingProof, setIsEstimatingProof] = useState(false)

  const { disconnect } = useDisconnect()
  const { isConnected, status: ethStatus, address } = useAppKitAccount({ namespace: 'eip155' })
  const events = useAppKitEvents()

  const { isClaimed, refetchIsClaimed, estimateClaim, isClaiming, claimToken } = useClaimableToken()

  const isInitializing =
    events.data.event === 'MODAL_CREATED' ||
    ethStatus === 'connecting' ||
    ethStatus === 'reconnecting'

  useEffect(() => {
    if (!proof) return

    const tryToClaim = async () => {
      setIsEstimatingProof(true)
      setErrorType(null)

      try {
        const canClaim = await estimateClaim(proof)
        if (!canClaim) {
          setErrorType('estimate')
          return
        }
        await claimToken(proof)
        await refetchIsClaimed()
      } catch (e) {
        console.error('Claim error:', e)
        setErrorType('claim')
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
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>🛡️ ZK Passport Example</h1>
            <p className='text-sm text-gray-500'>
              Requesting verification with the following parameters:
            </p>
          </div>

          <ProofStatusBlock status={status} proof={proof} />

          {isEstimatingProof && <p className='text-sm text-gray-500'>Checking gas requirements…</p>}

          {isClaiming && (
            <p className='text-sm text-gray-500 animate-pulse'>Claiming in progress…</p>
          )}

          <DocsLink />
        </section>

        {address && (
          <aside className='max-w-[290px] w-full md:w-auto flex justify-center items-center sticky top-[40px]'>
            <div className='border border-neutral-200 shadow-md rounded-xl p-4 bg-white'>
              {errorType ? (
                <ErrorBlock type={errorType} />
              ) : (
                <ZkPassportQrCode
                  apiUrl={config.API_URL}
                  requestId={address}
                  verificationOptions={{
                    contractAddress: config.CONTRACT_ADDRESS,
                    receiverAddress: address as `0x${string}`,
                    chain: rarimoL2AppKitChain as Chain,
                  }}
                  qrProps={{ size: 256 }}
                  className='w-full max-w-[256px]'
                  onStatusChange={setStatus}
                  onSuccess={setProof}
                  onError={console.error}
                />
              )}
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

function ErrorBlock({ type }: { type: ErrorType }) {
  const message =
    type === 'estimate'
      ? '❌ Failed to estimate gas. Please make sure your wallet has enough funds and the proof is valid.'
      : '❌ Something went wrong during the claim. Please try again later.'

  return (
    <div className='border border-red-300 bg-red-50 text-red-700 p-4 rounded-lg w-full text-sm text-center'>
      {message}
    </div>
  )
}
