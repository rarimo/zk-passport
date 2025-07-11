import { ZkProof } from '@rarimo/zk-passport'
import { useAppKitAccount } from '@reown/appkit/react'
import { estimateGas, getBalance, getPublicClient, waitForTransactionReceipt } from '@wagmi/core'
import { Address, encodeAbiParameters, encodeFunctionData, parseAbiParameters, toHex } from 'viem'
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

import { CLAIMABLE_TOKEN_ABI } from './ClaimableTokenAbi'
import { config } from './config'
import { wagmiAdapter } from './wagmi.config'

export default function useClaimableToken() {
  const { address } = useAppKitAccount({ namespace: 'eip155' })

  const { data: isClaimed, refetch: refetchIsClaimed } = useReadContract({
    abi: CLAIMABLE_TOKEN_ABI,
    address: config.CONTRACT_ADDRESS,
    functionName: 'isClaimedByAddress',
    args: [address as Address],
    query: {
      initialData: false,
    },
  })

  const { writeContractAsync: claim, data: txHash, isPending: isClaimPending } = useWriteContract()

  const {
    isLoading: isClaiming,
    isSuccess: isClaimSuccess,
    isError: isClaimError,
    error: claimError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) },
  })

  const estimateClaim = async (proof: ZkProof): Promise<boolean> => {
    try {
      if (!address) throw new Error('No address')
      const { args } = buildClaimArguments(proof, address)

      const encodedData = encodeFunctionData({
        abi: CLAIMABLE_TOKEN_ABI,
        functionName: 'execute',
        args,
      })

      const [gasLimit, gasFees, balance] = await Promise.all([
        estimateGas(wagmiAdapter.wagmiConfig, {
          to: config.CONTRACT_ADDRESS,
          data: encodedData,
          account: address as Address,
        }),
        getPublicClient(wagmiAdapter.wagmiConfig)?.estimateFeesPerGas(),
        getBalance(wagmiAdapter.wagmiConfig, { address: address as Address }),
      ])

      const estimatedCost = gasLimit * (gasFees?.maxFeePerGas || 0n)

      if (balance.value < estimatedCost) {
        console.error('Insufficient funds to cover gas')
        return false
      }

      return true
    } catch (error) {
      console.error('Gas estimation failed:', error)
      return false
    }
  }

  const claimToken = async (proof: ZkProof) => {
    if (!address) throw new Error('No address')
    const { args } = buildClaimArguments(proof, address)

    const hash = await claim({
      abi: CLAIMABLE_TOKEN_ABI,
      address: config.CONTRACT_ADDRESS,
      functionName: 'execute',
      args,
    })

    const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
      hash,
    })

    return receipt
  }

  return {
    isClaimed,
    refetchIsClaimed,
    estimateClaim,
    claimToken,
    isClaiming: isClaiming || isClaimPending,
    isClaimSuccess,
    isClaimError,
    claimError,
  }
}

function buildClaimArguments(proof: ZkProof, address: string) {
  if (!proof.proof.piA.length || !proof.proof.piB.length || !proof.proof.piC.length) {
    throw new Error('Invalid proof structure')
  }

  const nullifier = BigInt(proof.pubSignals[0])
  const identityCreationTimestamp = BigInt(proof.pubSignals[15])
  const root = BigInt(proof.pubSignals[11])
  const currentDate = BigInt(proof.pubSignals[13])

  const a = [BigInt(proof.proof.piA[0]), BigInt(proof.proof.piA[1])] as const
  const b = [
    [BigInt(proof.proof.piB[0][1]), BigInt(proof.proof.piB[0][0])],
    [BigInt(proof.proof.piB[1][1]), BigInt(proof.proof.piB[1][0])],
  ] as const
  const c = [BigInt(proof.proof.piC[0]), BigInt(proof.proof.piC[1])] as const

  return {
    args: [
      toHex(root, { size: 32 }),
      currentDate,
      encodeAbiParameters(parseAbiParameters('address, (uint256, uint256)'), [
        address as Address,
        [nullifier, identityCreationTimestamp],
      ]),
      { a, b, c },
    ] as const,
  }
}
