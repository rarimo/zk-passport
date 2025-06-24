import { JsonApiClient, NotFoundError } from '@distributedlab/jac'

import {
  RequestAdvancedVerificationLinkOpts,
  RequestVerificationLinkOpts,
  VerificationLinkResponse,
  VerificationStatus,
  ZkProof,
} from './types'

export class ZkPassport {
  #apiClient: JsonApiClient

  constructor(
    /**
     * Verificator service API URL:
     * https://github.com/rarimo/verificator-svc
     * @default 'https://api.app.rarime.com'
     */
    apiUrl?: string,
  ) {
    this.#apiClient = new JsonApiClient({
      baseUrl: apiUrl || 'https://api.app.rarime.com',
    })
  }

  /**
   * Request a verification link for a user.
   * @see https://rarimo.github.io/verificator-svc/#tag/User-verification/operation/getVerificationLink
   */
  async requestVerificationLink(id: string, opts?: RequestVerificationLinkOpts): Promise<string>

  /**
   * Request an advanced verification link for a user.
   * @see https://rarimo.github.io/verificator-svc/#tag/Advanced-verification/operation/getVerificationLinkV2
   */
  async requestVerificationLink(
    id: string,
    opts: RequestAdvancedVerificationLinkOpts,
  ): Promise<string>

  async requestVerificationLink(
    id: string,
    opts?: RequestVerificationLinkOpts | RequestAdvancedVerificationLinkOpts,
  ): Promise<string> {
    // OVERLOAD I: basic user verification
    if (!opts || !('selector' in (opts as RequestAdvancedVerificationLinkOpts))) {
      const { data } = await this.#apiClient.post<VerificationLinkResponse>(
        '/integrations/verificator-svc/private/verification-link',
        {
          body: {
            data: {
              id,
              type: 'user',
              attributes: {
                age_lower_bound: (opts as RequestVerificationLinkOpts)?.ageLowerBound,
                uniqueness: (opts as RequestVerificationLinkOpts)?.uniqueness,
                nationality: (opts as RequestVerificationLinkOpts)?.nationality,
                nationality_check: (opts as RequestVerificationLinkOpts)?.nationalityCheck,
                event_id: (opts as RequestVerificationLinkOpts)?.eventId,
              },
            },
          },
        },
      )

      return this._buildProofRequestUrl(data.get_proof_params)
    }

    // OVERLOAD II: advanced verification
    const { data } = await this.#apiClient.post<VerificationLinkResponse>(
      '/integrations/verificator-svc/v2/private/verification-link',
      {
        body: {
          data: {
            id,
            type: 'advanced_verification',
            attributes: {
              event_id: String((opts as RequestAdvancedVerificationLinkOpts)?.eventId),
              selector: (opts as RequestAdvancedVerificationLinkOpts)?.selector,
              citizenship_mask: (opts as RequestAdvancedVerificationLinkOpts)?.citizenshipMask,
              sex: (opts as RequestAdvancedVerificationLinkOpts)?.sex,
              identity_counter_lower_bound: (opts as RequestAdvancedVerificationLinkOpts)
                ?.identityCounterLowerBound,
              identity_counter_upper_bound: (opts as RequestAdvancedVerificationLinkOpts)
                ?.identityCounterUpperBound,
              birth_date_lower_bound: (opts as RequestAdvancedVerificationLinkOpts)
                ?.birthDateLowerBound,
              birth_date_upper_bound: (opts as RequestAdvancedVerificationLinkOpts)
                ?.birthDateUpperBound,
              event_data: (opts as RequestAdvancedVerificationLinkOpts)?.eventData,
              expiration_date_lower_bound: (opts as RequestAdvancedVerificationLinkOpts)
                ?.expirationDateLowerBound,
              expiration_date_upper_bound: (opts as RequestAdvancedVerificationLinkOpts)
                ?.expirationDateUpperBound,
            },
          },
        },
      },
    )

    return this._buildProofRequestUrl(data.get_proof_params)
  }

  /**
   * Builds the proof request URL for RariMe app.
   */
  private _buildProofRequestUrl(proofParamsUrl: string): string {
    const proofRequestUrl = new URL('https://app.rarime.com/external')
    proofRequestUrl.searchParams.append('type', 'proof-request')
    proofRequestUrl.searchParams.append('proof_params_url', proofParamsUrl)
    return proofRequestUrl.href
  }

  /**
   * Get the verification status of a user:
   * https://rarimo.github.io/verificator-svc/#tag/User-verification/operation/getUserStatus
   */
  async getVerificationStatus(id: string): Promise<VerificationStatus> {
    const { data } = await this.#apiClient.get<{
      id: string
      type: string
      status: VerificationStatus
    }>(`/integrations/verificator-svc/private/verification-status/${id}`)

    return data.status
  }

  /**
   * Get the verified proof for a user:
   * https://rarimo.github.io/verificator-svc/#tag/User-verification/operation/getProof
   */
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
