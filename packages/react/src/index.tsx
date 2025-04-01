import { RequestVerificationLinkOpts, ZkPassport, ZkProof } from '@rarimo/zk-passport'
import { QRCodeSVG } from 'qrcode.react'
import { ComponentProps, FC, useEffect, useRef, useState } from 'react'

export enum ProofRequestStatuses {
  Initial = 'initial',
  VerificationRequested = 'verification_requested',
  Verified = 'verified',
  Error = 'error',
}

export interface ZkPassportWrapperProps {
  apiUrl?: string
  requestId: string
  verificationOptions: RequestVerificationLinkOpts
  qrProps: Omit<ComponentProps<typeof QRCodeSVG>, 'value'>
  onStatusChange: (status: ProofRequestStatuses) => void
  onSuccess: (proof: ZkProof) => void
  onError: (error: Error) => void
}

const ZkPassportWrapper: FC<ZkPassportWrapperProps> = ({
  apiUrl,
  requestId,
  verificationOptions,
  qrProps,
  onStatusChange,
  onSuccess,
  onError,
}) => {
  const [proofRequestUrl, setProofRequestUrl] = useState<string>('')
  const [status, setStatus] = useState<ProofRequestStatuses>(ProofRequestStatuses.Initial)
  const statusPollTimeout = useRef<number>(-1)

  const zkPassport = new ZkPassport(apiUrl)

  const renderContent = () => {
    switch (status) {
      case ProofRequestStatuses.VerificationRequested:
        return <QRCodeSVG {...qrProps} value={proofRequestUrl} />
      case ProofRequestStatuses.Verified:
        return 'Verified'
      case ProofRequestStatuses.Error:
        return 'Error'
      case ProofRequestStatuses.Initial:
      default:
        return 'Loading...'
    }
  }

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

  useEffect(() => {
    const requestVerification = async () => {
      try {
        const proofRequestUrl = await zkPassport.requestVerificationLink(
          requestId,
          verificationOptions,
        )
        setProofRequestUrl(proofRequestUrl)
        setStatus(ProofRequestStatuses.VerificationRequested)
        statusPollTimeout.current = window.setTimeout(checkVerificationStatus, 5000)
      } catch (error) {
        setStatus(ProofRequestStatuses.Error)
        onError(error)
      }
    }

    requestVerification()
  }, [])

  useEffect(() => {
    if (status !== ProofRequestStatuses.Initial) {
      onStatusChange(status)
    }
  }, [status])

  return <div>{renderContent()}</div>
}

export default ZkPassportWrapper
