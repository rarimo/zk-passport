# ZK Passport React

QR code React component for ZK Passport. It allows you to easily integrate ZK Passport into your React applications and renders a QR code for identity verification through the RariMe app.

## Features

- Customizable QR code component for scanning with RariMe app
- Easy integration with [ZK Passport core library](https://github.com/rarimo/zk-passport/tree/main/packages/core)
- Supports both **basic** and **advanced** verification modes
- Events for status changes and success/error handling

## Installation

```bash
yarn add @rarimo/zk-passport-react
```

## Usage

You can check the full app example [here](https://github.com/rarimo/zk-passport/tree/main/examples).

### Basic verification

```tsx
import ZkPassportQrCode from '@rarimo/zk-passport-react'

const requestId = 'account-1'
const apiUrl = 'https://api.app.rarime.com'
const verificationOpts: RequestVerificationLinkOpts = {
  ageLowerBound: 18,
  uniqueness: true,
  nationalityCheck: true,
  eventId: '123',
}

return (
  <ZkPassportQrCode
    apiUrl={apiUrl}
    requestId={requestId}
    verificationOptions={verificationOpts}
    qrProps={{ size: 256 }}
    onStatusChange={status => console.log(status)}
    onSuccess={proof => console.log(proof)}
    onError={error => console.error(error)}
  />
)
```

### Advanced verification

```tsx
import { CustomProofParamsBuilder } from '@rarimo/zk-passport'
import ZkPassportQrCode from '@rarimo/zk-passport-react'

const advancedVerificationOpts = new CustomProofParamsBuilder()
  .withSelector('39425')
  .withEventId('123456')
  .withIdentityCounterBounds({ lower: '0', upper: '100' })
  .withBirthDateBounds({ lower: '000000', upper: '250630' })
  .withEventData('0xabcdef1234')
  .withExpirationDateBounds({ lower: '000000', upper: '000000' })
  .withTimestampBounds({ lower: '0', upper: '1742461731' })
  .build()

return (
  <ZkPassportQrCode
    apiUrl={apiUrl}
    requestId={requestId}
    verificationOptions={advancedVerificationOpts}
    qrProps={{ size: 256 }}
    onStatusChange={status => console.log(status)}
    onSuccess={proof => console.log(proof)}
    onError={error => console.error(error)}
  />
)
```

### `ZkPassportQrCode` Props

| Prop                  | Type                                                 | Description                                                                  | Required     |
| --------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- | ------------ |
| `apiUrl`              | `string`                                             | URL of the verificator service API. Defaults to `https://api.app.rarime.com` | **Optional** |
| `requestId`           | `string`                                             | Unique ID for the user/session. Used to associate the request with a proof.  | **Required** |
| `verificationOptions` | `RequestVerificationLinkOpts` or `CustomProofParams` | Parameters for either basic or advanced proof request.                       | **Required** |
| `pollingInterval`     | `number`                                             | Interval (in ms) to poll verification status. Defaults to `5000`.            | **Optional** |
| `qrProps`             | `Omit<ComponentProps<typeof QRCodeSVG>, 'value'>`    | Props passed to the QRCodeSVG component (except `value`).                    | **Required** |
| `onStatusChange`      | `(status: ProofRequestStatuses) => void`             | Callback triggered when the proof request status changes.                    | **Required** |
| `onSuccess`           | `(proof: ZkProof) => void`                           | Callback called when proof is successfully verified.                         | **Required** |
| `onError`             | `(error: Error) => void`                             | Callback called when an error occurs in the verification process.            | **Required** |
