import express from 'express'
import { getDbConnection, getJettonsByAddress, getLogger, logError } from './utils'
import { usernames } from './db/schema'
import { count, eq } from 'drizzle-orm'

const app = express()

app.use(express.json())
app.set('trust proxy', true)

const logger = getLogger('web')

app.use(async (err, req, res, next) => {
    await logError(logger, err)
    return res.status(500).send()
})

app.get('/getJettonsByAddress', async (req, res) => {
    const { address } = req.query
    if (typeof address !== 'string') {
        return res.status(422).send()
    }
    // const db = await getDbConnection()
    // const [addressInDb] = await db.select({ count: count() }).from(usernames).where(eq(usernames.address, address))
    // if (addressInDb.count === 0) {
    //     return res.status(204).send()
    // }
    const jettons = await getJettonsByAddress(address)
    const points = []
    for (const jetton of jettons) {
        const response = await fetch(`https://tonapi.io/v2/rates/chart?token=${jetton.address}&currency=ton`)
        const json: {
            points: [timestamp: number, price: number][]
        } = await response.json()
        points.push({
            symbol: jetton.symbol,
            image: jetton.image,
            points: json.points,
        })
    }
    return res.send(points)
})

const start = async () => {
    app.listen(Number(process.env.EXPRESS_PORT), '127.0.0.1')
    logger.info('Server started')
}
  
start()
