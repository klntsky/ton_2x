import { useEffect } from 'react'
import { useTonConnectModal, useTonConnectUI } from '@tonconnect/ui-react'
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  useMiniApp,
  useThemeParams,
} from '@tma.js/sdk-react'
import { retrieveLaunchParams } from '@tma.js/sdk'

import { Chart } from './components/Chart'
import { usePostData } from './hooks'

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
  miniApp.ready()

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
    modal.open()

    tonConnectUI.onStatusChange(wallet => {
      const launchParams = retrieveLaunchParams()
      if (!wallet?.account.address) return
      mutate({
        url: '/postUserWallet',
        data: {
          id: launchParams.initData?.user?.id,
          address: wallet?.account.address,
        },
      })
    })
  }, [])

  return (
    <div className="App">
      {tonConnectUI.account?.address ? (
        <Chart
          address={tonConnectUI.account.address}
          userId={launchParams.initData.user.id}
        />
      ) : null}
    </div>
  )
}
