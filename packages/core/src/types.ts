import { COUNTRIES_MASKS } from './constants'

/**
 * Verificator link request attributes:
 * @see[Request verification links for qr-code generation](https://rarimo.github.io/verificator-svc/#tag/User-verification/operation/getVerificationLink)
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
   * Enable verification of sex param
   */
  sex?: boolean
  /**
   * Enable verification of expiration lower bound param. When nothing (or false)
   * set default value is used, otherwise encoded current UTC timestamp will be stored.
   */
  expirationLowerBound?: boolean
  /**
   * Used to generate different nullifiers by the same identity for different use cases (events).
   *
   * Number or hex number in string format
   * @example '0x1234567890abcdef', '123'
   */
  eventId?: string
}

/**
 * Advanced verificator link request attributes:
 * @see[Request verification links with custom proof parameters](https://rarimo.github.io/verificator-svc/#tag/Advanced-verification/operation/getVerificationLinkV2)
 */
export interface CustomProofParams {
  /**
   * Must be decimal string and less than 31 bytes.
   * Used to generate different nullifiers by the same identity for different use cases (events).
   * @example "1"
   */
  eventId: string
  /**
   * Bitmask selector controlling which personal data fields are revealed.
   *
   * **QUERY SELECTOR mapping (bit index → description):**
   * - `0`: nullifier (reveal)
   * - `1`: birth date (reveal)
   * - `2`: expiration date (reveal)
   * - `3`: name (reveal)
   * - `4`: nationality (reveal)
   * - `5`: citizenship (reveal)
   * - `6`: sex (reveal)
   * - `7`: document number (reveal)
   * - `8`: timestamp lower bound (range-check)
   * - `9`: timestamp upper bound (range-check)
   * - `10`: identity counter lower bound (range-check)
   * - `11`: identity counter upper bound (range-check)
   * - `12`: passport expiration lower bound (range-check)
   * - `13`: passport expiration upper bound (range-check)
   * - `14`: birth date lower bound (range-check)
   * - `15`: birth date upper bound (range-check)
   * - `16`: verify citizenship mask as whitelist (not implemented)
   * - `17`: verify citizenship mask as blacklist (not implemented)
   *
   * @see {@link https://github.com/rarimo/passport-zk-circuits/blob/main/README.md#selector How does the selector work?}
   * @example
   * ```ts
   * // Given a raw binary mask string without the 0b prefix:
   * const rawSelector = "000100000100001";
   * // Convert to decimal string for the API:
   * const selector = parseInt(rawSelector, 2).toString();
   * ```
   */
  selector: string

  /**
   * Citizenship mask from an `ISO 3166-1 alpha-3 country code`.
   * @example 'UKR' // Ukraine's country code
   */
  citizenshipMask: string
  /**
   * User sex.
   * @example
   * 'M' // male,
   * 'F' // female,
   * 'O' // other,
   * '' // unspecified.
   */
  sex: Sex
  /**
   * Lower bound for identity counter used in uniqueness checks.
   * Must be less than the number of registrations for the same passport.
   * @example 0 // means no minimum restriction
   */
  identityCounterLowerBound: number
  /**
   * Upper bound for identity counter used in uniqueness checks.
   * Must be greater than or equal to the number of registrations for the same passport (often 1).
   * @example 1 // allows up to one registration
   */
  identityCounterUpperBound: number
  /**
   * Birth date lower bound in hex format (**earliest allowed**).
   * Format: **yyMMdd**.
   * Convert ASCII string like `010616` to its hex representation: `0x303130363136` (June 16, 2001).
   * Lower bound means before this date.
   * @example '0x303130363136' // before June 16, 2001
   */
  birthDateLowerBound: string
  /**
   * Birth date upper bound in hex format (latest allowed).
   * Format:  `yyMMdd`..
   * Convert ASCII string like `010617` to its hex representation: `0x303130363137` (June 17, 2001).
   * Upper bound means on or after this date.
   * @example '0x303130363137' // on or after June 17, 2001
   */
  birthDateUpperBound: string
  /**
   * Event data in hex format
   * Arbitrary data tied to the event (e.g., ETH address or hash of an email).
   * @example '0xabcdef1234...'
   */
  eventData: string
  /**
   * Lower bound for passport expiration date.
   * Encoded as `yyMMdd` hex string. Must be before the actual passport expiration date.
   * @example '0x20231231' // before actual expiration date
   */
  expirationDateLowerBound: string
  /**
   * Upper bound for passport expiration date.
   * Encoded as `yyMMdd` hex string. Must be on or after the actual passport expiration date.
   * @example '0x20241231' // on or after actual expiration date
   */
  expirationDateUpperBound: string
  /**
   * Timestamp lower bound, as UNIX epoch seconds.
   * Must be before the passport registration time.
   * @example 1620000000 // before registration timestamp
   */
  timestampLowerBound: number
  /**
   * Timestamp upper bound, as UNIX epoch seconds.
   * Must be on or after the passport registration time.
   * @example 1620003600 // on or after registration timestamp
   */
  timestampUpperBound: number
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

export interface VerificationLinkResponse {
  id: string
  type: string
  callback_url: string
  get_proof_params: string
}

export type CountryMask = (typeof COUNTRIES_MASKS)[number]
export type Sex = 'M' | 'F' | 'O' | ''
