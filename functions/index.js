var functions = require('firebase-functions');
var admin = require("firebase-admin");
let cloudGenerateDisplay = require('./cloudgeneratedisplay');

const serviceAccount = require('./fbcreds.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://groceryblocks2.firebaseio.com"
});

exports.generate = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === 'POST') {
    let id = req.query.id;
    let cloudGen = new cloudGenerateDisplay(id);
    let result_msg = await cloudGen.generateAnimation();
    return res.status(200).send(`{ "success": true, "msg": ${result_msg} }`);
  }
  return res.send("Post Only");
});
exports.upload = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === 'POST') {
    let id = req.query.id;
    let csvType = req.query.type;
    let data = JSON.parse(req.body);

    let cloudGen = new cloudGenerateDisplay(id);
    let result = await cloudGen.csvImport.writeProjectRawData(csvType + 'Rows', data);

    return res.status(200).send(`{ "success": true, "msg": ${'123'} }`);
  }

  return res.send("Post Only");
});
