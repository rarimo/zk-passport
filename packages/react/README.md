# ZK Passport React

QR code React component for ZK Passport. It allows you to easily integrate ZK Passport into your React applications and renders a QR code for identity verification through RariMe app.

## Features

- Customizable QR code component for scanning with RariMe app
- Easy integration with [ZK passport core library](https://github.com/rarimo/zk-passport/tree/main/packages/core)
- Events for status changes and success/error handling

## Installation

```bash
yarn add @rarimo/zk-passport-react
```

## Usage

You can check the full app example [here](https://github.com/rarimo/zk-passport/tree/main/examples/react-app).

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
