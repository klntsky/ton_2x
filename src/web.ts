import type { ErrorRequestHandler } from 'express'
import express from 'express'
import type { ParamsDictionary, Query } from 'express-serve-static-core'
import { getDbConnection, getLogger, logError } from './utils'
import { api } from './utils/parseTxData'
import type { TRequestHandler } from './types'
import { insertUserAdress } from './db/queries'

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

const onGetWalletData: TRequestHandler<
unknown,
unknown,
{
  id: string
  address: string
}
> = async (req, res) => {
  const { id, address } = req.query
  console.log({ address })
  const db = await getDbConnection()
  await insertUserAdress(db, {
    userId: Number(id),
    address,
  })
  await db.close()
  const result = await api(address)
  return res.send(result)
}

const onPostUserWallet: TRequestHandler<{
  id: number
  address: string
}> = async (req, res) => {
  const { id, address } = req.body
  const db = await getDbConnection()
  await insertUserAdress(db, {
    userId: id,
    address,
  })
  await db.close()
  return res.send()
}

app.use(onError)

app.get('/getWalletData', onGetWalletData)

app.post('/postUserWallet', onPostUserWallet)

const start = async () => {
  app.listen(Number(process.env.EXPRESS_PORT), '127.0.0.1')
  logger.info('Server started')
}

start()
