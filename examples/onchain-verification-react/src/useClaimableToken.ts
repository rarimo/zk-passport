import { ZkProof } from '@rarimo/zk-passport'
import { useAppKitAccount } from '@reown/appkit/react'
import { estimateGas, getBalance, getPublicClient, readContract } from '@wagmi/core'
import { encodeFunctionData, toHex } from 'viem'
import { useReadContract } from 'wagmi'

import { ClaimableTokenAbi } from './ClaimableTokenAbi'
import { config } from './config'
import { wagmiAdapter } from './wagmi.config'

export default function useClaimableToken() {
  const { address } = useAppKitAccount({ namespace: 'eip155' })

  const getEventData = () => {
    return readContract(wagmiAdapter.wagmiConfig, {
      abi: ClaimableTokenAbi,
      address: config.CONTRACT_ADDRESS,
      functionName: 'getEventData',
    })
  }

  const getSelector = () => {
    return readContract(wagmiAdapter.wagmiConfig, {
      abi: ClaimableTokenAbi,
      address: config.CONTRACT_ADDRESS,
      functionName: 'SELECTOR',
    })
  }

  const getEventId = (address: `0x${string}`) => {
    return readContract(wagmiAdapter.wagmiConfig, {
      abi: ClaimableTokenAbi,
      address: config.CONTRACT_ADDRESS,
      functionName: 'getEventId',
      args: [address],
    })
  }

  const { data: isClaimed, refetch: refetchIsClaimed } = useReadContract({
    abi: ClaimableTokenAbi,
    address: config.CONTRACT_ADDRESS,
    functionName: 'isClaimedByAddress',
    args: [address as `0x${string}`],
    query: {
      initialData: false,
    },
  })

  const estimateClaim = async (proof: ZkProof): Promise<boolean> => {
    try {
      if (!address) throw new Error('No address')
      if (!proof?.proof?.piA?.length || !proof?.proof?.piB?.length || !proof?.proof?.piC?.length) {
        throw new Error('Invalid proof structure')
      }

      const nullifier = BigInt(proof.pubSignals[0])
      const idCreationTimestamp = BigInt(proof.pubSignals[15])
      const tokenId = BigInt(proof.pubSignals[11])
      const root = BigInt(proof.pubSignals[13])

      const a = [BigInt(proof.proof.piA[0]), BigInt(proof.proof.piA[1])] as const
      const b = [
        [BigInt(proof.proof.piB[0][1]), BigInt(proof.proof.piB[0][0])],
        [BigInt(proof.proof.piB[1][1]), BigInt(proof.proof.piB[1][0])],
      ] as const
      const c = [BigInt(proof.proof.piC[0]), BigInt(proof.proof.piC[1])] as const

      const encodedData = encodeFunctionData({
        abi: ClaimableTokenAbi,
        functionName: 'claim',
        args: [
          toHex(tokenId, { size: 32 }),
          root,
          address.toLowerCase().trim() as `0x${string}`,
          {
            nullifier,
            identityCreationTimestamp: idCreationTimestamp,
          },
          { a, b, c },
        ],
      })

      const [gasLimit, gasFees, balance] = await Promise.all([
        estimateGas(wagmiAdapter.wagmiConfig, {
          to: config.CONTRACT_ADDRESS,
          data: encodedData,
          account: address as `0x${string}`,
        }),
        getPublicClient(wagmiAdapter.wagmiConfig)?.estimateFeesPerGas(),
        getBalance(wagmiAdapter.wagmiConfig, { address: address as `0x${string}` }),
      ])

      const estimatedCost = gasLimit * (gasFees?.maxFeePerGas || 0n)

      console.log('Estimated Gas:', gasLimit.toString())
      console.log('Estimated Fee (wei):', estimatedCost.toString())
      console.log('User Balance (wei):', balance.value.toString())

      if (balance.value < estimatedCost) {
        console.warn('Insufficient funds to cover gas')
        return false
      }

      return true
    } catch (error) {
      console.error('Gas estimation failed:', error)
      return false
    }
  }

  return {
    getEventData,
    getSelector,
    getEventId,

    isClaimed,
    refetchIsClaimed,
    estimateClaim,
  }
}
