class cView extends bView {
  constructor(layoutMode, tag, key, childKey, subView) {
    super(layoutMode, tag, key, false, childKey, subView);
    this.canvasHelper.initExtraOptions();

    this.userProfileName = this.dialog.querySelector('.user-profile-info');
    this.userprofileimage = this.dialog.querySelector('.user-profile-image');
    if (gAPPP.a.currentUser.isAnonymous)
      this.userProfileName.innerHTML = 'Anonymous User';
    else {
      this.userProfileName.innerHTML = gAPPP.a.currentUser.email;
      this.userprofileimage.setAttribute('src', gAPPP.a.currentUser.photoURL);
    }

    this.refreshProjectList();

    this.profilePanelRegister();
  }
  async canvasReady() {
    this.updateRecordList(this.key, this.subView);
    this.canvasHelper.userProfileChange();
  }
  initUI() {
    this.dataview_record_tag = this.dialog.querySelector('.dataview_record_tag');
    this.dataview_record_key = this.dialog.querySelector('.dataview_record_key');
    this.dataview_record_tag.value = this.tag;
    if (this.dataview_record_tag.selectedIndex === -1)
      this.dataview_record_tag.selectedIndex = 0;

    this.dataview_record_tag.addEventListener('change', e => this.updateRecordList());
    this.dataview_record_key.addEventListener('change', e => this.updateSelectedRecord());

    this.blockChildrenSelect = this.dialog.querySelector('.main-band-children-select');

    this.main_band_sub_view_picker = this.dialog.querySelector('.main-band-sub-view-picker');
    this.block_child_detail_view_btn = this.dialog.querySelector('.block_child_detail_view_btn');
    this.block_child_frames_view_btn = this.dialog.querySelector('.block_child_frames_view_btn');
    this.block_child_import_view_btn = this.dialog.querySelector('.block_child_import_view_btn');

    this.addChildButton = this.dialog.querySelector('.main-band-add-child');
    this.addChildButton.addEventListener('click', e => this.addChild());
    this.removeChildButton = this.dialog.querySelector('.main-band-delete-child');
    this.removeChildButton.addEventListener('click', e => this.removeChild(e));
    this.addFrameButton = this.dialog.querySelector('.add_frame_button');
    this.addFrameButton.addEventListener('click', e => this.__addFrameHandler());
    this.deleteAssetButton = this.dialog.querySelector('.delete-asset-button');
    this.deleteAssetButton.addEventListener('click', e => this.deleteAsset());
    this.snapshotAssetButton = this.dialog.querySelector('.snapshot-asset-button');
    this.snapshotAssetButton.addEventListener('click', e => this.renderPreview());
    this.openViewerAssetButton = this.dialog.querySelector('.view-asset-button');
    this.openViewerAssetButton.addEventListener('click', e => this.openViewerForAsset());

    this.dialog.querySelector('.add-asset-button').addEventListener('click', e => this.addAsset());
    this.block_child_details_block = this.dialog.querySelector('.block_child_details_block');

    this.helpViewerWrapper = this.dialog.querySelector('.help-overlay');
    this.addAssetPanel = document.createElement('div');
    this.addAssetPanel.classList.add('add-asset-template-panel');
    this.helpViewer = document.createElement('div');
    this.helpViewer.classList.add('help-viewer');
    this.helpViewerWrapper.appendChild(this.addAssetPanel);
    this.helpViewerWrapper.appendChild(this.helpViewer);

    this.view_layout_select = document.getElementById('view_layout_select');
    this.view_layout_select.addEventListener('change', e => {
      this.layoutMode = this.view_layout_select.value;
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'formLayoutMode',
        newValue: this.layoutMode
      }]).then(() => {
        setTimeout(() => location.reload(), 1);
      })
    });

    this.workspace_regenerate_layout_changes = document.body.querySelector('.workspace_regenerate_layout_changes');
    this.workspace_regenerate_layout_changes.addEventListener('click', e => this.generateAnimation());

    this.workspace_show_layout_positions = document.body.querySelector('.workspace_show_layout_positions');
    this.workspace_show_layout_positions.addEventListener('click', e => this.showLayoutPositions());

    this.workspace_display_layout_new_window = document.body.querySelector('.workspace_display_layout_new_window');
    this.workspace_display_layout_new_window.addEventListener('click', e => this.showDisplayDemo());

    this.workspace_show_home_btn = this.dialog.querySelector('.workspace_show_home_btn');
    this.workspace_show_home_btn.addEventListener('click', e => {
      this.dataview_record_tag.value = '';
      this.tag = '';
      this.key = '';
      this.updateRecordList();
    });
    this.asset_show_home_btn = this.dialog.querySelector('.asset_show_home_btn');
    this.asset_show_home_btn.addEventListener('click', e => {
      this.dataview_record_key.value = '';
      this.key = '';
      this.updateRecordList();
    });
    this.expandedAll = true;
    this.expand_all_global_btn = this.dialog.querySelector('.expand_all_global_btn');
    this.expand_all_global_btn.addEventListener('click', e => {
      if (this.detailsShown) {
        this.collapseAll();
      } else {
        this.expandAll();
      }
    });
    if (this.detailsShown)
      this.expandAll();
    else
      this.collapseAll();

    this.dialog.querySelector('.open_workspace_new_window')
      .addEventListener('click', e => this.openNewWindow(this.tag, this.key));

    this.dialog.querySelector('.builder_image_picker_dialog')
      .addEventListener('click', e => this.showImagePicker());

    this.view_layout_select.value = this.layoutMode;
  }
  generateAnimation(genNew = false, animationKey = false, clearWorkspace = true, reload = true) {
    if (!animationKey)
      animationKey = gAPPP.loadedWID;
    if (!animationKey)
      return;

    if (!genNew && !confirm('This will clear existing data - proceed?'))
      return;

    this.canvasHelper.hide();
    gAPPP.a._deactivateModels();
    setTimeout(async () => {
      let csvImport = new gCSVImport(animationKey);
      if (clearWorkspace)
        await gAPPP.a.clearProjectData(animationKey);
      let assets = await gAPPP.a.readProjectRawData(animationKey, 'assetRows');
      await csvImport.importRows(assets);
      let scene = await gAPPP.a.readProjectRawData(animationKey, 'sceneRows');
      await csvImport.importRows(scene);
      let products = await gAPPP.a.readProjectRawData(animationKey, 'productRows');
      await csvImport.importRows(products);
      await csvImport.addCSVDisplayFinalize();
      await gAPPP.a.writeProjectRawData(animationKey, 'animationGenerated', null);
      this._updateQueryString(animationKey, 'Generate');

      if (reload)
        window.location.href = this.genQueryString(animationKey, null,
          null, null, this.subView);

    }, 10);

  }
  async showLayoutPositions() {
    this.positionFrags = this.layoutPositionFrags();
    if (this.layoutPositionsShown) {
      this.layoutPositionsShown = false;
      this.workspace_show_layout_positions.innerHTML = '<i class="material-icons">grid_on</i>';

      this.canvasHelper.cameraSelect.selectedIndex = 2;
      this.canvasHelper.noTestError = true;
      this.canvasHelper.cameraChangeHandler();

      for (let positionCounter = 0; positionCounter < this.positionFrags.length; positionCounter++) {
        gAPPP.activeContext.setGhostBlock('layoutPositions' + positionCounter.toString(), null);
      }
    } else {
      this.layoutPositionsShown = true;
      this.workspace_show_layout_positions.innerHTML = '<i class="material-icons">grid_off</i>';

      this.canvasHelper.cameraSelect.selectedIndex = 0;
      this.canvasHelper.noTestError = true;
      this.canvasHelper.cameraChangeHandler();

      for (let positionCounter = 0; positionCounter < this.positionFrags.length; positionCounter++) {
        let block = new wBlock(gAPPP.activeContext, null);
        let p = new Promise((resolve) => {
          setTimeout(() => resolve(), 1);
        });
        await p;


        block.__createTextMesh('layoutPositions' + positionCounter.toString() + 'SceneObject', {
          text: (positionCounter + 1).toString(),
          depth: .2,
          size: 100,
          stroke: false,
          fontFamily: 'Courier',
          fontStyle: undefined,
          fontWeight: undefined,
          fontVariant: undefined
        });

        let positionParts = this.positionFrags[positionCounter].split(',');
        block.sceneObject.position.x = GLOBALUTIL.getNumberOrDefault(positionParts[0], 0);
        block.sceneObject.position.y = GLOBALUTIL.getNumberOrDefault(positionParts[1], 0);
        block.sceneObject.position.z = GLOBALUTIL.getNumberOrDefault(positionParts[2], 0);

        block.sceneObject.rotation.z = 3.14159 / 2;
        block.sceneObject.rotation.x = 3.14159;

        block.sceneObject.scaling.x = 2;
        block.sceneObject.scaling.y = 1;
        block.sceneObject.scaling.z = 5;

        let material = new BABYLON.StandardMaterial(`layoutPositions${positionCounter}SceneMaterial`, gAPPP.activeContext.scene);

        let rgb = positionCounter % 3;
        if (rgb === 1)
          material.diffuseColor = new BABYLON.Color3(2, 0, 0);
        else if (rgb === 2)
          material.diffuseColor = new BABYLON.Color3(0, 2, 0);
        else
          material.diffuseColor = new BABYLON.Color3(0, 0, 2);


        gAPPP.activeContext.__setMaterialOnObj(block.sceneObject, material);
        gAPPP.activeContext.setGhostBlock('layoutPositions' + positionCounter.toString(), block);
      }
    }
  }
  layoutPositionFrags() {
    let positionInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'displaypositions');
    let positionFrags = [];
    if (positionInfo) {
      let arr = positionInfo.genericBlockData.split('|');
      let positionHTML = '<option></option>';

      for (let c = 0, l = arr.length; c < l - 2; c += 3) {
        let frag = arr[c] + ',' + arr[c + 1] + ',' + arr[c + 2];
        positionFrags.push(frag);
      }
    }
    return positionFrags;
  }
  initRecordEditFields(tag, key) {
    if (this.fireSetCallback)
      this.fireSet.removeListener(this.fireSetCallback);
    this.dataViewContainer = this.form_panel_view_dom.querySelector('.data-view-container');
    this.dataViewContainer.innerHTML = this.__dataviewTemplate();
    this.assetsFieldsContainer = this.form_panel_view_dom.querySelector('.asset-fields-container');

    this.blockChildrenSelect.style.display = 'none';
    this.addChildButton.style.display = 'none';
    this.main_band_sub_view_picker.style.display = 'none';
    this.removeChildButton.style.visibility = 'hidden';

    if (!tag) tag = this.tag;
    if (!tag) return;

    if (!key) key = this.key;
    if (!key) return;

    this.fields = sDataDefinition.bindingFieldsCloned(tag);
    this.fireSet = gAPPP.a.modelSets[tag];

    this.fireFields = new cPanelData(this.fields, this.assetsFieldsContainer, this);
    this.fireFields.updateContextObject = true;

    let clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    this.assetsFieldsContainer.appendChild(clearDiv);

    this.fireSetCallback = (values, type, fireData) => this.fireFields._handleDataChange(values, type, fireData);
    this.fireSet.childListeners.push(this.fireSetCallback);

    if (tag === 'block') {
      this.initBlockDataFields();
      this.blockChildrenSelect.style.display = '';
      this.addChildButton.style.display = '';
      this.main_band_sub_view_picker.style.display = '';
    } else {}
  }
  initBlockDataFields() {
    this.framesPanel = this.dataViewContainer.querySelector('.frames-panel');
    this.framesBand = new cBandFrames(this.framesPanel, this);
    this.sceneFields = sDataDefinition.bindingFieldsCloned('sceneFields');
    this.sceneFieldsPanel = this.dataViewContainer.querySelector('.scene-fields-panel');
    this.sceneFireFields = new cPanelData(this.sceneFields, this.sceneFieldsPanel, this);
    this.fireSet.childListeners.push((values, type, fireData) => this.sceneFireFields._handleDataChange(values, type, fireData));
    this.sceneFireFields.updateContextObject = false;
    this.fireFields.updateContextObject = false;

    this.dialog.querySelector('.refresh-export-frames-button').addEventListener('click', e => this.fetchExportFrames());
    this.dialog.querySelector('.refresh-export-json-button').addEventListener('click', e => this.fetchExportJSON());
    this.dialog.querySelector('.import-frames-button').addEventListener('click', e => this.importFramesFromText());
    this.dialog.querySelector('.canvas-actions .download-button').style.display = 'inline-block';
    this.ieTextArea = this.dialog.querySelector('.frames-textarea-export');

    this.exportFramesDetailsPanel = this.dialog.querySelector('.export-frames-details-panel');
    this.nodedetailspanel = this.dialog.querySelector('.node-details-panel');
    this.block_child_detail_view_btn.addEventListener('click', e => this.updateSubViewDisplay('details'));
    this.block_child_frames_view_btn.addEventListener('click', e => this.updateSubViewDisplay('frames'));
    this.block_child_import_view_btn.addEventListener('click', e => this.updateSubViewDisplay('import'));
    this.updateSubViewDisplay('details');

    let deleteBlockAndChildren = document.createElement('button');
    deleteBlockAndChildren.innerHTML = '<i class="material-icons">delete</i> block and linked assets';
    deleteBlockAndChildren.classList.add('delete_block_and_children');
    deleteBlockAndChildren.addEventListener('click', e => this.deleteBlockAndChildren());
    this.sceneFieldsPanel.appendChild(deleteBlockAndChildren);

    this.childEditPanel = this.dataViewContainer.querySelector('.cblock-child-details-panel');
    this.childBlockPickerBand = this.dialog.querySelector('.child_band_picker_expanded');
    this.childBand = new cBlockLinkSelect(this.blockChildrenSelect, this, this.childEditPanel, this.childBlockPickerBand);
    this.childEditPanel.parentNode.insertBefore(this.assetsFieldsContainer, this.childEditPanel.parentNode.firstChild);

    let openBtn = document.createElement('button');
    openBtn.innerHTML = '<i class="material-icons">open_in_browser</i> linked asset';
    openBtn.classList.add('open_in_browser_block_child');
    openBtn.addEventListener('click', e => this.openChildBlockClick());
    this.childEditPanel.appendChild(openBtn);
    let openBtnInNew = document.createElement('button');
    openBtnInNew.innerHTML = '<i class="material-icons">open_in_new</i> new window';
    openBtnInNew.classList.add('open_in_new_block_child');
    openBtnInNew.addEventListener('click', e => this.openChildBlockClick(true));
    this.childEditPanel.appendChild(openBtnInNew);
  }
  deleteBlockAndChildren() {
    if (!this.key)
      return;
    if (!this.tag)
      return;

    if (!confirm('Are you sure you want to delete this ' + this.tag + ' - and all of the linked assets?  This should only be done if you know what you\'re doing.'))
      return;

    let children = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', this.key);

    for (let i in children) {
      let child = children[i];
      if (gAPPP.a.modelSets[child.childType]) {
        let cDs = gAPPP.a.modelSets[child.childType].queryCache('title', child.childName);
        let keys = Object.keys(cDs);

        keys.forEach(key => gAPPP.a.modelSets[child.childType].removeByKey(key));
      }
    }

    this.deleteAsset(false);
  }
  openChildBlockClick(newWindow) {
    let data = gAPPP.a.modelSets['blockchild'].fireDataValuesByKey[this.childKey];
    let newTag = data.childType;
    let childName = data.childName;
    let children = gAPPP.a.modelSets[newTag].queryCache('title', childName);
    let keys = Object.keys(children);

    if (keys.length < 1) {
      alert('linked asset not found');
      return;
    }
    if (keys.length > 1) {
      alert('more then 1 matching asset found');
    }
    let key = keys[0];
    let href = this.genQueryString(null, newTag, key);

    if (newWindow) {
      let anchor = document.createElement('a');
      anchor.setAttribute('href', href);
      anchor.setAttribute('target', '_blank');
      document.body.appendChild(anchor)
      anchor.click();
      document.body.removeChild(anchor);
    } else
      window.location.href = href;
  }
  updateSubViewDisplay(view) {
    this.block_child_detail_view_btn.classList.remove('app-inverted');
    this.block_child_frames_view_btn.classList.remove('app-inverted');
    this.block_child_import_view_btn.classList.remove('app-inverted');
    if (view === 'frames') this.block_child_frames_view_btn.classList.add('app-inverted');
    if (view === 'details') this.block_child_detail_view_btn.classList.add('app-inverted');
    if (view === 'import') this.block_child_import_view_btn.classList.add('app-inverted');

    this.addFrameButton.style.display = (this.tag === 'block') ? 'inline-block' : 'none';
    this.framesPanel.style.display = (view === 'frames') ? 'block' : 'none';
    this.nodedetailspanel.style.display = (view === 'details') ? '' : 'none';
    this.exportFramesDetailsPanel.style.display = (view === 'import') ? 'flex' : 'none';
    this.removeChildButton.style.visibility = (this.tag === 'block' && this.childKey) ? 'visibile' : 'hidden';
  }
  selectItem(newKey, newWindow) {
    if (!newWindow) {
      this.dataview_record_key.value = newKey;
      this.updateSelectedRecord();
      return;
    }

    this.openNewWindow(this.tag, newKey);
  }
  async deleteAsset(warn = true) {
    if (!this.tag)
      return;
    if (!this.key)
      return;
    if (warn && !confirm('Are you sure you want to delete this ' + this.tag + '?'))
      return;
    await gAPPP.a.modelSets[this.tag].removeByKey(this.key);

    this.dataview_record_key.value = '';
    return this.updateSelectedRecord();
  }
  __newAssetName() {
    let counter = 1;
    let newName = 'new ' + this.tag + counter.toString();

    while (true) {
      let existingTitles = gAPPP.a.modelSets[this.tag].queryCache('title', newName);
      let keys = Object.keys(existingTitles);
      if (keys.length === 0)
        break;

      counter++;
      newName = 'new ' + this.tag + counter.toString();
    }

    return newName;
  }
  async addAsset() {
    let results = await this.dialog.context.createObject(this.tag, this.__newAssetName());
    this.dataview_record_key.value = results.key;
    return this.updateSelectedRecord();
  }
  __addFrameHandler() {
    this.updateSubViewDisplay('frames');
    this.framesBand.addFrame(this.framesBand.__getKey());
  }
  updateRecordList(newKey = null, newView = null) {
    this.tag = this.dataview_record_tag.value;
    this.key = newKey;
    this.subView = newView;
    this.rootBlock = null;

    this._updateRecordSelect();
    this.initRecordEditFields();
    this.updateSelectedRecord();
  }
  _updateRecordSelect() {
    this.addAssetPanel.style.display = 'none';
    if (this.tag) {
      let options = `<option values="" selected>Select or Add ${this.dataview_record_tag.selectedOptions[0].label}</option>`;

      gAPPP.a.modelSets[this.tag].updateChildOrder();
      let keyOrder = gAPPP.a.modelSets[this.tag].childOrderByKey;
      keyOrder.forEach(key => options += `<option value="${key}">${gAPPP.a.modelSets[this.tag].fireDataValuesByKey[key].title}</option>)`);
      if (!this.key) {
        this.addAssetPanel.style.display = '';
      }

      this.dataview_record_key.innerHTML = options;
      this.dataview_record_key.value = this.key;
      this.workspace_show_home_btn.style.visibility = '';
    } else {
      let options = '<option>Overview</option><option>Details</option><option value="Generate">Generate Display</option>' +
        '<option value="LayoutProducts">Products Data</option><option value="LayoutData">Display Data</option><option value="LayoutAssets">Assets Data</option><option value="LayoutCustom">Custom Data</option>';
      this.deleteAssetButton.style.display = 'none';
      this.snapshotAssetButton.style.display = 'none';
      this.openViewerAssetButton.style.display = 'none';

      this.dataview_record_key.innerHTML = options;
      this.dataview_record_key.value = this.subView;
    }

    if (this.dataview_record_key.selectedIndex < 0)
      this.dataview_record_key.selectedIndex = 0;
  }
  async workspaceAddProjectClick(newWindow = false) {
    let name = this.dialog.querySelector('.new-workspace-name').value.trim();
    if (!name) {
      alert('please enter a name for the new workspace');
      return;
    }

    let newW = await this._addProject(name, false, !newWindow);

    if (newWindow)
      this.openNewWindow('', '', newW);
  }
  async updateSelectedRecord() {
    this.dialog.classList.remove('workspace');
    this.dialog.classList.remove('workspacelayout');
    this.dialog.classList.remove('generatelayout');
    this.workspaceCTL = null;

    this.form_panel_view_dom.classList.remove('child-block-display');
    this.form_panel_view_dom.classList.remove('root-block-display');
    this.asset_show_home_btn.style.visibility = 'hidden';
    this.expand_all_global_btn.style.display = '';
    this.workspace_show_home_btn.style.visibility = '';
    this.form_canvas_wrapper.classList.remove('show-help');
    this.deleteAssetButton.style.display = 'none';
    this.snapshotAssetButton.style.display = 'none';
    this.openViewerAssetButton.style.display = 'none';
    this.block_child_details_block.style.display = 'none';

    if (this.dataview_record_tag.selectedIndex < 1) {
      this.dialog.classList.add('workspace');
      this.subView = this.dataview_record_key.value;
      if (this.dataview_record_key.selectedIndex < 2) {
        await this.updateDisplayForWorkspaceDetails();
        this.workspaceLayoutLoaded = false;
      } else if (this.dataview_record_key.selectedIndex > 1)
        await this.updateDisplayForWorkspaceLayout();
    }
    if (this.dataview_record_tag.selectedIndex > 0) {
      if (this.dataview_record_key.selectedIndex < 1)
        await this.updateDisplayForAssetsList();
      else
        await this.updateDisplayForAssetEditView();

      this.workspaceLayoutLoaded = false;
    }

    this._updateQueryString();

    return;
  }
  _updateHelpSections(init = false, helpViewer) {
    if (!helpViewer)
      helpViewer = this.helpViewer;
    let buttons = helpViewer.querySelectorAll('.help_folding_button');
    let sections = helpViewer.querySelectorAll('.help_folding_section');

    for (let c = 0, l = buttons.length; c < l; c++) {
      let local = c;
      if (init) {
        buttons[local].parentNode.addEventListener('click', e => {
          if (buttons[local].expanded) {
            sections[local].classList.remove('expanded');
            buttons[local].firstChild.innerHTML = 'unfold_more';
            buttons[local].expanded = false;
            buttons[local].parentNode.style.display = 'inline-block';
          } else {
            sections[local].classList.add('expanded');
            buttons[local].firstChild.innerHTML = 'unfold_less';
            buttons[local].expanded = true;
            buttons[local].parentNode.style.display = 'block';
          }
        });
      }

      if (this.detailsShown && !init) {
        sections[local].classList.add('expanded');
        buttons[local].firstChild.innerHTML = 'unfold_less';
        buttons[local].expanded = true;
      } else {
        buttons[local].expanded = false;
        buttons[local].firstChild.innerHTML = 'unfold_more';
        sections[local].classList.remove('expanded');
      }
    }
  }
  async updateDisplayForAssetsList() {
    this.context.activate(null);
    this.dataview_record_key.selectedIndex = 0;
    this.key = '';
    this.generate = new cMacro(this.addAssetPanel, this.tag, this);
    this.assetsFieldsContainer = this.form_panel_view_dom.querySelector('.asset-fields-container');
    this.recordViewer = new cBandIcons(this.tag, this);
    this.expand_all_global_btn.style.display = '';
    this.form_canvas_wrapper.classList.add('show-help');
    this.addAssetPanel.style.display = '';
    this.deleteAssetButton.style.display = 'none';
    this.snapshotAssetButton.style.display = 'none';

    let helpTag = this.tag;
    if (helpTag === 'texture')
      helpTag = 'material';
    if (helpTag !== '')
      helpTag += 'help';
    else
      helpTag = 'overview';
    let res = await fetch(`/doc/${helpTag}.html`, {
      cache: "no-cache"
    })
    let html = await res.text();
    this.helpViewer.innerHTML = html;

    this._updateHelpSections(true);
  }
  async updateDisplayForWorkspaceDetails() {
    this.context.activate(null);
    if (this.dataview_record_key.selectedIndex < 0)
      this.dataview_record_key.selectedIndex = 0;

    if (this.tag === '')
      this.key = this.dataview_record_key.value;
    else
      this.key = '';

    this.initRecordEditFields();
    if (this.addFrameButton)
      this.addFrameButton.style.display = 'none';
    if (this.removeChildButton)
      this.removeChildButton.style.visibility = (this.tag === 'block' && this.childKey) ? 'visible' : 'hidden';

    this.addAssetPanel.style.display = '';
    this.addAssetPanel.innerHTML = `<label><span>Add Workspace </span><input class="new-workspace-name" type="text" /></label>
      <button class="add-workspace-button btn-sb-icon"><i class="material-icons">add</i></button>
      <button class="add-workspace-button-nw btn-sb-icon"><i class="material-icons">open_in_new</i></button><hr>`;

    this.dialog.querySelector('.add-workspace-button').addEventListener('click', e => this.workspaceAddProjectClick());
    this.dialog.querySelector('.add-workspace-button-nw').addEventListener('click', e => this.workspaceAddProjectClick(true));
    this.form_canvas_wrapper.classList.add('show-help');

    if (this.workspaceCTL)
      delete this.workspaceCTL;
    this.workspaceCTL = new cWorkspace(this.assetsFieldsContainer, this.key, this);
    let url = '/doc/workspacehelp.html';
    if (this.key === 'Details')
      url = '/doc/workspacehelp.html';
    if (this.key === 'Overview')
      url = '/doc/overview.html';

    let res = await fetch(url, {
      cache: "no-cache"
    });
    let html = await res.text();
    this.helpViewer.innerHTML = html;

    this._updateHelpSections(true);
  }
  async updateDisplayForWorkspaceLayout() {
    this.key = gAPPP.a.modelSets['block'].getIdByFieldLookup('blockCode', 'demo');
    this.dialog.classList.add('workspacelayout');
    this.context.arcCameraRadius = 80;
    this.context.cameraVector = new BABYLON.Vector3(-10, 10, 1);

    if (this.key && this.workspaceLayoutLoaded !== true) {
      await this.showBusyScreen();
      this.workspaceLayoutLoaded = true;
      let fireValues = gAPPP.a.modelSets['block'].fireDataByKey[this.key].val();
      //load saved scene if exists
      if (fireValues.url)
        await this.context.loadSceneURL(fireValues.url);

      let b = new wBlock(this.context);
      b.staticType = 'block';
      b.staticLoad = true;

      b.blockKey = this.key;
      b.isContainer = true;

      this.context.activate(null);
      this.context.setActiveBlock(b);
      this.rootBlock = b;
      this.canvasHelper.__updateVideoCallback();
      b.setData(fireValues);

      let result = null;
      this.canvasHelper.cameraSelect.selectedIndex = 2;
      this.canvasHelper.noTestError = true;
      this.canvasHelper.cameraChangeHandler();
      this.canvasHelper.playAnimation();
      this.rootBlock = this.context.activeBlock;
      if (this.canvasHelper)
        this.canvasHelper.logClear();

      this.context.scene.switchActiveCamera(this.context.camera, this.context.canvas);
    }
    if (this.workspaceCTL)
      delete this.workspaceCTL;
    if (this.dataview_record_key.selectedIndex === 2)
      this.workspaceCTL = new cGenerate(this.assetsFieldsContainer, this.key, this);
    else
      this.workspaceCTL = new cWorkspace(this.assetsFieldsContainer, this.dataview_record_key.value, this);
  }
  async showBusyScreen() {
    return new Promise((resolve, reject) => {
      if (this.canvasHelper) {
        this.canvasHelper.loadingScreen.style.display = '';
        this.canvasHelper.loadingScreen.offsetHeight;
        return window.requestAnimationFrame(() => {
          setTimeout(() => resolve(), 1);
        });
      }

      return resolve();
    });
  }
  async updateDisplayForAssetEditView() {
    this.form_canvas_wrapper.classList.remove('show-help');
    this.deleteAssetButton.style.display = 'inline-block';
    this.snapshotAssetButton.style.display = 'inline-block';
    this.addAssetPanel.style.display = 'none';
    this.expand_all_global_btn.style.display = '';

    await this.showBusyScreen();

    this.key = this.dataview_record_key.value;

    if (this.key) {
      this.asset_show_home_btn.style.visibility = '';
    }

    this.initRecordEditFields();
    let data = this.fireSet.fireDataValuesByKey[this.key];

    if (!data) {
      this.key = '';
      return;
    }
    this.fireFields.values = data;

    this.openViewerAssetButton.style.display = (this.tag === 'block') ? 'inline-block' : 'none';

    if (this.tag === 'block') {
      if (this.fireFields.values.url)
        await this.context.loadSceneURL(this.fireFields.values.url);

      this.sceneFireFields.values = data;

      this.block_child_details_block.style.display = '';
    }
    let b = new wBlock(this.context);
    b.staticType = this.tag;
    b.staticLoad = true;

    if (this.tag === 'block' && this.key) {
      b.blockKey = this.key;
      b.isContainer = true;
    }

    this.context.activate(null);
    this.context.setActiveBlock(b);
    this.rootBlock = b;
    this.rootBlock.updateCamera();
    this.canvasHelper.refresh();
    this.canvasHelper.playAnimation();

    this.canvasHelper.__updateVideoCallback();
    b.setData(this.fireFields.values);

    let result = null;
    if (this.tag === 'mesh')
      result = await this.rootBlock.loadMesh();

    if (this.tag === 'block') {
      this.setChildKey(this.childKey);
      this.childBand.refreshUIFromCache();
      this._updateFollowTargetListOptions();

      if (this.blockChildrenSelect.selectedIndex === -1) {
        this.childKey = '';
        this.blockChildrenSelect.value = '';
      }

      this.updateSubViewDisplay('details');
    }

    this.rootBlock = this.context.activeBlock;
    if (this.canvasHelper)
      this.canvasHelper.logClear();

    this.fireFields.loadedURL = this.fireFields.values['url'];
    let sceneReloadRequired = this.fireFields.paint();
    this.fireFields.helpers.resetUI();

    if (this.detailsShown)
      this.expandAll();
    else
      this.collapseAll();

    if (this.tag === 'block')
      this.setChildKey(this.childKey);

    if (this.sceneFireFields) {
      this.sceneFireFields.paint();
      this.sceneFireFields.helpers.resetUI();
    }
    this.context.scene.switchActiveCamera(this.context.camera, this.context.canvas);

    if (this.canvasHelper) {
      this.canvasHelper.loadingScreen.style.display = 'none';
      this.canvasHelper.show();
    }
  }
  genQueryString(wid = null, tag = null, key = null, childkey = null, subView = null) {
    if (wid === null) wid = gAPPP.loadedWID;
    if (tag === null) tag = this.tag;
    if (key === null) key = this.key;
    let queryString = `?wid=${wid}`;

    if (tag) {
      queryString += `&tag=${tag}`;
      if (key)
        queryString += `&key=${key}`;

    } else {
      if (subView) {
        queryString += `&subview=${subView}`
      } else if (this.dataview_record_key.selectedIndex > 0) {
        let wDisplay = this.dataview_record_key.value;
        queryString += `&subview=${wDisplay}`
      }
    }

    let newURL = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;
    return newURL;
  }
  _updateQueryString(newWid, tag = null) {
    let urlParams = new URLSearchParams(window.location.search);
    let url = '';
    if (newWid) {
      if (!tag)
        this.dataview_record_key.selectedIndex = 0;
      url = this.genQueryString(newWid, tag);
    } else {
      url = this.genQueryString();
    }

    if (url !== this.url) {
      window.history.pushState({
        path: url
      }, '', url);
      this.url = url;
    }
  }
  splitLayoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;flex-direction:column;">
      <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
      <div id="main-view-wrapper" class="app-collapsed">
        <div class="form_canvas_wrapper"></div>
        <div class="form_panel_view_dom">
          <div id="profile-header-panel" class="app-panel">${this.profilePanelTemplate()}</div>
          <div class="header_wrapper">
            <div class="header_bar_top_row">
              <button id="profile_description_panel_btn" style="float:right;"><i class="material-icons">settings</i></button>
              <select id="workspaces-select"></select>
              <button class="workspace_show_home_btn"><i class="material-icons">home</i></button>
              <button class="asset_show_home_btn"><i class="material-icons">library_books</i></button>
              <button class="expand_all_global_btn"><i class="material-icons">unfold_more</i></button>
              <button class="open_workspace_new_window"><i class="material-icons">open_in_new</i></button>
              <button class="builder_image_picker_dialog"><i class="material-icons">collections</i></button>
              <div style="clear:both;"></div>
            </div>
            <select class="dataview_record_tag">
              <option value="" selected>Workspace</option>
              <option value="block">Block</option>
              <option value="shape">Shape</option>
              <option value="mesh">Mesh</option>
              <option value="material">Material</option>
              <option value="texture">Texture</option>
            </select>
            <select class="dataview_record_key"></select>
            <button class="add-asset-button btn-sb-icon"><i class="material-icons">add</i></button>
            <button class="workspace_regenerate_layout_changes"><i class="material-icons">gavel</i></button>
            <button class="workspace_show_layout_positions"><i class="material-icons">grid_on</i></button>
            <button class="workspace_display_layout_new_window"><i class="material-icons">shop</i></button>
            <button class="delete-asset-button"><i class="material-icons">delete</i></button>
            <button class="view-asset-button"><i class="material-icons">visibility</i></button>
            <button class="snapshot-asset-button"><i class="material-icons">add_photo_alternate</i></button>
            <div class="block_child_details_block">
              <select class="main-band-children-select" style="display:none;"></select>
              <button class="main-band-delete-child"><i class="material-icons">link_off</i></button>
              <button class="main-band-add-child"><i class="material-icons">link</i></button>
              <div class="main-band-sub-view-picker app-control">
                <button class="block_child_detail_view_btn app-inverted"><i class="material-icons">details</i></button>
                <button class="block_child_frames_view_btn"><i class="material-icons">dehaze</i></button>
                <button class="block_child_import_view_btn"><i class="material-icons">import_export</i></button>
              </div>
              <button class="add_frame_button" style="display:none;"><i class="material-icons">playlist_add</i></button>
              <div style="clear:both;"></div>
              <div class="child_band_picker_expanded"></div>
            </div>
          </div>
          <div class="data-view-container app-border">
          </div>
        </div>
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
    </div>`;
  }
  __dataviewTemplate() {
    return `<div class="asset-fields-container"></div>
      <div class="frames-panel"><div class="no-frames"></div></div>
      <div class="node-details-panel">
        <div class="cblock-child-details-panel"></div>
        <div class="scene-fields-panel"></div>
      </div>
      <div class="export-frames-details-panel">
        <div>
          <button class="btn-sb-icon refresh-export-json-button">Fetch JSON</button>
          &nbsp;
          <button class="btn-sb-icon refresh-export-frames-button">Fetch Frames</button>
          &nbsp;
          <button class="btn-sb-icon import-frames-button">Import Frames</button>
        </div>
        <textarea class="frames-textarea-export" rows="1" cols="6"></textarea>
      </div>`;
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    this._updateRecordSelect();

    if (this.tag === '' && this.dataview_record_key.selectedIndex < 1) {
      this.updateSelectedRecord();
    }
    super._updateContextWithDataChange(tag, values, type, fireData);

    if (this.tag === 'block') {
      if (this.rootBlock) {
        this.childBand.refreshUIFromCache();
        if (tag === 'blockchild') {
          this.rootBlock.updateCamera();
          this._updateFollowTargetListOptions();
        }
      }
    }
  }
  fetchExportFrames() {
    let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
    if (!block)
      block = this.rootBlock;
    let outFrames = [];
    for (let i in block.framesHelper.rawFrames)
      outFrames.push(block.framesHelper.rawFrames[i]);

    this.ieTextArea.value = JSON.stringify(outFrames).replace(/},/g, '},\n');
  }
  fetchExportJSON() {
    this.ieTextArea.value = cMacro.assetJSON(this.tag, this.key);
  }
  async importFramesFromText() {
    let obj;
    let rawJSON = this.ieTextArea.value;
    try {
      obj = JSON.parse(rawJSON);
    } catch (e) {
      console.log('frames import error (JSON.parse)', e);
      alert('Error parsing JSON, refer to console for more details: ' + e.toString());
      return;
    }

    if (!Array.isArray(obj)) {
      alert('Frames need to be in an array');
      return;
    }

    if (obj.length < 1) {
      if (!confirm('0 frames found - this will clear existing frames - proceed?'))
        return;
    }

    let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
    if (!block)
      block = this.rootBlock;

    await block.framesHelper.importFrames(obj);
    this.updateSubViewDisplay('frames');
  }
  addChild() {
    let objectData = sDataDefinition.getDefaultDataCloned('blockchild');
    objectData.parentKey = this.key;
    gAPPP.a.modelSets['blockchild'].createWithBlobString(objectData).then(r => {
      this.childBand.setKey(r.key);
      setTimeout(() => {
        this.childBand.setKey(r.key);
      }, 100);
    });
    this.updateSubViewDisplay('details');
  }
  removeChild(e) {
    if (confirm('Remove this child block (only the link)?')) {
      this.childBand.fireSet.removeByKey(this.childKey);
      this.childBand.setKey(null);
      this.setChildKey(null);
    }
  }
  setChildKey(key) {
    this.childKey = key;
    this.removeChildButton.style.visibility = (this.tag === 'block' && this.childKey) ? 'visible' : 'hidden';

    if (!this.childKey) {
      this.form_panel_view_dom.classList.add('root-block-display');
      this.form_panel_view_dom.classList.remove('child-block-display');
      this.context.setActiveBlock(this.rootBlock);
    } else {
      this.form_panel_view_dom.classList.remove('root-block-display');
      this.form_panel_view_dom.classList.add('child-block-display');

      if (this.rootBlock) {
        let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
        if (block)
          this.context.setActiveBlock(block);
        else
          this.context.setActiveBlock(this.rootBlock);
      }
    }

    if (this.framesBand)
      this.framesBand.refreshUIFromCache();
  }
  _handleActiveObjectUpdate(e) {}
  expandAll() {
    super.expandAll();
    this._updateHelpSections();
    this.expand_all_global_btn.querySelector('i').innerHTML = 'unfold_less';
    if (this.framesBand) {
      this.framesBand._updateFrameHelpersUI();
    }

    this.mainViewWrapper.classList.add('app-expanded');
    this.mainViewWrapper.classList.remove('app-collapsed');
  }
  collapseAll() {
    super.collapseAll();
    this._updateHelpSections();
    this.expand_all_global_btn.querySelector('i').innerHTML = 'unfold_more';
    if (this.framesBand) {
      this.framesBand._updateFrameHelpersUI();
    }

    this.mainViewWrapper.classList.remove('app-expanded');
    this.mainViewWrapper.classList.add('app-collapsed');
  }
  _updateFollowTargetListOptions() {
    let optionText = '';
    let options = [];
    if (this.rootBlock)
      options = this.rootBlock.generateTargetFollowList();
    for (let i = options.length - 1; i >= 0; i--)
      optionText += '<option>' + options[i] + '</option>';

    if (!this.followblocktargetoptionslist) {
      this.followblocktargetoptionslist = document.createElement('datalist');
      this.followblocktargetoptionslist.id = 'followblocktargetoptionslist';
      document.body.appendChild(this.followblocktargetoptionslist);
    }
    this.followblocktargetoptionslist.innerHTML = optionText;
  }
  renderPreview() {
    if (this.context)
      if (this.tag && this.key)
        this.context.renderPreview(this.tag, this.key);
  }
  updateProjectList(records, selectedWorkspace = null) {
    super.updateProjectList(records, selectedWorkspace);

    if (this.workspaceCTL && this.workspaceCTL.csvGenerateRefreshProjectLists) {
      this.workspaceCTL.csvGenerateRefreshProjectLists(this.workplacesSelect.innerHTML);
    }
  }
  openViewerForAsset(key) {
    let wid = gAPPP.loadedWID;
    if (!key)
      key = this.key;
    let url = `/view?w=${wid}&b=${key}`;
    let a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  showDisplayDemo() {
    let url = `/display?wid=${gAPPP.loadedWID}`;
    let a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  showImagePicker(input) {
    if (!this.imagePickerDialog) {
      this.imagePickerDialog = document.createElement('dialog');
      this.imagePickerDialog.classList.add('app-panel');
      this.imagePickerDialog.setAttribute('style', 'height:75%;width:75%;padding:0;');

      let template = `<div style="display:flex;flex-direction:column;height:100%;">
          <div class="dialog-header-images">
            <h1 style="display:inline-block;">Standard Assets</h1>
            <div style="text-align:center;margin:.5em;display:inline-block">
              <label>
                <input type="radio" class="" name="texture-dialog-options" value="mesh" checked>
                <span>Mesh</span>
              </label>
              <label>
                <input type="radio" class="" name="texture-dialog-options" value="texture">
                <span>Texture</span>
              </label>
              <label>
                <input type="radio" name="texture-dialog-options" value="bump">
                <span>Bump</span>
              </label>
            </div>
          </div>
          <div style="flex:1;display:flex;flex-direction:row;position:relative;">
            <select size="4" style="height:100%;flex:1;" class="texture-picker">
            </select>
            <div class="texture-image imagebackgrounddisplay" style="flex:1;width:50%;position:relative">
              <div style="position:absolute;bottom:.15em;width:100%;text-align:center;">
                <input readonly class="imagePickerPathInput" style="border:none;width:90%;margin-left:5%;" type="text" />
                <br>
                <button class="copy_short">Copy Short</button>
                <button class="copy_full">Copy Full</button>
              </div>
            </div>
            <div class="mesh-details" style="flex:1;width:50%;flex-direction:column">
              <input readonly class="mesh-details-path" style="border:none;width:90%;" type="text" />
              <div class="mesh-details-images" style="flex:1;flex-direction:row;display:flex;height:50%;">
                <div class="mesh_texture_img imagebackgrounddisplay" style="flex:1;"></div>
                <div class="mesh_bump_img imagebackgrounddisplay" style="flex:1;"></div>
                <div class="mesh-preview-img imagebackgrounddisplay" style="flex:1;"></div>
              </div>
              <div class="mesh_message" style=""></div>
              <div class="mesh-options" style="">
                <label>Name<input class="mesh_import_name" type="text" /></label>
                <button>Import</button>
              </div>
            </div>
          </div>
          <div style="text-align:right;">
            <button class="close">Close</button>
          </div>
        </div>`;
      this.imagePickerDialog.innerHTML = template;
      if (!this.imagePickerDialog) {
        dialogPolyfill.registerDialog(this.imagePickerDialog);
      }

      this.imagePickerPathInput = this.imagePickerDialog.querySelector('.imagePickerPathInput');
      this.meshDetailsPath = this.imagePickerDialog.querySelector('.mesh-details-path');

      this.imagePickerDialog.querySelector('.close')
        .addEventListener('click', () => this.imagePickerDialog.close());

      let radios = this.imagePickerDialog.querySelectorAll('input[type="radio"]');
      radios.forEach(ctl => ctl.addEventListener('input', e => this.updateTexturePickerDialogRadio(ctl)));

      this.imagePickerTextureSelect = this.imagePickerDialog.querySelector('.texture-picker');
      this.imagePickerTextureSelect.addEventListener('input', e => this.updateTexturePickerSelectedImage());

      this.imagePickerTextureImage = this.imagePickerDialog.querySelector('.texture-image');
      this.imagePickerMeshDetails = this.imagePickerDialog.querySelector('.mesh-details');
      this.mesh_import_name = this.imagePickerDialog.querySelector('.mesh_import_name');
      this.mesh_texture_img = this.imagePickerDialog.querySelector('.mesh_texture_img');
      this.mesh_bump_img = this.imagePickerDialog.querySelector('.mesh_bump_img');
      this.mesh_message = this.imagePickerDialog.querySelector('.mesh_message');

      this.imagePickerCopyFull = this.imagePickerDialog.querySelector('.copy_full');
      this.imagePickerCopyFull
        .addEventListener('click', e => {
          this.imagePickerPathInput.focus();
          this.imagePickerPathInput.setSelectionRange(0, 99999);
          document.execCommand("copy");
          alert('Copied: ' + this.imagePickerPathInput.value);
        });

      this.imagePickerCopyShort = this.imagePickerDialog.querySelector('.copy_short');
      this.imagePickerCopyShort
        .addEventListener('click', e => {
          this.imagePickerTextureSelect.focus();
          document.execCommand("copy");
          alert('Copied: ' + this.imagePickerTextureSelect.value);
        });

      this.updateTexturePickerDialogRadio(radios[0]);
      document.body.appendChild(this.imagePickerDialog);
    }

    this.imagePickerDialog.showModal();
  }
  updateTexturePickerSelectedImage() {
    if (this.pickerSelectedTextureType === 'mesh') {
      let fullPath = gAPPP.cdnPrefix + 'meshes/' + this.imagePickerTextureSelect.value.substring(3);
      this.meshDetailsPath.value = fullPath;
      this.mesh_import_name.value = this.imagePickerTextureSelect.value.substring(3);

      let meshIndex = this.imagePickerTextureSelect.selectedIndex;
      let texture = gAPPP.meshesDetails[meshIndex].texture;
      let textureURL = '';
      if (texture) {
        textureURL = gAPPP.cdnPrefix + 'textures/' + texture.substring(3);
        textureURL = 'url(' + textureURL + ')';
      }
      let bump = gAPPP.meshesDetails[meshIndex].bump;
      let bumpURL = '';
      if (bump) {
        bumpURL = gAPPP.cdnPrefix + 'textures/' + bump.substring(3);
        bumpURL = 'url(' + bumpURL + ')';
      }
      let message = gAPPP.meshesDetails[meshIndex].message;
      let messageText = '';
      if (message)
        messageText = message;

      this.mesh_message.innerHTML = messageText;
      this.mesh_texture_img.style.backgroundImage = textureURL;
      this.mesh_bump_img.style.backgroundImage = bumpURL;
    } else {
      let fullPath = gAPPP.cdnPrefix + 'textures/' + this.imagePickerTextureSelect.value.substring(3);
      this.imagePickerPathInput.value = fullPath;
      let url = 'url(' + fullPath + ')';
      this.imagePickerTextureImage.style.backgroundImage = url;
    }
  }
  updateTexturePickerDialogRadio(ctl) {
    let type = ctl.value;
    this.pickerSelectedTextureType = type;
    if (type === 'mesh') {
      this.imagePickerTextureSelect.innerHTML = '';
      this.imagePickerTextureImage.style.display = 'none';
      let list = gAPPP.meshesDetails;
      let html = '';
      list.forEach(i => html += `<option>${i.mesh}</option>`);
      this.imagePickerMeshDetails.style.display = '';
      this.imagePickerTextureSelect.innerHTML = html;

      this.imagePickerTextureSelect.selectedIndex = 0;
      this.updateTexturePickerSelectedImage();
    } else {
      this.imagePickerTextureImage.style.display = '';
      this.imagePickerMeshDetails.style.display = 'none';
      let list = gAPPP[type + 'Textures'];
      let html = '';
      list.forEach(i => html += `<option>${i}</option>`);
      this.imagePickerTextureSelect.innerHTML = html;

      this.imagePickerTextureSelect.selectedIndex = 0;
      this.updateTexturePickerSelectedImage();
    }
  }
}
