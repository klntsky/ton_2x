import { ENotificationType } from '../src/constants'
import { getNotifications } from '../src/utils'
import type { TNotificationHandle } from '../src/utils/types/TNotificationHandle'
import type {
  TJettonRateNotification,
  TNewJettonNotification,
  TNotHoldedJettonNotification,
} from '../src/utils/types/TNotifications'

describe('getNotifications', () => {
  let handle: TNotificationHandle
  let notifications: (
    | TJettonRateNotification
    | TNewJettonNotification
    | TNotHoldedJettonNotification
  )[]

  beforeEach(() => {
    handle = {
      getUsersInDb: jest.fn(),
      getPrice: jest.fn(),
      getWalletsInDb: jest.fn(),
      getJettonsFromDB: jest.fn(),
      getJettonsFromChain: jest.fn(),
      getLastAddressJettonPurchaseFromDB: jest.fn(),
      getLastAddressNotificationFromDB: jest.fn(),
      deleteUserJetton: jest.fn(),
    }
    notifications.length = 0
  })

  it('should notify when user buys a jetton', async () => {
    ;(handle.getUsersInDb as jest.Mock)
      .mockResolvedValue([{ id: '1' }])(handle.getWalletsInDb as jest.Mock)
      .mockResolvedValue([{ address: 'wallet1' }])(handle.getJettonsFromDB as jest.Mock)
      .mockResolvedValue([{ token: 'jetton1', ticker: 'JET' }])(
        handle.getJettonsFromChain as jest.Mock,
      )
      .mockResolvedValue([{ address: 'jetton1', symbol: 'JET' }])(handle.getPrice as jest.Mock)
      .mockResolvedValue({ price: 100, timestamp: Date.now() })(
        handle.getLastAddressJettonPurchaseFromDB as jest.Mock,
      )
      .mockResolvedValue({ timestamp: Date.now() - 10000, price: 100 })(
        handle.getLastAddressNotificationFromDB as jest.Mock,
      )
      .mockResolvedValue(undefined)

    for await (const notification of getNotifications(handle)) {
      notifications.push(notification)
    }

    expect(notifications).toHaveLength(1)
    expect(notifications[0]).toMatchObject({
      userId: 1,
      wallet: 'wallet1',
      jetton: 'jetton1',
      symbol: 'JET',
      price: 100,
      action: ENotificationType.UP,
    })
  })

  it('should not notify when price increased by 1.5', async () => {
    ;(handle.getUsersInDb as jest.Mock)
      .mockResolvedValue([{ id: '1' }])(handle.getWalletsInDb as jest.Mock)
      .mockResolvedValue([{ address: 'wallet1' }])(handle.getJettonsFromDB as jest.Mock)
      .mockResolvedValue([{ token: 'jetton1', ticker: 'JET' }])(
        handle.getJettonsFromChain as jest.Mock,
      )
      .mockResolvedValue([{ address: 'jetton1', symbol: 'JET' }])(handle.getPrice as jest.Mock)
      .mockResolvedValue({ price: 150, timestamp: Date.now() })(
        handle.getLastAddressJettonPurchaseFromDB as jest.Mock,
      )
      .mockResolvedValue({ timestamp: Date.now() - 10000, price: 100 })(
        handle.getLastAddressNotificationFromDB as jest.Mock,
      )
      .mockResolvedValue(undefined)

    for await (const notification of getNotifications(handle)) {
      notifications.push(notification)
    }

    expect(notifications).toHaveLength(0)
  })

  it('should notify when price increased by 2', async () => {
    ;(handle.getUsersInDb as jest.Mock)
      .mockResolvedValue([{ id: '1' }])(handle.getWalletsInDb as jest.Mock)
      .mockResolvedValue([{ address: 'wallet1' }])(handle.getJettonsFromDB as jest.Mock)
      .mockResolvedValue([{ token: 'jetton1', ticker: 'JET' }])(
        handle.getJettonsFromChain as jest.Mock,
      )
      .mockResolvedValue([{ address: 'jetton1', symbol: 'JET' }])(handle.getPrice as jest.Mock)
      .mockResolvedValue({ price: 200, timestamp: Date.now() })(
        handle.getLastAddressJettonPurchaseFromDB as jest.Mock,
      )
      .mockResolvedValue({ timestamp: Date.now() - 10000, price: 100 })(
        handle.getLastAddressNotificationFromDB as jest.Mock,
      )
      .mockResolvedValue(undefined)

    for await (const notification of getNotifications(handle)) {
      notifications.push(notification)
    }

    expect(notifications).toHaveLength(1)
    expect(notifications[0]).toMatchObject({
      userId: 1,
      wallet: 'wallet1',
      jetton: 'jetton1',
      symbol: 'JET',
      price: 200,
      action: ENotificationType.UP,
    })
  })

  it('should not notify when price increased by 1.5, sold, then price increased by 2', async () => {
    ;(handle.getWalletsInDb as jest.Mock)
      .mockResolvedValue([{ address: 'wallet1' }])(handle.getJettonsFromDB as jest.Mock)
      .mockResolvedValue([{ token: 'jetton1', ticker: 'JET' }])(
        handle.getJettonsFromChain as jest.Mock,
      )
      .mockResolvedValue([])(handle.getPrice as jest.Mock)
      .mockResolvedValue({ price: 150, timestamp: Date.now() })(
        handle.getLastAddressJettonPurchaseFromDB as jest.Mock,
      )
      .mockResolvedValue({ timestamp: Date.now() - 20000, price: 100 })(
        handle.getLastAddressNotificationFromDB as jest.Mock,
      )
      .mockResolvedValue({ timestamp: Date.now() - 10000, price: 100 })

    for await (const notification of getNotifications(handle)) {
      notifications.push(notification)
    }

    expect(notifications).toHaveLength(1)
    expect(notifications[0]).toMatchObject({
      userId: 1,
      wallet: 'wallet1',
      jetton: 'jetton1',
      symbol: 'JET',
      action: ENotificationType.NOT_HOLD_JETTON_ANYMORE,
    })
  })

  it('should notify when price increased by 2, sold, then price increased by 2 again', async () => {
    ;(handle.getWalletsInDb as jest.Mock)
      .mockResolvedValue([{ address: 'wallet1' }])(handle.getJettonsFromDB as jest.Mock)
      .mockResolvedValue([{ token: 'jetton1', ticker: 'JET' }])(
        handle.getJettonsFromChain as jest.Mock,
      )
      .mockResolvedValue([])(handle.getPrice as jest.Mock)
      .mockResolvedValue({ price: 200, timestamp: Date.now() })(
        handle.getLastAddressJettonPurchaseFromDB as jest.Mock,
      )
      .mockResolvedValue({ timestamp: Date.now() - 20000, price: 100 })(
        handle.getLastAddressNotificationFromDB as jest.Mock,
      )
      .mockResolvedValue({ timestamp: Date.now() - 10000, price: 100 })

    for await (const notification of getNotifications(handle)) {
      notifications.push(notification)
    }

    expect(notifications).toHaveLength(2)
    expect(notifications[0]).toMatchObject({
      userId: 1,
      wallet: 'wallet1',
      jetton: 'jetton1',
      symbol: 'JET',
      price: 200,
      action: ENotificationType.UP,
    })
    expect(notifications[1]).toMatchObject({
      userId: 1,
      wallet: 'wallet1',
      jetton: 'jetton1',
      symbol: 'JET',
      action: ENotificationType.NOT_HOLD_JETTON_ANYMORE,
    })
  })

  it('should notify for multiple price increases and actions', async () => {
    ;(handle.getWalletsInDb as jest.Mock)
      .mockResolvedValue([{ address: 'wallet1' }])(handle.getJettonsFromDB as jest.Mock)
      .mockResolvedValue([{ token: 'jetton1', ticker: 'JET' }])(
        handle.getJettonsFromChain as jest.Mock,
      )
      .mockResolvedValue([{ address: 'jetton1', symbol: 'JET' }])(handle.getPrice as jest.Mock)
      .mockResolvedValueOnce({ price: 200, timestamp: Date.now() - 20000 })
      .mockResolvedValueOnce({ price: 200, timestamp: Date.now() })(
        handle.getLastAddressJettonPurchaseFromDB as jest.Mock,
      )
      .mockResolvedValue({ timestamp: Date.now() - 40000, price: 100 })(
        handle.getLastAddressNotificationFromDB as jest.Mock,
      )
      .mockResolvedValue({ timestamp: Date.now() - 30000, price: 100 })

    for await (const notification of getNotifications(handle)) {
      notifications.push(notification)
    }

    expect(notifications).toHaveLength(3)
    expect(notifications[0]).toMatchObject({
      userId: 1,
      wallet: 'wallet1',
      jetton: 'jetton1',
      symbol: 'JET',
      price: 200,
      action: ENotificationType.UP,
    })
    expect(notifications[1]).toMatchObject({
      userId: 1,
      wallet: 'wallet1',
      jetton: 'jetton1',
      symbol: 'JET',
      action: ENotificationType.NOT_HOLD_JETTON_ANYMORE,
    })
    expect(notifications[2]).toMatchObject({
      userId: 1,
      wallet: 'wallet1',
      jetton: 'jetton1',
      symbol: 'JET',
      price: 200,
      action: ENotificationType.UP,
    })
  })
})
