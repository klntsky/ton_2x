// import {TonConnectUI} from '@tonconnect/ui'

const main = async () => {
    window.Telegram.WebApp.ready()

    let isWalletConnected = false;

    try {
        // const tonConnectUI = new TonConnectUI({
        const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: 'https://ton2x.memeplex.pics/tonconnect-manifest.json',
            buttonRootId: 'wallet-connect-button',
            // restoreConnection: false,
            // uiPreferences: {
            //     // theme: 'SYSTEM',
            // },
        });
        tonConnectUI.uiOptions = {
            twaReturnUrl: 'https://t.me/ton_2x_bot/app'
        }

        tonConnectUI.onModalStateChange(
            async state => {
                if (state.status === "closed" && !isWalletConnected) {
                    await tonConnectUI.openModal();
                }
            }
        )
        console.log(999, tonConnectUI.connected)
        tonConnectUI.onStatusChange(
            walletAndwalletInfo => {
                const rawAddress = walletAndwalletInfo.account.address; // like '0:abcdef123456789...'
                console.log(1)
                const bouncableUserFriendlyAddress = TonConnectSDK.toUserFriendlyAddress(rawAddress);
                console.log(123, rawAddress, bouncableUserFriendlyAddress)
                window.userWalletAddress = walletAndwalletInfo.account.address
                window.Telegram.WebApp.sendData(JSON.stringify({ address: walletAndwalletInfo.account.address, friendlyAddress: bouncableUserFriendlyAddress }))
                console.log(2)
                isWalletConnected = true;
            }
        );

        tonConnectUI.connectionRestored.then(async restored => {
            if (restored) {
                console.log(
                    'Connection restored. Wallet:',
                    JSON.stringify({
                        ...tonConnectUI.wallet,
                        ...tonConnectUI.walletInfo
                    })
                );
            } else {
                console.log('Connection was not restored.');
                await tonConnectUI.openModal()
            }
        });
    } catch (error) {
        console.log(error)
    }
}

// setTimeout(main, 5_000)
main()
