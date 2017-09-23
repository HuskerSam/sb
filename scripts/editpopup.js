var editpopup = {};
editpopup.init = function() {
  this.uiHelper = new UIHelper();
  this.initEditMesh();
};
editpopup.initEditMesh = function() {
  let me = this;

  this.meshEditBabyHelper = new BabylonHelper('meshDetailCanvas');
  this.meshCanvas = document.getElementById('meshDetailCanvas');
  this.meshEditScene = this.meshEditBabyHelper.createDefaultScene();
  this.meshEditBabyHelper.setScene(this.meshEditScene);
  this.meshObject = {};
  this.meshData = {};
  this.basePath = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';

  window.Split(['#mesh-detail-wrapper', '#meshes-details-tabs'], {
    minSize: [100, 100],
    direction: 'vertical'
  });

  this.meshDetailFields = [{
    fireSetField: 'title',
    domQuerySelector: '#mesh-details-title',
    babylonMeshField: null
  }, {
    fireSetField: 'simpleUIDetails.scaleX',
    domQuerySelector: '#mesh-details-scale-x',
    babylonMeshField: 'scaling.x'
  }, {
    fireSetField: 'simpleUIDetails.scaleY',
    domQuerySelector: '#mesh-details-scale-y',
    babylonMeshField: 'scaling.y'
  }, {
    fireSetField: 'simpleUIDetails.scaleZ',
    domQuerySelector: '#mesh-details-scale-z',
    babylonMeshField: 'scaling.z'
  }, {
    fireSetField: 'simpleUIDetails.positionX',
    domQuerySelector: '#mesh-details-pos-x',
    babylonMeshField: 'position.x'
  }, {
    fireSetField: 'simpleUIDetails.positionY',
    domQuerySelector: '#mesh-details-pos-y',
    babylonMeshField: 'position.y'
  }, {
    fireSetField: 'simpleUIDetails.positionZ',
    domQuerySelector: '#mesh-details-pos-z',
    babylonMeshField: 'position.z'
  }, {
    fireSetField: 'simpleUIDetails.rotateX',
    domQuerySelector: '#mesh-details-rotate-x',
    babylonMeshField: 'rotation.x'
  }, {
    fireSetField: 'simpleUIDetails.rotateY',
    domQuerySelector: '#mesh-details-rotate-y',
    babylonMeshField: 'rotation.y'
  }, {
    fireSetField: 'simpleUIDetails.rotateZ',
    domQuerySelector: '#mesh-details-rotate-z',
    babylonMeshField: 'rotation.z'
  }];

  for (let i in this.meshDetailFields) {
    let d = this.meshDetailFields[i];
    if (d.domQuerySelector) {
      d.domElement = document.querySelector(d.domQuerySelector);
      d.domElement.addEventListener('change', this.meshDetailsChange, false);
    }
  }

  this.detailTabButton = document.getElementById('mesh-detail-tab-button');
  this.jsonTabButton = document.getElementById('mesh-json-tab-button');
  this.babyTabButton = document.getElementById('mesh-babylon-tab-button');
  this.meshDetailsDialog = document.getElementById('mesh-details-dialog');
  this.meshDetailEditor = this.uiHelper.editor("mesh-details-json");
  this.babyDetailEditor = this.uiHelper.editor("mesh-babylon-json");
  this.meshDialogButtonBar = document.querySelector('#mesh-dialog-button-bar');
  this.meshDetailsSave = this.meshDialogButtonBar.querySelector('.save-details');
  this.meshDetailsClose = this.meshDialogButtonBar.querySelector('.close-details');
  this.meshDetailsApply = this.meshDialogButtonBar.querySelector('.apply-details');
  this.meshesSimpleFields = document.getElementById('mesh-details-panel-fields');
  this.meshDetailsProgressBar = document.getElementById('mesh-apply-progress');

  if (!this.meshDetailsDialog.showModal) {
    dialogPolyfill.registerDialog(this.meshDetailsDialog);
  }

  this.meshDetailsClose.addEventListener('click', () => me.meshDetailsDialog.close());
  this.meshDetailsApply.addEventListener('click', () => me.meshEditorCommit());

  this.detailTabButton.addEventListener('click', (e) => me.showMeshEditorTab('mesh-details-panel'), false);
  this.jsonTabButton.addEventListener('click', (e) => me.showMeshEditorTab('mesh-json-panel'), false);
  this.babyTabButton.addEventListener('click', (e) => me.showMeshEditorTab('mesh-babylon-panel'), false);
};

