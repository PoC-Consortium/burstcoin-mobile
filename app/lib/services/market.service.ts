import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response, URLSearchParams } from "@angular/http";
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Currency, HttpError } from "../model";
import { NoConnectionError } from "../model/error";
import { DatabaseService } from "./";

@Injectable()
export class MarketService {

    public currency: BehaviorSubject<any> = new BehaviorSubject(undefined);
    private timeout: number = 10000; // 10 seconds

    constructor(
        private databaseService: DatabaseService,
        private http: Http
    ) {
        this.updateCurrency().catch(error => {});
    }

    public setCurrency(currency: Currency) {
        this.currency.next(currency);
    }

    /*
    * Get Currency Data from coinmarketcap
    * TODO Provide interface, for easy swap of currency data provider
    */
    public updateCurrency(): Promise<Currency> {
        return new Promise((resolve, reject) => {
            let params: URLSearchParams = new URLSearchParams();
            let requestOptions = this.getRequestOptions();
            let currency: string;
            if (this.databaseService.settings.value.currency != undefined) {
                currency = this.databaseService.settings.value.currency;
                params.set("convert", currency);
                requestOptions.params = params;
            }
            return this.http.get("https://api.coinmarketcap.com/v1/ticker/burst", requestOptions)
                .timeout(this.timeout)
                .toPromise()
                .then(response => {
                    let r = response.json() || [];
                    if (r.length > 0) {
                        // set currency for currency object
                        r[0]["currency"] = currency;
                        let c = new Currency(r[0]);
                        this.setCurrency(c);
                        resolve(c);
                    }
                })
                .catch(error => {
                    reject(new NoConnectionError("Could not reach market for currency updates. Check your internet connection!"))
                });
        });
    }

    public getPriceBurstcoin(coins: number) {
        if (coins % 1 === 0) {
            // whole number
            return coins.toString() + " BURST";
        } else {
            return coins.toFixed(8) + " BURST";
        }
    }

    public getPriceBTC(coins: number, decimals: number = 8) : string {
        if (this.currency.value != undefined) {
            return (coins * this.currency.value.priceBTC).toFixed(decimals) + " BTC";
        } else {
            return "...";
        }
    }

    public getPriceFiatCurrency(coins: number, decimals: number = 8) : string {
        if (this.currency.value != undefined) {
            switch (this.currency.value.currency) {
                case "AUD":
                case "CAD":
                case "CLP":
                case "HKD":
                case "MXN":
                case "NZD":
                case "SGD":
                case "TWD":
                case "USD":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " $" ;
                case "BRL":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " R$" ;
                case "CNY":
                case "JPY":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " ¥" ;
                case "CZK":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " Kč" ;
                case "DKK":
                case "NOK":
                case "SEK":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " kr" ;
                case "EUR":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " €" ;
                case "GBP":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " £" ;
                case "HUF":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " Ft" ;
                case "IDR":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " Rp" ;
                case "ILS":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " ₪" ;
                case "INR":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " ₹" ;
                case "KRW":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " ₩" ;
                case "MYR":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " RM" ;
                case "PHP":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " ₱" ;
                case "PKR":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " ₨" ;
                case "PLN":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " zł" ;
                case "RUB":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " ₽" ;
                case "THB":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " ฿" ;
                case "TRY":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " ₺" ;
                case "ZAR":
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " Rs" ;
                default:
                    return (coins * this.currency.value.priceCur).toFixed(decimals) + " " + this.currency.value.currency.toUpperCase();
            }
        } else {
            return "...";
        }
    }

    /*
    * Helper Method to generate Request options
    */
    public getRequestOptions() {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return options;
    }

    private handleError(error: Response | any) {
        return Promise.reject(new HttpError(error.json()));
    }

}
