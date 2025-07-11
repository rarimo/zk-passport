export const PUB_SIGNALS_ABI = [
  {
    inputs: [],
    name: 'getRegistrationSMT',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'registrationRoot_', type: 'bytes32' },
      { internalType: 'uint256', name: 'currentDate_', type: 'uint256' },
      { internalType: 'bytes', name: 'userPayload_', type: 'bytes' },
    ],
    name: 'getPublicSignals',
    outputs: [{ internalType: 'bytes32[]', name: 'publicSignals', type: 'bytes32[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const REGISTRATION_SMT_ABI = [
  {
    inputs: [],
    name: 'getRoot',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
