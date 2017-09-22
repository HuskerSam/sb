var scenebuilder = {};

scenebuilder.init = function() {
  this.initMeshUpload();
  this.initTextureUpload();
  this.initMaterialUpload();
  this.initToolbars();
};
scenebuilder.initToolbars = function() {
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
};
scenebuilder.initMeshUpload = function() {
  let me = this;
  this.meshUploadDialog = document.getElementById('mesh-upload-dialog');
  this.showMeshUploadDialog = document.getElementById('mesh-upload-button');
  this.meshUploadFileDom = document.getElementById('mesh-upload-file');
  this.meshObjIdUpload = document.getElementById('mesh-object-id');
  this.importMeshDialogProgress = document.getElementById('mesh-upload-progress');
  this.importMeshUploadButton = this.meshUploadDialog.querySelector('.import');
  this.meshUploadDialogClose = this.meshUploadDialog.querySelector('.close');

  if (!this.meshUploadDialog.showModal) {
    dialogPolyfill.registerDialog(this.meshUploadDialog);
  }
  this.showMeshUploadDialog.addEventListener('click', function() {
    me.meshUploadDialogClose.style.display = '';
    me.importMeshUploadButton.style.display = '';
    me.importMeshDialogProgress.style.display = 'none';
    me.meshUploadDialog.showModal();
  });
  this.meshUploadDialogClose.addEventListener('click', function() {
    me.meshUploadDialog.close();
  });
  this.importMeshUploadButton.addEventListener('click', (e) => me.uploadMesh(), false);
};
scenebuilder.uploadMesh = function() {
  let me = this;
  let file = me.meshUploadFileDom.files[0];
  let objId = me.meshObjIdUpload.value.trim();
  if (!objId) {
    alert('Need an id to import');
    return;
  }
  me.meshUploadDialogClose.style.display = 'none';
  me.importMeshUploadButton.style.display = 'none';
  me.importMeshDialogProgress.style.display = '';
  fireUtil.meshesFireSet.fileToURL(file).then(function(fileData) {
    babyUtil.serializeMesh(objId, "", "data:" + fileData).then(function(meshJSON) {
      fireUtil.newMesh(JSON.stringify(meshJSON), objId).then(function(result) {
        me.meshObjIdUpload.value = '';
        me.meshUploadFileDom.value = '';
        me.meshUploadDialogClose.style.display = '';
        me.importMeshUploadButton.style.display = '';
        me.importMeshDialogProgress.style.display = 'none';
        me.meshUploadDialog.close();
      });
    });
  });
};
scenebuilder.uploadTexture = function() {
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
  fireUtil.newTexture(file, title).then(function(result) {
    me.textureUploadTitle.value = '';
    me.textureUploadFile.value = '';
    me.textureUploadClose.style.display = '';
    me.textureUploadImport.style.display = '';
    me.textureUploadProgress.style.display = 'none';
    me.textureUploadDialog.close();
  });
};
scenebuilder.initTextureUpload = function() {
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
};
scenebuilder.toggleBar = function(button, bar) {
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
};
scenebuilder.uploadMaterial = function() {

};
scenebuilder.initMaterialUpload = function() {
  let me = this;
  
};
