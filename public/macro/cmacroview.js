class cMacroView extends bView {
  constructor(layoutMode, tag, key, childKey) {
    super('None', tag, key, false, childKey);
    this.canvasHelper.initExtraOptions();

    this.refreshProjectList().then(() => {});
    this._updateGoogleFonts().then(() => {});

    this.profilePanelRegister();

/*

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


*/








  }
  initUI() {}
  initDataFields() {
    if (this.fireSetCallback)
      this.fireSet.removeListener(this.fireSetCallback);
  }
  splitLayoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;flex-direction:column;">
      <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
      <div id="main-view-wrapper">
        <div class="form_canvas_wrapper"></div>
        <div class="form_panel_view_dom">
          <div id="profile-header-panel">${this.profilePanelTemplate()}</div>
          <div class="header_wrapper" style="line-height: 3em;">
            <b>&nbsp;Workspace</b>
            <select id="workspaces-select"></select>
            <button id="profile_description_panel_btn" style="float:right;" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">person</i></button>
          </div>
          <div class="data-view-container">
          </div>
        </div>
      </div>
    </div>
    <datalist id="fontfamilydatalist"></datalist>
    <datalist id="skyboxlist"></datalist>
    <datalist id="sbmesheslist"></datalist>`;
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
}
