# ZK Passport

ZK Passport is a library for generating and verifying zero-knowledge proofs for identity verification. It allows users to prove their identity without revealing any personal information.

## Core

Core ZK Passport library for the communication with RariMe verificator service.

### Installation

```bash
yarn add @rarimo/zk-passport
```

### Usage

```ts
const zkPassport = new ZkPassport()
const customApi = new ZkPassportVerifier('https://api.example.com')

const id = '123'
const verificationLink = await zkPassport.requestVerificationLink(id, {
  ageLowerBound: 18,
  uniqueness: true,
})

const status = await zkPassport.getVerificationStatus(id)
const proof = await zkPassport.getVerifiedProof(id)
```

## React

QR code React component for ZK Passport.

### Installation

```bash
yarn add @rarimo/zk-passport-react
```

### Usage

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
