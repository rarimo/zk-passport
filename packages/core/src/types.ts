/**
 * Verificator link request attributes:
 * https://rarimo.github.io/verificator-svc/#tag/User-verification/operation/getVerificationLink
 */
export interface RequestVerificationLinkOpts {
  uniqueness?: boolean
  ageLowerBound?: number
  nationality?: string
  nationalityCheck?: boolean
  sex?: string
  expirationLowerBound?: number
  eventId?: string
}

/**
 * User verification status
 * https://rarimo.github.io/verificator-svc/#tag/User-verification/operation/getUserStatus
 *
 * - `not_verified` - User has not generated a proof yet
 * - `verified` - User has generated a proof and it is verified
 * - `failed_verification` - User has generated a proof but the proof verification failed
 * - `uniqueness_check_failed` - User has revoked their identity, so uniqueness
 */
export type VerificationStatus =
  | 'not_verified'
  | 'verified'
  | 'failed_verification'
  | 'uniqueness_check_failed'

export interface ZkProof {
  /**
   * Groth16 proof
   */
  proof: {
    piA: string[]
    piB: string[][]
    piC: string[]
  }
  /**
   * Query proof public signals:
   * https://github.com/rarimo/passport-zk-circuits?tab=readme-ov-file#query-circuit-public-signals
   */
  pubSignals: string[]
}
