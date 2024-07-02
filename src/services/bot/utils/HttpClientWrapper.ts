import type { FullRequestParams } from 'tonapi-sdk-js'
import { HttpClient } from 'tonapi-sdk-js'
import { delay } from '../../../utils'

export class HttpClientWrapper<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  private readonly debouncerDelay = 1000
  private readonly debouncerDelayBase = 1.5
  private debouncerDelayExponent = 0

  constructor() {
    super({
      // TODO: -> .env
      baseUrl: 'https://tonapi.io',
      baseApiParams: {
        headers: {
          Authorization: `Bearer ${process.env.TONAPI_TOKEN}`,
          'Content-type': 'application/json',
        },
      },
    })
  }

  public async request<T = unknown>(params: FullRequestParams): Promise<T> {
    try {
      const response = await super.request<T>(params)
      this.debouncerDelayExponent = 0
      return response
    } catch (error) {
      this.debouncerDelayExponent++
      const currentDelay =
        this.debouncerDelay * this.debouncerDelayBase ** this.debouncerDelayExponent
      console.info('debouncing, ', currentDelay, params.path)
      await delay(currentDelay)
      return this.request(params)
    }
  }
}
