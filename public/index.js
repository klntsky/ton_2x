// import TonConnectUI from '@tonconnect/ui'

const main = async () => {
    window.Telegram.WebApp.ready()

    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://ton2x.memeplex.pics/tonconnect-manifest.json',
        buttonRootId: 'connect'
    });
    // const walletsList = await TonConnectUI.getWallets();

    tonConnectUI.onStatusChange(
        walletAndwalletInfo => {

            const rawAddress = walletAndwalletInfo.account.address; // like '0:abcdef123456789...'
            const bouncableUserFriendlyAddress = TonConnectSDK.toUserFriendlyAddress(rawAddress);
            console.log(123, walletAndwalletInfo.account.address, bouncableUserFriendlyAddress)
            window.Telegram.WebApp.sendData(JSON.stringify({ address: walletAndwalletInfo.account.address, friendlyAddress: bouncableUserFriendlyAddress }))
            // update state/reactive variables to show updates in the ui
        } 
    );
    await tonConnectUI.openModal();
}

// setTimeout(main, 5_000)
main()
