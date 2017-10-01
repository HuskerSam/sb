/* button bar controller for canvas/scene */
class ctlSceneToolsBand {
  constructor(canvas, sceneController) {
    let me = this;
    this.sC = sceneController;
    this.canvas = canvas;
    this.expanded = false;

    this.container = document.createElement('div');
    this.container.setAttribute('class', 'scene-tools-band-container');
    this.canvas.parentNode.appendChild(this.container);

    this.collapseButton = document.createElement('button');
    this.collapseButton.innerHTML = '<i class="material-icons">settings</i>';
    this.collapseButton.setAttribute('class', 'btn btn-primary-outline');
    this.collapseButton.addEventListener('click', e => me.toggle(), false);
    this.container.appendChild(this.collapseButton);
    this.container.appendChild(document.createElement('br'));

    this.buttonContainer = document.createElement('div');
    this.buttonContainer.setAttribute('class', 'button-container');
    this.buttonContainer.style.display = 'none';
    this.container.appendChild(this.buttonContainer);

    this.addShowSceneFloorGrid();
    this.addShowSceneRawButton();
  }
  _addButton(btn) {
    this.buttonContainer.appendChild(btn);
    this.buttonContainer.appendChild(document.createElement('br'));
  }
  toggle() {
    if (this.expanded) {
      this.expanded = false;
      this.buttonContainer.style.display = 'none';
      this.collapseButton.style.background = '';
    } else {
      this.expanded = true;
      this.buttonContainer.style.display = 'block';
      this.collapseButton.style.background = 'rgba(0,0,0,.2)';
    }
  }
  addShowSceneRawButton() {
    this.showSceneRawBtn = document.createElement('button');
    this.showSceneRawBtn.setAttribute('class', 'btn btn-primary-outline');
    this.showSceneRawBtn.addEventListener('click', () => {
        //let json = gAPPP.u.stringify(this.uiObject);
        let json = '{}';
        gAPPP.dialogs['ace-editor-popup'].showAce(json);
    }, false);
    this.showSceneRawBtn.innerHTML = 'Raw';
    this._addButton(this.showSceneRawBtn);
  }
  _showGrid() {
    if (this.gridShown) {
      this.showSceneFloorGridBtn.style.background = 'rgba(0,0,0,.2)';
      this.sC.showGrid();
    }
    else {
      this.showSceneFloorGridBtn.style.background = '';
      this.sC.showGrid(true);
    }
  }
  addShowSceneFloorGrid() {
    let me = this;
    this.gridShown = false;
    this.showSceneFloorGridBtn = document.createElement('button');
    this.showSceneFloorGridBtn.setAttribute('class', 'btn btn-primary-outline');
    this.showSceneFloorGridBtn.addEventListener('click', () => {
      me.gridShown = ! me.gridShown;
      me._showGrid();
    }, false);
    this.showSceneFloorGridBtn.innerHTML = 'Grid';
    this._addButton(this.showSceneFloorGridBtn);
  }
}
