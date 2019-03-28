const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');
const swaggerAPI = require('./swagger/swaggerapi');
firebaseAdmin.initializeApp();

exports.api = functions.https.onRequest(swaggerAPI);
