import { JsonApiClient, NotFoundError } from '@distributedlab/jac'

import { RequestVerificationLinkOpts, VerificationStatus, ZkProof } from './types'

export class ZkPassport {
  #apiClient: JsonApiClient

  constructor(apiUrl?: string) {
    this.#apiClient = new JsonApiClient({
      baseUrl: apiUrl || 'https://api.app.rarime.com',
    })
  }

  async requestVerificationLink(id: string, opts?: RequestVerificationLinkOpts): Promise<string> {
    const { data } = await this.#apiClient.post<{
      id: string
      type: string
      callback_url: string
      get_proof_params: string
    }>('/integrations/verificator-svc/private/verification-link', {
      body: {
        data: {
          id,
          type: 'user',
          attributes: {
            age_lower_bound: opts?.ageLowerBound,
            uniqueness: opts?.uniqueness,
            nationality: opts?.nationality,
            nationality_check: opts?.nationalityCheck,
            event_id: opts?.eventId,
          },
        },
      },
    })

    const proofRequestUrl = new URL('rarime://external')
    proofRequestUrl.searchParams.append('type', 'proof-request')
    proofRequestUrl.searchParams.append('proof_params_url', data.get_proof_params)

    return proofRequestUrl.href
  }

  async getVerificationStatus(id: string): Promise<VerificationStatus> {
    const { data } = await this.#apiClient.get<{
      id: string
      type: string
      status: VerificationStatus
    }>(`/integrations/verificator-svc/private/verification-status/${id}`)

    return data.status
  }

  async getVerifiedProof(id: string): Promise<ZkProof | null> {
    try {
      const { data } = await this.#apiClient.get<{
        id: string
        type: string
        proof: {
          proof: {
            pi_a: string[]
            pi_b: string[][]
            pi_c: string[]
          }
          pub_signals: string[]
        }
      }>(`/integrations/verificator-svc/private/proof/${id}`)

      return {
        proof: {
          piA: data.proof.proof.pi_a,
          piB: data.proof.proof.pi_b,
          piC: data.proof.proof.pi_c,
        },
        pubSignals: data.proof.pub_signals,
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        return null
      }

      throw error
    }
  }
}
