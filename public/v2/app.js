import cWebApplication from "/lib/firestoreapp.js";
import {
  cBandProfileOptions,
  cBandIcons,
  cPanelData,
  cBlockLinkSelect
} from '/lib/controls.js';
import sDataDefinition from '/lib/sdatadefinition.js';
import gUtility from '/lib/gutility.js';
import cWorkspace from '/lib/cworkspace.js';
import gCSVImport from '/lib/gcsvimport.js';
import cMacro from '/lib/cmacro.js';
import wBlock from '/lib/wblock.js';
import cGenerate from '/lib/cgenerate.js';

export class cApplication extends cWebApplication {
  constructor() {
    super();
    window.addEventListener('popstate', () => {
      let urlParams = new URLSearchParams(window.location.search);
      let subView = urlParams.get('subview');
      let tag = urlParams.get('tag');
      let key = urlParams.get('key');

      if (!tag)
        tag = '';
      if (!key)
        key = '';
      if (this.tag !== tag) {
        this.dataview_record_tag.value = tag;
        this.updateRecordList(key);
      } else if (this.key !== key) {
        this.dataview_record_key.value = key;
        this.updateSelectedRecord();
      }
    });

    this.loadPickerData();
    this.templateBasePath = 'https://s3-us-west-2.amazonaws.com/hcwebflow/templates/';
    this.blockChildrenSet = null;
  }
  async mainUpdateUI() {
    await super.mainUpdateUI();
    this.canvasHelper.initExtraOptions();

    let urlParams = new URLSearchParams(window.location.search);
    let layoutMode = urlParams.get('layoutmode');
    if (!layoutMode)
      layoutMode = this.a.profile.formLayoutMode;
    let tag = urlParams.get('tag');
    let key = urlParams.get('key');
    let childKey = urlParams.get('childkey');
    let subview = urlParams.get('subview');

    this.playAnimation = false;
    this.expandedAll = true;
    this.tag = tag;
    this.key = key;
    this.childKey = childKey;
    this.layoutMode = layoutMode;
    this.subView = subview;
    //this.geoOptions = geoOptions;
    this.detailsShown = this.a.profile.applicationDetailsShown;

    this.userProfileName = this.dialog.querySelector('.user-profile-info');
    this.userprofileimage = this.dialog.querySelector('.user-profile-image');
    if (this.a.currentUser.isAnonymous)
      this.userProfileName.innerHTML = 'Anonymous User';
    else {
      this.userProfileName.innerHTML = this.a.currentUser.email;
      this.userprofileimage.setAttribute('src', this.a.currentUser.photoURL);
    }

    this.profilePanelRegister();
    this.updateProjectList(this.sets.project.fireDataValuesByKey, this.loadedWID);

    this.updateRecordList(this.key, this.subView);
    this.canvasHelper.userProfileChange();
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
            <button class="view-asset-button"><i class="material-icons">animation</i></button>
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
  profilePanelRegister() {
    this.signOutBtn = document.querySelector('#sign-out-button');
    if (this.signOutBtn)
      this.signOutBtn.addEventListener('click', e => this.a.signOut(), false);

    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());

    this.dialog.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e => this.a.resetProfile());

    this.fontToolsContainer = this.dialog.querySelector('#profile-header-panel');
    this.fontFields = [{
      title: 'Background',
      fireSetField: 'canvasColor',
      type: 'color',
      group: 'color',
      helperType: 'vector',
      rangeMin: '0',
      rangeMax: '1',
      rangeStep: '.005',
      floatLeft: true,
      displayType: 'shortVector'
    }, {
      title: 'Font',
      fireSetField: 'fontFamily',
      group: 'main',
      dataListId: 'fontfamilydatalist',
      type: 'font',
      floatLeft: true
    }, {
      title: 'Size',
      fireSetField: 'fontSize',
      group: 'main',
      displayType: 'number',
      helperType: 'singleSlider',
      rangeMin: '7',
      rangeMax: '22',
      rangeStep: '.25',
      groupClass: 'font-size-main-view',
      floatLeft: true
    }, {
      title: 'Focus Lock',
      fireSetField: 'inputFocusLock',
      group: 'main',
      type: 'boolean',
      floatLeft: true,
      clearLeft: true
    }];
    this.fontFieldsContainer = this.fontToolsContainer.querySelector('.fields-container');
    this.fontTools = new cBandProfileOptions(null, this.fontFields, this.fontFieldsContainer, this.fontFieldsContainer);
    this.fontTools.fireFields.values = this.a.profile;
    this.fontTools.activate();

