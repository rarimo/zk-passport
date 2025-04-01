export interface RequestVerificationLinkOpts {
  uniqueness?: boolean
  ageLowerBound?: number
  nationality?: string
  nationalityCheck?: boolean
  sex?: string
  expirationLowerBound?: number
  eventId?: string
}

export type VerificationStatus =
  | 'not_verified'
  | 'verified'
  | 'failed_verification'
  | 'uniqueness_check_failed'

export interface ZkProof {
  proof: {
    piA: string[]
    piB: string[][]
    piC: string[]
  }
  pubSignals: string[]
}
