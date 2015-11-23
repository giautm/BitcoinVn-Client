/* global Buffer */
'use strict';

let Promise = require('bluebird');
let crypto = require('crypto');
let request = require('request-promise');

let BitcoinVnClient = function (client_key, client_secret, api_url) {
    this.client_key = client_key;
    this.client_secret = client_secret;
    this.api_url = api_url || 'https://www.bitcoinvietnam.com.vn/api/v2';
}

BitcoinVnClient.prototype.query = function (options) {
    
    options.nonce = Date.now() / 1000 | 0;

    let b64Params = new Buffer(JSON.stringify(options)).toString('base64');
    let signature = crypto.createHmac('sha256', this.client_secret)
        .update(b64Params)
        .digest('hex');
        
    return request({
        uri: this.api_url,
        method: 'POST',
        headers: {
            'X-BITCOINVIETNAM-KEY': this.client_key,
            'X-BITCOINVIETNAM-PARAMS': b64Params,
            'X-BITCOINVIETNAM-SIGNATURE': signature
        },
        form: options
    })
    .then(function (jsonString) {
        /* Loại bỏ khoảng trắng thừa và parse chuỗi JSON. */
        let rep = JSON.parse(jsonString.replace(/\s+/g,' '));
        
        if (rep.error) {
            return Promise.reject(rep.error);
        }
        
        return Promise.resolve(rep.response);
    });
}

BitcoinVnClient.prototype.getDailyData = function () {
    return this.query({ method: 'dailydata'});
};
BitcoinVnClient.prototype.getAccount = function () {
    return this.query({ method: 'account'});
};
BitcoinVnClient.prototype.getStatus = function () {
    return this.query({ method: 'status'});
};
BitcoinVnClient.prototype.getTicker = function () {
    return this.query({ method: 'ticker'});
};
BitcoinVnClient.prototype.getPrice = function (side) {
    return this.query({ method: 'price', side: side || 'buy'});
};
BitcoinVnClient.prototype.getOrderStatus = function (orderId) {
    return this.query({ method: 'orderstatus', id: orderId});
};
BitcoinVnClient.prototype.sellCoin = function (amount) {
    return this.query({ method: 'sell', amount: amount});
};
BitcoinVnClient.prototype.buyCoin = function (amount, amountType, price, btcAddress) {
    return this.query({
         method: 'buy',
         amount: amount,
         amountType: amountType,
         price: price,
         btcAddress: btcAddress || 'WALLET'
    });
};

module.exports = BitcoinVnClient