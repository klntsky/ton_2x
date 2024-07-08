import process from 'process'
import 'dotenv/config'
import type { ErrorRequestHandler } from 'express'
import express from 'express'
import type { ParamsDictionary, Query } from 'express-serve-static-core'
import { getLogger, logError } from '../../utils'
import { onGetWalletData, onPostUserWallet } from './handlers'

const app = express()

app.use(express.json())
app.set('trust proxy', true)

const logger = getLogger('web')

const onError: ErrorRequestHandler<
ParamsDictionary,
unknown,
unknown,
Query,
Record<string, unknown>
> = async (err, _req, res, _next) => {
  await logError(logger, err)
  return res.status(500).send()
}

app.use(onError)

app.get('/getWalletData', onGetWalletData)

app.post('/postUserWallet', onPostUserWallet)

const start = async () => {
  app.listen(Number(process.env.EXPRESS_PORT), '127.0.0.1')
  logger.info('Server started')
}

start()
