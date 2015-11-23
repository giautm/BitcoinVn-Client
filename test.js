var BitcoinVnClient = require('./index.js');

var client = new BitcoinVnClient(
	Chuoi API KEY,
	CHUOI SECRECT,
	null);


client.getAccount()
	.then(console.log)
	.catch(console.error);