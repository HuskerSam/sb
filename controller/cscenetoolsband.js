/* button bar controller for canvas/scene */
class cSceneToolsBand {
  constructor(classPrefix, sceneController) {
    let me = this;
    this.sC = sceneController;
    this.expanded = false;
    this.classPrefix = classPrefix;

    this.container = document.createElement('div');
    this.container.setAttribute('class', 'scene-tools-band-container sb-floating-toolbar-item');
    this.sC.canvas.parentNode.appendChild(this.container);

    this.collapseButton = document.createElement('button');
    this.collapseButton.innerHTML = '<i class="material-icons">menu</i>';
    this.collapseButton.setAttribute('class', 'btn btn-primary-outline');
    this.collapseButton.addEventListener('click', e => me.toggle(), false);
    this.container.appendChild(this.collapseButton);

    this.innerContainer = document.createElement('div');
    this.innerContainer.setAttribute('class', 'sb-floating-toolbar-content');
    this.container.appendChild(this.innerContainer);

    this.fields = sStatic.bindingFieldsCloned('sceneToolsBar');
    this.fieldsContainer = document.createElement('div');
    this.fieldsContainer.setAttribute('class', 'fields-container');
    this.innerContainer.appendChild(this.fieldsContainer);
    this.classPrefix = classPrefix;
    let domClassPrefix = this.classPrefix + '-scene-tools-band-fields-';
    this.fireSet = gAPPP.a.modelSets['userProfile'];
    this.fireFields = new cBoundFields(this.fields, domClassPrefix, this.fieldsContainer, this);
    this.fireSet.childListeners.push((values, type, fireData) =>
      me.fireFields._handleDataChange(values, type, fireData));
  }
  _addButton(btn) {
    this.buttonContainer.appendChild(btn);
    this.buttonContainer.appendChild(document.createElement('br'));
  }
  toggle() {
    if (this.expanded) {
      this.expanded = false;
      this.innerContainer.style.display = 'none';
      this.collapseButton.style.background = '';
      this.container.style.display = 'inline-block';
      this.container.style.width = '';
    } else {
      this.expanded = true;
      this.innerContainer.style.display = 'block';
      this.collapseButton.style.background = 'rgba(0,0,0,.2)';
      this.container.style.display = 'flex';
      this.container.style.width = '100%';
    }
  }
  _showGrid() {
    if (this.gridShown) {
      this.showSceneFloorGridBtn.style.background = 'rgba(0,0,0,.2)';
      this.sC.showGrid();
    } else {
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
      me.gridShown = !me.gridShown;
      me._showGrid();
    }, false);
    this.showSceneFloorGridBtn.innerHTML = 'Grid';
    this._addButton(this.showSceneFloorGridBtn);
  }
}