    this.profile_description_panel_btn = document.getElementById('profile_description_panel_btn');
    this.profile_description_panel_btn.addEventListener('click', e => this.profilePanelToggle());
  }
  profilePanelToggle() {
    if (this.profilePanelShown) {
      this.profilePanelShown = false;
      this.profile_description_panel_btn.classList.remove('app-inverted');
      this.form_panel_view_dom.classList.remove('header-expanded');
    } else {
      this.profilePanelShown = true;
      this.profile_description_panel_btn.classList.add('app-inverted');
      this.form_panel_view_dom.classList.add('header-expanded');
    }
  }
  _initAssetUI() {
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
    this.addAssetPanel.classList.add('add_asset_template_panel');
    this.helpViewer = document.createElement('div');
    this.helpViewer.classList.add('help-viewer');
    this.helpViewerWrapper.appendChild(this.addAssetPanel);
    this.helpViewerWrapper.appendChild(this.helpViewer);

    this.view_layout_select = document.getElementById('view_layout_select');
    this.view_layout_select.addEventListener('change', async e => {
      this.layoutMode = this.view_layout_select.value;
      await this.sets.profile.update({
        formLayoutMode: this.layoutMode
      });
      setTimeout(() => location.reload(), 1);
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

    this.view_layout_select.value = this.layoutMode;
  }
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
  async selectProject() {
    this._updateQueryString(this.workplacesSelect.value);
    await this.sets.profile.update({
      selectedWorkspace: this.workplacesSelect.value
    });
    setTimeout(() => location.reload(), 1);
    return;
  }
  async _addProject(newTitle, key = false, reload = true, tags) {
    let csvImport = new gCSVImport();
    key = await csvImport.addProject(newTitle, key, tags);

    if (reload) {
      this._updateQueryString(key);
      await this.sets.profile.update({
        selectedWorkspace: key
      });
      setTimeout(() => location.reload(), 100);
    }

    return key;
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
      let options = '<option>Overview</option><option>Details</option><option value="Generate">Generate Display</option>';
      this.deleteAssetButton.style.display = 'none';
      this.snapshotAssetButton.style.display = 'none';
      this.openViewerAssetButton.style.display = 'none';

      this.dataview_record_key.innerHTML = options;
      this.dataview_record_key.value = this.subView;
    }

    if (this.dataview_record_key.selectedIndex < 0)
      this.dataview_record_key.selectedIndex = 0;
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
    this.fireSet = this.sets[tag];

    this.fireFields = new cPanelData(this.fields, this.assetsFieldsContainer, this);
    this.fireFields.updateContextObject = true;

    let clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    this.assetsFieldsContainer.appendChild(clearDiv);

    this.fireSetCallback = (values, type, fireData) => this.fireFields._handleDataChange(values, type, fireData);
    this.fireSet.childListeners.push(this.fireSetCallback);

    if (tag === 'block') {
      if (this.blockChildrenSet)
        this.blockChildrenSet.deactivate();

      this.blockChildrenSet = new cFirestoreData('blockchild', this.loadedWID, 'blockchild', key);
      //this.blockChildrenSet.childListeners.push(this.fireSetCallback);
      this.initBlockDataFields();
      this.blockChildrenSelect.style.display = '';
      this.addChildButton.style.display = '';
      this.main_band_sub_view_picker.style.display = '';
    } else {}
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

    this.addAssetPanel.style.display = 'block';
    this.addAssetPanel.innerHTML = `<label><span>Add Workspace </span><input class="new-workspace-name" type="text" /></label>
      <button class="add-workspace-button btn-sb-icon"><i class="material-icons">add</i></button>
      <button class="add-workspace-button-nw btn-sb-icon"><i class="material-icons">open_in_new</i></button><hr>`;

    this.dialog.querySelector('.add-workspace-button').addEventListener('click', e => this.workspaceAddProjectClick());
    this.dialog.querySelector('.add-workspace-button-nw').addEventListener('click', e => this.workspaceAddProjectClick(true));
    this.form_canvas_wrapper.classList.add('show-help');

    if (this.workspaceCTL)
      delete this.workspaceCTL;
    this.workspaceCTL = new cWorkspace(this.assetsFieldsContainer, this.key, this);
    let url = '/docraw/workspacehelp.html';
    if (this.key === 'Details')
      url = '/docraw/workspacehelp.html';
    if (this.key === 'Overview')
      url = '/docraw/overviewhelp.html';

    let res = await fetch(url, {
      cache: "no-cache"
    });
    let html = await res.text();
    this.helpViewer.innerHTML = html;

    this._updateHelpSections(true);
  }
  async updateGenerateDataTimes() {
    let csvImport = new gCSVImport(gAPPP.loadedWID);
    let results = await Promise.all([
      csvImport.readProjectRawDataDate('assetRows'),
      csvImport.readProjectRawDataDate('sceneRows'),
      csvImport.readProjectRawDataDate('productRows'),
      csvImport.readProjectRawDataDate('animationGenerated')
    ]);
    this.assetRowsDate = results[0];
    this.assetRowsDateDisplay = (this.assetRowsDate) ? gUtility.shortDateTime(gAPPP.assetRowsDate) : 'none';
    this.sceneRowsDate = results[1];
    this.sceneRowsDateDisplay = (this.sceneRowsDate) ? gUtility.shortDateTime(gAPPP.sceneRowsDate) : 'none';
    this.productRowsDate = results[2];
    this.productRowsDateDisplay = (this.productRowsDate) ? gUtility.shortDateTime(gAPPP.productRowsDate) : 'none';
    this.animationGeneratedDate = results[3];
    this.animationGeneratedDateDisplay = (this.animationGeneratedDate) ? gUtility.shortDateTime(gAPPP.animationGeneratedDate) : 'none';

    this.animationRegenerationNeeded = false;
    if (this.animationGeneratedDate) {
      if (this.assetRowsDate > this.animationGeneratedDate)
        this.animationRegenerationNeeded = true;
      if (this.sceneRowsDate > this.animationGeneratedDate)
        this.animationRegenerationNeeded = true;
      if (this.productRowsDate === null)
        this.animationRegenerationNeeded = true;
      if (this.productRowsDate > this.animationGeneratedDate)
        this.animationRegenerationNeeded = true;
    }

    if (this.mV) {
      if (this.animationRegenerationNeeded)
        this.mV.dialog.classList.add('animation_regeneration_needed');
      else
        this.mV.dialog.classList.remove('animation_regeneration_needed');
    }

    return;
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
  async updateDisplayForAssetsList() {
    this.context.activate(null);
    this.dataview_record_key.selectedIndex = 0;
    this.key = '';
    this.generate = new cMacro(this.addAssetPanel, this.tag, gAPPP);
    this.assetsFieldsContainer = this.form_panel_view_dom.querySelector('.asset-fields-container');
    this.recordViewer = new cBandIcons(this.tag, this);
    this.expand_all_global_btn.style.display = '';
    this.form_canvas_wrapper.classList.add('show-help');
    this.addAssetPanel.style.display = '';
    this.deleteAssetButton.style.display = 'none';
    this.snapshotAssetButton.style.display = 'none';

    gAPPP.updateHelpView(this.tag, this.helpViewer);
    this._updateHelpSections(true);
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
    let results = await this.context.createObject(this.tag, this.__newAssetName());
    this.dataview_record_key.value = results.key;
    return this.updateSelectedRecord();
  }
  initBlockDataFields() {
    this.framesPanel = this.dataViewContainer.querySelector('.frames-panel');
    //this.framesBand = new cBandFrames(this.framesPanel, this);
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
      //this.childBand.refreshUIFromCache();
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
  async generateAnimation(genNew = false, animationKey = false, clearWorkspace = true, reload = true) {
    if (!animationKey)
      animationKey = gAPPP.loadedWID;
    if (!animationKey)
      return;

    if (!genNew && !confirm('This will clear existing data - proceed?'))
      return;

    this.canvasHelper.hide();
    let csvImport = new gCSVImport(animationKey);

    if (this.rootBlock)
      await csvImport.dbSetRecordFields('block', {
        generationState: 'not ready'
      }, this.rootBlock.blockKey);

    gAPPP.a._deactivateModels();
    setTimeout(async () => {
      if (this.rootBlock)
        this.rootBlock.updatesDisabled = true;
      if (clearWorkspace)
        await csvImport.clearProjectData();
      let assets = await csvImport.readProjectRawData('assetRows');
      await csvImport.importRows(assets);
      let scene = await csvImport.readProjectRawData('sceneRows');
      await csvImport.importRows(scene);
      let products = await csvImport.readProjectRawData('productRows');
      await csvImport.importRows(products);
      await csvImport.addCSVDisplayFinalize();
      await csvImport.writeProjectRawData('animationGenerated', null);
      this._updateQueryString(animationKey, 'Generate');

      if (reload) {
        //alert('Generation Complete, reloading...');
        window.location.href = this.genQueryString(animationKey, null,
          null, null, this.subView);
      }

    }, 10);

    return;
  }
  openNewWindow(tag, key, wid = null) {
    let url = this.genQueryString(wid, tag, key);
    let a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
}
