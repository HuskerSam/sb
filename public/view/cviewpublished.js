class cViewPublished extends bView {
  constructor() {
    super(null, null, null, true);

    this.elementSelect = document.getElementById('element-type-to-edit');
    this.elementSelect.addEventListener('input', e => this.elementTypeChange());
    this.blockId = document.getElementById('element-id-to-edit');
    this.blockField = document.getElementById('field-name-to-edit');
    this.fieldValue = document.getElementById('value-to-edit');
    this.setButton = document.getElementById('button-to-edit');
    this.setButton.addEventListener('click', e => this.setValue());
    this.noProjectFoundCanvas = document.getElementById('noProjectFoundCanvas');

    this.bandButtons = [];
    this.fontToolsContainer = this.dialog.querySelector('#publish-profile-panel');
    this.fontFields = [{
      title: 'Background',
      fireSetField: 'canvasColor',
      type: 'color',
      group: 'main1',
      rangeMin: '0',
      rangeMax: '1',
      rangeStep: '.005',
      floatLeft: true,
      clearLeft: true,
      displayType: 'shortVector'
    },{
      title: 'Font',
      fireSetField: 'fontFamily',
      group: 'main',
      dataListId: 'fontfamilydatalist',
      type: 'font',
      floatLeft: true,
      clearLeft: true
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
    }];
    this.fontFieldsContainer = this.fontToolsContainer.querySelector('.fields-container');
    this.fontToolsButton = this.dialog.querySelector('#publish-settings-button');
    this.fontTools = new cBandProfileOptions(this.fontToolsButton, this.fontFields, this.fontFieldsContainer, this.fontToolsContainer);
    this.fontTools.fireFields.values = gAPPP.a.profile;
    this.fontTools.activate();
    this.bandButtons.push(this.fontTools);
    this.fontTools.closeOthersCallback = () => this.closeHeaderBands();

    this.publish_help_viewer = this.dialog.querySelector('#publish_help_viewer');
    this.publish_help_viewer.addEventListener('click', e => {
      let url = '/doc/viewer';
      let a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    this.dialog.querySelector('#enable_vr_canvas_btn').addEventListener('click', e => {
      gAPPP.activeContext.setupXRSupport();
    });

    this.dialog.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e =>{
      gAPPP.a.resetProfile();
      setTimeout(() => location.reload(), 100);
    });

    this.elementTypeChange();

    this._updateSelectedBlock(gAPPP.blockInURL);

    gAPPP.activeContext.handleAnimationNotReadyCallback = () => {
      this.rootBlock.updatesDisabled = true;
      this.canvasHelper.hide();
    };
    gAPPP.activeContext.handleAnimationReadyCallback = () => {
      if (this.rootBlock.updatesDisabled)
        location.reload();
    };

    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());

    this.refreshProjectList();
  }
  closeHeaderBands() {

  }
  async canvasReadyPostTimeout() {
    this.updateDisplayCameraName();
    this.updateSelectedCamera();
    await super.canvasReadyPostTimeout();
    this._displayCameraFeatures();
  }
  _displayCameraFeatures() {
    if (!this.rootBlock)
      return;
      
    this.updateDisplayCameraName();
    if (this.displayCamera) {
      setTimeout(() => this.updateSelectedCamera(), 150);
    } else {
      setTimeout(() => this.canvasHelper.cameraChangeHandler(), 150);
    }

    if (this.rootBlock.blockRawData && this.rootBlock.blockRawData.supportVR) {
      setTimeout(() => gAPPP.activeContext.setupXRSupport(), 1500);
    }
    this.updateDocTitle();
  }
  updateSelectedCamera() {
    if (!this.displayCamera)
      return;

    let options = this.canvasHelper.cameraSelect;
    for (let c = 0; c < options.length; c++) {
      if (options.item(c).innerHTML === this.displayCamera) {
        this.canvasHelper.cameraSelect.selectedIndex = c;
        this.canvasHelper.cameraChangeHandler();
        break;
      }
    }
  }
  updateDisplayCameraName() {
    if (!this.rootBlock)
      return;
    this.displayCamera = 'demo';
    this.sceneDefaultCamera = '';
    if (this.rootBlock.blockRawData && this.rootBlock.blockRawData.displayCamera) {
      this.displayCamera = this.rootBlock.blockRawData.displayCamera;
      this.sceneDefaultCamera = this.displayCamera;
    }
    let urlParams = new URLSearchParams(window.location.search);
    let displayCamera = urlParams.get('displayCamera');
    if (displayCamera)
      this.displayCamera = displayCamera;
  }
  setValue() {
    let t = this.elementSelect.value.toLowerCase();
    let id = this.blockId.value.split(' ')[0].trim();
    let field = this.blockField.value.trim();
    let v = this.fieldValue.value;

    if (id === '')
      return;

    if (field === '')
      return;

    gAPPP.a.modelSets[t].commitUpdateList([{
      field: field,
      newValue: v
    }], id);

  }
  splitLayout() {
    this.dialog.style.display = 'block';
  }
  elementTypeChange() {
    let t = this.elementSelect.value.toLowerCase();
    if (!gAPPP.a.modelSets[t])
      return;

    if (this.eleList) this.eleList.remove();
    if (this.fldList) this.fldList.remove();

    this.eleList = document.createElement('datalist');
    this.fldList = document.createElement('datalist');
    this.eleList.setAttribute('id', 'elementidlist');
    this.fldList.setAttribute('id', 'fieldnamelist');
    document.body.appendChild(this.eleList);
    document.body.appendChild(this.fldList);

    let options = '';
    let fS = gAPPP.a.modelSets[t].fireDataValuesByKey;
    for (let i in fS)
      options += '<option>' + i + ' ' + fS[i].title + '</option>';

    this.eleList.innerHTML = options;

    if (t === 'frame')
      t = 'shapeFrame';
    let fields = sDataDefinition.bindingFields(t);

    let fieldOptions = '';
    for (let c = 0, l = fields.length; c< l; c++)
      fieldOptions += '<option>' + fields[c].fireSetField + '</option>';

    this.fldList.innerHTML = fieldOptions;
  }
  _canvasPanelTemplate() {
    return `<canvas class="popup-canvas"></canvas>
    <div class="video-overlay">
      <video></video>
    </div>
    <div class="canvas-actions">
      <div class="canvas-play-bar">
        <div class="scene-options-panel" style="display:none;">
          <select id="workspaces-select" style="float:left;"></select>
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
          <button class="btn-sb-icon glb-download-button"><i class="material-icons">download_for_offline</i></button>
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
    <div id="noProjectFoundCanvas" style="display:none;"><br><br>No Project Found</div>
  <div class="form_canvas_wrapper"></div>
  <div style="position:absolute;bottom:.25em;right:.25em;">
    <button id="user-profile-dialog-reset-button" style="padding-top:.125em;padding-bottom:.125em;">Reset</button>
    <button id="publish-settings-button" class="btn-sb-icon"><i class="material-icons">dashboard</i></button>
    <button id="publish_help_viewer" class="btn-sb-icon"><i class="material-icons">help</i></button>
  </div>
  <div id="publish-profile-panel" style="display:none;">
    <div id="value-set-panel" class="app-panel app-transparent">
      <label><span>Element</span>
      <select id="element-type-to-edit">
        <option>Block</option>
        <option>BlockChild</option>
        <option>Shape</option>
        <option>Mesh</option>
        <option>Texture</option>
        <option>Material</option>
        <option>Frame</option>
      </select>
      </label>
      <br>
      <label><span>ID</span><input id="element-id-to-edit" type="text" list="elementidlist" /></label>
      <br>
      <label><span>Field</span><input id="field-name-to-edit" type="text" list="fieldnamelist" /></label>
      <br>
      <label><span>Value</span><input id="value-to-edit" type="text" /></label>
      <br>
      <button id="button-to-edit">Set</button>
    </div>
    <button id="enable_vr_canvas_btn">Enable VR</button>
    <div class="fields-container"></div>
  </div>
</div>`;
  }
}
