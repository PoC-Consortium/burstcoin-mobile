/*
    Copyright 2017 icewave.org
*/

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
        this.id = data.id || "";
		this.name = data.name || "";
		this.symbol = data.symbol || "";
        this.rank = data.rank || 0;
        this.priceUSD = data.price_usd || 0;
        this.priceBTC = data.price_btc || 0;
        this.volume24h = data["24h_volume_usd"] || 0;
        this.marketCapUSD = data.market_cap_usd || 0;
        this.availableSupply = data.avalaible_supply || 0;
        this.totalSupply = data.total_supply || 0;
        this.percentChange1h = data.percent_change_1h || 0;
        this.percentChange24h = data.percent_change_24h || 0;
        this.percentChange7d = data.percent_change_7d || 0;
        this.lastUpdated = data.last_updated || 0;
        this.currency = data.currency != undefined ? data.currency : "USD";
        this.priceCur = data["price_" + this.currency.toLowerCase()] || "";
        this.volume24hCur = data["24h_volume_" + this.currency] || "";
        this.marketCapCur = data["market_cap_" + this.currency] || "";
    }
}
