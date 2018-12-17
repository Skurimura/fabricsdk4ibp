'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Chaincode query
 */

var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');
var fs = require('fs-extra');

//
var fabric_client = new Fabric_Client();
let tlscacert = fs.readFileSync('/Users/skurimura/demo/pdc/1.2/fabric-samples/chaincode/marbles02_private/tls/tls.pem');

// setup the fabric network
var channel = fabric_client.newChannel('mychannel');
var peer = fabric_client.newPeer('grpcs://n55536e1b2a2d4491b41bbed32a580e52-org1-peer1.us01.blockchain.ibm.com:31002', { 'pem' : Buffer.from(tlscacert).toString()});
channel.addPeer(peer);

//
var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);
var tx_id = null;

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
	// assign the store to the fabric client
	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	// use the same location for the state store (where the users' certificate are kept)
	// and the crypto store (where the users' keys are kept)
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	// get the enrolled user from persistence, this user will sign all requests
	return fabric_client.getUserContext('admin', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded admin from persistence');
		member_user = user_from_store;
	} else {
		throw new Error('Failed to get admin.... run registerUser.js');
	}

	// intall chaincode
process.env.GOPATH = '/Users/skurimura/gopath';

	var request = {
		targets: peer,
		chaincodePath: 'github.com/',
		chaincodeId: '',
		chaincodeType: 'golang',
		chaincodeVersion: '1.0',
		channelNames: ''
		 };

	// send the install chiancode proposal to the peer
	return fabric_client.installChaincode(request);


}).then((install_responses) => {
	console.log("Install has completed, checking results");
	// query_responses could have more than one  results if there multiple peers were used as targets
	if (install_responses && install_responses.length == 1) {
		if (install_responses[0] instanceof Error) {
			console.error("error from install = ", install_responses[0]);
		} else {
			console.log("Response is ", isntall_responses[0].toString());
		}
	} else {
		console.log("No payloads were returned from install chaincode");
	}
}).catch((err) => {
	console.error('Failed to install chaincode successfully :: ' + err);
});
