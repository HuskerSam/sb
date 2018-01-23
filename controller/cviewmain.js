class cViewMain {
  constructor() {
    this.dialog = document.querySelector('#main-page');
    this.dialogs = {};
    this.dialogs['mesh-edit'] = new cDialogEditItem('mesh', 'Mesh Options');
    this.dialogs['shape-edit'] = new cDialogEditItem('shape', 'Shape Editor');
    this.dialogs['block-edit'] = new cDialogBlock();
    this.dialogs['material-edit'] = new cDialogEditItem('material', 'Material Editor');
    this.dialogs['texture-edit'] = new cDialogEditItem('texture', 'Texture Options');
    this.dialogs['mesh-create'] = new cDialogCreateItem('mesh', 'Add Mesh');
    this.dialogs['shape-create'] = new cDialogCreateItem('shape', 'Add Shape', true);
    this.dialogs['block-create'] = new cDialogCreateItem('block', 'Add Block', true);
    this.dialogs['texture-create'] = new cDialogCreateItem('texture', 'Add Texture');
    this.dialogs['material-create'] = new cDialogCreateItem('material', 'Add Material', true);

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

    this.toolbarItems = {};
    this.toolbarItems['block'] = new cBandRecords('block', 'Blocks');
    this.toolbarItems['mesh'] = new cBandRecords('mesh', 'Meshes');
    this.toolbarItems['shape'] = new cBandRecords('shape', 'Shapes');
    this.toolbarItems['material'] = new cBandRecords('material', "Materials");
    this.toolbarItems['texture'] = new cBandRecords('texture', 'Textures');

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
    this.userProfileContainer = this.dialog.querySelector('.user-profile-expanded-wrapper');
    this.userProfileFields = sDataDefinition.bindingFieldsCloned('userProfile');
    this.userProfileToggleBtn = this.dialog.querySelector('#user-profile-settings-button');
    this.userFieldsContainer = this.dialog.querySelector('.user-profile-fields-container');
    this.userProfileBand = new cBandProfileOptions(this.userProfileToggleBtn, this.userProfileFields, this.userFieldsContainer, this.userProfileContainer);
    this.userProfileBand.fireFields.values = gAPPP.a.profile;
    this.userProfileBand.activate();
    this.bandButtons.push(this.userProfileBand);

    this.addProjectButton = document.querySelector('#add-workspace-button');
    this.addProjectButton.addEventListener('click', e => this.addProject());
    this.addProjectName = document.querySelector('#new-workspace-name');
    this.deleteWorkspaceButton = document.querySelector('#remove-workspace');
    this.deleteWorkspaceButton.addEventListener('click', e => this.deleteProject());

    let user = gAPPP.a.currentUser;
    this.userProfileName.innerHTML = user.displayName + '<br>' + user.email;
    this.userProfileImage.setAttribute('src', user.photoURL);

    this.addProjectButton = document.querySelector("workspace-settings-button");
    this.projectToggleBtn = this.dialog.querySelector('#workspace-settings-button');
    this.projectFieldsContainer = this.dialog.querySelector('.project-fields-container');
    this.projectPanelContainer = this.dialog.querySelector('#project-panel');
    this.projectPanelBand = new cBandProfileOptions(this.projectToggleBtn, [], this.projectFieldsContainer, this.projectPanelContainer);
    this.projectPanelBand.fireFields.values = gAPPP.a.profile;
    this.projectPanelBand.activate();
    this.bandButtons.push(this.projectPanelBand);

    this.allExpanded = false;
    this.toggleButton = this.dialog.querySelector('#toggle-all-toolbands');
    this.toggleButton.addEventListener('click', e => this._toggleAllBands());
    this.dialog.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e => gAPPP.a.resetProfile());

    this.renderToggleBtn = this.dialog.querySelector('.render-log-button');
    this.renderFieldsContainer = this.dialog.querySelector('.render-log-panel .fields-container');
    this.renderPanelContainer = this.dialog.querySelector('.render-log-panel');
    this.renderPanelBand = new cBandProfileOptions(this.renderToggleBtn, [], this.renderFieldsContainer, this.renderPanelContainer);
    this.renderPanelBand.fireFields.values = gAPPP.a.profile;
    this.renderPanelBand.activate();
    this.bandButtons.push(this.renderPanelBand);
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.rootBlock) {
      this.rootBlock.handleDataUpdate(tag, values, type, fireData);
    }
  }
  _updateSelectedBlock(profileKey) {
    if (gAPPP.activeContext !== this.context)
      return;

    if (!profileKey) {
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

  addProject() {
    let newTitle = this.addProjectName.value.trim();
    if (newTitle.length === 0) {
      alert('need a name for workspace');
      return;
    }
    let key = gAPPP.a.modelSets['project'].getKey();
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
    if (confirm('Are you sure you want to delete this project?'))
      if (confirm('Really?  Really sure?  this won\'t come back...')) {
        gAPPP.a.modelSets['project'].removeByKey(this.workplacesSelect.value);
        gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'selectedWorkspace',
          newValue: 'default'
        }]);
        setTimeout(() => location.reload(), 100);
      }
  }
  _collaspseAllBands() {
    let dialog = this.__detectIfEditDialogShown();
    if (dialog)
      return dialog.collapseAll();

    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggleChildBandDisplay(false);

    for (let i in this.bandButtons) {
      this.bandButtons[i].expanded = true;
      this.bandButtons[i].toggle();
    }

    this.canvasHelper.collapseAll();
  }
  _toggleAllBands() {
    if (this.allExpanded) {
      this.allExpanded = false;
      this._collaspseAllBands();
      this.toggleButton.querySelector('i').innerHTML = 'expand_less';
    } else {
      this.allExpanded = true;
      this._expandAllBands();
      this.toggleButton.querySelector('i').innerHTML = 'expand_more';
    }
  }
  _expandAllBands() {
    let dialog = this.__detectIfEditDialogShown();
    if (dialog)
      return dialog.expandAll();

    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggleChildBandDisplay(true);
  }
  __detectIfEditDialogShown() {
    for (let i in this.dialogs)
      if ($(this.dialogs[i].dialog).hasClass('in'))
        return this.dialogs[i];
    return null;
  }
  closeAllDialogs() {
    for (let i in this.dialogs)
      if ($(this.dialogs[i].dialog).hasClass('in'))
        this.dialogs[i].close();
  }
}
