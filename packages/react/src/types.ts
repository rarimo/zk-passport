import {
  type CustomProofParams,
  type RequestVerificationLinkOpts,
  type ZkProof,
} from '@rarimo/zk-passport'
import { type QRCodeSVG } from 'qrcode.react'
import { type ComponentProps, type HTMLAttributes } from 'react'
import { type Address, type Chain } from 'viem'

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

export interface OnChainVerificationOptions {
  /**
   * The address of the smart contract using `@rarimo/passport-contracts` SDK
   * @example '0x1234567890abcdef1234567890abcdef12345678'
   * @see {@link https://docs.rarimo.com/zk-passport/guide-on-chain-verification/ On-chain verification guide}
   */
  contractAddress: Address
  /**
   * The address used in `userPayload` to build the public signals
   * @example '0xabcdefabcdefabcdefabcdefabcdefabcdef'
   * @see {@link https://docs.rarimo.com/zk-passport/guide-on-chain-verification/#step-3-integrate-proof-verification-into-your-smart-contract Integrate proof verification into your smart contract}
   */
  receiverAddress: Address
  /**
   * The `viem` network to use for the receiving public signals
   * @default "Rarimo L2"
   * @see {@link https://docs.rarimo.com/zk-registry/network-info/ Rarimo L2 network}
   * @see {@link https://viem.sh/docs/chains/introduction Viem chains documentation}
   */
  chain?: Chain
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
  verificationOptions: RequestVerificationLinkOpts | CustomProofParams | OnChainVerificationOptions
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
