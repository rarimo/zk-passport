# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog], and this project adheres to [Semantic Versioning].

## [Unreleased]
### Added
- `react` - Support for **Onchain Verification** with `OnChainVerificationOptions`
- `examples` - `StackBlitz` live demos for all examples
- `examples` - New example `advanced-verification-react`

### Changed
- Use workspace packages in examples instead of local paths
- Update `yarn` to `4.9.2`
- `examples` - Rename `offchain-verification-react` to `basic-verification-react`
- `examples` - Update `onchain-verification-react` to use `OnChainVerificationOptions`

## [1.0.0] - 2025-07-01
### Added
- `core` - Support for **Advanced Verification** with `CustomProofParamsBuilder`
- `core` - Full type-safe interface for advanced proof parameters
- `core` - Unit tests for custom proof params builder
- `examples/onchain-verification-react` - New example app demonstrating onchain usage (React + TS + Wagmi)

### Changed
- `core` – `sex` and `expirationLowerBound` are now `boolean` flags (`RequestVerificationLinkOpts`)

## [0.1.2] - 2025-04-25
### Changed
- `core` - Use `app.rarime.com` as QR code URL host

## [0.1.1] - 2025-04-09
### Added
- License for all packages

## [0.1.0] - 2025-04-09
### Added
- `core` package for ZK Passport
- `react` package for ZK Passport QR code component
- React example app


[Keep a Changelog]: https://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: https://semver.org/spec/v2.0.0.html

[Unreleased]: https://github.com/rarimo/zk-passport/compare/1.0.0...HEAD
[1.0.0]: https://github.com/rarimo/zk-passport/compare/0.1.2...1.0.0
[0.1.2]: https://github.com/rarimo/zk-passport/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/rarimo/zk-passport/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/rarimo/zk-passport/releases/tag/0.1.0
