import assert from 'node:assert'
import type { Mock } from 'node:test'
import { describe, it, beforeEach, mock } from 'node:test'
import type { TNotificationHandle } from '../src/services/bot/types'
import type { TNotification } from '../src/services/bot/types/TNotifications'
import { ENotificationType } from '../src/services/bot/constants'
import { getNotifications } from '../src/services/bot/utils'

type THandleCallbackKeys = keyof Omit<TNotificationHandle, 'rates' | 'secondForPossibleRollback'>

describe('getNotifications', () => {
  let handle: Record<THandleCallbackKeys, Mock<TNotificationHandle[THandleCallbackKeys]>> & {
    rates: TNotificationHandle['rates']
    secondForPossibleRollback: TNotificationHandle['secondForPossibleRollback']
  }
  const notifications: TNotification[] = []

  beforeEach(() => {
    handle = {
      rates: {
        top: 2,
        bottom: 0.5,
      },
      secondForPossibleRollback: 60,
      getPrice: mock.fn<TNotificationHandle['getPrice']>(),
      getUsersInDb: mock.fn<TNotificationHandle['getUsersInDb']>(),
      getWalletsInDb: mock.fn<TNotificationHandle['getWalletsInDb']>(),
      getJettonsFromDB: mock.fn<TNotificationHandle['getJettonsFromDB']>(),
      getJettonsFromChain: mock.fn<TNotificationHandle['getJettonsFromChain']>(),
      getLastAddressJettonPurchaseFromDB:
        mock.fn<TNotificationHandle['getLastAddressJettonPurchaseFromDB']>(),
      getLastAddressNotificationFromDB:
        mock.fn<TNotificationHandle['getLastAddressNotificationFromDB']>(),
      getFirstAddressJettonPurchaseFromDB:
        mock.fn<TNotificationHandle['getFirstAddressJettonPurchaseFromDB']>(),
    }
    notifications.length = 0
  })

  it('should notify when user buys a jetton', async () => {
    handle.getUsersInDb.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          username: 'testUser',
          timestamp: 1,
        },
      ]),
    )
    handle.getWalletsInDb.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          address: 'wallet1',
          userId: 1,
        },
      ]),
    )
    handle.getJettonsFromDB.mock.mockImplementation(() => Promise.resolve([]))
    handle.getJettonsFromChain.mock.mockImplementation(() =>
      Promise.resolve([
        {
          address: 'jetton1',
          symbol: 'JET',
          decimals: 9,
        },
      ]),
    )
    handle.getPrice.mock.mockImplementation(() => Promise.resolve(100))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        timestamp: Date.now() - 10000,
        price: 100,
        jettonId: 1,
      }),
    )
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() =>
      Promise.resolve(undefined),
    )

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.strictEqual(notifications.length, 1)
    assert.deepStrictEqual(notifications[0], {
      userId: 1,
      walletId: 1,
      jetton: 'jetton1',
      symbol: 'JET',
      price: 100,
      action: ENotificationType.NEW_JETTON,
      decimals: 9,
      // @ts-expect-error timestamp not everywhere
      timestamp: notifications[0].timestamp,
    })
  })

  it('should not notify when price increased by 1.5', async () => {
    handle.getUsersInDb.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          username: 'testUser',
          timestamp: 1,
        },
      ]),
    )
    handle.getWalletsInDb.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          address: 'wallet1',
          userId: 1,
        },
      ]),
    )
    handle.getJettonsFromDB.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          token: 'jetton1',
          ticker: 'JET',
          walletId: 1,
        },
      ]),
    )
    handle.getJettonsFromChain.mock.mockImplementation(() =>
      Promise.resolve([
        {
          address: 'jetton1',
          symbol: 'JET',
          decimals: 9,
        },
      ]),
    )
    handle.getPrice.mock.mockImplementation(() => Promise.resolve(150))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        timestamp: Date.now() - 10000,
        price: 100,
        jettonId: 1,
      }),
    )
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() =>
      Promise.resolve(undefined),
    )

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.strictEqual(notifications.length, 0)
  })

  it('should notify when price increased by 2', async () => {
    handle.getUsersInDb.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          username: 'testUser',
          timestamp: 1,
        },
      ]),
    )
    handle.getWalletsInDb.mock.mockImplementation(() =>
      Promise.resolve([{ id: 1, userId: 1, address: 'wallet1' }]),
    )
    handle.getJettonsFromDB.mock.mockImplementation(() =>
      Promise.resolve([{ id: 1, token: 'jetton1', ticker: 'JET', walletId: 1 }]),
    )
    handle.getJettonsFromChain.mock.mockImplementation(() =>
      Promise.resolve([{ address: 'jetton1', symbol: 'JET', decimals: 9 }]),
    )
    handle.getPrice.mock.mockImplementation(() => Promise.resolve(200))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() - 10000,
        price: 100,
      }),
    )
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() =>
      Promise.resolve(undefined),
    )

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.strictEqual(notifications.length, 1)
    assert.deepStrictEqual(notifications[0], {
      userId: 1,
      walletId: 1,
      jettonId: 1,
      symbol: 'JET',
      price: 200,
      decimals: 9,
      action: ENotificationType.UP,
      // @ts-expect-error timestamp not everywhere
      timestamp: notifications[0].timestamp,
    })
  })

  it('should not notify when price increased by 1.5, sold, then price increased by 2', async () => {
    handle.getUsersInDb.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          username: 'testUser',
          timestamp: 1,
        },
      ]),
    )
    handle.getWalletsInDb.mock.mockImplementation(() =>
      Promise.resolve([{ id: 1, userId: 1, address: 'wallet1' }]),
    )
    handle.getJettonsFromDB.mock.mockImplementation(() =>
      Promise.resolve([{ id: 1, token: 'jetton1', ticker: 'JET', walletId: 1 }]),
    )
    handle.getJettonsFromChain.mock.mockImplementation(() => Promise.resolve([]))
    handle.getPrice.mock.mockImplementation(() => Promise.resolve(150))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() - 10000,
        price: 100,
      }),
    )
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() - 10000,
        price: 100,
      }),
    )
    handle.getFirstAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() / 1000 - 20000,
        price: 100,
      }),
    )

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.strictEqual(notifications.length, 1)
    assert.deepStrictEqual(notifications[0], {
      userId: 1,
      walletId: 1,
      jettonId: 1,
      symbol: 'JET',
      action: ENotificationType.NOT_HOLD_JETTON_ANYMORE,
    })
  })

  it('should notify when price increased by 2, sold, then price increased by 2 again without notification', async () => {
    handle.getUsersInDb.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          username: 'testUser',
          timestamp: 1,
        },
      ]),
    )
    handle.getWalletsInDb.mock.mockImplementation(() =>
      Promise.resolve([{ id: 1, userId: 1, address: 'wallet1' }]),
    )
    handle.getJettonsFromDB.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          token: 'jetton1',
          walletId: 1,
          ticker: 'JET',
        },
      ]),
    )
    handle.getJettonsFromChain.mock.mockImplementation(() =>
      Promise.resolve([
        {
          address: 'jetton1',
          symbol: 'JET',
          decimals: 9,
        },
      ]),
    )
    handle.getPrice.mock.mockImplementation(() => Promise.resolve(200))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() - 20000,
        price: 100,
      }),
    )
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() - 20000,
        price: 100,
      }),
    )
    handle.getFirstAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() / 1000 - 30000,
        price: 100,
      }),
    )

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getJettonsFromChain.mock.mockImplementation(() => Promise.resolve([]))
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getJettonsFromDB.mock.mockImplementation(() => Promise.resolve([]))
    handle.getJettonsFromChain.mock.mockImplementation(() =>
      Promise.resolve([
        {
          address: 'jetton1',
          symbol: 'JET',
          decimals: 9,
        },
      ]),
    )
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getPrice.mock.mockImplementation(() => Promise.resolve(600))
    handle.getJettonsFromDB.mock.mockImplementation(() => Promise.resolve([]))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve(undefined),
    )
    handle.getJettonsFromChain.mock.mockImplementation(() => Promise.resolve([]))
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.deepStrictEqual(
      [notifications[0].action, notifications[1].action, notifications[2].action],
      [
        ENotificationType.UP,
        ENotificationType.NOT_HOLD_JETTON_ANYMORE,
        ENotificationType.NEW_JETTON,
      ],
    )
  })

  it('buy, price increase by 2, sell, buy, price increase by 2 again', async () => {
    handle.getUsersInDb.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          username: 'testUser',
          timestamp: 1,
        },
      ]),
    )
    handle.getWalletsInDb.mock.mockImplementation(() =>
      Promise.resolve([{ id: 1, userId: 1, address: 'wallet1' }]),
    )
    handle.getJettonsFromDB.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          token: 'jetton1',
          walletId: 1,
          ticker: 'JET',
        },
      ]),
    )
    handle.getJettonsFromChain.mock.mockImplementation(() =>
      Promise.resolve([
        {
          address: 'jetton1',
          symbol: 'JET',
          decimals: 9,
        },
      ]),
    )
    handle.getPrice.mock.mockImplementation(() => Promise.resolve(200))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() / 1000 - 20000,
        price: 100,
      }),
    )
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() / 1000 - 10000,
        price: 100,
      }),
    )
    handle.getFirstAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() / 1000 - 30000,
        price: 100,
      }),
    )

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getJettonsFromChain.mock.mockImplementation(() => Promise.resolve([]))
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getJettonsFromDB.mock.mockImplementation(() => Promise.resolve([]))
    handle.getJettonsFromChain.mock.mockImplementation(() =>
      Promise.resolve([
        {
          address: 'jetton1',
          symbol: 'JET',
          decimals: 9,
        },
      ]),
    )
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getPrice.mock.mockImplementation(() => Promise.resolve(600))
    handle.getJettonsFromDB.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          token: 'jetton1',
          walletId: 1,
          ticker: 'JET',
        },
      ]),
    )
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.deepStrictEqual(
      [
        notifications[0].action,
        notifications[1].action,
        notifications[2].action,
        notifications[3].action,
      ],
      [
        ENotificationType.UP,
        ENotificationType.NOT_HOLD_JETTON_ANYMORE,
        ENotificationType.NEW_JETTON,
        ENotificationType.UP,
      ],
    )
  })

  it('should handle rollbacks', async () => {
    handle.getUsersInDb.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          username: 'testUser',
          timestamp: 1,
        },
      ]),
    )
    handle.getWalletsInDb.mock.mockImplementation(() =>
      Promise.resolve([{ id: 1, userId: 1, address: 'wallet1' }]),
    )
    handle.getJettonsFromDB.mock.mockImplementation(() => Promise.resolve([]))
    handle.getJettonsFromChain.mock.mockImplementation(() =>
      Promise.resolve([
        {
          address: 'jetton1',
          symbol: 'JET',
          decimals: 9,
        },
      ]),
    )
    handle.getPrice.mock.mockImplementation(() => Promise.resolve(100))
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    assert.equal(notifications.length, 1)
    assert.equal(notifications[0].action, ENotificationType.NEW_JETTON)
    notifications.length = 0

    handle.getJettonsFromDB.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: 1,
          token: 'jetton1',
          walletId: 1,
          ticker: 'JET',
        },
      ]),
    )
    handle.getJettonsFromChain.mock.mockImplementation(() => Promise.resolve([]))
    handle.getFirstAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() / 1000 - handle.secondForPossibleRollback,
        price: 100,
      }),
    )
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    assert.equal(notifications.length, 0)

    handle.getFirstAddressJettonPurchaseFromDB.mock.mockImplementation(() =>
      Promise.resolve({
        jettonId: 1,
        timestamp: Date.now() / 1000 - 10000,
        price: 100,
      }),
    )
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    assert.equal(notifications.length, 1)
    assert.equal(notifications[0].action, ENotificationType.NOT_HOLD_JETTON_ANYMORE)
  })
})
