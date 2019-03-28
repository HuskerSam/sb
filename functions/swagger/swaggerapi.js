const swaggermw = require('swagger-express-mw');
const express = require('express');
const app = express();
const pathtoSwaggerUi = require('swagger-ui-dist').absolutePath();
const fs = require('fs');
const YAML = require('yamljs');
const path = require('path');
const swaggerDocument = YAML.load(path.join(__dirname, '/api/swagger/swagger.yaml'));
let swaggerDocumentUI = YAML.load(path.join(__dirname, '/api/swagger/swagger.yaml'));

app.get('/', (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  fs.createReadStream(path.join(__dirname, '/ui.html')).pipe(res);
});

app.get('/api-docs', (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.json(swaggerDocument);
});

app.get('/api-docsui', (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  let url = req.headers.referer;
  let host = req.headers.host;
  if (!host) host = '';
  if (!url) url = '';
  let hostPos = url.indexOf(host);
  let basePath = url.substr(hostPos + host.length);
  swaggerDocumentUI.basePath = basePath;
  swaggerDocumentUI.host = host;
  if (url.substr(0,10).indexOf('https') !== -1){
    swaggerDocumentUI.schemes = ['https', 'http'];
  }

  res.json(swaggerDocumentUI);
});

app.use(express.static(pathtoSwaggerUi));

swaggermw.create({
  appRoot: __dirname
}, (err, swaggerExpress) => {
  if (err) throw err;
  app.swaggerExpress = swaggerExpress;
  swaggerExpress.register(app);
});

module.exports = app;
