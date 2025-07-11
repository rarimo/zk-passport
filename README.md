# ZK Passport

ZK Passport is a library for interaction with the RariMe app and [RariMe verificator service](https://github.com/rarimo/verificator-svc). It encapsulates the logic of generating and verifying zero-knowledge proofs for identity verification.

## Packages

### [Core](./packages/core/README.md)

Core ZK Passport library for communicating with the [RariMe verificator service](https://github.com/rarimo/verificator-svc).

It supports both:

- **Basic verification** — simple identity checks such as age, uniqueness, nationality, etc.
- **Advanced verification** — custom proof configuration with fine-grained control using a builder interface (`CustomProofParamsBuilder`).

### [React](./packages/react/README.md)

QR code React component for ZK Passport. It allows you to easily integrate ZK Passport into your React applications and renders a QR code for identity verification through the RariMe app.

## Examples

The repository also includes two examples showcasing integration:

- [Basic Verification React](./examples/basic-verification-react/README.md) – High-level integration with basic verification flow ([Live demo](https://stackblitz.com/github/rarimo/zk-passport/tree/main/examples/basic-verification-react))
- [Advanced Verification React](./examples/advanced-verification-react/README.md) – Advanced verification using `CustomProofParamsBuilder` ([Live demo](https://stackblitz.com/github/rarimo/zk-passport/tree/main/examples/advanced-verification-react))
- [Onchain Verification React](./examples/onchain-verification-react/README.md) – Onchain verification for the contracts using [`@rarimo/passport-contracts` SDK](https://docs.rarimo.com/zk-passport/guide-on-chain-verification/) ([Live demo](https://stackblitz.com/github/rarimo/zk-passport/tree/main/examples/onchain-verification-react))

## License

This project is licensed under the [MIT License](./LICENSE).
