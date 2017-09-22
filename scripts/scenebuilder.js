var scenebuilder = {};

scenebuilder.init = function() {
  let me = this;
  this.meshesCollapseButton = document.getElementById('collapse-meshes');
  this.meshesCollapsePanel = document.getElementById('meshes-content');
  this.skinsCollapseButton = document.getElementById('collapse-skins');
  this.skinsCollapsePanel = document.getElementById('skins-content');

  this.initMeshUpload();
  this.meshesCollapseButton.addEventListener('click',
    (e) => me.toggleBar(me.meshesCollapseButton, me.meshesCollapsePanel), false);

  this.skinsCollapseButton.addEventListener('click',
    (e) => me.toggleBar(me.skinsCollapseButton, me.skinsCollapsePanel), false);
};
scenebuilder.initMeshUpload = function() {
  let me = this;
  this.showMeshUploadDialog = document.getElementById('mesh-upload-button');
  this.meshUploadDialog = document.getElementById('mesh-upload-dialog');
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
  babyUtil.fileToURL(file).then(function(fileData) {
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
