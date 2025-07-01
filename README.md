# ZK Passport

ZK Passport is a library for interaction with the RariMe app and [RariMe verificator service](https://github.com/rarimo/verificator-svc). It encapsulates the logic of generating and verifying zero-knowledge proofs for identity verification.

## Packages

### [Core](./packages/core/README.md)

Core ZK Passport library for communicating with the [RariMe verificator service](https://github.com/rarimo/verificator-svc).

It supports both:

- **Basic verification** — simple identity checks such as age, uniqueness, nationality, etc.
- **Advanced verification** — custom proof configuration with fine-grained control using a builder interface (`CustomProofParamsBuilder`).

## [React](./packages/react/README.md)

QR code React component for ZK Passport. It allows you to easily integrate ZK Passport into your React applications and renders a QR code for identity verification through the RariMe app.

### Examples

The repository also includes two examples showcasing integration:

- [`examples/onchain-verification-react`](./examples/onchain-verification-react) – full end-to-end flow including smart contract interaction and Reown App integration.
- [`examples/offchain-verification-react`](./examples/offchain-verification-react) – client-side verification flow (no contract interaction).

## License

This project is licensed under the [MIT License](./LICENSE).
