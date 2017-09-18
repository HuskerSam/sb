var meshespopup = {};
meshespopup.init = function() {
  let me = this;

  this.uiHelper = new UIHelper();
  this.babyHelper = new BabylonHelper('meshDetailCanvas');
  this.meshCanvas = document.getElementById('meshDetailCanvas');
  this.scene = this.babyHelper.createDefaultScene();
  this.babyHelper.setScene(this.scene);

  this.dragButton = document.getElementById('drag-tab-height');
  this.meshesTab = document.getElementById('meshes-details-tabs');
  this.rotateButton = document.getElementById('drag-tab-rotate');
  this.portraitUpperRow = document.getElementById('portrait-upper-row');
  this.portraitLowerRow = document.getElementById('portrait-lower-row');
  this.portraitUpperCell = document.getElementById('portrait-upper-cell');
  this.portraitLowerCell = document.getElementById('portrait-lower-cell');
  this.landscapeRow = document.getElementById('landscape-row');
  this.landscapeLeftCell = document.getElementById('landscape-left-cell');
  this.landscapeRightCell = document.getElementById('landscape-right-cell');
  this.detailsContainer = document.getElementById('details-content-div');
  this.meshDetailsScaleX = document.getElementById('mesh-details-scale-x');
  this.meshDetailsScaleY = document.getElementById('mesh-details-scale-y');
  this.meshDetailsScaleZ = document.getElementById('mesh-details-scale-z');
  this.meshDetailsPosX = document.getElementById('mesh-details-pos-x');
  this.meshDetailsPosY = document.getElementById('mesh-details-pos-y');
  this.meshDetailsPosZ = document.getElementById('mesh-details-pos-z');
  this.meshDetailsRotateX = document.getElementById('mesh-details-rotate-x');
  this.meshDetailsRotateY = document.getElementById('mesh-details-rotate-y');
  this.meshDetailsRotateZ = document.getElementById('mesh-details-rotate-z');
  this.meshObject = {};

  this.detailTabButton = document.getElementById('mesh-detail-tab-button');
  this.jsonTabButton = document.getElementById('mesh-json-tab-button');
  this.babyTabButton = document.getElementById('mesh-babylon-tab-button');
  this.meshDetailsDialog = document.getElementById('mesh-details-dialog');
  this.meshDetailEditor = this.uiHelper.editor("mesh-details-json");
  this.babyDetailEditor = this.uiHelper.editor("mesh-babylon-json");
  this.meshDetailsSave = document.querySelector('.save-details');
  this.meshDetailsClose = document.querySelector('.close-details');
  this.meshDetailsApply = document.querySelector('.apply-details');
  this.meshData = {};
  this.basePath = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';

  this.tabHeight = 200;
  this.tabWidth = 200;
  this.tabRotate = false;

  if (!this.meshDetailsDialog.showModal) {
    dialogPolyfill.registerDialog(this.meshDetailsDialog);
  }

  this.setTabDragLimits();
  this.dragButton.addEventListener('mousedown', this.resizeMouseDown, false);
  this.rotateButton.addEventListener('click', this.rotateTab);
  window.addEventListener('resize', this.setTabDragLimits, false);


  this.meshDetailsClose.addEventListener('click', () => me.meshDetailsDialog.close());
  this.meshDetailsSave.addEventListener('click', () => me.meshDetailsDialog.close());
  this.meshDetailsApply.addEventListener('click', () => me.commit());

  this.meshDetailsScaleX.addEventListener('change', this.meshDetailsChange, false);
  this.meshDetailsScaleY.addEventListener('change', this.meshDetailsChange, false);
  this.meshDetailsScaleZ.addEventListener('change', this.meshDetailsChange, false);

  this.meshDetailsPosX.addEventListener('change', this.meshDetailsChange, false);
  this.meshDetailsPosY.addEventListener('change', this.meshDetailsChange, false);
  this.meshDetailsPosZ.addEventListener('change', this.meshDetailsChange, false);

  this.meshDetailsRotateX.addEventListener('change', this.meshDetailsChange, false);
  this.meshDetailsRotateY.addEventListener('change', this.meshDetailsChange, false);
  this.meshDetailsRotateZ.addEventListener('change', this.meshDetailsChange, false);
};
meshespopup.commit = function() {

};
meshespopup.meshDetailsChange = function(e) {
  meshespopup.meshObject.scaling.y = meshespopup.meshDetailsScaleY.value;
  meshespopup.meshObject.scaling.z = meshespopup.meshDetailsScaleZ.value;

  meshespopup.meshObject.position.x = meshespopup.meshDetailsPosX.value;
  meshespopup.meshObject.position.y = meshespopup.meshDetailsPosY.value;
  meshespopup.meshObject.position.z = meshespopup.meshDetailsPosZ.value;

  if (meshespopup.meshDetailsScaleX.value != this.meshData.simpleUIDetails.scaleX) {
    this.meshData.simpleUIDetails.scaleX = meshespopup.meshDetailsScaleX.value;
    meshespopup.meshObject.scaling.x = meshespopup.meshDetailsScaleX.value;
  }
  if (meshespopup.meshDetailsScaleY.value != this.meshData.simpleUIDetails.scaleY) {
    this.meshData.simpleUIDetails.scaleY = meshespopup.meshDetailsScaleY.value;
    meshespopup.meshObject.scaling.y = meshespopup.meshDetailsScaleY.value;
  }
  if (meshespopup.meshDetailsScaleZ.value != this.meshData.simpleUIDetails.scaleZ) {
    this.meshData.simpleUIDetails.scaleZ = meshespopup.meshDetailsScaleZ.value;
    meshespopup.meshObject.scaling.z = meshespopup.meshDetailsScaleZ.value;
  }

  //meshespopup.meshDetailsPosX.value = this.meshData.simpleUIDetails.positionX;
  //meshespopup.meshDetailsPosY.value = this.meshData.simpleUIDetails.positionY;
  //meshespopup.meshDetailsPosZ.value = this.meshData.simpleUIDetails.positionZ;

  //  meshespopup.meshDetailsRotateX.value = this.meshData.simpleUIDetails.rotateX;
  //  meshespopup.meshDetailsRotateY.value = this.meshData.simpleUIDetails.rotateY;
  //  meshespopup.meshDetailsRotateZ.value = this.meshData.simpleUIDetails.rotateZ;

  //  meshespopup.meshObject.rotate(BABYLON.Axis.X, meshespopup.meshDetailsRotateX.value, BABYLON.Space.LOCAL);
  //  meshespopup.meshObject.rotate.x = meshespopup.meshDetailsRotateX.value;
  //  meshespopup.meshObject.rotate.y = meshespopup.meshDetailsRotateY.value;
  //  meshespopup.meshObject.rotate.z = meshespopup.meshDetailsRotateZ.value;
};
meshespopup.rotateTab = function(e) {
  if (meshespopup.tabRotate) {
    meshespopup.portraitLowerRow.style.display = '';
    meshespopup.portraitUpperRow.style.display = '';
    meshespopup.landscapeRow.style.display = 'none';
    meshespopup.portraitLowerCell.appendChild(meshespopup.detailsContainer);
    meshespopup.portraitUpperCell.appendChild(meshespopup.meshCanvas);
    meshespopup.tabRotate = false;

    meshespopup.detailTabButton.innerHTML = 'Detail';
    meshespopup.jsonTabButton.innerHTML = 'JSON';
    meshespopup.babyTabButton.innerHTML = 'Babylon';
  } else {
    meshespopup.tabRotate = true;
    meshespopup.portraitLowerRow.style.display = 'none';
    meshespopup.portraitUpperRow.style.display = 'none';
    meshespopup.landscapeRow.style.display = '';

    meshespopup.landscapeLeftCell.appendChild(meshespopup.meshCanvas);
    meshespopup.landscapeRightCell.appendChild(meshespopup.detailsContainer);

    meshespopup.detailTabButton.innerHTML = 'D';
    meshespopup.jsonTabButton.innerHTML = 'J';
    meshespopup.babyTabButton.innerHTML = 'B';
  }
};
meshespopup.setTabDragLimits = function() {
  meshespopup.tabHeightMax = window.innerHeight - 300;
  meshespopup.tabHeightMin = 100;
  meshespopup.tabWidthMax = window.innerWidth - 300;
  meshespopup.tabWidthMin = 50;
};
meshespopup.resizeMouseDown = function(e) {
  meshespopup.dragButtonStartY = e.clientY;
  meshespopup.dragButtonStartX = e.clientX;

  window.addEventListener('mousemove', meshespopup.resizeMouseMove, false);
  window.addEventListener('mouseup', meshespopup.resizeMouseUp, false);
};
meshespopup.resizeMouseMove = function(e) {
  if (meshespopup.tabRotate) {
    meshespopup.tabWidth = meshespopup.tabWidth + (meshespopup.dragButtonStartX - e.clientX);
    meshespopup.dragButtonStartX = e.clientX;
    if (meshespopup.tabWidth > meshespopup.tabWidthMax)
      meshespopup.tabWidth = meshespopup.tabWidthMax;
    if (meshespopup.tabWidth < meshespopup.tabWidthMin)
      meshespopup.tabWidth = meshespopup.tabWidthMin;
    meshespopup.meshesTab.style.width = meshespopup.tabWidth + 'px';
  } else {
    meshespopup.tabHeight = meshespopup.tabHeight + (meshespopup.dragButtonStartY - e.clientY);
    meshespopup.dragButtonStartY = e.clientY;
    if (meshespopup.tabHeight > meshespopup.tabHeightMax)
      meshespopup.tabHeight = meshespopup.tabHeightMax;
    if (meshespopup.tabHeight < meshespopup.tabHeightMin)
      meshespopup.tabHeight = meshespopup.tabHeightMin;
    meshespopup.meshesTab.style.height = meshespopup.tabHeight + 'px';
  }
};
meshespopup.resizeMouseUp = function(e) {
  window.removeEventListener('mousemove', meshespopup.resizeMouseMove, false);
  window.removeEventListener('mouseup', meshespopup.resizeMouseUp, false);
};
meshespopup.show = function(meshData) {
  let me = this;
  this.meshData = meshData.val();
  this.babyHelper.loadMesh(this.meshData.title, this.basePath,
    this.meshData.url.replace(this.basePath, ''),
    this.scene).then(function(m) {
    me.meshObject = m;
    let s = me.uiHelper.stringify(m);
    me.babyDetailEditor.setValue(s);
    me.uiHelper.beautify(me.babyDetailEditor);
    me.loadUIData();
  });
  this.meshDetailsDialog.showModal();
  this.meshDetailEditor.setValue(JSON.stringify(this.meshData));
  this.uiHelper.beautify(me.meshDetailEditor);

  this.babyHelper.engine.resize();
  this.detailTabButton.click();
};
meshespopup.loadUIData = function() {
  meshespopup.meshDetailsScaleX.value = this.meshData.simpleUIDetails.scaleX;
  meshespopup.meshDetailsScaleY.value = this.meshData.simpleUIDetails.scaleY;
  meshespopup.meshDetailsScaleZ.value = this.meshData.simpleUIDetails.scaleZ;

  meshespopup.meshDetailsPosX.value = this.meshData.simpleUIDetails.positionX;
  meshespopup.meshDetailsPosY.value = this.meshData.simpleUIDetails.positionY;
  meshespopup.meshDetailsPosZ.value = this.meshData.simpleUIDetails.positionZ;

  meshespopup.meshDetailsRotateX.value = this.meshData.simpleUIDetails.rotateX;
  meshespopup.meshDetailsRotateY.value = this.meshData.simpleUIDetails.rotateY;
  meshespopup.meshDetailsRotateZ.value = this.meshData.simpleUIDetails.rotateZ;
};
