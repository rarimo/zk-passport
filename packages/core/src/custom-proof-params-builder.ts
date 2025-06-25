import { BINARY_REG_EX, DECIMAL_REG_EX, PASSPORT_DATE_REG_EX } from './constants'
import { CountryMask, CustomProofParams, Sex } from './types'
import { ASCIItoHex } from './utils'

/**
 * Builder for advanced verification link parameters (custom proof parameters).
 * Chain must start with `withSelector()` before setting other options.
 * Call `.build()` to finalize.
 * @see https://rarimo.github.io/verificator-svc/#tag/Advanced-verification/operation/getVerificationLinkV2
 */
export class CustomProofParamsBuilder {
  private opts: Partial<CustomProofParams> = {}

  /**
   * Set the selector bitmask for the proof.
   * - number: decimal value
   * - '0b…': binary literal
   * - '\d+': decimal string
   */
  withSelector(selector: number | string): this {
    if (typeof selector === 'number') {
      this.opts.selector = String(selector)
      return this
    }
    if (BINARY_REG_EX.test(selector)) {
      this.opts.selector = parseInt(selector.slice(2), 2).toString()
      return this
    }
    if (DECIMAL_REG_EX.test(selector)) {
      this.opts.selector = selector
      return this
    }
    throw new Error(`Invalid selector format: ${selector}`)
  }

  /**
   *  Must be a non-negative integer and no more than 31 decimal digits.
   */
  withEventId(eventId: number): this {
    if (!Number.isInteger(eventId) || eventId < 0) {
      throw new Error(`eventId must be a non-negative integer`)
    }
    const digits = eventId.toString().length
    if (digits > 31) {
      throw new Error(`eventId decimal length must be less or equal 31 digits; got ${digits}`)
    }
    this.opts.eventId = String(eventId)
    return this
  }

  /**
   * Set the ISO 3166-1 alpha-3 country code for citizenship.
   * Validates that `mask` is one of the allowed codes in `COUNTRIES`.
   * @example 'UKR'
   */
  withCitizenshipMask(mask: CountryMask): this {
    this.opts.citizenshipMask = mask
    return this
  }

  /** User sex: `M`, `F`, `O`, or `''`.
   * @example
   * 'M' // male,
   * 'F' // female,
   * 'O' // other,
   * '' // unspecified.
   */
  withSex(sex: Sex): this {
    this.opts.sex = sex
    return this
  }

  /**
   * Set both identity counter bounds for uniqueness checks.
   * @param bounds.lower Lower bound (≥0)
   * @param bounds.upper Upper bound (≥ lower bound)
   */
  withIdentityCounterBounds(bounds: { lower: number; upper: number }): this {
    const { lower, upper } = bounds
    // Validate lower bound
    if (!Number.isInteger(lower) || lower < 0) {
      throw new Error(`identityCounterLowerBound must be a non-negative integer, got ${lower}`)
    }
    // Validate upper bound
    if (!Number.isInteger(upper) || upper < lower) {
      throw new Error(
        `identityCounterUpperBound must be an integer ≥ lower bound (${lower}), got ${upper}`,
      )
    }
    this.opts.identityCounterLowerBound = lower
    this.opts.identityCounterUpperBound = upper
    return this
  }

  /**
   * Set both birth date bounds using 'yyMMdd' format strings.
   * Validates each bound as exactly 6 digits and converts to bytes32 hex.
   * @param bounds.lower Lower bound as 6-digit 'yyMMdd'
   * @param bounds.upper Upper bound as 6-digit 'yyMMdd'
   * @example
   * '010616' // 16 June of 20001
   * '000000' // Used for zero date
   */
  withBirthDateBounds(bounds: { lower: string; upper: string }): this {
    const { lower, upper } = bounds
    if (!PASSPORT_DATE_REG_EX.test(lower)) {
      throw new Error(`birthDateLowerBound must be 6 digits 'yyMMdd', got '${lower}'`)
    }
    if (!PASSPORT_DATE_REG_EX.test(upper)) {
      throw new Error(`birthDateUpperBound must be 6 digits 'yyMMdd', got '${upper}'`)
    }

    this.opts.birthDateLowerBound = ASCIItoHex(lower)
    this.opts.birthDateUpperBound = ASCIItoHex(upper)

    return this
  }

  /** Event data in hex (arbitrary). */
  withEventData(hex: `0x${string}`): this {
    this.opts.eventData = hex
    return this
  }

  /**
   * Set both passport expiration date bounds using `yyMMdd` format strings.
   * Validates each bound as exactly 6 digits and converts to bytes32 hex.
   * @param bounds.lower Lower bound as 6-digit `yyMMdd`
   * @param bounds.upper Upper bound as 6-digit `yyMMdd`
   * @example
   * '010616' // 16 June of 20001
   * '000000' // Used for zero date
   */
  withExpirationDateBounds(bounds: { lower: string; upper: string }): this {
    const { lower, upper } = bounds

    // 1) Validate `yyMMdd` format: exactly 6 digits
    if (!PASSPORT_DATE_REG_EX.test(lower)) {
      throw new Error(`expirationDateLowerBound must be 6 digits 'yyMMdd', got '${lower}'`)
    }
    if (!PASSPORT_DATE_REG_EX.test(upper)) {
      throw new Error(`expirationDateUpperBound must be 6 digits 'yyMMdd', got '${upper}'`)
    }

    // 2) Convert ASCII `yyMMdd` to bytes32 hex
    this.opts.expirationDateLowerBound = ASCIItoHex(lower)
    this.opts.expirationDateUpperBound = ASCIItoHex(upper)

    return this
  }

  /**
   * Set both timestamp bounds as UNIX epoch seconds.
   * Validates bounds are non-negative integers and lower ≤ upper.
   * @param bounds.lower Lower bound seconds (before registration)
   * @param bounds.upper Upper bound seconds (on or after registration)
   */
  withTimestampBounds(bounds: { lower: number; upper: number }): this {
    const { lower, upper } = bounds
    if (!Number.isInteger(lower) || lower < 0) {
      throw new Error(`timestampLowerBound must be a non-negative integer, got ${lower}`)
    }
    if (!Number.isInteger(upper) || upper < 0) {
      throw new Error(`timestampUpperBound must be a non-negative integer, got ${upper}`)
    }
    if (upper < lower) {
      throw new Error(`timestampUpperBound (${upper}) must be >= timestampLowerBound (${lower})`)
    }
    this.opts.timestampLowerBound = lower
    this.opts.timestampUpperBound = upper
    return this
  }

  /**
   * Finalize builder, returning fully populated options.
   * Throws if any required field is missing.
   */
  build(): CustomProofParams {
    const required: (keyof CustomProofParams)[] = [
      'selector',
      'eventId',
      'citizenshipMask',
      'sex',
      'identityCounterLowerBound',
      'identityCounterUpperBound',
      'birthDateLowerBound',
      'birthDateUpperBound',
      'eventData',
      'expirationDateLowerBound',
      'expirationDateUpperBound',
      'timestampLowerBound',
      'timestampUpperBound',
    ]
    for (const key of required) {
      if (this.opts[key] == null) {
        throw new Error(`Missing parameter: ${key}`)
      }
    }
    return this.opts as CustomProofParams
  }
}
