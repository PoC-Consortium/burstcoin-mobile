/*
* Copyright 2018 PoC-Consortium
*/

import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response, URLSearchParams } from "@angular/http";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/timeout'

import { Currency, HttpError, constants } from "../model";
import { NoConnectionError } from "../model/error";
import { DatabaseService } from "./";

/*
* MarketService class
*
* The MarketService is responsible for getting currency information. (right now, only from coinmarketcap.com)
*/
@Injectable()
export class MarketService {
    public currency: BehaviorSubject<any> = new BehaviorSubject(undefined);

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
            return this.http.get(constants.marketUrl, requestOptions)
                .timeout(constants.connectionTimeout)
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

    /*
    * Format a coin amount number to 8 decimals and return string with BURST addition
    */
    public formatBurstcoin(coins: number): string {
        if (isNaN(coins)) {
            return "0 BURST";
        } else {
            if (coins % 1 === 0) {
                // whole number
                return coins.toString() + " BURST";
            } else {
                return coins.toFixed(8) + " BURST";
            }
        }
    }

    /*
    * Convert fiat amount to burst amunt
    */
    public convertFiatCurrencyToBurstcoin(amount: number): number {
        return amount / this.currency.value.priceCur;
    }

    /*
    * Format number to 8 decimals string and BTC addition
    */
    public getPriceBTC(coins: number, decimals: number = 8): string {
        if (this.currency.value != undefined) {
            return (coins * this.currency.value.priceBTC).toFixed(decimals) + " BTC";
        } else {
            return "...";
        }
    }

    /*
    * Format fiat amount to Burst amount string with BURST addition
    */
    public getPriceBurstcoin(amount: number): string {
        if (isNaN(amount)) {
            return "0 BURST";
        } else {
            let coins = amount / this.currency.value.priceCur;
            if (coins % 1 === 0) {
                // whole number
                return coins.toString() + " BURST";
            } else {
                return coins.toFixed(8) + " BURST";
            }
        }
    }

    /*
    * Format number to 8 decimals string and fiat addition
    */
    public getPriceFiatCurrency(coins: number, decimals: number = 2): string {
        if (this.currency.value != undefined) {
            return (coins * this.currency.value.priceCur).toFixed(decimals) + " " + this.getCurrencySymbol();
        } else {
            return "...";
        }
    }

    /*
    * Get current fiat currency symbol
    */
    public getCurrencySymbol(): string {
        if (this.currency.value != undefined) {
            let currency = constants.currencies.find(c => c.code === this.currency.value.currency);
            if (currency != undefined) {
                return currency.symbol;
            } else {
                this.currency.value.currency.toUpperCase();
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

    /*
    * Helper Method to handle HTTP errors
    */
    private handleError(error: Response | any) {
        return Promise.reject(new HttpError(error.json()));
    }

}
