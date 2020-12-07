const functions = require('firebase-functions');
const admin = require("firebase-admin");
const cloudGenerateDisplay = require('./cloudgeneratedisplay');

admin.initializeApp();
const fb_config = process.env.FIREBASE_CONFIG;
const runtimeOpts = {
  timeoutSeconds: 540,
  memory: '2GB'
};
const database = admin.database();
exports.generate = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === 'POST') {
      let id = req.query.id;
      if (!id)
        id = '';
      let name = req.query.name;
      if (!name)
        name = '';
      let cloudGen = new cloudGenerateDisplay(id);

      let validateResults = await cloudGen.validateToken(req.query.token);
      if (validateResults.success === false)
        return res.status(200).send(validateResults);

      if (name)
        id = await cloudGen.workspaceForName(name);
      cloudGen = new cloudGenerateDisplay(id);
      let result_msg = await cloudGen.generateAnimation();
      return res.status(200).send({
        success: true,
        id,
        name,
        result_msg
      });
    }
    return res.send("Post Only");
  });
exports.upload = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === 'POST') {
      let id = req.query.id;
      if (!id)
        id = '';
      let name = req.query.name;
      if (!name)
        name = '';
      let cloudGen = new cloudGenerateDisplay(id);

      let validateResults = await cloudGen.validateToken(req.query.token);
      if (validateResults.success === false)
        return res.status(200).send(validateResults);

      if (name)
        id = await cloudGen.workspaceForName(name);
      cloudGen = new cloudGenerateDisplay(id);

      let csvType = req.query.type;
      let data = JSON.parse(req.body);

      let result = await cloudGen.csvImport.writeProjectRawData(csvType + 'Rows', data);

      return res.status(200).send({
        success: true,
        id,
        name
      });
    }

    return res.send("Post Only");
  });
exports.delete = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === 'POST') {
      let id = req.query.id;
      if (!id)
        id = '';
      let name = req.query.name;
      if (!name)
        name = '';
      let cloudGen = new cloudGenerateDisplay(id);

      let validateResults = await cloudGen.validateToken(req.query.token);
      if (validateResults.success === false)
        return res.status(200).send(validateResults);

      if (name)
        id = await cloudGen.workspaceForName(name);
      cloudGen = new cloudGenerateDisplay(id);
      let result_msg = await cloudGen.deleteAnimation();
      return res.status(200).send({
        success: true,
        id,
        name,
        result_msg
      });
    }
    return res.send("Post Only");
  });
exports.fileupload = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === 'POST') {
      let id = req.query.id;
      if (!id)
        id = '';
      let name = req.query.name;
      if (!name)
        name = '';
      let cloudGen = new cloudGenerateDisplay(id);

      let validateResults = await cloudGen.validateToken(req.query.token);
      if (validateResults.success === false)
        return res.status(200).send(validateResults);

      if (name)
        id = await cloudGen.workspaceForName(name);
        
      cloudGen = new cloudGenerateDisplay(id);
      let result_msg = await cloudGen.uploadFile(req.query, req.body);
      return res.status(200).send({
        success: true,
        id,
        name,
        result_msg
      });
    }
    return res.send("Post Only");
  });
