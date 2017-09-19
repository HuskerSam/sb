var meshes = {};

var defaultMeshData = {
  title: 'Mesh',
  meshName: '',
  url: '',
  type: 'url',
  size: 0,
  simpleUIDetails : {
    scaleX: 1.0,
    scaleY: 1.0,
    scaleZ: 1.0,
    positionX: 0.0,
    positionY: 0.0,
    positionZ: 0.0,
    rotateX: 0.0,
    rotateY: 0.0,
    rotateZ: 0.0
  }
};

meshes.init = function() {
  this.dialog = document.getElementById('model-upload-dialog');
  this.objIdUpload = document.getElementById('object-id');
  this.fileUpload = document.getElementById('model-upload-file');
  this.dialogCloseUpload = this.dialog.querySelector('.close');
  this.dialogShowButton = document.getElementById('upload-button');
  this.dialogUploadButton = this.dialog.querySelector('.import');
  this.dialogProgress = document.getElementById('model-upload-progress');

  var me = this;
  if (!this.dialog.showModal) {
    dialogPolyfill.registerDialog(this.dialog);
  }
  this.dialogShowButton.addEventListener('click', function() {
    me.dialogCloseUpload.style.display = '';
    me.dialogUploadButton.style.display = '';
    me.dialogProgress.style.display = 'none';
    me.dialog.showModal();
  });
  this.dialogCloseUpload.addEventListener('click', function() {
    me.dialog.close();
  });
  this.dialogUploadButton.addEventListener('click', function() {
    var file = me.fileUpload.files[0];
    var objId = me.objIdUpload.value.trim();
    if (!objId) {
      alert('Need an id to import');
      return;
    }
    me.dialogCloseUpload.style.display = 'none';
    me.dialogUploadButton.style.display = 'none';
    me.dialogProgress.style.display = '';
    babyUtil.fileToURL(file).then(function(fileData) {
      babyUtil.serializeMesh(objId, "", "data:" + fileData).then(function(meshJSON) {
        fireUtil.newModel(JSON.stringify(meshJSON), objId).then(function(result) {
          me.objIdUpload.value = '';
          me.fileUpload.value = '';
          me.dialogCloseUpload.style.display = '';
          me.dialogUploadButton.style.display = '';
          me.dialogProgress.style.display = 'none';
          me.dialog.close();
        });
      });
    });
  });
};
