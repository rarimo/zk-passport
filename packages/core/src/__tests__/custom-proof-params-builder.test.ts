import { CustomProofParamsBuilder } from '@rarimo/zk-passport'

// (1n << 254n).toString()
export const MIN_UINT_255_BITS =
  '28948022309329048855892746252171976963317496166410141009864396001978282409984'

describe('CustomProofParamsBuilder', () => {
  it('builds with valid selector and eventId', () => {
    const builder = new CustomProofParamsBuilder().withSelector('0b1010').withEventId('123')
    const result = builder.build()
    expect(result.selector).toBe('10')
    expect(result.eventId).toBe('123')
  })

  it('throws on invalid selector', () => {
    const builder = new CustomProofParamsBuilder()
    expect(() => builder.withSelector('invalid selector')).toThrow(/Invalid selector format/)
  })

  it('parses hex selector correctly', () => {
    const builder = new CustomProofParamsBuilder().withSelector('0x1f').withEventId('42')
    const result = builder.build()
    expect(result.selector).toBe('31')
  })

  it('throws if eventId is too big', () => {
    const builder = new CustomProofParamsBuilder()
    const bigValue = '0x' + 'f'.repeat(70)
    expect(() => builder.withEventId(bigValue)).toThrow(/exceeds/)
  })

  it('accepts eventId with 254-bit value', () => {
    const MAX_UINT_254_BITS = (BigInt(MIN_UINT_255_BITS) - 1n).toString()
    const builder = new CustomProofParamsBuilder().withSelector('1').withEventId(MAX_UINT_254_BITS)
    const result = builder.build()
    expect(result.eventId).toBe(MAX_UINT_254_BITS)
  })

  it('throws if eventId exceeds 254-bit value', () => {
    const builder = new CustomProofParamsBuilder()
    expect(() => builder.withEventId(MIN_UINT_255_BITS)).toThrow(/254-bit limit/)
  })

  it('fails build() without required fields', () => {
    const builder = new CustomProofParamsBuilder()
    expect(() => builder.build()).toThrow(/Missing required fields/)
  })

  it('throws if selector is set but eventId is missing', () => {
    const builder = new CustomProofParamsBuilder().withSelector('0b1')
    expect(() => builder.build()).toThrow(/Missing required fields/)
  })

  it('throws if eventId is set but selector is missing', () => {
    const builder = new CustomProofParamsBuilder().withEventId('1')
    expect(() => builder.build()).toThrow(/Missing required fields/)
  })

  it('sets citizenship mask', () => {
    const builder = new CustomProofParamsBuilder()
      .withSelector('42')
      .withEventId('123')
      .withCitizenshipMask('UKR')
    const result = builder.build()
    expect(result.citizenshipMask).toBe('UKR')
  })

  it('sets sex', () => {
    const builder = new CustomProofParamsBuilder().withSelector('1').withEventId('2').withSex('M')
    const result = builder.build()
    expect(result.sex).toBe('M')
  })

  it('sets identity counter bounds', () => {
    const builder = new CustomProofParamsBuilder()
      .withSelector('1')
      .withEventId('2')
      .withIdentityCounterBounds({ lower: '0', upper: '10' })
    const result = builder.build()
    expect(result.identityCounterLowerBound).toBe('0')
    expect(result.identityCounterUpperBound).toBe('10')
  })

  it('throws if identityCounterUpperBound < lowerBound', () => {
    const builder = new CustomProofParamsBuilder()
    expect(() => builder.withIdentityCounterBounds({ lower: '10', upper: '5' })).toThrow()
  })

  it('sets birth date bounds', () => {
    const builder = new CustomProofParamsBuilder()
      .withSelector('1')
      .withEventId('2')
      .withBirthDateBounds({ lower: '010101', upper: '020202' })
    const result = builder.build()
    expect(result.birthDateLowerBound).toMatch(/^0x/)
    expect(result.birthDateUpperBound).toMatch(/^0x/)
  })

  it('sets event data', () => {
    const builder = new CustomProofParamsBuilder()
      .withSelector('1')
      .withEventId('2')
      .withEventData('0xabcdef1234')
    const result = builder.build()
    expect(result.eventData).toBe('0xabcdef1234')
  })

  it('sets expiration date bounds', () => {
    const builder = new CustomProofParamsBuilder()
      .withSelector('1')
      .withEventId('2')
      .withExpirationDateBounds({ lower: '240101', upper: '250101' })
    const result = builder.build()
    expect(result.expirationDateLowerBound).toMatch(/^0x/)
    expect(result.expirationDateUpperBound).toMatch(/^0x/)
  })

  it('sets timestamp bounds', () => {
    const builder = new CustomProofParamsBuilder()
      .withSelector('1')
      .withEventId('2')
      .withTimestampBounds({ lower: '1000', upper: '2000' })
    const result = builder.build()
    expect(result.timestampLowerBound).toBe('1000')
    expect(result.timestampUpperBound).toBe('2000')
  })

  it('throws if timestamp upper < lower', () => {
    const builder = new CustomProofParamsBuilder()
    expect(() => builder.withTimestampBounds({ lower: '100', upper: '99' })).toThrow()
  })

  it('matches snapshot with binary selector', () => {
    const builder = new CustomProofParamsBuilder()
      .withSelector('0b1')
      .withEventId('1')
      .withCitizenshipMask('UKR')
      .withSex('M')
      .withIdentityCounterBounds({ lower: '0', upper: '1' })
      .withBirthDateBounds({ lower: '010101', upper: '020202' })
      .withEventData('0x123456')
      .withExpirationDateBounds({ lower: '240101', upper: '250101' })
      .withTimestampBounds({ lower: '1000', upper: '2000' })

    expect(builder.build()).toMatchSnapshot()
  })

  it('matches snapshot with hex selector', () => {
    const builder = new CustomProofParamsBuilder()
      .withSelector('0x2a')
      .withEventId('3')
      .withCitizenshipMask('UKR')
      .withSex('F')
      .withIdentityCounterBounds({ lower: '1', upper: '2' })
      .withBirthDateBounds({ lower: '910101', upper: '950101' })
      .withEventData('0xdeadbeef')
      .withExpirationDateBounds({ lower: '300101', upper: '310101' })
      .withTimestampBounds({ lower: '1234567890', upper: '2234567890' })

    expect(builder.build()).toMatchSnapshot()
  })
})
