import { AppKitNetwork, defineChain } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { http } from 'wagmi'

import { config } from './config'

export const rarimoTestnetAppKitChain: AppKitNetwork = {
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
  id: rarimoTestnetAppKitChain.id as number,
  caipNetworkId: `eip155:${rarimoTestnetAppKitChain.id}`,
  chainNamespace: 'eip155',
  name: rarimoTestnetAppKitChain.name,
  nativeCurrency: rarimoTestnetAppKitChain.nativeCurrency,
  rpcUrls: rarimoTestnetAppKitChain.rpcUrls,
  blockExplorers: rarimoTestnetAppKitChain.blockExplorers,
})

export const ethNetworks = [activeNetwork] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  networks: ethNetworks,
  projectId: config.REOWN_ID,
  transports: {
    [activeNetwork.id]: http(activeNetwork.rpcUrls.default.http[0]),
  },
})
