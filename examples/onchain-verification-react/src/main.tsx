import './index.css'

import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'

import App from './App'
import { config } from './config'
import { ethNetworks, wagmiAdapter } from './wagmi.config'

createAppKit({
  adapters: [wagmiAdapter],
  networks: [...ethNetworks],
  projectId: config.REOWN_ID,
  themeMode: 'dark',
  features: {
    analytics: false,
    socials: [],
    email: false,
  },
})

const queryClient = new QueryClient()

const root = createRoot(document.getElementById('root') as Element)

root.render(
  <StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
