class cGeoView extends bView {
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

    this.dialog.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e => {
      gAPPP.a.resetProfile();
      setTimeout(() => location.reload(), 100);
    });

    this.startLat = 0;
    this.startLon = 0;
    this.latitude = '0';
    this.longitude = '0';

    this.elementTypeChange();

    this.initGPSUpdates();

    this._updateSelectedBlock(gAPPP.blockInURL);
  }
  __updateLocation(updateCoords) {
    if (updateCoords) {
      this.startLat = Number(this.latitude);
      this.startLon = Number(this.longitude);
    }
    this.base_location.innerHTML = 'Base :' + this.startLat.toFixed(7) + '°, ' + this.startLon.toFixed(7) + '°';
    let d_result = this.getGPSDiff(this.startLat, this.startLon, this.latitude, this.longitude);
    this.offset_distances.innerHTML = 'crow:' + d_result.distance.toFixed(3) + '<br>h:' + d_result.horizontal.toFixed(3)
      + ', v:' + d_result.vertical.toFixed(3);

    if (!this.context)
      return;

    this.context.camera._position.x = d_result.horizontal  * -5.0;
    this.context.camera._position.z = d_result.vertical * -5.0;
  }
  initGPSUpdates() {
    this.gps_info_overlay = this.dialog.querySelector('.gps_info_overlay');
    this.gps_location = this.dialog.querySelector('.gps_location');
    this.device_orientation = this.dialog.querySelector('.device_orientation');
    this.offset_distances = this.dialog.querySelector('.offset_distances');
    this.base_location = this.dialog.querySelector('.base_location');
    this.use_current_location = this.dialog.querySelector('.use_current_location');
    this.__updateLocation();
    this.use_current_location.addEventListener('click', e => this.__updateLocation(true));
    this.gps_location.innerHTML = 'initing...';
    this.device_orientation.innerHTML = 'initing...';

    window.addEventListener('deviceorientation', event => {
      let alpha = event.alpha ? event.alpha.toFixed(0) : 'none';
      let beta = event.beta ? event.beta.toFixed(1) : 'none';
      let gamma = event.gamma ? event.gamma.toFixed(2) : 'none';

      this.device_orientation.innerHTML = 'A:' + alpha + '°, B:' + beta + '°, G:' + gamma;
    });

    navigator.geolocation.watchPosition(position => {
      this.latitude = position.coords.latitude.toFixed(7);
      this.longitude = position.coords.longitude.toFixed(7);

      let html = `La: ${this.latitude}°<br>Lo: ${this.longitude}°`;
      this.gps_location.innerHTML = html;
      this.__updateLocation();
    }, err => {
      this.gps_location.innerHTML = 'ERROR(' + err.code + '): ' + err.message;
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  }
  __distanceGPSMeters(lat1, lon1, lat2, lon2) {
    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }

    let earthradius_m = 6371000;
    let dLat = deg2rad(lat2-lat1);
    let dLon = deg2rad(lon2-lon1);
    let a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return earthradius_m * c;
  }
  getGPSDiff(lat1, lon1, lat2, lon2) {
    let distance = this.__distanceGPSMeters(lat1, lon1, lat2, lon2);
    let horizontal = this.__distanceGPSMeters(lat1, lon1, lat2, lon1);
    let vertical = this.__distanceGPSMeters(lat1, lon1, lat1, lon2);

    return {
      horizontal,
      vertical,
      distance
    };
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
  splitLayout() {
    this.dialog.style.display = 'block';
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
    for (let c = 0, l = fields.length; c < l; c++)
      fieldOptions += '<option>' + fields[c].fireSetField + '</option>';

    fldList.innerHTML = fieldOptions;
  }
  _canvasPanelTemplate() {
    return `<canvas class="popup-canvas"></canvas>
    <div class="video-overlay">
      <video></video>
    </div>
    <div class="canvas-actions">
      <div class="canvas-play-bar" style="">
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
        <div class="gps_info_overlay">
          <span class="gps_location"></span>
          <br>
          <span class="device_orientation"></span>
          <br>
          <div class="offset_info_panel">
            <span class="base_location">base location</span>
            <br>
            <span class="offset_distances">hor, vert, crow</span>
            <br>
            <button class="use_current_location">Use Current Location</button>
          </div>
        </div>
        <button class="btn-sb-icon gps-options" style="clear:both;">GPS</button>
        <div style="display:none">
          <br>
          <button class="btn-sb-icon scene-options" style="clear:both;"><i class="material-icons">settings_brightness</i></button>
          <button class="btn-sb-icon play-button"><i class="material-icons">play_arrow</i></button>
          <button class="btn-sb-icon pause-button"><i class="material-icons">pause</i></button>
          <div class="run-length-label"></div>
          <input class="animate-range" type="range" step="any" value="0" min="0" max="100" />
          <div class="camera-options-panel" style="display:none;">
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
      </div>
    </div>`;
  }
  layoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;">
  <div id="renderLoadingCanvas" style="display:none;"><br><br>LOADING...</div>
  <div class="form_canvas_wrapper"></div>
  <button id="user-profile-dialog-reset-button" style="display:none">Reset Options</button>
  <button id="publish-settings-button" style='display:none' class="btn-sb-icon"><i class="material-icons">settings_brightness</i></button>
  <div id="publish-profile-panel" style="display:none;">
    <div id="value-set-panel">
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

    <div class="fields-container"></div>
  </div>
</div>`;
  }
}
