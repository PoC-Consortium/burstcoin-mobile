

export class Currency {
    id: string;
    name: string;
	symbol: string;
	rank: number;
	priceUSD: number;
	priceBTC: number;
	volume24h: number;
	marketCapUSD: number;
	availableSupply: number;
	totalSupply: number;
	percentChange1h: number;
	percentChange24h: number;
	percentChange7d: number;
	lastUpdated: number;
    currency: string;
    priceCur: number;
    volume24hCur: number;
    marketCapCur: number;

    constructor(data:any = {}) {
        this.id = data.id || undefined;
		this.name = data.name || undefined;
		this.symbol = data.symbol || undefined;
        this.rank = data.rank || undefined;
        this.priceUSD = data.price_usd || undefined;
        this.priceBTC = data.price_btc || undefined;
        this.volume24h = data["24h_volume_usd"] || undefined;
        this.marketCapUSD = data.market_cap_usd || undefined;
        this.availableSupply = data.avalaible_supply || undefined;
        this.totalSupply = data.total_supply || undefined;
        this.percentChange1h = data.percent_change_1h || undefined;
        this.percentChange24h = data.percent_change_24h || undefined;
        this.percentChange7d = data.percent_change_7d || undefined;
        this.lastUpdated = data.last_updated || undefined;
        this.currency = data.currency != undefined ? data.currency.toLowerCase() : undefined;
        this.priceCur = data["price_" + this.currency] || undefined;
        this.volume24hCur = data["24h_volume_" + this.currency] || undefined;
        this.marketCapCur = data["market_cap_" + this.currency] || undefined;
    }
}
