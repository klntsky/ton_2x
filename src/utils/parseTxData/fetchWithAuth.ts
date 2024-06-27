import 'dotenv/config'
import { delay } from '..'

const debouncerDelay = 1000
const debouncerDelayBase = 1.5
let debouncerDelayExponent = 0

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchWithAuth = async (url: string): Promise<{ json: () => any }> => {
  const resp = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + process.env.TONAPI_TOKEN,
    },
  }).then(x => x.json())

  if (resp.error) {
    debouncerDelayExponent++
    const currentDelay = debouncerDelay * debouncerDelayBase ** debouncerDelayExponent
    await delay(currentDelay)
    console.info('debouncing, ', currentDelay, url)
    return fetchWithAuth(url)
  } else {
    debouncerDelayExponent = 0
  }
  return { json: () => resp }
}
