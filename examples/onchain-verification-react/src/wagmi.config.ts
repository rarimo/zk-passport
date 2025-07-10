import { AppKitNetwork, defineChain } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { http } from 'wagmi'

import { config } from './config'

export const rarimoL2AppKitChain: AppKitNetwork = {
  id: 7368,
  name: 'Rarimo L2',
  caipNetworkId: 'eip155:201411',
  chainNamespace: 'eip155',
  nativeCurrency: {
    decimals: 18,
    name: 'RMO',
    symbol: 'RMO',
  },
  rpcUrls: {
    default: {
      http: ['https://l2.rarimo.com'],
    },
  },
  contracts: {},
}

const activeNetwork = defineChain({
  id: rarimoL2AppKitChain.id as number,
  caipNetworkId: `eip155:${rarimoL2AppKitChain.id}`,
  chainNamespace: 'eip155',
  name: rarimoL2AppKitChain.name,
  nativeCurrency: rarimoL2AppKitChain.nativeCurrency,
  rpcUrls: rarimoL2AppKitChain.rpcUrls,
  blockExplorers: rarimoL2AppKitChain.blockExplorers,
})

export const ethNetworks = [activeNetwork] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  networks: ethNetworks,
  projectId: config.REOWN_ID,
  transports: {
    [activeNetwork.id]: http(activeNetwork.rpcUrls.default.http[0]),
  },
})