editpopup.showEditMesh = function(firebaseMeshData) {
  let me = this;
  this.meshesSimpleFields.style.display = 'none';
  this.meshDialogButtonBar.style.display = 'none';
  this.meshDetailsProgressBar.style.display = '';
  this.meshEditScene = this.meshEditBabyHelper.createDefaultScene();
  this.meshEditBabyHelper.setScene(this.meshEditScene);

  this.meshId = firebaseMeshData.key;
  this.meshData = firebaseMeshData.val();

  this.meshEditBabyHelper.loadMesh(this.meshData.meshName, this.basePath,
    this.meshData.url.replace(this.basePath, ''),
    this.meshEditScene).then(function(m) {
    me.meshObject = m;
    let s = me.uiHelper.stringify(m);
    me.babyDetailEditor.setValue(s);
    me.uiHelper.beautify(me.babyDetailEditor);
    me.loadMeshUIFields();
    me.meshesSimpleFields.style.display = '';
    me.meshDialogButtonBar.style.display = '';
    me.meshDetailsProgressBar.style.display = 'none';
  });
  this.meshDetailsDialog.showModal();
  this.meshDetailEditor.setValue(JSON.stringify(this.meshData));
  this.uiHelper.beautify(me.meshDetailEditor);

  this.meshEditBabyHelper.engine.resize();
  this.detailTabButton.click();
};
editpopup.showMeshEditorTab = function(divId) {
  document.getElementById('mesh-details-panel').style.display = 'none';
  document.getElementById('mesh-json-panel').style.display = 'none';
  document.getElementById('mesh-babylon-panel').style.display = 'none';

  document.getElementById(divId).style.display = '';
};
editpopup.meshEditorCommit = function() {
  this.meshDialogButtonBar.style.display = 'none';
  this.meshDetailsProgressBar.style.display = '';
  var me = this;
  me.scrapeMeshData();
  var meshJSON = BABYLON.SceneSerializer.Serialize(me.meshEditScene);
  let fireSet = fireUtil.meshesFireSet;
  fireSet.setString(me.meshId, JSON.stringify(meshJSON), 'file.babylon').then(function(uploadResult) {
    me.meshData.url = uploadResult.downloadURL;
    fireSet.set(me.meshId, me.meshData).then(function(dataResult) {
      me.meshDialogButtonBar.style.display = '';
      me.meshDetailsProgressBar.style.display = 'none';
    });
  }).catch(function(error) {
    console.log(error);
  });
};
editpopup.meshDetailsChange = function(e) {
  //  editpopup.meshObject.rotate(BABYLON.Axis.X,30, BABYLON.Space.LOCAL)
  editpopup.scrapeMeshData();
};
editpopup.scrapeMeshData = function() {
  for (let i in this.meshDetailFields) {
    let d = this.meshDetailFields[i];
    if (d.domQuerySelector) {
      let v = d.domElement.value;
      if (d.babylonMeshField)
        this.uiHelper.index(this.meshObject, d.babylonMeshField, v);
      if (d.fireSetField)
        this.uiHelper.index(this.meshData, d.fireSetField, v);
    }
  }
};
editpopup.loadMeshUIFields = function() {
  for (let i in this.meshDetailFields) {
    let d = this.meshDetailFields[i];
    if (d.domElement)
      d.domElement.value = this.uiHelper.index(this.meshData, d.fireSetField);
  }

  var mdlInputs = document.querySelectorAll('.mdl-js-textfield');
  for (var i = 0, l = mdlInputs.length; i < l; i++) {
    mdlInputs[i].MaterialTextfield.checkDirty();
  }
};
