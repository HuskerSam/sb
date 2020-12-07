const requireFromUrl = require('require-from-url/sync');
let firebase = require("firebase-admin");
let project_id = JSON.parse(process.env.FIREBASE_CONFIG).projectId;
let gcsvimport = requireFromUrl(`https://${project_id}.web.app/global/gcsvimport.js?abc=894i4`);
let GLOBALUTIL = requireFromUrl(`https://${project_id}.web.app/global/globalutil.js?abc=13ii8974`);

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
  async uploadProfileImage(blob, filename) {
    try {
      let bname = firebase.instanceId().app.options.storageBucket;
      const bucket = firebase.storage().bucket(bname);
      let uuid = 'handtop';
      const imageByteArray = new Uint8Array(blob);
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
      let file_result = await file.save(imageByteArray, options);

      let signed_url = "https://firebasestorage.googleapis.com/v0/b/" +
        bname + "/o/" + encodeURIComponent(filename) + "?alt=media&token=" + uuid
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
  async uploadFile(query, body) {
    let filename = query.filename;
    let rawfileblob = body;

    let file_result = await this.uploadProfileImage(rawfileblob, filename);
    return file_result;
  }
};
