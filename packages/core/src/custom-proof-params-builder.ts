import {
  BINARY_REG_EX,
  DECIMAL_REG_EX,
  HEX_REG_EX,
  MAX_EVENT_ID_BIT_LENGTH,
  PASSPORT_DATE_REG_EX,
} from './constants'
import { CustomProofParams, PassportCitizenshipCode, Sex } from './types'
import { asciiToHex } from './utils'

/**
 * Builder for advanced verification link parameters (custom proof parameters).
 * Call `.build()` to finalize.
 * @see https://rarimo.github.io/verificator-svc/#tag/Advanced-verification/operation/getVerificationLinkV2
 */
export class CustomProofParamsBuilder {
  private opts: Partial<CustomProofParams> = {}

  /**
   * Set the selector bitmask for the proof.
   * Accepts binary ("0b..."), decimal ("123"), or hex ("0x...") literals.
   * Internally stores as decimal string.
   * @example
   * builder.withSelector("0b1010") // binary → stored as "10"
   * builder.withSelector("42")     // decimal → stored as "42"
   * builder.withSelector("0x2A")   // hex → stored as "42"
   */
  withSelector(selector: string): this {
    if (BINARY_REG_EX.test(selector)) {
      this.opts.selector = parseInt(selector.slice(2), 2).toString()
      return this
    }

    if (DECIMAL_REG_EX.test(selector)) {
      this.opts.selector = selector
      return this
    }

    if (HEX_REG_EX.test(selector)) {
      this.opts.selector = parseInt(selector, 16).toString()
      return this
    }

    throw new Error(`Invalid selector format: ${selector}`)
  }

  /**
   * Sets the event ID used for nullifier domain separation.
   *
   * Accepts a decimal string or a 0x-prefixed hexadecimal string.
   * Regardless of format, the value must fit within **254 bits**.
   *
   * This ensures compatibility with ZK circuits or field constraints.
   *
   * @param eventId - A non-negative decimal string or 0x-prefixed hex string
   * @returns The builder instance
   *
   * @example "123"
   * @example "0x1a2b3c"
   * @throws If input is not a valid non-negative decimal or hex string
   * @throws If the resulting number exceeds 254 bits
   */
  withEventId(eventId: string): this {
    let parsed: bigint

    try {
      parsed = BigInt(eventId)
    } catch {
      throw new Error('eventId must be a valid non-negative decimal or 0x-prefixed hex string')
    }

    if (parsed < 0n) {
      throw new Error('eventId must not be negative')
    }

    const bitLength = parsed.toString(2).length
    if (bitLength > MAX_EVENT_ID_BIT_LENGTH) {
      throw new Error(
        `eventId exceeds ${MAX_EVENT_ID_BIT_LENGTH}-bit limit (got ${bitLength} bits)`,
      )
    }

    this.opts.eventId = parsed.toString()
    return this
  }

  /**
   * Citizenship mask from an `ISO 3166-1 alpha-3 country code`.
   * Most countries follow the standard 3-letter format like "UKR", "USA", "FRA", etc.
   *
   * ⚠️ Exception: `"D<<"` is used for Germany in some passport formats
   * — it's a placeholder with a 1-letter country code (`D`) followed by filler characters.
   *
   * @example "UKR" // Ukraine
   * @example "D<<" // Germany (placeholder format)
   */
  withCitizenshipMask(mask: PassportCitizenshipCode): this {
    this.opts.citizenshipMask = mask
    return this
  }

