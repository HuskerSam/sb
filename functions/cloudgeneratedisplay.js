const requireFromUrl = require('require-from-url/sync');
let firebase =  require("firebase-admin");
let project_id = JSON.parse(process.env.FIREBASE_CONFIG).projectId;
let gcsvimport = requireFromUrl(`https://${project_id}.web.app/global/gcsvimport.js?abc=5io844`);
let GLOBALUTIL = requireFromUrl(`https://${project_id}.web.app/global/globalutil.js?abc=13io574`);

module.exports = class cloudGenerateDisplay {
  constructor(id) {
    this.csvImport = new gcsvimport(id);
    this.firebase = firebase;
    this.globalUtil = GLOBALUTIL;
    this.csvImport.globalUtil = this.globalUtil;
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

  async workspaceForName(name) {
    let wid = await this.csvImport.widForName(name);

    if (wid === null) {
      let tags = 'active,' + 'gd:' + new Date().toISOString();
      wid = await this.csvImport.addProject(name, wid, tags);
    }

    return wid;
  }
};
