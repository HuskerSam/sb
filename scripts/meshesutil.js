var meshes = {};

meshes.init = function() {
  this.dialog = document.getElementById('model-upload-dialog');
  this.meshDetailsDialog = document.getElementById('mesh-details-dialog');
  this.objIdUpload = document.getElementById('object-id');
  this.fileUpload = document.getElementById('model-upload-file');
  this.dialogCloseUpload = this.dialog.querySelector('.close');
  this.dialogShowButton = document.getElementById('upload-button');
  this.dialogUploadButton = this.dialog.querySelector('.import');
  this.dialogProgress = document.getElementById('model-upload-progress');
  this.meshDetailEditor = ace.edit("mesh-details-json");
  this.meshDetailsSave = document.querySelector('.save-details');
  this.meshDetailsClose = document.querySelector('.close-details');

  var me = this;
  if (!this.dialog.showModal) {
    dialogPolyfill.registerDialog(this.dialog);
  }
  if (!this.meshDetailsDialog.showModal) {
    dialogPolyfill.registerDialog(this.meshDetailsDialog);
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
  this.meshDetailsClose.addEventListener('click', function() {
    me.meshDetailsDialog.close();
  });
  this.meshDetailsSave.addEventListener('click', function() {


    me.meshDetailsDialog.close();
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
        fireUtil.uploadModel(JSON.stringify(meshJSON), objId).then(function(result) {
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

  this.setEditorOptions(this.meshDetailEditor);
};
meshes.showDetailsPopup = function(data) {
  this.meshDetailsDialog.showModal();
};
meshes.setEditorOptions = function(e) {
  e.setTheme("ace/theme/textmate");
  e.getSession().setMode("ace/mode/json");
  e.setOptions({
    fontFamily: '"Lucida Console",Monaco,monospace',
    fontSize: '9pt'
  });
};
