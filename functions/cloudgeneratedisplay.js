const requireFromUrl = require('require-from-url/sync');
let firebase = require("firebase-admin");
let project_id = JSON.parse(process.env.FIREBASE_CONFIG).projectId;
let gcsvimport = requireFromUrl(`https://${project_id}.web.app/global/gcsvimport.js?abc=342`);
let GLOBALUTIL = requireFromUrl(`https://${project_id}.web.app/global/globalutil.js?abc=13i321`);
const Busboy = require('busboy');
const toArray = require('stream-to-array');

module.exports = class cloudGenerateDisplay {
  constructor(id) {
    this.csvImport = new gcsvimport(id);
    this.firebase = firebase;
    this.globalUtil = GLOBALUTIL;
    this.wid = id;
    this.csvImport.globalUtil = this.globalUtil;
    this.setReferencePath();
  }

  async generateAnimation() {
    let sceneData = await this.csvImport.csvFetchSceneBlock();

    if (sceneData.key)
      await this.csvImport.dbSetRecordFields('block', {
        generationState: 'not ready'
      }, sceneData.key);

    await this.csvImport.clearProjectData();
    let assets = await this.csvImport.readProjectRawData('assetRows');
    await this.csvImport.importRows(assets);
    let scene = await this.csvImport.readProjectRawData('sceneRows');
    await this.csvImport.importRows(scene);
    let products = await this.csvImport.readProjectRawData('productRows');
    await this.csvImport.importRows(products);
    await this.csvImport.addCSVDisplayFinalize();
    await this.csvImport.writeProjectRawData('animationGenerated', null);

    return 'animation generated';
  }
  async deleteAnimation() {
    await this.csvImport.clearProjectData(true);
    return 'animation deleted';
  }
  async workspaceForName(name) {
    let wid = await this.csvImport.widForName(name);

    if (wid === null) {
      let tags = 'active,' + 'gd:' + new Date().toISOString();
      wid = await this.csvImport.addProject(name, wid, tags);
    }

    return wid;
  }
  async productDataForWorkspace(name) {
    this.wid = await this.workspaceForName(name);
    this.csvImport.projectId = this.wid;
    let pD = await this.csvImport.initProducts(null, true);
    pD.wid = this.wid;
    let pos_blocks = await this.csvImport.dbFetchByLookup('block', 'blockFlag', 'displaypositions');
    if (pos_blocks.records.length > 0)
      pD.positionInfo = pos_blocks.records[0];
    return pD;
  }
  async validateToken(token) {
    let fireDB = this.firebase.firestore();
    let securityDoc = await fireDB.doc('privateConfiguration/security').get();
    let errorMessage = "Configuration Not Found.";
    if (!token)
      token = '';
    if (securityDoc.exists) {
      let data = securityDoc.data();
      if (token === data.token) {
        return {
          success: true
        }
      }

      return {
        success: false,
        errorMessage: "Token didn't match"
      }
    }

    return {
      success: false,
      errorMessage
    }
  }
  setReferencePath(tag = 'cloudupload') {
    this.referencePath = 'project/' + this.wid + '/' + tag + '/';
  }
  async uploadProfileImage(pushBuffer, filename) {
    try {
      let bname = firebase.instanceId().app.options.storageBucket;
      const bucket = firebase.storage().bucket(bname);
      let uuid = 'token';


      let path = this.referencePath + filename;
      const file = bucket.file(path);
      const options = {
        resumable: false,
        metadata: {
          contentType: "image/png",
          metadata: {
            firebaseStorageDownloadTokens: uuid
          }
        }
      }

      let file_result = await file.save(pushBuffer, options);

      let signed_url = "https://firebasestorage.googleapis.com/v0/b/" +
        bname + "/o/" + encodeURIComponent(this.referencePath + filename) + "?alt=media&token=" + uuid;

      return {
        success: true,
        file_result,
        signed_url
      }
    } catch (err) {
      return {
        success: false,
        error: err
      }
    }
  }
  async convertFormData(req) {
    return new Promise(async (res, rej) => {
      let busboy = new Busboy({
        headers: req.headers
      });
      let resultFiles = [];
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        resultFiles.push({
          fieldname,
          file,
          filename,
          encoding,
          mimetype
        });
      });

      busboy.end(req.rawBody);
      res(resultFiles);
    });
  }
  async uploadFile(query, body, headers, req) {
    let filename = query.filename;

    let results = await this.convertFormData(req);
    let buffers = await toArray(results[0].file);

    let file_result = await this.uploadProfileImage(buffers[0], filename);
    return file_result;
  }
  async post3DChatMessage(req, res) {

    //verify enuf time has passed since last (use transaction)
    let db = this.firebase.database();
    let ref = db.ref('applicationData');
    let postMessageAllow = false;
    let newPostDate = new Date().toISOString();

    if (!req.query.texttext) {
      return res.status(200).send({
        success: false,
        message: 'texttext required'
      });
    }

    try {
      await ref.transaction((current_value) => {
        if (!current_value) {
          postMessageAllow = true;
          return {
            lastMessageDate: newPostDate
          };
        }

        let lD = new Date(current_value.lastMessageDate);
        if (new Date() - lD > 10000) {
          postMessageAllow = true;
          return {
            lastMessageDate: newPostDate
          };
        }

        newPostDate = null;
        return current_value;
      });
    } catch (err) {
      console.log('error', err);
      return res.status(200).send({
        success: false,
        message: 'Error'
      });
    }
    if (!newPostDate)
      return res.status(200).send({
        success: false,
        message: 'Wait Time'
      });

    //delete old messages
    await this.csvImport.deleteOldChat();

    let name = 'chatitem_' + newPostDate;
    let postdate = newPostDate;

    let texttext = req.query.texttext;
    let createshapetype = req.query.createshapetype;
    if (!createshapetype) createshapetype = '';
    let cylinderhorizontal = req.query.cylinderhorizontal;
    if (!cylinderhorizontal) cylinderhorizontal = '';

    let textfontfamily = req.query.textfontfamily;
    if (!textfontfamily) textfontfamily = '';
    let textmaterial = req.query.textmaterial;
    if (!textmaterial) textmaterial = '';
    let shapematerial = req.query.shapematerial;
    if (!shapematerial) shapematerial = '';
    let texttextline2 = req.query.displayname;
    if (!texttextline2) texttextline2 = '';

    let csv_row = {
      name,
      texttext,
      textfontfamily,
      textmaterial,
      createshapetype,
      shapematerial,
      cylinderhorizontal,
      asset: 'shapeandtext',
      width: "8",
      height: "3",
      depth: "2",
      textdepth: '.25',
      tessellation: '',
      textstroke: '',
      texttextline2,
      parent: '::scene::_chatWrapper',
      postdate
    };

    let seconds = Math.round(new Date().getSeconds());
    let angle = -4.0 * Math.PI * (seconds % 60) / 60.0;

    let radius = 15;
    csv_row.x = radius * Math.cos(angle);
    csv_row.z = radius * Math.sin(angle);
    csv_row.y = 5.0;
    csv_row.ry = Math.atan2(csv_row.x, csv_row.z);

    await this.csvImport.addCSVRow(csv_row);


    return res.status(200).send({
      success: true
    });
  }
};
