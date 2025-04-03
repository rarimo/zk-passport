# ZK Passport React

QR code React component for ZK Passport.

## Installation

```bash
yarn add @rarimo/zk-passport-react
```

## Usage

You can check the full app example in the [example folder](./example).

```tsx
import ZkPassportQrCode, { ProofRequestStatuses } from '@rarimo/zk-passport-react'

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
