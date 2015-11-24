var BitcoinVnClient = require('./index.js');

var client = new BitcoinVnClient(
	'7Vo3PEig0NmuKTdFO6ADkxW2LslG1YHn',
	'3c56a5f5a0dbe399d982dad3a8dec1893463874102d0677ebf41515454483298afdd98c714fae178c590b536e1143f0c732eea66bab74f62232abeb1ef28992b',
	null);


client.getAccount()
	.then(console.log)
	.catch(console.error);