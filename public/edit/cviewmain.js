class cViewMain extends bView {
  constructor() {
    super();

    this.dialogs['mesh-edit'] = new bDialog('mesh', 'Mesh Options', this);
    this.dialogs['shape-edit'] = new bDialog('shape', 'Shape Editor', this);
    this.dialogs['block-edit'] = new cDialogBlock(this);
    this.dialogs['material-edit'] = new bDialog('material', 'Material Editor', this);
    this.dialogs['texture-edit'] = new bDialog('texture', 'Texture Options', this);

    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelectEditName = document.querySelector('#edit-workspace-name');
    this.workplacesSelectEditCode = document.querySelector('#edit-workspace-code');
    this.workplacesRemoveButton = document.querySelector('#remove-workspace-button');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());
    this.workplacesSelectEditName.addEventListener('input', e => this.updateWorkspaceNameCode());
    this.workplacesSelectEditCode.addEventListener('input', e => this.updateWorkspaceNameCode());

    this.toolbarItems = {};
    this.toolbarItems['texture'] = new cBandRecords('texture', 'Texture', this);
    this.toolbarItems['material'] = new cBandRecords('material', "Material", this);
    this.toolbarItems['mesh'] = new cBandRecords('mesh', 'Mesh', this);
    this.toolbarItems['shape'] = new cBandRecords('shape', 'Shape', this);
    this.toolbarItems['block'] = new cBandRecords('block', 'Block', this);

    this.bandButtons = [];
    this.userProfileName = this.dialog.querySelector('.user-info');
    this.fontToolsButton = this.dialog.querySelector('#workspace-settings-button');
    this.fontToolsContainer = this.dialog.querySelector('#user-profile-panel');
    this.fontFields = sDataDefinition.bindingFieldsCloned('fontFamilyProfile');
    this.fontFieldsContainer = this.fontToolsContainer.querySelector('.fields-container');
    this.fontTools = new cBandProfileOptions(this.fontToolsButton, this.fontFields, this.fontFieldsContainer, this.fontToolsContainer);
    this.fontTools.fireFields.values = gAPPP.a.profile;
    this.fontTools.activate();
    this.bandButtons.push(this.fontTools);
    this.fontTools.closeOthersCallback = () => this.closeHeaderBands();

    this.gigViewButton = this.dialog.querySelector('#workspace-gig-view-button');
    this.gigViewContainer = this.dialog.querySelector('#gig-options-panel');
    this.gigFieldsContainer = this.gigViewContainer.querySelector('.fields-container');
    this.gigViewPanel = new cBandProfileOptions(this.gigViewButton, [], this.gigFieldsContainer, this.gigViewContainer);
    this.gigViewPanel.fireFields.values = gAPPP.a.profile;
    this.gigViewPanel.activate();
    this.bandButtons.push(this.gigViewPanel);
    this.gigViewPanel.closeOthersCallback = () => this.closeHeaderBands();

    this.addPanelButton = this.dialog.querySelector('#sb-floating-toolbar-create-btn');
    this.createPanel = document.querySelector('.add-item-panel');
    this.addFieldsContainer = this.createPanel.querySelector('.fields-container');
    this.addPanelTools = new cBandProfileOptions(this.addPanelButton, [], this.addFieldsContainer, this.createPanel);
    this.addPanelTools.fireFields.values = gAPPP.a.profile;
    this.addPanelTools.activate();
    this.bandButtons.push(this.addPanelTools);
    this.addPanelTools.closeOthersCallback = () => this.closeHeaderBands();

    this.importPanelButton = this.dialog.querySelector('#sb-floating-toolbar-import-btn');
    this.importPanel = document.querySelector('#import-export-panel-main-view');
    this.importFieldsContainer = this.importPanel.querySelector('.fields-container');
    this.importPanelTools = new cBandProfileOptions(this.importPanelButton, [], this.importFieldsContainer, this.importPanel);
    this.importPanelTools.fireFields.values = gAPPP.a.profile;
    this.importPanelTools.activate();
    this.bandButtons.push(this.importPanelTools);
    this.importPanelTools.closeOthersCallback = () => this.closeHeaderBands();
    this.importRefreshElementName = this.importPanel.querySelector('.fetch-element-name');
    this.importRefreshElementSelect = this.importPanel.querySelector('.fetch-element-type');
    this.importRefreshElementSelect.addEventListener('input', e => this.updateElementImportRefresh());
    this.updateElementImportRefresh();
    this.importRefreshFetchBtn = this.importPanel.querySelector('.refresh-button');
    this.importRefreshFetchBtn.addEventListener('click', e => this._importElementRefreshExport());
    this.importRefreshTextArea = this.importPanel.querySelector('.element-textarea-export');
    this.importImportBtn = this.importPanel.querySelector('.import-button');
    this.importImportBtn.addEventListener('click', e => this.importPanelImport());

    this.importFileDom = this.importPanel.querySelector('.meshes-import-file');
    this.importFileDom.addEventListener('change', e => this._importMeshListCSV());
    this.importImportMeshesBtn = this.importPanel.querySelector('.import-meshes-button');
    this.importImportMeshesBtn.addEventListener('click', e => this.importFileDom.click());

    this.addPanelTypeRadios = this.createPanel.querySelector('.block-type-radio-wrapper').querySelectorAll('input[type="radio"]');
    for (let i = 0; i < this.addPanelTypeRadios.length; i++) {
      let value = this.addPanelTypeRadios[i].value;
      this.addPanelTypeRadios[i].addEventListener('change', e => this.handleAddTypeSelect(value));
    }
    this.addElementType = 'Block';

    this.addProjectButton = document.querySelector('#add-workspace-button');
    this.addProjectButton.addEventListener('click', e => this.addProject());
    this.addProjectName = document.querySelector('#new-workspace-name');
    this.addProjectCode = document.querySelector('#new-workspace-code');
    this.workplacesRemoveButton.addEventListener('click', e => this.deleteProject());

    this.userProfileName.innerHTML = gAPPP.a.currentUser.email;

    this.toggleButton = this.dialog.querySelector('#toggle-all-toolbands');
    this.toggleButton.addEventListener('click', e => this._collaspseAllBands());
    this.toggleButtonDown = this.dialog.querySelector('#toggle-all-toolbands-down');
    this.toggleButtonDown.addEventListener('click', e => this._expandAllBands());

    this.dialog.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e => gAPPP.a.resetProfile());
    this.dialog.querySelector('.canvas-actions .download-button').style.display = 'inline-block';

    this.createPanelCreateBtn = this.createPanel.querySelector('.add-button');
    this.createPanelCreateBtn.addEventListener('click', e => this.createItem());
    this.createPanelInput = this.createPanel.querySelector('.add-item-name');
    this.createPanelInput.addEventListener('keypress', e => this._titleKeyPress(e), false);
    this.createMesage = this.createPanel.querySelector('.creating-message');

    this.addMaterialOptionsPanel = this.createPanel.querySelector('.material-add-options');
    this.materialColorInput = this.createPanel.querySelector('.material-color-add');
    this.materialColorPicker = this.createPanel.querySelector('.material-color-add-colorinput');
    this.diffuseCheckBox = this.createPanel.querySelector('.diffuse-color-checkbox');
    this.emissiveCheckBox = this.createPanel.querySelector('.emissive-color-checkbox');
    this.ambientCheckBox = this.createPanel.querySelector('.ambient-color-checkbox');
    this.specularCheckBox = this.createPanel.querySelector('.specular-color-checkbox');
    this.texturePickerMaterial = this.createPanel.querySelector('.texture-picker-select');

    this.materialColorPicker.addEventListener('input', e => this.__handleMaterialColorInputChange());
    this.materialColorInput.addEventListener('input', e => this.__handleMaterialColorTextChange());
    this.__handleMaterialColorTextChange();

    this.addShapeOptionsPanel = this.createPanel.querySelector('.shape-add-options');
    this.add2dTextPanel = this.createPanel.querySelector('.create-2d-text-plane');
    this.createBoxOptions = this.addShapeOptionsPanel.querySelector('.create-box-options');
    this.createSphereOptions = this.addShapeOptionsPanel.querySelector('.create-sphere-options');
    this.createTextOptions = this.addShapeOptionsPanel.querySelector('.create-text-options');
    this.createCylinderOptions = this.addShapeOptionsPanel.querySelector('.create-cylinder-options');
    this.createShapesSelect = this.createPanel.querySelector('.shape-type-select');
    this.createShapesSelect.addEventListener('input', e => this.__handleShapesSelectChange());
    this.shapeMaterialSelectPicker = this.createPanel.querySelector('.shape-material-picker-select');
    this.shapeAddFontFamily = this.createPanel.querySelector('.font-family-shape-add');
    this.shapeAddFontFamily.addEventListener('input', e => this.updateFontField(this.shapeAddFontFamily));
    this.shapeAddFontFamily2D = this.createPanel.querySelector('.font-family-2d-add');
    this.shapeAddFontFamily2D.addEventListener('input', e => this.updateFontField(this.shapeAddFontFamily2D));
    this.__handleShapesSelectChange();

    this.addMeshOptionsPanel = this.createPanel.querySelector('.mesh-add-options');
    this.meshMaterialSelectPicker = this.createPanel.querySelector('.mesh-material-picker-select');
    this.meshFile = this.createPanel.querySelector('.mesh-file-upload');
    this.selectMeshType = this.createPanel.querySelector('.mesh-type-select');
    this.selectMeshType.addEventListener('input', e => this.__handleMeshTypeChange());
    this.meshPathInputLabel = this.createPanel.querySelector('.mesh-path-label');
    this.meshPathInput = this.createPanel.querySelector('.text-path-mesh');

    this.__handleMeshTypeChange();

    this.texturePanel = this.createPanel.querySelector('.texture-add-options');
    this.selectTextureType = this.createPanel.querySelector('.texture-type-select');
    this.selectTextureType.addEventListener('input', e => this.__handleTextureTypeChange());
    this.textureFile = this.createPanel.querySelector('.file-upload-texture');
    this.texturePathInputLabel = this.createPanel.querySelector('.texture-path-label');
    this.texturePathInput = this.createPanel.querySelector('.text-path-texture');
    this.__handleTextureTypeChange();

    this.addBlockOptionsPanel = this.createPanel.querySelector('.block-add-options');
    this.blockOptionsPicker = this.createPanel.querySelector('.block-type-select');
    this.blockOptionsPicker.addEventListener('input', e => this.__handleBlockTypeSelectChange());

    this.blockShapePicker = this.createPanel.querySelector('.block-add-shape-type-options');
    this.blockShapePicker.addEventListener('input', e => this.__handleShapeChange());
    this.blockShapePanel = this.createPanel.querySelector('.shape-and-text-block-options');
    this.sceneBlockPanel = this.createPanel.querySelector('.scene-block-add-options');
    this.emptyBlockPanel = this.createPanel.querySelector('.scene-empty-block-add-options');
    this.connectorLinePanel = this.createPanel.querySelector('.connector-line-block-add-options');
    this.animatedDashPanel = this.createPanel.querySelector('.animated-line-block-add-options');
    this.storeItemPanel = this.createPanel.querySelector('.store-item-block-add-options');

    this.blockAddFontFamily = this.blockShapePanel.querySelector('.font-family-block-add');
    this.blockAddFontFamily.addEventListener('input', e => this.updateFontField(this.blockAddFontFamily));

    this.skyBoxImages = this.createPanel.querySelector('.skybox-preview-images');
    this.skyBoxInput = this.createPanel.querySelector('.block-skybox-picker-select');
    this.skyBoxInput.addEventListener('input', e => this.__handleSkyboxChange());

    this.cloudImageInput = this.createPanel.querySelector('.block-scene-cloudfile-picker-input');
    this.groundImagePreview = this.createPanel.querySelector('.cloud-file-ground-preview');
    this.generateGroundMaterial = this.createPanel.querySelector('.block-generate-ground');
    this.cloudImageInput.addEventListener('input', e => this.__handleGroundChange());

    this.addSceneLight = this.createPanel.querySelector('.block-add-hemi-light');
    this.shapeDetailsPanel = this.createPanel.querySelector('.block-shape-add-label');
    this.stretchDetailsPanel = this.createPanel.querySelector('.block-stretch-along-width-label');

    this._initAddStoreItem();
    this._initGigPanel();

    this.__handleBlockTypeSelectChange();
    this.__handleShapeChange();
    this.__handleSkyboxChange();
    this.handleAddTypeSelect('Block');

    this.expandedContainer = document.getElementById('sb-floating-toolbar-expanded');
    this.canvasActions.insertBefore(this.expandedContainer, this.canvasActions.childNodes[0]);

    document.querySelector('#help-button-on-user-panel').addEventListener('click', e => this.showHelpPanel());

    document.getElementById(`ui-project-tab`).addEventListener('click', e => {
      this.__reformatTable(this.projectTabTable);
      //    this.editTables[tableName].redraw(true);
      this.projectTabTable.setColumnLayout();
    });

    this.fontsAdded = {};
    this.canvasHelper.cameraShownCallback = () => {
      this._updateGoogleFonts();
    };
  }
  _updateGoogleFonts() {
    let editInfoBlocks = gAPPP.a.modelSets['block'].queryCache('blockFlag', 'googlefont');
    for (let id in editInfoBlocks) {
      let fontName = editInfoBlocks[id].genericBlockData;
      let newLink = document.createElement('link');
      fontName = fontName.replace(/ /g, '+');

      if (!this.fontsAdded[fontName]) {
        this.fontsAdded[fontName] = true;
        newLink.setAttribute('href', `https://fonts.googleapis.com/css?family=${fontName}`);
        newLink.setAttribute('rel', 'stylesheet');
        document.head.append(newLink);
      }
    }
  }
  __reformatTable(tbl) {
    let rows = tbl.getRows();
    for (let c = 0, l = rows.length; c < l; c++)
      rows[c].reformat();

    //  this.__tableChangedHandler();
  }
  _initAddStoreItem() {
    this.storeItemParentDom = this.storeItemPanel.querySelector('.store-item-parent-block');

  }
  async _loadProjectTable() {
    let data = [];
    let results = await firebase.database().ref(`grafter/projects`).once('value')
      .then(r => r.val());
    if (results) data = results;

    let columns = [{
        title: "Name",
        field: "name",
        editor: "input"
      },
      {
        title: "Type",
        field: "class",
        editor: "input"
      },
      {
        title: "Female Required",
        field: "gender",
        width: 95,
        editor: "select",
        editorParams: {
          "Male": "male",
          "Female": "female"
        }
      },
      {
        title: "Contractor",
        field: "rating",
        formatter: "star",
        align: "center",
        width: 100,
        editor: true
      },
      {
        title: "Location",
        field: "rating",
        formatter: "star",
        align: "center",
        width: 100,
        editor: true
      },
      {
        title: "Due Date",
        field: "dob",
        width: 130,
        sorter: "date",
        align: "center"
      }
    ];

    this.projectTabTable = new Tabulator(`#project_tab_table`, {
      data,
      virtualDom: true,
      height: '100%',
      width: '100%',
      movableRows: true,
      movableColumns: false,
      selectable: false,
      layout: "fitData",
      columns
      //    dataEdited: data => this.__tableChangedHandler(true),
      //    rowMoved: (row) => this._rowMoved(tableName, row)
    });

    //    this.projectTabTable.setColumnLayout();


    return Promise.resolve();
  }
  _initGigPanel() {
    let columns = [ //define the table columns
      {
        title: "Name",
        field: "name",
        editor: "input"
      },
      {
        title: "Task Progress",
        field: "progress",
        align: "left",
        formatter: "progress",
        editor: true
      },
      {
        title: "Gender",
        field: "gender",
        width: 95,
        editor: "select",
        editorParams: {
          "Male": "male",
          "Female": "female"
        }
      },
      {
        title: "Rating",
        field: "rating",
        formatter: "star",
        align: "center",
        width: 100,
        editor: true
      },
      {
        title: "Color",
        field: "col",
        width: 130,
        editor: "input"
      },
      {
        title: "Date Of Birth",
        field: "dob",
        width: 130,
        sorter: "date",
        align: "center"
      },
      {
        title: "Driver",
        field: "car",
        width: 90,
        align: "center",
        formatter: "tickCross",
        sorter: "boolean",
        editor: true
      },
    ];

    this._loadProjectTable().then(() => {});
  }
  _importMeshListCSV() {
    if (this.importFileDom.files.length > 0) {
      Papa.parse(this.importFileDom.files[0], {
        header: true,
        complete: results => {
          if (results.data) {
            for (let c = 0, l = results.data.length; c < l; c++) {
              new gCSVImport(gAPPP.a.profile.selectedWorkspace).addCSVRow(results.data[c]).then(() => {});
            }
          }
        }
      });
    }
  }
  updatePublishLink() {
    if (this.rootBlock)
      document.querySelector('#publish-link-url').setAttribute('href', this.rootBlock.publishURL);
  }
  importPanelImport() {
    let eleType = this.importRefreshElementSelect.value.toLowerCase();
    let json = '';

    try {
      json = JSON.parse(this.importRefreshTextArea.value);
    } catch (e) {
      alert('error parsing json check console');
      console.log('error parsing json for import', e);
      return;
    }

    if (eleType !== 'block') {
      json.sortKey = new Date().getTime();
      gAPPP.a.modelSets[eleType].createWithBlobString(json).then(results => {});
    } else {
      json.sortKey = new Date().getTime();
      let blockFrames = json.frames;
      let blockChildren = json.children;

      json.children = undefined;
      delete json.children;
      json.frames = undefined;
      delete json.frames;
      gAPPP.a.modelSets['block'].createWithBlobString(json).then(blockResults => {
        this.__importFrames(blockFrames, blockResults.key);

        for (let c = 0, l = blockChildren.length; c < l; c++) {
          let child = blockChildren[c];
          let childFrames = child.frames;
          child.frames = undefined;
          delete child.frames;
          child.parentKey = blockResults.key;

          gAPPP.a.modelSets['blockchild'].createWithBlobString(child).then(
            childResults => this.__importFrames(childFrames, childResults.key));
        }
      });
    }
  }
  __importFrames(frames, parentKey) {
    for (let c = 0, l = frames.length; c < l; c++) {
      frames[c].parentKey = parentKey;
      gAPPP.a.modelSets['frame'].createWithBlobString(frames[c]).then(frameResult => {});
    }
  }
  _importElementRefreshExport() {
    let eleType = this.importRefreshElementSelect.value.toLowerCase();
    let eleName = this.importRefreshElementName.value;

    if (eleType !== 'block') {
      let ele = gAPPP.a.modelSets[eleType].getValuesByFieldLookup('title', eleName);
      if (ele)
        ele.renderImageURL = undefined;
      this.importRefreshTextArea.value = JSON.stringify(ele, null, 4);
    } else {
      let ele = gAPPP.a.modelSets['block'].getValuesByFieldLookup('title', eleName);
      let key = gAPPP.a.modelSets['block'].lastKeyLookup;
      if (!ele) {
        alert('block not found');
        return;
      }

      let frames = gAPPP.a.modelSets['frame'].queryCache('parentKey', key);
      let framesArray = [];
      for (let i in frames)
        framesArray.push(frames[i]);
      ele.frames = framesArray;
      ele.renderImageURL = undefined;

      let children = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', key);
      let childArray = [];
      for (let childKey in children) {
        let childFrames = gAPPP.a.modelSets['frame'].queryCache('parentKey', childKey);
        let childFramesArray = [];
        for (let i in childFrames)
          childFramesArray.push(childFrames[i]);
        children[childKey].frames = childFramesArray;
        childArray.push(children[childKey]);
      }
      ele.children = childArray;

      this.importRefreshTextArea.value = JSON.stringify(ele, null, 4);
    }
  }
  updateElementImportRefresh() {
    let eleType = this.importRefreshElementSelect.value.toLowerCase();
    this.importRefreshElementName.setAttribute('list', eleType + 'datatitlelookuplist');
  }
  showHelpPanel() {
    window.open('/doc/help.html', '_blank');
  }
  closeHeaderBands() {
    this.fontTools.expanded = true;
    this.fontTools.toggle(false);
    this.addPanelTools.expanded = true;
    this.addPanelTools.toggle(false);
    this.gigViewPanel.expanded = true;
    this.gigViewPanel.toggle(false);
    this.importPanelTools.expanded = true;
    this.importPanelTools.toggle(false);
    this.canvasHelper.collapseAll();
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
    }
  }
  updateWorkspaceNameCode() {
    let name = this.workplacesSelectEditName.value.trim();
    let code = this.workplacesSelectEditCode.value.trim();

    if (name.length < 1)
      return;

    gAPPP.a.modelSets['projectTitles'].commitUpdateList([{
      field: 'title',
      newValue: name
    }, {
      field: 'code',
      newValue: code
    }], this.workplacesSelect.value);
  }
  addProject() {
    let newTitle = this.addProjectName.value.trim();
    if (newTitle.length === 0) {
      alert('need a name for workspace');
      return;
    }
    let newCode = this.addProjectCode.value.trim();

    this._addProject(newTitle, newCode);
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
    this.addPanelTools.expanded = true;
    this.addPanelTools.toggle();
  }
  handleAddTypeSelect(elementType) {
    this.addElementType = elementType;
    this.addMaterialOptionsPanel.style.display = 'none';
    this.addShapeOptionsPanel.style.display = 'none';
    this.addMeshOptionsPanel.style.display = 'none';
    this.texturePanel.style.display = 'none';
    this.addBlockOptionsPanel.style.display = 'none';

    let sel = this.addElementType;
    if (sel === 'Shape') {
      this.addShapeOptionsPanel.style.display = '';
    } else if (sel === 'Block') {
      this.addBlockOptionsPanel.style.display = '';
    } else if (sel === 'Mesh')
      this.addMeshOptionsPanel.style.display = '';
    else if (sel === 'Material')
      this.addMaterialOptionsPanel.style.display = '';
    else if (sel === 'Texture')
      this.texturePanel.style.display = '';
  }
  __handleMeshTypeChange() {
    this.meshPathInputLabel.style.display = 'none';
    this.meshFile.style.display = 'none';

    let sel = this.selectMeshType.value;
    if (sel === 'Upload')
      this.meshFile.style.display = '';
    else if (sel === 'Path')
      this.meshPathInputLabel.style.display = '';
  }
  __handleShapeChange() {
    this.shapeDetailsPanel.style.display = 'none';
    this.stretchDetailsPanel.style.display = 'none';
    let shape = this.blockShapePicker.value;

    if (shape !== 'Box' && shape !== 'Cube')
      this.shapeDetailsPanel.style.display = '';

    if (shape === 'Cone' || shape === 'Cylinder')
      this.stretchDetailsPanel.style.display = '';
  }
  __handleGroundChange() {
    let cloudImage = this.cloudImageInput.value.trim();

    this.groundImagePreview.style.display = '';
    if (cloudImage !== '') {
      let url = cloudImage;
      if (url.substring(0, 3) === 'sb:') {
        url = gAPPP.cdnPrefix + 'textures/' + url.substring(3);
      }
      this.groundImagePreview.setAttribute('src', url);
    } else {
      this.groundImagePreview.style.display = 'none';
    }

  }
  __handleSkyboxChange() {
    let skybox = this.skyBoxInput.value.trim();

    if (skybox === '')
      this.skyBoxImages.style.display = 'none';
    else {
      this.skyBoxImages.style.display = '';
      let imgs = this.skyBoxImages.querySelectorAll('img');

      let skyboxPath = gAPPP.cdnPrefix + 'box/' + skybox + '/skybox';

      imgs[0].setAttribute('src', skyboxPath + '_nx.jpg');
      imgs[1].setAttribute('src', skyboxPath + '_px.jpg');
      imgs[2].setAttribute('src', skyboxPath + '_ny.jpg');
      imgs[3].setAttribute('src', skyboxPath + '_py.jpg');
      imgs[4].setAttribute('src', skyboxPath + '_nz.jpg');
      imgs[5].setAttribute('src', skyboxPath + '_pz.jpg');
    }
  }
  __handleTextureTypeChange() {
    this.texturePathInputLabel.style.display = 'none';
    this.textureFile.style.display = 'none';

    let sel = this.selectTextureType.value;
    if (sel === 'Upload')
      this.textureFile.style.display = '';
    else if (sel === 'Path')
      this.texturePathInputLabel.style.display = '';
  }
  __handleBlockTypeSelectChange() {
    this.blockShapePanel.style.display = 'none';
    this.sceneBlockPanel.style.display = 'none';
    this.emptyBlockPanel.style.display = 'none';
    this.animatedDashPanel.style.display = 'none';
    this.connectorLinePanel.style.display = 'none';
    this.storeItemPanel.style.display = 'none';

    let sel = this.blockOptionsPicker.value;
    if (sel === 'Text and Shape')
      this.blockShapePanel.style.display = '';
    else if (sel === 'Scene')
      this.sceneBlockPanel.style.display = '';
    else if (sel === 'Connector Line')
      this.connectorLinePanel.style.display = '';
    else if (sel === 'Animated Line')
      this.animatedDashPanel.style.display = '';
    else if (sel === 'Store Item')
      this.storeItemPanel.style.display = '';
    else
      this.emptyBlockPanel.style.display = '';
  }
  __handleShapesSelectChange() {
    this.createBoxOptions.style.display = this.createShapesSelect.value === 'Box' ? '' : 'none';
    this.createSphereOptions.style.display = this.createShapesSelect.value === 'Sphere' ? '' : 'none';
    this.createTextOptions.style.display = this.createShapesSelect.value === '3D Text' ? '' : 'none';
    this.createCylinderOptions.style.display = this.createShapesSelect.value === 'Cylinder' ? '' : 'none';
    this.add2dTextPanel.style.display = this.createShapesSelect.value === '2D Text Plane' ? '' : 'none';
    this.shapeMaterialSelectPicker.parentElement.style.display = this.createShapesSelect.value != '2D Text Plane' ? '' : 'none';
  }
  __handleMaterialColorInputChange() {
    let bColor = GLOBALUTIL.HexToRGB(this.materialColorPicker.value);
    this.materialColorInput.value = bColor.r.toFixed(2) + ',' + bColor.g.toFixed(2) + ',' + bColor.b.toFixed(2);
  }
  __handleMaterialColorTextChange() {
    let bColor = GLOBALUTIL.color(this.materialColorInput.value);
    let rH = Math.round(bColor.r * 255).toString(16);
    if (rH.length === 1)
      rH = '0' + rH;
    let gH = Math.round(bColor.g * 255).toString(16);
    if (gH.length === 1)
      gH = '0' + gH;
    let bH = Math.round(bColor.b * 255).toString(16);
    if (bH.length === 1)
      bH = '0' + bH;

    let hex = '#' + rH + gH + bH;
    this.materialColorPicker.value = hex;
  }
  createItem() {
    let newName = this.createPanelInput.value.trim();
    if (newName === '') {
      alert('Please enter a name');
      return;
    }
    this.createPanelInput.value = '';
    let file = null;
    let scene = gAPPP.mV.scene;
    let tag = this.addElementType.toLowerCase();

    this.createMesage.style.display = 'block';

    let mixin = {};
    if (tag === 'material') {
      let color = this.materialColorInput.value;
      let texture = this.texturePickerMaterial.value;
      if (this.diffuseCheckBox.checked) {
        mixin.diffuseColor = color;
        mixin.diffuseTextureName = texture;
      }
      if (this.emissiveCheckBox.checked) {
        mixin.emissiveColor = color;
        mixin.emissiveTextureName = texture;
      }
      if (this.ambientCheckBox.checked) {
        mixin.ambientColor = color;
        mixin.ambientTextureName = texture;
      }
      if (this.specularCheckBox.checked) {
        mixin.specularColor = color;
        mixin.specularTextureName = texture;
      }
    }

    let generate2DTexture = false;
    let callbackMixin = {};
    if (tag === 'shape') {
      let sT = this.createShapesSelect.value;
      let shapeType = 'box';
      if (sT === 'Sphere')
        shapeType = 'sphere';
      else if (sT === '3D Text')
        shapeType = 'text';
      else if (sT === 'Cylinder')
        shapeType = 'cylinder';
      else if (sT === '2D Text Plane')
        shapeType = 'plane';

      mixin.shapeType = shapeType;
      if (shapeType === 'text') {
        mixin.textText = this.createTextOptions.querySelector('.text-shape-add').value;
        mixin.textFontFamily = this.createTextOptions.querySelector('.font-family-shape-add').value;
      }
      if (shapeType === 'sphere') {
        mixin.sphereDiameter = this.addShapeOptionsPanel.querySelector('.sphere-diameter').value;
      }
      if (shapeType === 'box') {
        mixin.boxWidth = this.addShapeOptionsPanel.querySelector('.box-width').value;
        mixin.boxHeight = this.addShapeOptionsPanel.querySelector('.box-height').value;
        mixin.boxDepth = this.addShapeOptionsPanel.querySelector('.box-depth').value;
      }
      if (shapeType === 'cylinder') {
        mixin.cylinderDiameter = this.addShapeOptionsPanel.querySelector('.cylinder-diameter').value;
        mixin.cylinderHeight = this.addShapeOptionsPanel.querySelector('.cylinder-height').value;
      }
      mixin.materialName = this.shapeMaterialSelectPicker.value;

      if (shapeType === 'plane') {
        mixin.width = this.addShapeOptionsPanel.querySelector('.font-2d-plane-size').value;
        mixin.height = mixin.width;
        mixin.materialName = newName + '_2d_material';

        callbackMixin.textureText = this.addShapeOptionsPanel.querySelector('.text-2d-line-1').value;
        callbackMixin.textureText2 = this.addShapeOptionsPanel.querySelector('.text-2d-line-2').value;
        callbackMixin.textureText3 = this.addShapeOptionsPanel.querySelector('.text-2d-line-3').value;
        callbackMixin.textureText4 = this.addShapeOptionsPanel.querySelector('.text-2d-line-4').value;
        callbackMixin.textFontFamily = this.addShapeOptionsPanel.querySelector('.font-family-2d-add').value;
        callbackMixin.textFontColor = this.addShapeOptionsPanel.querySelector('.font-2d-color').value;
        callbackMixin.textFontSize = this.addShapeOptionsPanel.querySelector('.font-2d-text-size').value;
        generate2DTexture = true;
      }
    }

    if (tag === 'mesh') {
      mixin.materialName = this.meshMaterialSelectPicker.value;
      let sel = this.selectMeshType.value;
      if (sel === 'Upload') {
        if (this.meshFile.files.length > 0)
          file = this.meshFile.files[0];
      }
      if (sel === 'Path') {
        mixin.url = this.meshPathInput.value.trim();
      }
    }

    if (tag === 'texture') {
      let sel = this.selectTextureType.value;
      if (sel === 'Upload') {
        if (this.textureFile.files.length > 0)
          file = this.textureFile.files[0];
      }
      if (sel === 'Path') {
        mixin.url = this.texturePathInput.value.trim();
      }
    }

    let generateGround = false;
    let generateLight = false;
    let generateShapeAndText = false;
    let generateAnimatedLine = false;
    let generateConnectorLine = false;
    if (tag === 'block') {
      let bType = this.blockOptionsPicker.value;

      if (bType === 'Empty') {
        mixin.width = this.addBlockOptionsPanel.querySelector('.block-box-width').value;
        mixin.height = this.addBlockOptionsPanel.querySelector('.block-box-height').value;
        mixin.depth = this.addBlockOptionsPanel.querySelector('.block-box-depth').value;
      }

      if (bType === 'Scene') {
        mixin.width = this.sceneBlockPanel.querySelector('.block-box-width').value;
        mixin.height = this.sceneBlockPanel.querySelector('.block-box-height').value;
        mixin.depth = this.sceneBlockPanel.querySelector('.block-box-depth').value;
        mixin.skybox = this.skyBoxInput.value.trim();

        if (this.generateGroundMaterial.checked) {
          generateGround = true;
          mixin.groundMaterial = newName + '_groundmaterial';
        }
        if (this.addSceneLight.checked)
          generateLight = true;
      }

      if (bType === 'Text and Shape') {
        mixin.width = this.blockShapePanel.querySelector('.block-box-width').value;
        mixin.height = this.blockShapePanel.querySelector('.block-box-height').value;
        mixin.depth = this.blockShapePanel.querySelector('.block-box-depth').value;

        mixin.textText = this.blockShapePanel.querySelector('.block-box-text').value;
        mixin.textTextLine2 = this.blockShapePanel.querySelector('.block-box-text-line2').value;
        mixin.textFontFamily = this.blockShapePanel.querySelector('.font-family-block-add').value;
        mixin.textMaterial = this.blockShapePanel.querySelector('.block-material-picker-select').value;
        mixin.textDepth = this.blockShapePanel.querySelector('.block-text-depth').value;
        mixin.shapeMaterial = this.blockShapePanel.querySelector('.block-shapematerial-picker-select').value;
        mixin.shapeDivs = this.blockShapePanel.querySelector('.block-add-shape-sides').value;
        mixin.cylinderHorizontal = this.blockShapePanel.querySelector('.shape-stretch-checkbox').checked;
        mixin.createShapeType = this.blockShapePicker.value;
        generateShapeAndText = true;
      }

      if (bType === 'Animated Line') {
        mixin.width = this.animatedDashPanel.querySelector('.block-box-width').value;
        mixin.height = this.animatedDashPanel.querySelector('.block-box-height').value;
        mixin.depth = this.animatedDashPanel.querySelector('.block-box-depth').value;

        mixin.dashCount = this.animatedDashPanel.querySelector('.animated-line-dash-count').value;
        mixin.runTime = this.animatedDashPanel.querySelector('.animated-run-time').value;

        mixin.createShapeType = this.animatedDashPanel.querySelector('.block-add-dash-shape-type-options').value;
        mixin.dashDepth = this.animatedDashPanel.querySelector('.dash-box-depth').value;
        mixin.shapeDivs = this.animatedDashPanel.querySelector('.dash-shape-sides').value;
        mixin.materialName = this.animatedDashPanel.querySelector('.dash-shape-material-picker-select').value;

        generateAnimatedLine = true;
      }
      if (bType === 'Connector Line') {
        callbackMixin.lineLength = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.line-length').value, 1);
        callbackMixin.lineDiameter = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.line-diameter').value, 1);
        callbackMixin.lineMaterial = this.connectorLinePanel.querySelector('.line-material').value;
        callbackMixin.lineSides = this.connectorLinePanel.querySelector('.line-sides').value;

        callbackMixin.pointLength = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.point-length').value, 1);
        callbackMixin.pointDiameter = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.point-diameter').value, 1);
        callbackMixin.pointMaterial = this.connectorLinePanel.querySelector('.point-material').value;
        callbackMixin.pointSides = this.connectorLinePanel.querySelector('.point-sides').value;
        callbackMixin.pointShape = this.connectorLinePanel.querySelector('.point-shape').value;

        callbackMixin.tailLength = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.tail-length').value, 1);
        callbackMixin.tailDiameter = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.tail-diameter').value, 1);
        callbackMixin.tailMaterial = this.connectorLinePanel.querySelector('.tail-material').value;
        callbackMixin.tailSides = this.connectorLinePanel.querySelector('.tail-sides').value;
        callbackMixin.tailShape = this.connectorLinePanel.querySelector('.tail-shape').value;

        callbackMixin.adjPointLength = callbackMixin.pointLength;
        callbackMixin.adjPointDiameter = callbackMixin.pointDiameter;
        if (callbackMixin.pointShape === 'None') {
          callbackMixin.adjPointLength = 0;
          callbackMixin.adjPointDiameter = 0;
        }
        callbackMixin.adjTailLength = callbackMixin.tailLength;
        callbackMixin.adjTailDiameter = callbackMixin.tailDiameter;
        if (callbackMixin.tailShape === 'None') {
          callbackMixin.adjTailLength = 0;
          callbackMixin.adjTailDiameter = 0;
        }
        callbackMixin.depth = Math.max(callbackMixin.lineDiameter, Math.max(callbackMixin.adjTailDiameter, callbackMixin.adjPointDiameter));
        callbackMixin.height = callbackMixin.depth;
        callbackMixin.width = callbackMixin.lineLength + callbackMixin.adjPointLength / 2.0 + callbackMixin.adjTailLength / 2.0;

        mixin.width = callbackMixin.width;
        mixin.height = callbackMixin.height;
        mixin.depth = callbackMixin.depth;

        generateConnectorLine = true;
      }
    }

    this.context.createObject(tag, newName, file, mixin).then(results => {
      if (generateAnimatedLine)
        wGenerate.generateAnimatedLine(this.context, results.key, newName, mixin);

      if (generateGround)
        this.__generateGroundForScene(results.key, newName, mixin, this.cloudImageInput.value.trim());
      if (generateLight)
        this.__generateLightForScene(results.key, newName, mixin);
      if (generateShapeAndText)
        wGenerate.generateShapeAndText(this.context, results.key, newName, mixin);
      if (generateConnectorLine)
        wGenerate.generateConnectorLine(this.context, results.key, newName, callbackMixin);
      if (generate2DTexture)
        wGenerate.generate2DTexture(this.context, results.key, newName, callbackMixin);

      setTimeout(() => {
        gAPPP.dialogs[tag + '-edit'].show(results.key);
        this.createMesage.style.display = 'none';
      }, 300);
    });
  }
  updateFontField(textDom) {
    textDom.style.fontFamily = textDom.value;
  }
  __generateLightForScene(blockKey, blockTitle, mixin) {
    this.context.createObject('blockchild', '', null, {
      childType: 'light',
      childName: 'Hemispheric',
      parentKey: blockKey
    }).then(results => {
      this.context.createObject('frame', '', null, {
        frameTime: '',
        frameOrder: '10',
        parentKey: results.key,
        lightDiffuseR: '1',
        lightIntensity: '.35',
        lightDiffuseG: '1',
        lightDiffuseB: '1',
        lightSpecularR: '1',
        lightSpecularG: '1',
        lightSpecularB: '1',
        lightDirectionX: '0',
        lightDirectionY: '1',
        lightDirectionZ: '0'
      })
    });

  }
  __generateGroundForScene(blockKey, blockTitle, mixin, imgPath) {
    let textureName = blockTitle + '_groundtexture';
    let materialName = blockTitle + '_groundmaterial';
    this.context.createObject('texture', textureName, null, {
      url: imgPath,
      vScale: mixin.depth,
      uScale: mixin.width
    }).then(results => {});
    this.context.createObject('material', materialName, null, {
      diffuseTextureName: textureName
    }).then(results => {});
  }
  _titleKeyPress(e) {
    if (e.code === 'Enter')
      this.createItem();
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    super._updateContextWithDataChange(tag, values, type, fireData);
    this.updatePublishLink();
  }
  __loadBlock(profileKey, blockData) {
    super.__loadBlock(profileKey, blockData);
    this.storeItemParentDom.value = blockData.title;
  }
  _canvasPanelTemplate() {
    return `<canvas class="popup-canvas"></canvas>
<div class="video-overlay">
  <video controls autoplay loop></video>
</div>
<div class="canvas-actions">
  <div class="canvas-play-bar">
    <div class="scene-options-panel" style="display:none;">
      <div class="scene-fields-container">
      </div>
      <div class="render-log-wrapper" style="display:none;">
        <button class="btn-sb-icon log-clear"><i class="material-icons">clear_all</i></button>
        <textarea class="render-log-panel" spellcheck="false"></textarea>
        <div class="fields-container" style="display:none;"></div>
      </div>
      <br>
      <button class="btn-sb-icon stop-button"><i class="material-icons">stop</i></button>
      <button class="btn-sb-icon video-button"><i class="material-icons">fiber_manual_record</i></button>
      <button class="btn-sb-icon download-button"><i class="material-icons">file_download</i></button>
      <button class="btn-sb-icon show-hide-log"><i class="material-icons">info_outline</i></button>
    </div>
    <br>
    <button class="btn-sb-icon scene-options" style="clear:both;"><i class="material-icons">settings_brightness</i></button>
    <button class="btn-sb-icon play-button"><i class="material-icons">play_arrow</i></button>
    <button class="btn-sb-icon pause-button"><i class="material-icons">pause</i></button>
    <div class="run-length-label"></div>
    <input class="animate-range" type="range" step="any" value="0" min="0" max="100" />
    <div class="camera-options-panel" style="display:inline-block;">
      <select class="camera-select" style=""></select>
      <div style="display:inline-block;">
        <div class="camera-slider-label">Radius</div>
        <input class="camera-select-range-slider" type="range" step="any" min="1" max="300" />
      </div>
      <div style="display:inline-block;">
        <div class="camera-slider-label">FOV</div>
        <input class="camera-select-range-fov-slider" type="range" step=".01" min="-1" max="2.5" value=".8" />
      </div>
      <div style="display:inline-block;">
        <div class="camera-slider-label">Height</div>
        <input class="camera-select-range-height-slider" type="range" step=".25" min="-15" max="40" />
      </div>
      <div class="fields-container" style="float:left"></div>
    </div>
  </div>
</div>`;
  }
  layoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;">
    <div id="renderLoadingCanvas" style="display:none;"><br><br>LOADING...</div>
    <div class="form_canvas_wrapper"></div>
    <div style="display:none;position:absolute;top:0;right:.25em;z-index:1000;">
      <button id="toggle-all-toolbands-down" class="btn-sb-icon"><i class="material-icons doubled-up-first">expand_more</i><i class="material-icons doubled-up-second">expand_more</i></button>
      <button id="toggle-all-toolbands" class="btn-sb-icon"><i class="material-icons doubled-up-first">expand_less</i><i class="material-icons doubled-up-second">expand_less</i></button>
    </div>
    <a id="publish-link-url" target="_blank">Publish</a>
    <button id="help-button-on-user-panel" class="btn-sb-icon"><i class="material-icons">help</i></button>

    <div id="sb-floating-toolbar-expanded">
    </div>

    <button class="btn-sb-icon" id="sb-floating-toolbar-import-btn"><i class="material-icons">import_export</i></button>
    <button class="btn-sb-icon" id="sb-floating-toolbar-create-btn"><i class="material-icons">add</i></button>
    <button id="workspace-settings-button" class="btn-sb-icon"><i class="material-icons">group</i></button>
    <button id="workspace-gig-view-button" class="btn-sb-icon"><i class="material-icons">assignment</i></button>
    <div id="gig-options-panel" style="display:none;white-space:nowrap;">
      <div class="fields-container" style="clear:both;"></div>
      <div class="mdl-tabs mdl-js-tabs mdl-js-ripple-effect" style="flex:1;">
        <div class="mdl-tabs__tab-bar">
          <a href="#ui-tracking-panel" id="ui-tracking-tab" class="mdl-tabs__tab is-active">Tracking</a>
          <a href="#ui-projects-panel" id="ui-project-tab" class="mdl-tabs__tab">Projects</a>
          <a href="#ui-scene-panel" id="ui-scene-tab" class="mdl-tabs__tab">Grafters</a>
          <a href="#ui-assets-panel" id="ui-asset-tab" class="mdl-tabs__tab">Account</a>
          <div class="tab-item-wrapper" style="flex:1">
            <span style="float:right;margin:.25em;">
              Weekly: <b>$ 450</b>
              Available: <b>$ 2320</b>
              Total: <b>$ 3430</b>
              <br>
              Pending <b>$ -250</b>
              Queued <b>$ -800</b>
              Incomplete <b>$ 500</b>
            </span>
            <span style="float:right;">
              <input style="width:8em;" placeholder="Search..." />
              <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">keyboard_voice</i></button>
            </span>
          </div>
        </div>
        <button id="changes_commit_header" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary" style="display:none;"><i class="material-icons">save</i></button>
        <input type="file" class="csv-import-file" style="display:none;" />
        <div id="ui-assets-panel" class="mdl-tabs__panel"></div>
        <div id="ui-scene-panel" class="mdl-tabs__panel"></div>
        <div id='ui-project-panel' class="mdl-tabs__panel is-active">
          <div style="height:100%;width:100%;" id="project_tab_table"></div>
        </div>
        <div id="ui-review-panel" class="mdl-tabs__panel"></div>
        <div id="ui-training-panel" class="mdl-tabs__panel" style="flex:1">
          <textarea style="width:100%;height:100%;">
          </textarea>
        </div>
      </div>
    </div>

    <div id="user-profile-panel" style="display:none;white-space:nowrap;">
      <div>
        <label><span>Workspace </span><select id="workspaces-select"></select></label>
        <button id="remove-workspace-button" class="btn-sb-icon" style="font-size:1.2em;"><i class="material-icons">delete</i></button>
        <br>
        <label><span>Name </span><input id="edit-workspace-name" /></label><label><span> Z Code </span><input id="edit-workspace-code" style="width:5em;" /></label>
        <br>
        <label><span>New Workspace </span><input id="new-workspace-name" /></label><label><span> Z Code </span><input id="new-workspace-code" style="width:5em;" /></label>
        <button id="add-workspace-button" class="btn-sb-icon" style="font-size:1.2em;"><i class="material-icons">add</i></button>
        </label>
      </div>
      <div class="user-info"></div>
      <button id="user-profile-dialog-reset-button" style="font-size:1.1em;" class="btn-sb-icon"><i class="material-icons">account_circle</i> Reset Profile </button>
      <button id="sign-out-button" style="font-size:1.1em;" class="btn-sb-icon"><i class="material-icons">account_box</i> Sign out </button>
      <div class="fields-container" style="clear:both;"></div>
    </div>
    <div id="import-export-panel-main-view" style="display:none;">
      <div style="float:left;text-align:center;">
        <label>Element <select class="fetch-element-type">
          <option>Block</option>
          <option>Mesh</option>
          <option>Shape</option>
          <option>Material</option>
          <option>Texture</option>
        </select></label>
        <br>
        <label>Title <input class="fetch-element-name" /></label>
        <br>
        <button class="btn-sb-icon refresh-button">Fetch</button>
        <br>
        <br>
        <br>
        <button class="btn-sb-icon import-button">Import Text</button>
        <button class="btn-sb-icon import-meshes-button">Import CSV</button>
        <input type="file" class="meshes-import-file" style="display:none;" />
      </div>
      <textarea class="element-textarea-export" rows="6" cols="6"></textarea>
      <div style="clear:both"></div>
      <div class="fields-container" style="clear:both;"></div>
    </div>
    <div class="add-item-panel" style="display:none;text-align:right;">
      <div class="texture-add-options" style="display:none">
        <select class="texture-type-select">
          <option>Upload</option>
          <option>Path</option>
        </select>
        <input type="file" class="file-upload-texture" />
        <label class="texture-path-label"><span>Path</span><input type="text" style="width:17em;" class="text-path-texture" list="sbimageslist" /></label>
      </div>
      <div class="material-add-options" style="display:none;">
        <label><input type="checkbox" class="diffuse-color-checkbox" checked />Diffuse</label>
        <label><input type="checkbox" class="ambient-color-checkbox" checked />Ambient</label>
        <label><input type="checkbox" class="emissive-color-checkbox" />Emissive</label>
        <label><input type="checkbox" class="specular-color-checkbox" />Specular</label>
        <br>
        <label>Color <input style="width:12em;" class="material-color-add" type="text" value="1,.5,0" /></label>
        <input type="color" class="material-color-add-colorinput" />
        <br>
        <label><span>Texture</span><input type="text" style="width:15em;" class="texture-picker-select" list="texturedatatitlelookuplist" /></label>
      </div>
      <div class="block-add-options" style="display:none">
        <div class="scene-empty-block-add-options">
          <label><span>W</span><input type="text" class="block-box-width" value="" /></label>
          <label><span>H</span><input type="text" class="block-box-height" value="" /></label>
          <label><span>D</span><input type="text" class="block-box-depth" value="" /></label>
        </div>

        <div class="connector-line-block-add-options" style="display:none;">
          <label><span>Length</span><input type="text" class="line-length" value="10" /></label>
          <label><span>Diameter</span><input type="text" class="line-diameter" value=".5" /></label>
          <label><span>Sides</span><input type="text" class="line-sides" value="" /></label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="line-material" list="materialdatatitlelookuplist" /></label>
          <br>
          <label>
            <span>Point</span>
            <select class="point-shape">
              <option>None</option>
              <option>Cylinder</option>
              <option selected>Cone</option>
              <option>Ellipsoid</option>
            </select>
          </label>
          <br>
          <label><span>Length</span><input type="text" class="point-length" value="1" /></label>
          <label><span>Diameter</span><input type="text" class="point-diameter" value="2" /></label>
          <label><span>Sides</span><input type="text" class="point-sides" value="" /></label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="point-material" list="materialdatatitlelookuplist" /></label>
          <br>
          <label>
            <span>Tail Shape</span>
            <select class="tail-shape">
              <option>None</option>
              <option>Cylinder</option>
              <option>Cone</option>
              <option selected>Ellipsoid</option>
            </select>
          </label>
          <br>
          <label><span>Length</span><input type="text" class="tail-length" value="1" /></label>
          <label><span>Diameter</span><input type="text" class="tail-diameter" value="1" /></label>
          <label><span>Sides</span><input type="text" class="tail-sides" value="" /></label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="tail-material" list="materialdatatitlelookuplist" /></label>
        </div>
        <div class="store-item-block-add-options" style="text-align:right;display:none;">
          <b>Highlight Details</b>
          <br>
          <label><span>Description</span><textarea style="width:15em;" rows="2" cols="1"  class="store-item-block-description"></textarea></label>
          <br>
          <label><span>Image</span><input style="width:15em;"  class="store-item-block-description-image" /></label>
          <br>
          <label><span>Video</span><input style="width:15em;"  class="store-item-block-description-video" /></label>
          <br>
          <b>Item Details</b>
          <br>
          <label><span>Price</span><input type="text" style="width:7em;"  class="store-item-block-price" value="$1.00" /></label>
          &nbsp;
          <label><span>Name</span><input type="text" style="width:10em;"  class="store-item-block-name" value="" /></label>
          <br>
          <label>
            <span></span>
            <select class="store-item-block-type-options">
              <option selected>Block</option>
              <option>Mesh</option>
              <option>Shape</option>
            </select>
          </label>
          <label><span></span><input type="text" style="width:15em;"  class="store-item-block-block" list="blockdatatitlelookuplist" /></label>

          <!--label><span></span><input type="text" style="width:15em;"  class="store-item-block-mesh" list="sbmesheslist" /></label>
          <br>
          <label><span></span><input type="text" style="width:15em;"  class="store-item-block-shape" list="shapedatatitlelookuplist" /></label>
          <br-->
          <br>
          <label><span>Location</span><input type="text" style="width:6em;" class="store-item-block-location" value="0,0,0" /></label>
          &nbsp;
          <label><span>Rotation</span><input type="text" style="width:8em;" class="store-item-block-rotation" value="" /></label>
          <br>
          <label><span>Parent Block</span><input type="text" style="width:15em;"  class="store-item-parent-block" list="blockdatatitlelookuplist"  /></label>
        </div>
        <div class="animated-line-block-add-options">
          <label><span>Dashes</span><input type="text" class="animated-line-dash-count" value="5" /></label>
          <label><span>Run Time</span><input type="text" class="animated-run-time" value="1500" /></label>
          <br>
          <label>
            <span>Shape</span>
            <select class="block-add-dash-shape-type-options">
              <option>Cylinder</option>
              <option selected>Cone</option>
              <option>Ellipsoid</option>
            </select>
          </label>
          <label><span>Sides</span><input type="text" class="dash-shape-sides" value="" /></label>
          <label><span>Length</span><input type="text" class="dash-box-depth" value=".5" /></label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="dash-shape-material-picker-select" list="materialdatatitlelookuplist" /></label>
          <br>
          <label><span>W</span><input type="text" class="block-box-width" value="1" /></label>
          <label><span>H</span><input type="text" class="block-box-height" value="2" /></label>
          <label><span>Len</span><input type="text" class="block-box-depth" value="10" /></label>
        </div>
        <div class="shape-and-text-block-options">
          <label><span>Line 1</span><input type="text" style="width:15em;" class="block-box-text" value="Block Text" /></label>
          <br>
          <label><span>Line 2</span><input type="text" style="width:15em;" class="block-box-text-line2" value="" /></label>
          <br>
          <label><span>Font</span><input class="font-family-block-add" list="fontfamilydatalist" /></label>
          <label><span>Depth</span><input type="text" class="block-text-depth" value=".1" /></label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="block-material-picker-select" list="materialdatatitlelookuplist" /></label>
          <hr>

          <label><span>Shape</span><select class="block-add-shape-type-options"><option>Cube</option><option>Box</option><option selected>Cone</option>
            <option>Cylinder</option><option>Sphere</option><option>Ellipsoid</option></select></label>
          <label class="block-shape-add-label"><span>Divs</span><input type="text" class="block-add-shape-sides" /></label>
          <label class="block-stretch-along-width-label"><input type="checkbox" class="shape-stretch-checkbox" />Horizontal</label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="block-shapematerial-picker-select" list="materialdatatitlelookuplist" /></label>
          <br>
          <label><span>W</span><input type="text" class="block-box-width" value="4" /></label>
          <label><span>H</span><input type="text" class="block-box-height" value="1" /></label>
          <label><span>D</span><input type="text" class="block-box-depth" value="1" /></label>
        </div>
        <div class="scene-block-add-options" style="text-align:center;">
          <label><input type="checkbox" class="block-add-hemi-light" /><span>Add Hemispheric Light</span></label>
          <hr>
          <label><input type="checkbox" class="block-generate-ground" /><span>Create Ground Material</span></label>
          <br>
          <label><span>Image Path</span><input type="text" style="width:15em;" class="block-scene-cloudfile-picker-input" list="sbimageslist" /></label>
          <br>
          <img class="cloud-file-ground-preview" crossorigin="anonymous" style="width:5em;height:5em;display:none;">
          <hr>
          <label><span>Skybox</span><input type="text" style="width:15em;" class="block-skybox-picker-select" list="skyboxlist" /></label>
          <div class="skybox-preview-images"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"></div>
          <br>
          <label><span>W</span><input type="text" class="block-box-width" value="50" /></label>
          <label><span>H</span><input type="text" class="block-box-height" value="16" /></label>
          <label><span>D</span><input type="text" class="block-box-depth" value="50" /></label>
        </div>
        <select class="block-type-select">
         <option>Empty</option>
         <option>Scene</option>
         <option selected>Text and Shape</option>
         <option>Animated Line</option>
         <option>Connector Line</option>
         <option>Store Item</option>
        </select>
      </div>
      <div class="mesh-add-options" style="display:none">
        <select class="mesh-type-select">
            <option>Upload</option>
            <option>Path</option>
          </select>
        <input type="file" class="mesh-file-upload" />
        <label class="mesh-path-label"><span>Path</span><input type="text" style="width:17em;" class="text-path-mesh" list="sbmesheslist" /></label>
        <br>
        <label><span>Material</span><input type="text" style="width:15em;" class="mesh-material-picker-select" list="materialdatatitlelookuplist" /></label>
      </div>
      <div class="shape-add-options" style="display:none;">
        <div class="create-sphere-options">
          <label><span>Diameter</span><input type="text" class="sphere-diameter" /></label>
        </div>
        <div class="create-2d-text-plane">
          <label><span>Text</span><input class="text-2d-line-1" value="Text Line" /></label>
          <br>
          <label><span>Line 2</span><input class="text-2d-line-2" value="" /></label>
          <br>
          <label><span>Line 3</span><input class="text-2d-line-3" value="" /></label>
          <br>
          <label><span>Line 4</span><input class="text-2d-line-4" value="" /></label>
          <br>
          <label><span>Font</span><input class="font-family-2d-add" list="fontfamilydatalist" /></label>
          <br>
          <label><span>Color</span><input class="font-2d-color" color="0,0,0" /></label>
          <br>
          <label><span>Text Size</span><input class="font-2d-text-size" value="100" /></label>
          <br>
          <label><span>Plane Size</span><input class="font-2d-plane-size" value="4" /></label>
        </div>
        <div class="create-cylinder-options">
          <label><span>Diameter</span><input type="text" class="cylinder-diameter"></label>
          <label><span>Height</span><input type="text" class="cylinder-height"></label>
        </div>
        <div class="create-text-options">
          <label><span>Text</span><input class="text-shape-add" value="3D Text" /></label>
          <br>
          <label><span>Font</span><input class="font-family-shape-add" list="fontfamilydatalist" /></label>
        </div>
        <label><span>Material</span><input type="text" style="width:15em;" class="shape-material-picker-select" list="materialdatatitlelookuplist" /></label>
        <div class="create-box-options">
          <label><span>Width</span><input type="text" class="box-width" /></label>
          <label><span>Height</span><input type="text" class="box-height" /></label>
          <label><span>Depth</span><input type="text" class="box-depth" /></label>
        </div>
        <br>
        <select class="shape-type-select">
         <option>2D Text Plane</option>
         <option selected>3D Text</option>
         <option>Box</option>
         <option>Sphere</option>
         <option>Cylinder</option>
        </select>
      </div>
      <div class="fields-container" style="clear:both;"></div>
      <hr>
      <div class="block-type-radio-wrapper" style="white-space:nowrap;font-weight:bold;padding:.25em;">
        <label><input type="radio" name="elementtyperadio" checked value="Block"><span>Block</span></label>
        <label><input type="radio" name="elementtyperadio" value="Mesh"><span>Mesh</span></label>
        <label><input type="radio" name="elementtyperadio" value="Shape"><span>Shape</span></label>
        <label><input type="radio" name="elementtyperadio" value="Material"><span>Material</span></label>
        <label><input type="radio" name="elementtyperadio" value="Texture"><span>Texture</span></label>
      </div>
      <label><span>Title</span><input style="width:20em;" class="add-item-name" /></label>
      <button class="add-button btn-sb-icon" style="background:rgb(0,127,0);color:white;"><i class="material-icons">add_circle</i></button>
      <div class="creating-message" style="display:none;background:silver;padding: .25em;">Creating...</div>
    </div>
    <datalist id="framecommandoptionslist">
      <option>Set</option>
      <option>GSet</option>
      <option>Animation</option>
      <option>Video</option>
      <option>Audio</option>
      <option>Function</option>
      <option>Camera</option>
    </datalist>
    <datalist id="framecommandfieldslist">
      <option>videoURL</option>
      <option>videoHeight</option>
      <option>videoWidth</option>
      <option>fogType</option>
      <option>fogDensity</option>
      <option>skybox</option>
      <option>groundMaterial</option>
      <option>material</option>
      <option>play</option>
      <option>pause</option>
      <option>stop</option>
      <option>position</option>
      <option>target</option>
    </datalist>
    <datalist id="blockchildtypelist">
      <option>block</option>
      <option>mesh</option>
      <option>shape</option>
      <option>light</option>
      <option>camera</option>
    </datalist>
    <datalist id="htmlvideosourcelist">
      <option>video/webm</option>
      <option>video/mp4</option>
      <option>video/ogg</option>
    </datalist>
    <datalist id="fogtypelist">
      <option>none</option>
      <option>EXP</option>
      <option>EXP2</option>
      <option>LINEAR</option>
    </datalist>
    <datalist id="lightsourceslist">
      <option>Point</option>
      <option>Directional</option>
      <option>Spot</option>
      <option>Hemispheric</option>
    </datalist>
    <datalist id="camerasourceslist">
      <option>UniversalCamera</option>
      <option>ArcRotate</option>
      <option>FollowCamera</option>
    </datalist>
    <datalist id="fontfamilydatalist"></datalist>
    <datalist id="skyboxlist"></datalist>
    <datalist id="sbmesheslist"></datalist>
    <datalist id="followblocktargetoptionslist"></datalist>
  </div>`;
  }
}
