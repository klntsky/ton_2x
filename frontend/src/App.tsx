import { useEffect } from 'react';
import { Chart } from './Components/Chart';
import { useTonConnectModal, useTonConnectUI } from '@tonconnect/ui-react';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  useMiniApp,
  useThemeParams,
} from '@tma.js/sdk-react';
import { retrieveLaunchParams } from '@tma.js/sdk';
import { usePostData } from './Hooks';
import { useParams } from 'react-router-dom';

function App() {
  const query = useParams();
  const modal = useTonConnectModal();
  const [tonConnectUI] = useTonConnectUI();
  const themeParams = useThemeParams();
  const miniApp = useMiniApp();
  const { mutate } = usePostData();
  miniApp.ready();

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  // useEffect(() => {
  //   if (modal.state.status === 'closed') {
  //     if (!query.address) {
  //       modal.open();
  //     }
  //   } else {
  //     if (query.address) {
  //       modal.close();
  //     }
  //   }
  // }, [modal, modal.state.status, query.address]);

  useEffect(() => {
    if (!query.address) {
      modal.open();
    }

    tonConnectUI.onStatusChange(wallet => {
      const myURL = new URL(window.location.href);
      const launchParams = retrieveLaunchParams();
      console.log(123, {
        id: launchParams.initData?.user?.id,
        address: wallet?.account.address,
      });
      if (query.address || !wallet?.account.address) return;
      myURL.searchParams.set('address', wallet.account.address);
      window.location.href = myURL.toString();
      mutate({
        url: '/postUserWallet',
        data: {
          id: launchParams.initData?.user?.id,
          address: wallet?.account.address,
        },
      });
    });
  }, []);

  return (
    <div className="App">
      <Chart />
    </div>
  );
}

export default App;
