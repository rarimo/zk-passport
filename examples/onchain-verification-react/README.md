# Onchain Verification Example (React + TypeScript + Wagmi)

This example demonstrates how to integrate **ZK Passport** onchain verification logic into a modern React app using **TypeScript**, **Wagmi**, and **Vite**.

## Prerequisites

- Node.js >= 18
- Yarn >= 1.22

## Installation

Clone the repo and install dependencies from the `monorepo root`:

```bash
yarn install
```

Then build the packages from the `monorepo root`:

```bash
yarn build
```

Navigate to the example folder:

```bash
cd examples/onchain-verification-react
```

Install local dependencies (to make sure you use the latest built packages from dist/):

```bash
yarn install
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
- `VITE_CONTRACT_ADDRESS`: The deployed smart contract address onchain
- `VITE_REOWN_ID`: App ID used for linking user to an organization (Reown)

## Start the App

```bash
yarn start
```

The app will be available at http://localhost:5173 by default.
