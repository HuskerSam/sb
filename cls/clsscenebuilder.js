class clsSceneBuilder {
  constructor() {
    this.babyHelper = new clsBabylonHelper("#renderCanvas");
    this.scene = this.babyHelper.createDefaultScene();
    this.babyHelper.setScene(this.scene);

//    this.initMaterialUpload();
    this.initToolbars();
  }
  initToolbars() {
    let me = this;
    this.meshesCollapseButton = document.getElementById('collapse-meshes');
    this.meshesCollapsePanel = document.getElementById('meshes-content');
    this.skinsCollapseButton = document.getElementById('collapse-textures');
    this.skinsCollapsePanel = document.getElementById('textures-content');
    this.materialsCollapseButton = document.getElementById('collapse-materials');
    this.materialsCollapsePanel = document.getElementById('materials-content');

    this.meshesCollapseButton.addEventListener('click',
      (e) => me.toggleBar(me.meshesCollapseButton, me.meshesCollapsePanel), false);
    this.skinsCollapseButton.addEventListener('click',
      (e) => me.toggleBar(me.skinsCollapseButton, me.skinsCollapsePanel), false);
    this.materialsCollapseButton.addEventListener('click',
      (e) => me.toggleBar(me.materialsCollapseButton, me.materialsCollapsePanel), false);
  }
  toggleBar(button, bar) {
    if (bar.style.display === 'none') {
      bar.style.display = '';
      button.querySelector('i').innerHTML = 'expand_more';
      bar.parentNode.style.display = '';
      bar.parentNode.parentNode.insertBefore(bar.parentNode, bar.parentNode.parentNode.childNodes[0]);
    } else {
      bar.style.display = 'none';
      bar.parentNode.style.display = 'inline-block';
      button.querySelector('i').innerHTML = 'expand_less';
      bar.parentNode.parentNode.insertBefore(bar.parentNode, null);
    }
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
