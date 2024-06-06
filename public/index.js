// import TonConnectUI from '@tonconnect/ui'

const main = async () => {
    window.Telegram.WebApp.ready()

    let isWalletConnected = false;

    try {
        const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: 'https://ton2x.memeplex.pics/tonconnect-manifest.json',
            buttonRootId: 'wallet-connect-button',
            // restoreConnection: false,
            uiPreferences: {
                // theme: 'SYSTEM',
            },
        });

        tonConnectUI.onModalStateChange(
            async state => {
                if (state.status === "closed" && !isWalletConnected) {
                    await tonConnectUI.openModal();
                }
            }
        )

        tonConnectUI.onStatusChange(
            walletAndwalletInfo => {
                const rawAddress = walletAndwalletInfo.account.address; // like '0:abcdef123456789...'
                const bouncableUserFriendlyAddress = TonConnectSDK.toUserFriendlyAddress(rawAddress);
                console.log(123, rawAddress, bouncableUserFriendlyAddress)
                const rootDiv = document.getElementById('root')
                rootDiv.style = 'display: block;'
                window.Telegram.WebApp.sendData(JSON.stringify({ address: walletAndwalletInfo.account.address, friendlyAddress: bouncableUserFriendlyAddress }))
                isWalletConnected = true;
            }
        );
        await tonConnectUI.openModal();
    } catch (error) {
        console.log(error)
    }
}

// setTimeout(main, 5_000)
main()