  /**
   * User sex: `M`, `F`, `O`, or `''`.
   * @example
   * "M" // male,
   * "F" // female,
   * "O" // other,
   * "" // unspecified.
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
  withIdentityCounterBounds(bounds: { lower: string; upper: string }): this {
    if (!DECIMAL_REG_EX.test(bounds.lower)) {
      throw new Error(
        `identityCounterLowerBound must be a non-negative decimal string, got ${bounds.lower}`,
      )
    }
    if (!DECIMAL_REG_EX.test(bounds.upper)) {
      throw new Error(
        `identityCounterUpperBound must be a non-negative decimal string, got ${bounds.upper}`,
      )
    }
    if (BigInt(bounds.upper) < BigInt(bounds.lower)) {
      throw new Error(
        `identityCounterUpperBound must be ≥ lower bound (${bounds.lower}), got ${bounds.upper}`,
      )
    }
    this.opts.identityCounterLowerBound = bounds.lower
    this.opts.identityCounterUpperBound = bounds.upper
    return this
  }

  /**
   * Set both birth date bounds using `yyMMdd` format strings.
   * Validates each bound as exactly 6 digits and converts to bytes32 hex.
   * @param bounds.lower Lower bound as 6-digit `yyMMdd`
   * @param bounds.upper Upper bound as 6-digit `yyMMdd`
   * @example
   * "010616" // 16 June of 2001
   * "000000" // Used for zero date
   */
  withBirthDateBounds(bounds: { lower: string; upper: string }): this {
    if (!PASSPORT_DATE_REG_EX.test(bounds.lower)) {
      throw new Error(`birthDateLowerBound must be 'yyMMdd', got '${bounds.lower}'`)
    }
    if (!PASSPORT_DATE_REG_EX.test(bounds.upper)) {
      throw new Error(`birthDateUpperBound must be 'yyMMdd', got '${bounds.upper}'`)
    }
    this.opts.birthDateLowerBound = asciiToHex(bounds.lower)
    this.opts.birthDateUpperBound = asciiToHex(bounds.upper)
    return this
  }

  /**
   * Event data in hex format
   * Arbitrary data tied to the event (e.g., ETH address or hash of an email).
   * @example "0xabcdef1234"
   */
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
   * '010616' // 16 June of 2001
   * '000000' // Used for zero date
   */
  withExpirationDateBounds(bounds: { lower: string; upper: string }): this {
    if (!PASSPORT_DATE_REG_EX.test(bounds.lower)) {
      throw new Error(`expirationDateLowerBound must be 'yyMMdd', got '${bounds.lower}'`)
    }
    if (!PASSPORT_DATE_REG_EX.test(bounds.upper)) {
      throw new Error(`expirationDateUpperBound must be 'yyMMdd', got '${bounds.upper}'`)
    }
    this.opts.expirationDateLowerBound = asciiToHex(bounds.lower)
    this.opts.expirationDateUpperBound = asciiToHex(bounds.upper)
    return this
  }

  /**
   * Set both timestamp bounds as UNIX epoch seconds.
   * Validates bounds are non-negative decimal strings and lower ≤ upper.
   * @param bounds.lower Lower bound seconds (before registration)
   * @param bounds.upper Upper bound seconds (on or after registration)
   */
  withTimestampBounds(bounds: { lower: string; upper: string }): this {
    if (!DECIMAL_REG_EX.test(bounds.lower)) {
      throw new Error(
        `timestampLowerBound must be a non-negative decimal string, got ${bounds.lower}`,
      )
    }
    if (!DECIMAL_REG_EX.test(bounds.upper)) {
      throw new Error(
        `timestampUpperBound must be a non-negative decimal string, got ${bounds.upper}`,
      )
    }
    if (BigInt(bounds.upper) < BigInt(bounds.lower)) {
      throw new Error(
        `timestampUpperBound (${bounds.upper}) must be ≥ timestampLowerBound (${bounds.lower})`,
      )
    }
    this.opts.timestampLowerBound = bounds.lower
    this.opts.timestampUpperBound = bounds.upper
    return this
  }

  /**
   * Finalize builder, returning fully populated options.
   * Requires only selector and eventId.
   */
  build(): CustomProofParams {
    const { selector, eventId } = this.opts
    if (!selector || !eventId) {
      throw new Error(`Missing required fields: selector and eventId are required.`)
    }
    return this.opts as CustomProofParams
  }
}
