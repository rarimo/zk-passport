export type Config = {
  API_URL: string
  REOWN_ID: string
  CONTRACT_ADDRESS: `0x${string}`
}

export const config: Config = {
  CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS,
  REOWN_ID: import.meta.env.VITE_REOWN_ID,
  API_URL: import.meta.env.VITE_API_URL,
}
