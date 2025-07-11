# ZK Passport

ZK Passport is a library for interaction with RariMe app and [RariMe verificator service](https://github.com/rarimo/verificator-svc). It encapsulates the logic of generating and verifying zero-knowledge proofs for identity verification.

## Installation

```bash
yarn add @rarimo/zk-passport
```

## Usage

### Basic verification

```ts
const zkPassport = new ZkPassport()
const customApi = new ZkPassport('https://api.example.com')

const id = '123'
const verificationLink = await zkPassport.requestVerificationLink(id, {
  ageLowerBound: 18,
  uniqueness: true,
})

const status = await zkPassport.getVerificationStatus(id)
const proof = await zkPassport.getVerifiedProof(id)
```

### Advanced verification

```tsx
import { CustomProofParamsBuilder } from '@rarimo/zk-passport'

const zkPassport = new ZkPassport()
const customApi = new ZkPassport('https://api.example.com')

const advancedVerificationOpts = new CustomProofParamsBuilder()
  .withSelector('39425')
  .withEventId('123456')
  .withIdentityCounterBounds({ lower: '0', upper: '100' })
  .withBirthDateBounds({ lower: '000000', upper: '250630' })
  .withEventData('0xabcdef1234')
  .withExpirationDateBounds({ lower: '000000', upper: '000000' })
  .withTimestampBounds({ lower: '0', upper: '1742461731' })
  .build()

const status = await zkPassport.getVerificationStatus(id)
const proof = await zkPassport.getVerifiedProof(id)
```

## Verification Options

### Basic Verification (`RequestVerificationLinkOpts`)

| Option                 | Type      | Description                                                      | Required |
| ---------------------- | --------- | ---------------------------------------------------------------- | -------- |
| `uniqueness`           | `boolean` | Check uniqueness by passport identity counter and timestamp      | Optional |
| `ageLowerBound`        | `number`  | Minimum age required                                             | Optional |
| `nationality`          | `string`  | Nationality to check (ISO 3166-1 alpha-3, e.g. `"UKR"`, `"D<<"`) | Optional |
| `nationalityCheck`     | `boolean` | Include nationality in the generated proof                       | Optional |
| `sex`                  | `boolean` | Enable verification of user's sex                                | Optional |
| `expirationLowerBound` | `boolean` | Require passport to be valid beyond current time                 | Optional |
| `eventId`              | `string`  | Hex or decimal event identifier                                  | Optional |

### Advanced Verification (`CustomProofParams`)

| Field                       | Type     | Description                                                    | Required     |
| --------------------------- | -------- | -------------------------------------------------------------- | ------------ |
| `eventId`                   | `string` | Decimal string (≤254 bits) used to generate nullifier          | **Required** |
| `selector`                  | `string` | Bitmask (decimal string) controlling which fields are revealed | **Required** |
| `citizenshipMask`           | `string` | ISO 3166-1 alpha-3 code (e.g. `"UKR"`, `"D<<"`)                | **Optional** |
| `sex`                       | `string` | `"M"` / `"F"` / `"O"` / `""`                                   | **Optional** |
| `identityCounterLowerBound` | `string` | Min allowed identity counter                                   | **Optional** |
| `identityCounterUpperBound` | `string` | Max allowed identity counter                                   | **Optional** |
| `birthDateLowerBound`       | `string` | Lower birth date (hex `yyMMdd`)                                | **Optional** |
| `birthDateUpperBound`       | `string` | Upper birth date (hex `yyMMdd`)                                | **Optional** |
| `eventData`                 | `string` | Arbitrary hex value tied to event                              | **Optional** |
| `expirationDateLowerBound`  | `string` | Lower bound for passport expiration (hex `yyMMdd`)             | **Optional** |
| `expirationDateUpperBound`  | `string` | Upper bound for passport expiration (hex `yyMMdd`)             | **Optional** |
| `timestampLowerBound`       | `string` | UNIX timestamp (seconds) — must be before registration         | **Optional** |
| `timestampUpperBound`       | `string` | UNIX timestamp (seconds) — must be on/after registration       | **Optional** |

## License

This project is licensed under the [MIT License](./LICENSE).
