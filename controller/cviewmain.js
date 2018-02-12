class cViewMain {
  constructor() {
    this.dialog = document.querySelector('#main-page');
    this.dialogs = {};
    this.dialogs['mesh-edit'] = new cDialogEdit('mesh', 'Mesh Options');
    this.dialogs['shape-edit'] = new cDialogEdit('shape', 'Shape Editor');
    this.dialogs['block-edit'] = new cDialogBlock();
    this.dialogs['material-edit'] = new cDialogEdit('material', 'Material Editor');
    this.dialogs['texture-edit'] = new cDialogEdit('texture', 'Texture Options');

    let canvasTemplate = document.getElementById('canvas-d3-player-template').innerHTML;
    this.dialog.querySelector('.popup-canvas-wrapper').innerHTML = canvasTemplate;

    this.canvas = this.dialog.querySelector('.popup-canvas');
    this.context = new wContext(this.canvas, true);
    this.dialog.context = this.context;
    this.show(null);

    this.canvasActions = this.dialog.querySelector('.canvas-actions');
    this.canvasActions.style.display = '';

    this.key = null;
    this.loadedSceneURL = '';
    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesRemoveButton = document.querySelector('#remove-workspace-button');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());

    this.toolbarItems = {};
    this.toolbarItems['block'] = new cBandRecords('block', 'Blocks', this);
    this.toolbarItems['mesh'] = new cBandRecords('mesh', 'Meshes', this);
    this.toolbarItems['shape'] = new cBandRecords('shape', 'Shapes', this);
    this.toolbarItems['material'] = new cBandRecords('material', "Materials", this);
    this.toolbarItems['texture'] = new cBandRecords('texture', 'Textures', this);

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

    this.bandButtons = [];
    //cBandOptions
    this.userProfileName = this.dialog.querySelector('.user-info');
    this.userProfileImage = this.dialog.querySelector('.user-image-display');

    this.fontToolsButton = this.dialog.querySelector('#workspace-settings-button');
    this.fontToolsContainer = this.dialog.querySelector('#user-profile-panel');
    this.fontFields = sDataDefinition.bindingFieldsCloned('fontFamilyProfile');
    this.fontFieldsContainer = this.fontToolsContainer.querySelector('.fields-container');
    this.fontTools = new cBandProfileOptions(this.fontToolsButton, this.fontFields, this.fontFieldsContainer, this.fontToolsContainer);
    this.fontTools.fireFields.values = gAPPP.a.profile;
    this.fontTools.activate();
    this.bandButtons.push(this.fontTools);

    this.addProjectButton = document.querySelector('#add-workspace-button');
    this.addProjectButton.addEventListener('click', e => this.addProject());
    this.addProjectName = document.querySelector('#new-workspace-name');
    this.workplacesRemoveButton.addEventListener('click', e => this.deleteProject());

    let user = gAPPP.a.currentUser;
    this.userProfileName.innerHTML = user.displayName + '<br>' + user.email;
    this.userProfileImage.setAttribute('src', user.photoURL);

    this.toggleButton = this.dialog.querySelector('#toggle-all-toolbands');
    this.toggleButton.addEventListener('click', e => this._collaspseAllBands());
    this.toggleButtonDown = this.dialog.querySelector('#toggle-all-toolbands-down');
    this.toggleButtonDown.addEventListener('click', e => this._expandAllBands());

    this.dialog.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e => gAPPP.a.resetProfile());
    this.dialog.querySelector('.canvas-actions .download-button').style.display = 'inline-block';
  }
  closeHeaderBands() {
    this.fontTools.expanded = true;
    this.fontTools.toggle(false);
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.rootBlock) {
      this.rootBlock.handleDataUpdate(tag, values, type, fireData);
    }
  }
  __updateSceneBlockBand(profileKey) {
    let bandElement = document.querySelector('.block' + this.toolbarItems['block'].myKey + '-' + profileKey);
    if (bandElement) {
      let p = bandElement.parentNode;
      let children = p.querySelectorAll('.menu-clipper-wrapper');

      for (let i = 0; i < children.length; i++) {
        let ele = children[i];
        let wrapper = ele.querySelector('.band-background-preview');
        wrapper.style.borderStyle = '';
        let btn = ele.querySelector('.select-block-animation-button');
        btn.style.display = '';
        let title = ele.querySelector('.band-title');
        title.background = '';
      }

      let wrapper = bandElement.querySelector('.band-background-preview');
      wrapper.style.borderStyle = 'inset';
      let btn = bandElement.querySelector('.select-block-animation-button');
      btn.style.display = 'none';
      let title = bandElement.querySelector('.band-title');
      title.background = 'rgb(240,240,240)';
    }
  }
  _updateSelectedBlock(profileKey) {
    if (gAPPP.activeContext !== this.context)
      return;

    if (!profileKey) {
      this.key = '';
      this.canvasHelper.show();
      return;
    }

    if (this.key !== profileKey) {
      this.show(null);
      this.canvasHelper.hide();
      setTimeout(() => {
        let blockData = gAPPP.a.modelSets['block'].getCache(profileKey);
        if (blockData) {
          this.__updateSceneBlockBand(profileKey);

          if (blockData.url)
            this.context.loadSceneURL(blockData.url).then(result => {
              this.__loadBlock(profileKey, blockData);
            });
          else
            this.__loadBlock(profileKey, blockData);
        } else {
          this.key = '';
          this.canvasHelper.show();
          document.title = this.workplacesSelect.selectedOptions[0].innerText;
        }
      }, 10);
    }
  }
  updateProjectList(records, selectedWorkspace = null) {
    let html = '';

    for (let i in records) {
      let o = `<option value=${i}>${records[i].title}</option>`;

      if (i === 'default')
        html += o;
      else
        html = o + html;
    }
    let val = selectedWorkspace;
    if (val === null)
      val = this.workplacesSelect.value;
    this.workplacesSelect.innerHTML = html;
    this.workplacesSelect.value = val;
    if (this.workplacesSelect.selectedIndex === -1) {
      this.workplacesSelect.selectedIndex = 0;
      this.selectProject();
    }
  }
  selectProject() {
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'selectedWorkspace',
      newValue: gAPPP.mV.workplacesSelect.value
    }]);
    setTimeout(() => location.reload(), 100);
  }
  __loadBlock(profileKey, blockData) {
    let b = new wBlock(this.context);
    document.title = blockData.title + ' - ' + this.workplacesSelect.selectedOptions[0].innerText;
    b.staticType = 'block';
    b.staticLoad = true;
    b.blockKey = profileKey;
    b.isContainer = true;
    b.setData(blockData);
    this.context.setActiveBlock(b);
    this.scene = this.context.scene;
    this.rootBlock = b;
    this.key = profileKey;
    this.rootBlock.setData();
    setTimeout(() => {
      this.canvasHelper.show();
      this.context.scene.switchActiveCamera(this.context.camera, this.context.canvas);
    }, 50);
  }
  addProject() {
    let newTitle = this.addProjectName.value.trim();
    if (newTitle.length === 0) {
      alert('need a name for workspace');
      return;
    }
    let key = gAPPP.a.modelSets['projectTitles'].getKey();
    firebase.database().ref('projectTitles/' + key).set({
      title: newTitle
    });
    firebase.database().ref('project/' + key).set({
      title: newTitle
    });
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'selectedWorkspace',
      newValue: key
    }]);
    setTimeout(() => location.reload(), 100);
  }
  deleteProject() {
    if (this.workplacesSelect.value === 'default') {
      alert('Please select a workspace to delete other then default');
      return;
    }
    if (confirm(`Are you sure you want to delete the project: ${this.workplacesSelect.selectedOptions[0].innerText}?`))
      if (confirm('Really?  Really sure?  this won\'t come back...')) {
        gAPPP.a.modelSets['projectTitles'].removeByKey(this.workplacesSelect.value);
        gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'selectedWorkspace',
          newValue: 'default'
        }]);
      }
  }
  _collaspseAllBands() {
    for (let i in this.toolbarItems) {
      this.toolbarItems[i].toggleChildBandDisplay(false);

      this.toolbarItems[i].createPanelShown = true;
      this.toolbarItems[i].toggleCreatePanel();
    }

    for (let i in this.bandButtons) {
      this.bandButtons[i].expanded = true;
      this.bandButtons[i].toggle();
    }

    this.canvasHelper.collapseAll();
    this.closeHeaderBands();
  }
  _expandAllBands() {
    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggleChildBandDisplay(true);
  }
  closeOpenPanels() {
    this.canvasHelper.sceneTools.expanded = true;
    this.canvasHelper.sceneTools.toggle();

    this.fontTools.expanded = true;
    this.fontTools.toggle();

    for (let i in this.toolbarItems) {
      this.toolbarItems[i].createPanelShown = true;
      this.toolbarItems[i].toggleCreatePanel();
    }
  }
  show(scene) {
    this.context.activate(scene);
    if (this.canvasHelper)
      this.canvasHelper.cameraSelect.value = 'default';
  }
}
