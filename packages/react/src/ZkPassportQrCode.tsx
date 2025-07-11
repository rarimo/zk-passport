import { ZkPassport } from '@rarimo/zk-passport'
import { QRCodeSVG } from 'qrcode.react'
import { FC, useEffect, useRef, useState } from 'react'

import { isAndroid, isIos } from './device'
import { buildOnChainProofParams } from './on-chain-proof-params'
import { ProofRequestStatuses, ZkPassportQrCodeProps } from './types'

const ZkPassportQrCode: FC<ZkPassportQrCodeProps> = ({
  apiUrl,
  requestId,
  verificationOptions,
  pollingInterval = 5000,
  qrProps,
  onStatusChange,
  onSuccess,
  onError,
  ...rest
}) => {
  const [proofRequestUrl, setProofRequestUrl] = useState<string>('')
  const [status, setStatus] = useState<ProofRequestStatuses>(ProofRequestStatuses.RequestInitiated)
  const statusPollTimeout = useRef<number>(-1)

  const zkPassport = new ZkPassport(apiUrl)

  const loadVerifiedProof = async () => {
    const proof = await zkPassport.getVerifiedProof(requestId)
    if (!proof) throw new Error('Proof not found')

    setStatus(ProofRequestStatuses.Verified)
    onSuccess(proof)
  }

  const checkVerificationStatus = async () => {
    try {
      const verificationStatus = await zkPassport.getVerificationStatus(requestId)
      switch (verificationStatus) {
        case 'failed_verification':
          setStatus(ProofRequestStatuses.Error)
          onError(new Error('Verification failed'))
          break
        case 'uniqueness_check_failed':
          setStatus(ProofRequestStatuses.Error)
          onError(new Error('Uniqueness check failed'))
          break
        case 'verified':
          await loadVerifiedProof()
          break
        case 'not_verified':
        default:
          statusPollTimeout.current = window.setTimeout(checkVerificationStatus, 5000)
          break
      }
    } catch (error) {
      setStatus(ProofRequestStatuses.Error)
      onError(error)
    }
  }

  const getProofRequestUrl = async () => {
    if ('contractAddress' in verificationOptions) {
      const customProofParams = await buildOnChainProofParams(verificationOptions)
      return zkPassport.requestVerificationLink(requestId, customProofParams)
    }

    return 'selector' in verificationOptions
      ? zkPassport.requestVerificationLink(requestId, verificationOptions)
      : zkPassport.requestVerificationLink(requestId, verificationOptions)
  }

  useEffect(() => {
    const requestVerification = async () => {
      try {
        setProofRequestUrl(await getProofRequestUrl())
        setStatus(ProofRequestStatuses.VerificationRequested)
        statusPollTimeout.current = window.setTimeout(checkVerificationStatus, pollingInterval)
      } catch (error) {
        setStatus(ProofRequestStatuses.Error)
        onError(error)
      }
    }

    requestVerification()

    return () => {
      if (statusPollTimeout.current !== -1) {
        window.clearTimeout(statusPollTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    if (status !== ProofRequestStatuses.RequestInitiated) {
      onStatusChange(status)
    }
  }, [status])

  return (
    <a
      href={isIos() || isAndroid() ? proofRequestUrl : undefined}
      target='_blank'
      rel='noopener noreferrer'
      {...rest}
    >
      {status === ProofRequestStatuses.VerificationRequested && (
        <QRCodeSVG {...qrProps} value={proofRequestUrl} />
      )}
    </a>
  )
}

export default ZkPassportQrCode
