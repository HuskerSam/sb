var meshespopup = {};


meshespopup.init = function() {
  this.dragButton = document.getElementById('drag-tab-height');
  this.meshesTab = document.getElementById('meshes-details-tabs');
  this.tabHeight = 200;

  this.setTabDragLimits();
  this.dragButton.addEventListener('mousedown', this.resizeMouseDown, false);
  window.addEventListener('resize', this.setTabDragLimits, false);
};
meshespopup.setTabDragLimits = function() {
  meshespopup.tabHeightMax = window.innerHeight - 300;
  meshespopup.tabHeightMin = 150;
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
