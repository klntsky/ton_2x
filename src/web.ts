import express from 'express'
import { getDbConnection, getLogger, logError } from './utils'
import { usernames } from './db/schema'
import { count, eq } from 'drizzle-orm'
import { getWalletDataMock } from './constants'

const app = express()

app.use(express.json())
app.set('trust proxy', true)

const logger = getLogger('web')

app.use(async (err, req, res, next) => {
    await logError(logger, err)
    return res.status(500).send()
})

app.get('/getWalletData', async (req, res) => {
    const { address } = req.query
    if (typeof address !== 'string') {
        return res.status(422).send()
    }
    const db = await getDbConnection()
    const [addressInDb] = await db.select({ count: count() }).from(usernames).where(eq(usernames.address, address))
    if (addressInDb.count === 0) {
        return res.status(204).send()
    }
    return res.send(getWalletDataMock)
})

const start = async () => {
    app.listen(3086, '127.0.0.1')
    logger.info('Server started')
}
  
start()
