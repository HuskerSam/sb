class clsSceneBuilder {
  constructor() {
    this.babyHelper = new clsBabylonHelper("#renderCanvas");
    this.scene = this.babyHelper.createDefaultScene();
    this.babyHelper.setScene(this.scene);

    this.initTextureUpload();
    this.initMaterialUpload();
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

  uploadTexture() {
    let me = this;
    let file = me.textureUploadFile.files[0];
    let title = me.textureUploadTitle.value.trim();
    if (!title) {
      alert('Need a title to upload');
      return;
    }
    me.textureUploadClose.style.display = 'none';
    me.textureUploadImport.style.display = 'none';
    me.textureUploadProgress.style.display = '';
    gAPPP.firebaseHelper.newTexture(file, title).then(function(result) {
      me.textureUploadTitle.value = '';
      me.textureUploadFile.value = '';
      me.textureUploadClose.style.display = '';
      me.textureUploadImport.style.display = '';
      me.textureUploadProgress.style.display = 'none';
      me.textureUploadDialog.close();
    });
  }
  initTextureUpload() {
    let me = this;
    this.textureUploadDialog = document.getElementById('texture-upload-dialog');
    this.showTextureUploadDialog = document.getElementById('texture-upload-button');
    this.textureUploadFile = document.getElementById('texture-upload-file');
    this.textureUploadTitle = document.getElementById('texture-upload-title');
    this.textureUploadProgress = document.getElementById('texture-upload-progress');
    this.textureUploadImport = this.textureUploadDialog.querySelector('.import');
    this.textureUploadClose = this.textureUploadDialog.querySelector('.close');

    if (!this.textureUploadDialog.showModal) {
      dialogPolyfill.registerDialog(this.textureUploadDialog);
    }
    this.showTextureUploadDialog.addEventListener('click', function() {
      me.textureUploadClose.style.display = '';
      me.textureUploadImport.style.display = '';
      me.textureUploadProgress.style.display = 'none';
      me.textureUploadDialog.showModal();
    });
    this.textureUploadClose.addEventListener('click', function() {
      me.textureUploadDialog.close();
    });
    this.textureUploadImport.addEventListener('click', (e) => me.uploadTexture(), false);
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
