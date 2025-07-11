import {
  CustomProofParams,
  CustomProofParamsBuilder,
  encodePassportDate,
  PassportCitizenshipCode,
  Sex,
} from '@rarimo/zk-passport'
import {
  Chain,
  createPublicClient,
  encodeAbiParameters,
  Hex,
  hexToBigInt,
  hexToString,
  http,
  parseAbiParameters,
  size,
  toHex,
  trim,
} from 'viem'

import { PUB_SIGNALS_ABI, REGISTRATION_SMT_ABI } from './abi'
import { OnChainVerificationOptions } from './types'

const RARIMO_L2_CHAIN: Chain = {
  id: 7368,
  name: 'Rarimo L2',
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
  blockExplorers: {
    default: {
      name: 'Rarimo Scan',
      url: 'https://scan.rarimo.com',
    },
  },
}

export async function buildOnChainProofParams({
  contractAddress,
  receiverAddress,
  chain,
}: OnChainVerificationOptions): Promise<CustomProofParams> {
  const client = createPublicClient({
    chain: chain ?? RARIMO_L2_CHAIN,
    transport: http(),
  })

  const registrationSmtAddress = await client.readContract({
    address: contractAddress,
    abi: PUB_SIGNALS_ABI,
    functionName: 'getRegistrationSMT',
  })

  const root = await client.readContract({
    address: registrationSmtAddress,
    abi: REGISTRATION_SMT_ABI,
    functionName: 'getRoot',
  })

  const { result } = await client.simulateContract({
    address: contractAddress,
    abi: PUB_SIGNALS_ABI,
    functionName: 'getPublicSignals',
    args: [
      root,
      hexToBigInt(toHex(encodePassportDate(new Date()))),
      encodeAbiParameters(parseAbiParameters('address, (uint256, uint256)'), [
        receiverAddress,
        [0n, 0n],
      ]),
    ] as const,
  })

  const isEmptyHex = (hex: Hex) => hex === toHex('', { size: size(hex) })

  const builder = new CustomProofParamsBuilder()
    .withEventId(result[9])
    .withEventData(result[10])
    .withSelector(result[12])
    .withTimestampBounds({
      lower: hexToBigInt(result[14]).toString(),
      upper: hexToBigInt(result[15]).toString(),
    })
    .withIdentityCounterBounds({
      lower: hexToBigInt(result[16]).toString(),
      upper: hexToBigInt(result[17]).toString(),
    })
    .withBirthDateBounds({
      lower: hexToString(trim(result[18])),
      upper: hexToString(trim(result[19])),
    })
    .withExpirationDateBounds({
      lower: hexToString(trim(result[20])),
      upper: hexToString(trim(result[21])),
    })

  if (!isEmptyHex(result[6])) {
    builder.withCitizenshipMask(hexToString(trim(result[6])) as PassportCitizenshipCode)
  }

  if (!isEmptyHex(result[7])) {
    builder.withSex(hexToString(trim(result[7])) as Sex)
  }

  return builder.build()
}
