import { JsonApiClient, NotFoundError } from '@distributedlab/jac'

import {
  CustomProofParams,
  RequestVerificationLinkOpts,
  VerificationLinkResponse,
  VerificationStatus,
  ZkProof,
} from './types'

export class ZkPassport {
  #apiClient: JsonApiClient

  constructor(
    /**
     * @see[Verificator service API URL](https://github.com/rarimo/verificator-svc)
     * @default 'https://api.app.rarime.com'
     */
    apiUrl?: string,
  ) {
    this.#apiClient = new JsonApiClient({
      baseUrl: apiUrl || 'https://api.app.rarime.com',
    })
  }

  /**
   * @see[Request a verification link for a user.](https://rarimo.github.io/verificator-svc/#tag/User-verification/operation/getVerificationLink)
   */
  async requestVerificationLink(id: string, opts?: RequestVerificationLinkOpts): Promise<string>

  /**
   * @see[Request an advanced verification link for a user.](https://rarimo.github.io/verificator-svc/#tag/Advanced-verification/operation/getVerificationLinkV2)
   */
  async requestVerificationLink(id: string, opts: CustomProofParams): Promise<string>

  async requestVerificationLink(
    id: string,
    opts?: RequestVerificationLinkOpts | CustomProofParams,
  ): Promise<string> {
    const proofParamsUrl =
      opts && 'selector' in opts
        ? await this._getCustomProofParamsUrl(id, opts)
        : await this._getVerificationLinkProofParamsUrl(id, opts)

    const proofRequestUrl = new URL('https://app.rarime.com/external')
    proofRequestUrl.searchParams.append('type', 'proof-request')
    proofRequestUrl.searchParams.append('proof_params_url', proofParamsUrl)
    return proofRequestUrl.href
  }

  private async _getVerificationLinkProofParamsUrl(
    id: string,
    opts?: RequestVerificationLinkOpts,
  ): Promise<string> {
    const { data } = await this.#apiClient.post<VerificationLinkResponse>(
      '/integrations/verificator-svc/private/verification-link',
      {
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
      },
    )

    return data.get_proof_params
  }

  private async _getCustomProofParamsUrl(id: string, opts: CustomProofParams): Promise<string> {
    const safeNum = (v?: string) => (v ? Number(v) : undefined)

    const { data } = await this.#apiClient.post<VerificationLinkResponse>(
      '/integrations/verificator-svc/v2/private/verification-link',
      {
        body: {
          data: {
            id,
            type: 'advanced_verification',
            attributes: {
              timestamp_lower_bound: safeNum(opts.timestampLowerBound),
              timestamp_upper_bound: safeNum(opts.timestampUpperBound),
              event_id: opts.eventId,
              selector: opts.selector,
              citizenship_mask: opts.citizenshipMask,
              sex: opts.sex,
              identity_counter_lower_bound: safeNum(opts.identityCounterLowerBound),
              identity_counter_upper_bound: safeNum(opts.identityCounterUpperBound),
              birth_date_lower_bound: opts.birthDateLowerBound,
              birth_date_upper_bound: opts.birthDateUpperBound,
              event_data: opts.eventData,
              expiration_date_lower_bound: opts.expirationDateLowerBound,
              expiration_date_upper_bound: opts.expirationDateUpperBound,
            },
          },
        },
      },
    )

    return data.get_proof_params
  }

  /**
   * @see[Get the verification status of a user:](https://rarimo.github.io/verificator-svc/#tag/User-verification/operation/getUserStatus)
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
   *
   * @see:[Get the verified proof for a user:](https://rarimo.github.io/verificator-svc/#tag/User-verification/operation/getProof)
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
