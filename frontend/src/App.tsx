import { useEffect, useState } from 'react'
import { useTonConnectModal, useTonConnectUI } from '@tonconnect/ui-react'
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  useMiniApp,
  useThemeParams,
} from '@tma.js/sdk-react'
import { retrieveLaunchParams } from '@tma.js/sdk'

import { Charts, Button } from './components'
import { usePostData } from './hooks'
import { useTranslation } from 'react-i18next'
import { TGetWalletDataResponse } from './types'

export const App = () => {
  const launchParams = retrieveLaunchParams()
  if (!launchParams.initData?.user?.id) {
    throw new Error(`There is no user id in launchParams`)
  }
  const modal = useTonConnectModal()
  const [tonConnectUI] = useTonConnectUI()
  const themeParams = useThemeParams()
  const miniApp = useMiniApp()
  const { mutate } = usePostData()
  const { t } = useTranslation()
  const [walletsCount, setWalletsCount] = useState(0)
  miniApp.ready()

  const onClickLinkAnothgerWalletButton = async () => {
    if (tonConnectUI.connected) {
      await tonConnectUI.disconnect()
    }
    modal.open()
  }

  const onUpdateChartsData = async (data: TGetWalletDataResponse) => {
    setWalletsCount(data.walletsTotal)
    if (data.walletsTotal === 0) {
      modal.open()
    }
  }

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams)
  }, [miniApp, themeParams])

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams)
  }, [themeParams])

  // useEffect(() => {
  //   if (modal.state.status === 'closed' && !tonConnectUI.account?.address) {
  //     modal.open();
  //   }
  // }, [modal.state.status]);

  useEffect(() => {
    tonConnectUI.onStatusChange(wallet => {
      if (!wallet?.account.address) return
      const launchParams = retrieveLaunchParams()
      mutate({
        url: '/postUserWallet',
        data: {
          id: launchParams.initData?.user?.id,
          address: wallet?.account.address,
        },
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="App">
      <Charts
        walletsCount={walletsCount}
        userId={launchParams.initData.user.id}
        onUpdate={onUpdateChartsData}
      />
      {walletsCount > 0 ? (
        <Button onClick={onClickLinkAnothgerWalletButton}>
          {t('button.linkAnotherWallet')}
        </Button>
      ) : null}
    </div>
  )
}
