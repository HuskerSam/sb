var meshespopup = {};
meshespopup.init = function() {
  var me = this;
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
  this.meshCanvas = document.getElementById('meshDetailCanvas');
  this.detailsContainer = document.getElementById('details-content-div');
  this.babyHelper = new BabylonHelper('meshDetailCanvas');
  this.scene = this.babyHelper.createDefaultScene();
  this.babyHelper.setScene(this.scene);

  this.detailTabButton = document.getElementById('mesh-detail-tab-button');
  this.jsonTabButton = document.getElementById('mesh-json-tab-button');
  this.babyTabButton = document.getElementById('mesh-babylon-tab-button');
  this.meshDetailsDialog = document.getElementById('mesh-details-dialog');
  this.meshDetailEditor = ace.edit("mesh-details-json");
  this.meshDetailsSave = document.querySelector('.save-details');
  this.meshDetailsClose = document.querySelector('.close-details');
  this.meshData = {};
  this.basePath = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
  this.setEditorOptions(this.meshDetailEditor);

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


  this.meshDetailsClose.addEventListener('click', function() {
    me.meshDetailsDialog.close();
  });

  this.meshDetailsSave.addEventListener('click', function() {


    me.meshDetailsDialog.close();
  });
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
  this.meshData = meshData.val();
  this.babyHelper.loadMesh(this.meshData.title, this.basePath,
    this.meshData.url.replace(this.basePath, ''),
    this.scene).then(function (m) {

    });
  this.meshDetailsDialog.showModal();
  this.babyHelper.engine.resize();
};
meshespopup.setEditorOptions = function(e) {
  e.setTheme("ace/theme/textmate");
  e.getSession().setMode("ace/mode/json");
  e.setOptions({
    fontFamily: '"Lucida Console",Monaco,monospace',
    fontSize: '9pt'
  });
};
