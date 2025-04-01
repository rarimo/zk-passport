import { RequestVerificationLinkOpts, ZkPassport, ZkProof } from '@rarimo/zk-passport'
import { QRCodeSVG } from 'qrcode.react'
import { ComponentProps, FC, useEffect, useState } from 'react'

export enum ProofRequestStatuses {
  Initial,
  VerificationRequested,
  Verified,
  Error,
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
  onError,
}) => {
  const [proofRequestUrl, setProofRequestUrl] = useState<string>('')
  const [status, setStatus] = useState<ProofRequestStatuses>(ProofRequestStatuses.Initial)

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

  useEffect(() => {
    const requestVerification = async () => {
      try {
        const proofRequestUrl = await zkPassport.requestVerificationLink(
          requestId,
          verificationOptions,
        )
        setProofRequestUrl(proofRequestUrl)
        setStatus(ProofRequestStatuses.VerificationRequested)
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
