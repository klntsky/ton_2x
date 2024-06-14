import express from 'express'
import { getDbConnection, getLogger, logError } from './utils'
import { api } from './utils/parseTxData'
import { apiMock } from './constants'
import { TRequestHandler } from './types'
import { insertUserAdress } from './db/queries'

const app = express()

app.use(express.json())
app.set('trust proxy', true)

const logger = getLogger('web')

// @ts-expect-error
app.use(async (err, req, res, next) => {
    await logError(logger, err)
    return res.status(500).send()
})

const onGetWalletData: TRequestHandler<unknown, unknown, {
    id: string
    address?: string
}> = async (req, res) => {
    const { id, address } = req.query
    console.log({ address })
    const db = await getDbConnection()
    if (address) {
        await insertUserAdress(db, {
            userId: Number(id),
            address,
        })
    }
    const result = address && typeof address === 'string'
        ? await api(address)
        : apiMock
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
    return res.send()
}

app.get('/getWalletData', onGetWalletData)

app.post('/postUserWallet', onPostUserWallet)

const start = async () => {
    app.listen(Number(process.env.EXPRESS_PORT), '127.0.0.1')
    logger.info('Server started')
}
  
start()
