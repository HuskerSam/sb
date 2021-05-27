const functions = require('firebase-functions');
const admin = require("firebase-admin");
const cloudGenerateDisplay = require('./cloudgeneratedisplay');
const helpGen = require('./helpgenpath/helpgen');

admin.initializeApp();
const fb_config = process.env.FIREBASE_CONFIG;
const runtimeOpts = {
  timeoutSeconds: 300,
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
      let result_msg = await cloudGen.uploadFile(req.query, req.body, req.headers, req);
      return res.status(200).send({
        success: true,
        id,
        name,
        result_msg
      });
    }
    return res.send("Post Only");
  });
exports.widforname = functions
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === 'GET') {
      let name = req.query.name;
      if (!name)
        return res.status(200).send({
          success: false,
          wid: null
        });

      let cloudGen = new cloudGenerateDisplay();
      let validateResults = await cloudGen.validateToken(req.query.token);
      if (validateResults.success === false)
        return res.status(200).send(validateResults);

      let wid = await cloudGen.workspaceForName(name);

      return res.status(200).send({
        success: true,
        name,
        wid,
        bucket: admin.instanceId().app.options.storageBucket
      });
    }
    return res.send("GET Only");
  });
exports.productsforname = functions
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === 'GET') {
      let name = req.query.name;
      if (!name)
        return res.status(200).send({
          success: false,
          wid: null
        });

      let cloudGen = new cloudGenerateDisplay();
      let validateResults = await cloudGen.validateToken(req.query.token);
      if (validateResults.success === false)
        return res.status(200).send(validateResults);

      let productData = await cloudGen.productDataForWorkspace(name);

      return res.status(200).send({
        success: true,
        name,
        productData,
        bucket: admin.instanceId().app.options.storageBucket
      });
    }
    return res.send("GET Only");
  });
exports.generatedhelplist = functions
  .https.onRequest(async (req, res) => helpGen.helpGen(req, res));

exports.post3dmessage = functions
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === 'POST') {
      let id = req.query.id;
      if (!id)
        return res.status(200).send({
          success: false,
          wid: null
        });

      let cloudGen = new cloudGenerateDisplay(id);
      return await cloudGen.post3DChatMessage(res, req);
    }
    return res.send("Post Only");
  });
