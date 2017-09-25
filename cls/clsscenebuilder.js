class clsSceneBuilder {
  constructor() {
    this.babyHelper = new clsBabylonHelper("#renderCanvas");
    this.scene = this.babyHelper.createDefaultScene();
    this.babyHelper.setScene(this.scene);
    this.toolbarItems = {};
    //    this.initMaterialUpload();
    this.toolbarItems['meshes'] = new clsToolbarItem('meshes', 'Meshes');
    this.toolbarItems['materials'] = new clsToolbarItem('materials', "Materials");
    this.toolbarItems['textures'] = new clsToolbarItem('textures', 'Textures');
  }
  saveMaterial() {
    let me = this;
    let title = this.materialUploadTitle.value.trim();
    gAPPP.firebaseHelper.newMaterial(title).then((result) => {
      me.materialUploadTitle.value = '';
      me.materialUploadDialog.close();
    });
  }
  initMaterialUpload() {
    let me = this;
    this.materialUploadDialog = document.getElementById('material-upload-dialog');
    this.showMaterialUploadDialog = document.getElementById('material-upload-button');
    this.materialUploadTitle = document.getElementById('material-upload-title');
    this.materialUploadSave = this.materialUploadDialog.querySelector('.save');
    this.materialUploadClose = this.materialUploadDialog.querySelector('.close');

    if (!this.materialUploadDialog.showModal) {
      dialogPolyfill.registerDialog(this.materialUploadDialog);
    }
    this.showMaterialUploadDialog.addEventListener('click', () => me.materialUploadDialog.showModal());
    this.materialUploadClose.addEventListener('click', () => me.materialUploadDialog.close());
    this.materialUploadSave.addEventListener('click', () => me.saveMaterial(), false);
  }
}
