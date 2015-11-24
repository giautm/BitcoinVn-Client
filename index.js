/* global Buffer */
/* global Promise */
'use strict';

let crypto = require('crypto');
let request = require('request-promise');

class BitcoinVnClient {

    constructor(client_key, client_secret, api_url) {
        this.client_key = client_key;
        this.client_secret = client_secret;
        this.api_url = api_url || 'https://www.bitcoinvietnam.com.vn/api/v2';
    }

    /*
     * Thực thi một câu truy vấn đến API và trả về kết quả.
     *
     * @param: options - object, là các tham số cần thiết để tạo câu truy vấn.
     *
     * @code:
     * query({
     *    method: 'account'
     * }).then(console.log);
     */
    query(options) {
        return new Promise(function (resolve, reject) {
            try {
                options.nonce = Date.now() / 1000 | 0;

                let b64Params = new Buffer(JSON.stringify(options)).toString('base64');
                let signature = crypto.createHmac('sha256', this.client_secret)
                    .update(b64Params)
                    .digest('hex');

                resolve({
                    uri: this.api_url,
                    method: 'POST',
                    headers: {
                        'X-BITCOINVIETNAM-KEY': this.client_key,
                        'X-BITCOINVIETNAM-PARAMS': b64Params,
                        'X-BITCOINVIETNAM-SIGNATURE': signature
                    },
                    form: options
                });
            } catch (exception) {
                reject(exception);
            }
        }.bind(this)).then(request).then(function (jsonString) {
            /* Loại bỏ khoảng trắng thừa và parse chuỗi JSON. */
            // TODO: Bug - Nếu chuỗi giá trị có nhiều khoảng trắng thì cũng sẽ bị sửa đổi.
            let rep = JSON.parse(jsonString.replace(/\s+/g, ' '));

            if (rep.error) {
                return Promise.reject(rep.error);
            }

            return Promise.resolve(rep.response);
        });
    }

    getDailyData() {
        return this.query({method: 'dailydata'});
    }

    getAccount() {
        return this.query({method: 'account'});
    }

    getStatus() {
        return this.query({method: 'status'});
    }

    getTicker() {
        return this.query({method: 'ticker'});
    }

    getPrice(side) {
        if (side !== 'buy' && side !== 'sell') {
            side = 'buy';
        }

        return this.query({method: 'price', side: side});
    }

    getOrderStatus(orderId) {
        return this.query({method: 'orderstatus', id: orderId});
    }

    sellCoin(amount) {
        return this.query({method: 'sell', amount: amount});
    }

    buyCoin(amount, amountType, price, btcAddress) {
        return this.query({
            method: 'buy',
            amount: amount,
            amountType: amountType,
            price: price,
            btcAddress: btcAddress || 'WALLET'
        });
    }
}

module.exports = BitcoinVnClient