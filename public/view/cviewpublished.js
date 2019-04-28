class cViewPublished extends bView {
  constructor() {
    super();

    this.elementSelect = document.getElementById('element-type-to-edit');
    this.elementSelect.addEventListener('input', e => this.elementTypeChange());
    this.blockId = document.getElementById('element-id-to-edit');
    this.blockField = document.getElementById('field-name-to-edit');
    this.fieldValue = document.getElementById('value-to-edit');
    this.setButton = document.getElementById('button-to-edit');
    this.setButton.addEventListener('click', e => this.setValue());

    this.bandButtons = [];
    this.fontToolsContainer = this.dialog.querySelector('#publish-profile-panel');
    this.fontFields = sDataDefinition.bindingFieldsCloned('publishFontFamilyProfile');
    this.fontFieldsContainer = this.fontToolsContainer.querySelector('.fields-container');
    this.fontToolsButton = this.dialog.querySelector('#publish-settings-button');
    this.fontTools = new cBandProfileOptions(this.fontToolsButton, this.fontFields, this.fontFieldsContainer, this.fontToolsContainer);
    this.fontTools.fireFields.values = gAPPP.a.profile;
    this.fontTools.activate();
    this.bandButtons.push(this.fontTools);
    this.fontTools.closeOthersCallback = () => this.closeHeaderBands();

    this.dialog.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e =>{
      gAPPP.a.resetProfile();
      setTimeout(() => location.reload(), 100);
    });

    this.elementTypeChange();
  }
  closeHeaderBands() {

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
  elementTypeChange() {
    let t = this.elementSelect.value.toLowerCase();

    let eleList = document.createElement('datalist');
    let fldList = document.createElement('datalist');
    eleList.setAttribute('id', 'elementidlist');
    fldList.setAttribute('id', 'fieldnamelist');
    document.body.appendChild(eleList);
    document.body.appendChild(fldList);

    let options = '';
    let fS = gAPPP.a.modelSets[t].fireDataValuesByKey;
    for (let i in fS)
      options += '<option>' + i + ' ' + fS[i].title + '</option>';

    eleList.innerHTML = options;

    if (t === 'frame')
      t = 'shapeFrame';
    let fields = sDataDefinition.bindingFields(t);

    let fieldOptions = '';
    for (let c = 0, l = fields.length; c< l; c++)
      fieldOptions += '<option>' + fields[c].fireSetField + '</option>';

    fldList.innerHTML = fieldOptions;
  }
  _canvasPanelTemplate() {
    return `<canvas class="popup-canvas"></canvas>
    <div class="video-overlay">
      <video></video>
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
}
