const util = require('util');
const firebaseAdmin = require('firebase-admin');

module.exports = {};

module.exports.dummyFunction = (req, res) => {

      return res.status(200).send('{ "success": true }');

  //    res.status(500).send(e);

};
