var meshespopup = {};

meshespopup.init = function() {
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

  this.tabHeight = 200;
  this.tabRotate = false;

  this.setTabDragLimits();
  this.dragButton.addEventListener('mousedown', this.resizeMouseDown, false);
  this.rotateButton.addEventListener('click', this.rotateTab);
  window.addEventListener('resize', this.setTabDragLimits, false);
};
meshespopup.rotateTab = function(e) {
  if (meshespopup.tabRotate) {
    meshespopup.portraitLowerRow.style.display = '';
    meshespopup.portraitUpperRow.style.display = '';
    meshespopup.landscapeRow.style.display = 'none';
    meshespopup.portraitLowerCell.appendChild(meshespopup.detailsContainer);
    meshespopup.portraitUpperCell.appendChild(meshespopup.meshCanvas);
    meshespopup.tabRotate = false;
  } else {
    meshespopup.tabRotate = true;
    meshespopup.portraitLowerRow.style.display = 'none';
    meshespopup.portraitUpperRow.style.display = 'none';
    meshespopup.landscapeRow.style.display = '';

    meshespopup.landscapeLeftCell.appendChild(meshespopup.meshCanvas);
    meshespopup.landscapeRightCell.appendChild(meshespopup.detailsContainer);
  }
};
meshespopup.setTabDragLimits = function() {
  meshespopup.tabHeightMax = window.innerHeight - 300;
  meshespopup.tabHeightMin = 100;
};
meshespopup.resizeMouseDown = function(e) {
  meshespopup.dragButtonStartY = e.clientY;
  window.addEventListener('mousemove', meshespopup.resizeMouseMove, false);
  window.addEventListener('mouseup', meshespopup.resizeMouseUp, false);
};
meshespopup.resizeMouseMove = function(e) {
  meshespopup.tabHeight = meshespopup.tabHeight + (meshespopup.dragButtonStartY - e.clientY);
  meshespopup.dragButtonStartY = e.clientY;
  if (meshespopup.tabHeight > meshespopup.tabHeightMax)
    meshespopup.tabHeight = meshespopup.tabHeightMax;
  if (meshespopup.tabHeight < meshespopup.tabHeightMin)
    meshespopup.tabHeight = meshespopup.tabHeightMin;
  meshespopup.meshesTab.style.height = meshespopup.tabHeight + 'px';
};
meshespopup.resizeMouseUp = function(e) {
  window.removeEventListener('mousemove', meshespopup.resizeMouseMove, false);
  window.removeEventListener('mouseup', meshespopup.resizeMouseUp, false);
};
