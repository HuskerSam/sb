const requireFromUrl = require('require-from-url/sync');
let firebase =  require("firebase-admin");
let gcsvimport = requireFromUrl("https://groceryblocks2.web.app/global/gcsvimport.js?abc=581544");
let GLOBALUTIL = requireFromUrl("https://groceryblocks2.web.app/global/globalutil.js?abc=187445");

module.exports = class cloudGenerateDisplay {
  constructor(id) {
    this.csvImport = new gcsvimport(id);
    this.firebase = firebase;
    this.globalUtil = GLOBALUTIL;
    this.csvImport.globalUtil = this.globalUtil;
  }

  async generateAnimation() {
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

};
