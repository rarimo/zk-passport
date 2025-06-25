import {
  CustomProofParams,
  RequestVerificationLinkOpts,
  ZkPassport,
  ZkProof,
} from '@rarimo/zk-passport'
import { QRCodeSVG } from 'qrcode.react'
import { ComponentProps, FC, HTMLAttributes, useEffect, useRef, useState } from 'react'

import { isAndroid, isIos } from './utils/device'

export enum ProofRequestStatuses {
  /**
   * The proof request params have been requested
   */
  RequestInitiated = 'request_initiated',
  /**
   * The user can scan the QR code to generate the proof
   */
  VerificationRequested = 'verification_requested',
  /**
   * The proof has been received and verified
   */
  Verified = 'verified',
  /**
   * An error occurred during the proof request process
   */
  Error = 'error',
}

export interface ZkPassportQrCodeProps extends Omit<HTMLAttributes<HTMLAnchorElement>, 'onError'> {
  /**
   * Verificator service API URL:
   * https://github.com/rarimo/verificator-svc
   * @default 'https://api.app.rarime.com'
   */
  apiUrl?: string
  /**
   * Unique User ID
   */
  requestId: string
  /**
   * Options for the proof request
   */
  verificationOptions: RequestVerificationLinkOpts | CustomProofParams
  /**
   * Polling interval for checking the proof status
   * @default 5000
   */
  pollingInterval?: number
  /**
   * Props for the QR code component:
   * https://github.com/zpao/qrcode.react?tab=readme-ov-file#available-props
   */
  qrProps: Omit<ComponentProps<typeof QRCodeSVG>, 'value'>
  /**
   * Callback for proof request status changes
   */
  onStatusChange: (status: ProofRequestStatuses) => void
  /**
   * Callback for successful proof generation and verification
   */
  onSuccess: (proof: ZkProof) => void
  /**
   * Callback for errors during the proof request process
   */
  onError: (error: Error) => void
}

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

  useEffect(() => {
    const requestVerification = async () => {
      try {
        const proofRequestUrl =
          'selector' in verificationOptions
            ? await zkPassport.requestVerificationLink(requestId, verificationOptions)
            : await zkPassport.requestVerificationLink(requestId, verificationOptions)

        setProofRequestUrl(proofRequestUrl)
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
