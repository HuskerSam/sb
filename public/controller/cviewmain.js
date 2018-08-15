class cViewMain extends bView {
  constructor() {
    super();

    this.dialogs['mesh-edit'] = new bDialog('mesh', 'Mesh Options');
    this.dialogs['shape-edit'] = new bDialog('shape', 'Shape Editor');
    this.dialogs['block-edit'] = new cDialogBlock();
    this.dialogs['material-edit'] = new bDialog('material', 'Material Editor');
    this.dialogs['texture-edit'] = new bDialog('texture', 'Texture Options');

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

    this.__handleBlockTypeSelectChange();
    this.__handleShapeChange();
    this.__handleSkyboxChange();
    this.handleAddTypeSelect('Block');

    this.expandedContainer = document.getElementById('sb-floating-toolbar-expanded');
    this.canvasActions.insertBefore(this.expandedContainer, this.canvasActions.childNodes[0]);

    document.querySelector('#help-button-on-user-panel').addEventListener('click', e => this.showHelpPanel());
  }
  _initAddStoreItem() {
    this.storeItemParentDom = this.storeItemPanel.querySelector('.store-item-parent-block');

  }
  _importMeshListCSV() {
    if (this.importFileDom.files.length > 0) {
      Papa.parse(this.importFileDom.files[0], {
        header: true,
        complete: results => {
          if (results.data) {
            for (let c = 0, l = results.data.length; c < l; c++) {
              let row = results.data[c];
              if (row.asset === 'meshtexture') {
                gAPPP.a.modelSets['mesh'].createWithBlobString({
                  title: row.name,
                  materialName: row.materialname,
                  url: row.meshpath,
                  positionX: row.x,
                  positionY: row.y,
                  positionZ: row.z,
                  rotationX: row.rx,
                  rotationY: row.ry,
                  rotationZ: row.rz,
                  scalingX: row.sx,
                  scalingY: row.sy,
                  scalingZ: row.sz,
                  type: 'url'
                }).then(results => {});

                let diffuseColor = '';
                let diffuseTextureName = '';
                if (row.diffuse === 'x') {
                  diffuseColor = row.color;
                  diffuseTextureName = row.texturepath;
                }
                let ambientColor = '';
                let ambientTextureName = '';
                if (row.ambient === 'x') {
                  ambientColor = row.color;
                  ambientTextureName = row.texturepath;
                }
                let emissiveColor = '';
                let emissiveTextureName = '';
                if (row.emissive === 'x') {
                  emissiveColor = row.color;
                  emissiveTextureName = row.texturepath;
                }

                gAPPP.a.modelSets['material'].createWithBlobString({
                  title: row.materialname,
                  ambientColor,
                  ambientTextureName,
                  backFaceCulling: true,
                  diffuseColor,
                  diffuseTextureName,
                  emissiveColor,
                  emissiveTextureName,
                  bumpTextureName: row.bmppath
                }).then(results => {});
              }

              if (row.asset === 'block')
                gAPPP.a.modelSets['block'].createWithBlobString({
                  title: row.name,
                  materialName: row.materialname,
                  height: row.height,
                  width: row.width,
                  depth: row.depth
                }).then(blockResult => {
                  gAPPP.a.modelSets['frame'].createWithBlobString({
                    parentKey: blockResult.key,
                    positionX: row.x,
                    positionY: row.y,
                    positionZ: row.z,
                    rotationX: row.rx,
                    rotationY: row.ry,
                    rotationZ: row.rz,
                    scalingX: row.sx,
                    scalingY: row.sy,
                    scalingZ: row.sz,
                    frameOrder: 10,
                    frameTime: 0
                  }).then(fResults => {});
                });

              if (row.asset === 'blockchild') {
                let ele = gAPPP.a.modelSets['block'].getValuesByFieldLookup('title', row.parent);
                let key = gAPPP.a.modelSets['block'].lastKeyLookup;

                if (!ele) {
                  console.log(row.parent, ' - block not found');
                  return;
                }
                let inheritMaterial = false;
                if (row.materialname === 'inherit')
                  inheritMaterial = true;
                gAPPP.a.modelSets['blockchild'].createWithBlobString({
                  materialName: row.materialname,
                  parentKey: key,
                  childType: row.childtype,
                  childName: row.name,
                  inheritMaterial
                }).then(childResults => {
                  gAPPP.a.modelSets['frame'].createWithBlobString({
                    parentKey: childResults.key,
                    positionX: row.x,
                    positionY: row.y,
                    positionZ: row.z,
                    rotationX: row.rx,
                    rotationY: row.ry,
                    rotationZ: row.rz,
                    scalingX: row.sx,
                    scalingY: row.sy,
                    scalingZ: row.sz,
                    visibility: row.visibility,
                    frameOrder: 10,
                    frameTime: 0
                  }).then(fResults => {});
                });
              }

              if (row.asset === 'shape') {
                let texturename = row.texturepath;
                let bumptexturename = row.bmppath;

                if (row.scalev) {
                  if (row.texturepath) {
                    texturename = row.materialname;
                    gAPPP.a.modelSets['texture'].createWithBlobString({
                      title: texturename,
                      url: row.texturepath,
                      uScale: row.scaleu,
                      vScale: row.scalev
                    }).then(results => {});
                  }

                  if (row.bmppath) {
                    bumptexturename = row.materialname + 'bmp';
                    gAPPP.a.modelSets['texture'].createWithBlobString({
                      title: bumptexturename,
                      url: row.bmppath,
                      uScale: row.scaleu,
                      vScale: row.scalev
                    }).then(results => {});
                  }
                }

                if (row.materialname)
                  gAPPP.a.modelSets['material'].createWithBlobString({
                    title: row.materialname,
                    ambientColor: row.color,
                    ambientTextureName: texturename,
                    backFaceCulling: true,
                    diffuseColor: row.color,
                    diffuseTextureName: texturename,
                    emissiveColor: row.color,
                    emissiveTextureName: texturename,
                    bumpTextureName: bumptexturename
                  }).then(results => {});

                gAPPP.a.modelSets['shape'].createWithBlobString({
                  title: row.name,
                  materialName: row.materialname,
                  boxHeight: row.height,
                  boxWidth: row.width,
                  boxDepth: row.depth,
                  shapeType: row.shapetype
                }).then(results => {});
              }
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
  updateProjectList(records, selectedWorkspace = null) {
    let html = '';

    for (let i in records) {
      let code = '';
      if (records[i].code)
        code = records[i].code;
      let o = `<option value=${i}>${records[i].title} (${code})</option>`;

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
    this.workplacesSelectEditName.value = records[val].title;
    let code = '';
    if (records[val].code)
      code = records[val].code;
    this.workplacesSelectEditCode.value = code;
    gAPPP.workspaceCode = code;

    if (this.workplacesSelect.selectedIndex === -1) {
      this.workplacesSelect.selectedIndex = 0;
      this.selectProject();
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
    let key = gAPPP.a.modelSets['projectTitles'].getKey();
    firebase.database().ref('projectTitles/' + key).set({
      title: newTitle,
      code: newCode
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
  selectProject() {
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'selectedWorkspace',
      newValue: gAPPP.mV.workplacesSelect.value
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
}
