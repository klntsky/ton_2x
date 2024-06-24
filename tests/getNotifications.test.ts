import assert from 'node:assert'
import { ENotificationType } from '../src/constants'
import { getNotifications } from '../src/utils'
import type { TNotificationHandle } from '../src/utils/types/TNotificationHandle'
import type { TNotification } from '../src/utils/types/TNotifications'
import type { Mock } from 'node:test'
import { describe, it, beforeEach, mock } from 'node:test'

describe('getNotifications', () => {
  let handle: Record<string, Mock<TNotificationHandle[keyof TNotificationHandle]>>
  const notifications: TNotification[] = []

  beforeEach(() => {
    handle = {
      getPrice: mock.fn<TNotificationHandle['getPrice']>(),
      getUsersInDb: mock.fn<TNotificationHandle['getUsersInDb']>(),
      getWalletsInDb: mock.fn<TNotificationHandle['getWalletsInDb']>(),
      getJettonsFromDB: mock.fn<TNotificationHandle['getJettonsFromDB']>(),
      getJettonsFromChain: mock.fn<TNotificationHandle['getJettonsFromChain']>(),
      getLastAddressJettonPurchaseFromDB:
        mock.fn<TNotificationHandle['getLastAddressJettonPurchaseFromDB']>(),
      getLastAddressNotificationFromDB:
        mock.fn<TNotificationHandle['getLastAddressNotificationFromDB']>(),
      deleteUserJetton: mock.fn<TNotificationHandle['deleteUserJetton']>(),
    }
    notifications.length = 0
  })

  it('should notify when user buys a jetton', async () => {
    handle.getUsersInDb.mock.mockImplementation(() => [
      {
        id: 1,
        username: 'testUser',
        timestamp: 1,
      },
    ])
    handle.getWalletsInDb.mock.mockImplementation(() => [
      {
        address: 'wallet1',
        userId: 1,
      },
    ])
    handle.getJettonsFromDB.mock.mockImplementation(() => [])
    handle.getJettonsFromChain.mock.mockImplementation(() => [
      {
        address: 'jetton1',
        symbol: 'JET',
      },
    ])
    handle.getPrice.mock.mockImplementation(() => ({
      price: 100,
      timestamp: Date.now(),
      wallet: 'wallet1',
      jetton: 'jetton1',
    }))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() => ({
      timestamp: Date.now() - 10000,
      price: 100,
      wallet: 'wallet1',
      jetton: 'jetton1',
    }))
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() => undefined)

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.strictEqual(notifications.length, 1)
    assert.deepStrictEqual(notifications[0], {
      userId: 1,
      wallet: 'wallet1',
      jetton: 'jetton1',
      symbol: 'JET',
      price: 100,
      action: ENotificationType.NEW_JETTON,
      // @ts-expect-error timestamp not everywhere
      timestamp: notifications[0].timestamp,
    })
  })

  it('should not notify when price increased by 1.5', async () => {
    handle.getUsersInDb.mock.mockImplementation(() => [
      {
        id: 1,
        username: 'testUser',
        timestamp: 1,
      },
    ])
    handle.getWalletsInDb.mock.mockImplementation(() => [
      {
        address: 'wallet1',
        userId: 1,
      },
    ])
    handle.getJettonsFromDB.mock.mockImplementation(() => [
      {
        token: 'jetton1',
        ticker: 'JET',
        wallet: 'wallet1',
      },
    ])
    handle.getJettonsFromChain.mock.mockImplementation(() => [
      {
        address: 'jetton1',
        symbol: 'JET',
      },
    ])
    handle.getPrice.mock.mockImplementation(() => ({
      price: 150,
      timestamp: Date.now(),
      wallet: 'wallet1',
      jetton: 'jetton1',
    }))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() => ({
      timestamp: Date.now() - 10000,
      price: 100,
      wallet: 'wallet1',
      jetton: 'jetton1',
    }))
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() => undefined)

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.strictEqual(notifications.length, 0)
  })

  it('should notify when price increased by 2', async () => {
    handle.getUsersInDb.mock.mockImplementation(() => [
      {
        id: 1,
        username: 'testUser',
        timestamp: 1,
      },
    ])
    handle.getWalletsInDb.mock.mockImplementation(() => [{ address: 'wallet1' }])
    handle.getJettonsFromDB.mock.mockImplementation(() => [{ token: 'jetton1', ticker: 'JET' }])
    handle.getJettonsFromChain.mock.mockImplementation(() => [
      { address: 'jetton1', symbol: 'JET' },
    ])
    handle.getPrice.mock.mockImplementation(() => ({ price: 200, timestamp: Date.now() }))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() => ({
      timestamp: Date.now() - 10000,
      price: 100,
    }))
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() => undefined)

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.strictEqual(notifications.length, 1)
    assert.deepStrictEqual(notifications[0], {
      userId: 1,
      wallet: 'wallet1',
      jetton: 'jetton1',
      symbol: 'JET',
      price: 200,
      action: ENotificationType.UP,
      // @ts-expect-error timestamp not everywhere
      timestamp: notifications[0].timestamp,
    })
  })

  it('should not notify when price increased by 1.5, sold, then price increased by 2', async () => {
    handle.getUsersInDb.mock.mockImplementation(() => [
      {
        id: 1,
        username: 'testUser',
        timestamp: 1,
      },
    ])
    handle.getWalletsInDb.mock.mockImplementation(() => [{ address: 'wallet1' }])
    handle.getJettonsFromDB.mock.mockImplementation(() => [{ token: 'jetton1', ticker: 'JET' }])
    handle.getJettonsFromChain.mock.mockImplementation(() => [])
    handle.getPrice.mock.mockImplementation(() => ({ price: 150, timestamp: Date.now() }))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() => ({
      timestamp: Date.now() - 20000,
      price: 100,
    }))
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() => ({
      timestamp: Date.now() - 10000,
      price: 100,
    }))

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.strictEqual(notifications.length, 1)
    assert.deepStrictEqual(notifications[0], {
      userId: 1,
      wallet: 'wallet1',
      jetton: 'jetton1',
      symbol: 'JET',
      action: ENotificationType.NOT_HOLD_JETTON_ANYMORE,
    })
  })

  it('should notify when price increased by 2, sold, then price increased by 2 again without notification', async () => {
    handle.getUsersInDb.mock.mockImplementation(() => [
      {
        id: 1,
        username: 'testUser',
        timestamp: 1,
      },
    ])
    handle.getWalletsInDb.mock.mockImplementation(() => [{ address: 'wallet1' }])
    handle.getJettonsFromDB.mock.mockImplementation(() => [
      {
        token: 'jetton1',
        wallet: 'wallet1',
        ticker: 'JET',
      },
    ])
    handle.getJettonsFromChain.mock.mockImplementation(() => [
      {
        address: 'jetton1',
        symbol: 'JET',
      },
    ])
    handle.getPrice.mock.mockImplementation(() => ({ price: 200, timestamp: Date.now() }))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() => ({
      timestamp: Date.now() - 20000,
      price: 100,
    }))
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() => ({
      timestamp: Date.now() - 10000,
      price: 100,
    }))

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getJettonsFromChain.mock.mockImplementation(() => [])
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getJettonsFromDB.mock.mockImplementation(() => [])
    handle.getJettonsFromChain.mock.mockImplementation(() => [
      {
        address: 'jetton1',
        symbol: 'JET',
      },
    ])
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getPrice.mock.mockImplementation(() => ({ price: 600, timestamp: Date.now() }))
    handle.getJettonsFromDB.mock.mockImplementation(() => [])
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() => undefined)
    handle.getJettonsFromChain.mock.mockImplementation(() => [])
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.strictEqual(notifications.length, 3)
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
    handle.getUsersInDb.mock.mockImplementation(() => [
      {
        id: 1,
        username: 'testUser',
        timestamp: 1,
      },
    ])
    handle.getWalletsInDb.mock.mockImplementation(() => [{ address: 'wallet1' }])
    handle.getJettonsFromDB.mock.mockImplementation(() => [
      {
        token: 'jetton1',
        wallet: 'wallet1',
        ticker: 'JET',
      },
    ])
    handle.getJettonsFromChain.mock.mockImplementation(() => [
      {
        address: 'jetton1',
        symbol: 'JET',
      },
    ])
    handle.getPrice.mock.mockImplementation(() => ({ price: 200, timestamp: Date.now() }))
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() => ({
      timestamp: Date.now() - 20000,
      price: 100,
    }))
    handle.getLastAddressNotificationFromDB.mock.mockImplementation(() => ({
      timestamp: Date.now() - 10000,
      price: 100,
    }))

    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getJettonsFromChain.mock.mockImplementation(() => [])
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getJettonsFromDB.mock.mockImplementation(() => [])
    handle.getJettonsFromChain.mock.mockImplementation(() => [
      {
        address: 'jetton1',
        symbol: 'JET',
      },
    ])
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }
    handle.getPrice.mock.mockImplementation(() => ({ price: 600, timestamp: Date.now() }))
    handle.getJettonsFromDB.mock.mockImplementation(() => [
      {
        token: 'jetton1',
        wallet: 'wallet1',
        ticker: 'JET',
      },
    ])
    handle.getLastAddressJettonPurchaseFromDB.mock.mockImplementation(() => undefined)
    for await (const notification of getNotifications(handle as unknown as TNotificationHandle)) {
      notifications.push(notification)
    }

    assert.strictEqual(notifications.length, 4)
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
})
