# Onchain Verification Example (React + TypeScript + Wagmi)

## Live Demo
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/rarimo/zk-passport/tree/main/examples/onchain-verification-react)

## Installation

Install dependencies from the `monorepo root`:

```bash
yarn install
```

Then build the packages from the `monorepo root`:

```bash
yarn build
```

## Environment Setup

```bash
cp .env-example .env
```

Update the `.env` file with your own values if needed:

```env
VITE_API_URL='https://api.app.rarime.com'
VITE_CONTRACT_ADDRESS='0x69c94172f3E3Cb300e6b0f50A67181455650D150'
VITE_REOWN_ID='9eb385e4b93c0798cd7fa751badc11f5'
```

- `VITE_API_URL`: The base URL of the Verificator service
- `VITE_CONTRACT_ADDRESS`: The smart contract address deployed to [Rarimo L2](https://docs.rarimo.com/zk-registry/network-info/)
- `VITE_REOWN_ID`: VITE_REOWN_ID: App ID used for linking user to an organization (get it on [Reown](https://reown.com/))

## Running the Example

From the `monorepo root`, either run:

```bash
yarn workspace examples/onchain-verification-react start
```

or:

```bash
cd examples/onchain-verification-react
yarn start
```

The app will be available at http://localhost:5173 by default.

