export const shouldNotificate = async (transactionPrice: number, dexPrice: number, rate: number, side: boolean) => {
    if (side) {
        return (dexPrice / transactionPrice) > rate
    } 
    return (dexPrice / transactionPrice) < rate
}
