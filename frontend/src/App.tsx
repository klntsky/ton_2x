import { useEffect } from 'react';
import { Chart } from './Components/Chart';
import {
  useTonAddress,
  useTonConnectModal,
  useTonConnectUI,
} from '@tonconnect/ui-react';
import { useMiniApp } from '@tma.js/sdk-react';

function App() {
  const rawAddress = useTonAddress(false);
  const userFriendlyAddress = useTonAddress();
  const modal = useTonConnectModal();
  const [tonConnectUI] = useTonConnectUI();
  const miniApp = useMiniApp();
  miniApp.ready();

  if (!rawAddress) {
    modal.open();
  }

  useEffect(() => {
    // tonConnectUI.onModalStateChange((state) => {
    //   if (state.status === "closed" && !isWalletConnected.current) {
    //       modal.open();
    //   }
    // })

    tonConnectUI.onStatusChange(wallet => {
      console.log(123, rawAddress, userFriendlyAddress);
      const myURL = new URL(window.location.href);
      const hasAddress = myURL.searchParams.has('address');
      if (hasAddress || !wallet?.account.address) return;
      myURL.searchParams.set('address', wallet.account.address);
      window.location.href = myURL.toString();
      // const data = {
      //   address: rawAddress,
      //   friendlyAddress: userFriendlyAddress
      // }
      // miniApp.sendData(JSON.stringify(data))
    });
  }, []);

  return (
    <div className="App">
      <Chart />
    </div>
  );
}

export default App;
