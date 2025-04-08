# ZK Passport

ZK Passport is a library for interaction with RariMe app and [RariMe verificator service](https://github.com/rarimo/verificator-svc). It encapsulates the logic of generating and verifying zero-knowledge proofs for identity verification.

### Installation

```bash
yarn add @rarimo/zk-passport
```

### Usage

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
