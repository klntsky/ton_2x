import { Api } from 'tonapi-sdk-js'
import { HttpClientWrapper } from '../utils/HttpClientWrapper'

const httpClient = new HttpClientWrapper()

export const tonApiClient = new Api(httpClient)
