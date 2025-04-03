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
