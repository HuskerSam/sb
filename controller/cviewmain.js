class cViewMain {
  constructor() {
    this.dialog = document.querySelector('#main-page');

    let canvasTemplate = document.getElementById('canvas-d3-player-template').innerHTML;
    this.dialog.querySelector('.popup-canvas-wrapper').innerHTML = canvasTemplate;

    this.canvas = this.dialog.querySelector('.popup-canvas');
    this.context = new wContext(this.canvas, true);
    this.context.activate(null);

    this.canvasActions = this.dialog.querySelector('.canvas-actions');
    this.canvasActions.style.display = '';

    this.key = null;
    this.loadedSceneURL = '';
    gAPPP.a.modelSets['project'].childListeners.push((values, type, fireData) => this.updateProjectList(values, type, fireData));
    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());

    gAPPP.a.modelSets['blockchild'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('blockchild', values, type, fireData));
    gAPPP.a.modelSets['block'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('block', values, type, fireData));
    gAPPP.a.modelSets['mesh'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('mesh', values, type, fireData));
    gAPPP.a.modelSets['shape'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('shape', values, type, fireData));
    gAPPP.a.modelSets['material'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('material', values, type, fireData));
    gAPPP.a.modelSets['texture'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('texture', values, type, fireData));
    gAPPP.a.modelSets['frame'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('frame', values, type, fireData));

    this.canvasHelper = new cPanelCanvas(this);
    this.context.canvasHelper = this.canvasHelper;
    this.canvasHelper.hide();
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.rootBlock) {
      this.rootBlock.handleDataUpdate(tag, values, type, fireData);
    }
  }
  _updateSelectedBlock(profileKey) {
    if (gAPPP.activeContext !== this.context)
      return;

    if (!profileKey){
      return;
    }

    if (this.key !== profileKey) {
      this.context.activate(null);
      this.canvasHelper.hide();
      setTimeout(() => {
        let blockData = gAPPP.a.modelSets['block'].getCache(profileKey);
        if (blockData) {
          let b = new wBlock(this.context);
          b.staticType = 'block';
          b.staticLoad = true;
          b.blockKey = profileKey;
          b.isContainer = true;
          b.setData(blockData);
          this.context.setActiveBlock(b);
          this.rootBlock = b;
          this.key = profileKey;
          this.rootBlock.setData();
          setTimeout(() => {
            this.canvasHelper.show();
          }, 300);
        } else {
          this.key = '';
          this.canvasHelper.show();
        }
      }, 10);
    }
  }
  updateProjectList(values, type, fireData) {
    let records = gAPPP.a.modelSets['project'].fireDataValuesByKey;
    let html = '';

    for (let i in records)
      html += `<option value=${i}>${records[i].title}</option>`;
    this.workplacesSelect.innerHTML = html;
    this.workplacesSelect.value = gAPPP.a.profile.selectedWorkspace;
  }
  selectProject() {
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'selectedWorkspace',
      newValue: gAPPP.mV.workplacesSelect.value
    }]);
    setTimeout(() => location.reload(), 100);
  }
}
