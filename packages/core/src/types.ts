/**
 * Verificator link request attributes:
 * https://rarimo.github.io/verificator-svc/#tag/User-verification/operation/getVerificationLink
 */
export interface RequestVerificationLinkOpts {
  /**
   * Check if the user registration is unique by validating
   * the passport identity counter and identity creation timestamp
   */
  uniqueness?: boolean
  /**
   * Used to calculate birth date upper bound for the proof params
   */
  ageLowerBound?: number
  /**
   * Check for specific user's nationality (ISO 3166-1 alpha-3 code)
   * @example 'USA', 'GBR', 'DEU'
   */
  nationality?: string
  /**
   * A flag to include user's nationality in the generated proof
   * based on query proof selector. If `true`, the proof will
   * contain user's nationality in public signals
   */
  nationalityCheck?: boolean
  /**
   * User's sex to be used in the proof params
   * @example 'M', 'F'
   */
  sex?: string
  /**
   * User's document expiration date lower bound timestamp
   */
  expirationLowerBound?: number
  /**
   * Used to generate different nullifiers by the same identity for different use cases (events).
   *
   * Number or hex number in string format
   * @example '0x1234567890abcdef', '123'
   */
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
