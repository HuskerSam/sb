class cViewLayout extends bView {
  constructor() {
    super(null, null, null, true);


    this.initFieldEdit();

    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};
    this.editTables = {};

    let key = 'selectedBlockKey' + gAPPP.workspace;
    this._updateSelectedBlock(gAPPP.a.profile[key]);
  }
  async canvasReadyPostTimeout() {
    document.querySelector('.form_panel_view_dom').style.display = '';
    this.productData = await new gCSVImport(gAPPP.a.profile.selectedWorkspace).initProducts();
    this.products = this.productData.products;
    this.productBySKU = this.productData.productsBySKU;

    this.canvasHelper.cameraSelect.selectedIndex = 2;
    this.canvasHelper.noTestError = true;
    this.canvasHelper.cameraChangeHandler();


    this.updateProductList();
    this.updatePositionList();
    this.loadTemplateLists();

    this._loadDataTables().then(() => {});

    try {
      this.canvasHelper.playAnimation();
    } catch (e) {
      console.log('play anim error', e);
    }

    let basketListHTML = '';
    if (this.productData.displayBlocks)
      for (let c = 0, l = this.productData.displayBlocks.length; c < l; c++)
        basketListHTML += `<option>${this.productData.displayBlocks[c]}</option>`;
    document.getElementById('blocklist').innerHTML = basketListHTML;

    this.changes_commit_header = document.getElementById('changes_commit_header');
    this.changes_commit_header.addEventListener('click', e => this.saveChanges());

    return Promise.resolve();
  }
  saveChanges() {
    this.__saveChanges().then(() => {});
  }
  async _loadDataTables() {
    await Promise.all([
      this.loadDataTable('asset'),
      this.loadDataTable('scene'),
      this.loadDataTable('product'),
    ]);

    this.__tableChangedHandler();
    this.initSceneEditFields();
    this.sceneOptionsBlockListChange();
  }
}
