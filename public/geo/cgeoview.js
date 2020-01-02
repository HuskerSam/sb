class cGeoView extends bView {
  constructor() {
    super(undefined, undefined, null, true);

    this.bandButtons = [];
    this.fontToolsContainer = this.dialog.querySelector('#publish-profile-panel');
    this.fontFields = sDataDefinition.bindingFieldsCloned('fontFamilyProfile');
    this.fontFields.push({
      title: 'Bounds',
      fireSetField: 'showBoundsBox',
      type: 'boolean',
      group: 'depthExtras',
      floatLeft: true,
      clearLeft: true,
      groupClass: 'scene-tools-checkboxes'
    });
    this.fontFieldsContainer = this.fontToolsContainer.querySelector('.fields-container');
    this.fontToolsButton = this.dialog.querySelector('#publish-settings-button');
    this.fontTools = new cBandProfileOptions(this.fontToolsButton, this.fontFields, this.fontFieldsContainer, this.fontToolsContainer);
    this.fontTools.fireFields.values = gAPPP.a.profile;
    this.fontTools.activate();
    this.bandButtons.push(this.fontTools);
    this.fontTools.closeOthersCallback = () => this.closeHeaderBands();

    this.gps_info_overlay = this.dialog.querySelector('.gps_info_overlay');
    this.gps_overlay_btn = this.dialog.querySelector('.gps_overlay_btn');
    this.gpsOverlayPopup = new cBandProfileOptions(this.gps_overlay_btn, [], this.gps_info_overlay, this.gps_info_overlay);
    this.gpsOverlayPopup.fireFields.values = gAPPP.a.profile;
    this.gpsOverlayPopup.activate();
    this.bandButtons.push(this.gpsOverlayPopup);
    this.gpsOverlayPopup.closeOthersCallback = () => this.closeHeaderBands();

    this.geo_add_item_panel = this.dialog.querySelector('.geo_add_item_panel');
    this.geo_add_btn = this.dialog.querySelector('.geo_add_btn');
    this.geoAddPopup = new cBandProfileOptions(this.geo_add_btn, [], this.geo_add_item_panel, this.geo_add_item_panel);
    this.geoAddPopup.fireFields.values = gAPPP.a.profile;
    this.geoAddPopup.activate();
    this.bandButtons.push(this.geoAddPopup);
    this.geoAddPopup.closeOthersCallback = () => this.closeHeaderBands();

    this.asset_list_panel = this.dialog.querySelector('.asset_list_panel');
    this.object_list_btn = this.dialog.querySelector('.object_list_btn');
    this.objectListPopup = new cBandProfileOptions(this.object_list_btn, [], this.asset_list_panel, this.asset_list_panel);
    this.objectListPopup.fireFields.values = gAPPP.a.profile;
    this.objectListPopup.activate();
    this.bandButtons.push(this.objectListPopup);
    this.objectListPopup.closeOthersCallback = () => this.closeHeaderBands();

    this.geo_add_block = this.dialog.querySelector('.geo_add_block');
    this.geo_add_block.addEventListener('click', e => this.geoAddItem());

    this.child_edit_panel = this.dialog.querySelector('.child_edit_panel');
    this.child_band_picker = this.dialog.querySelector('.child_band_picker');
    this.child_select_picker = this.dialog.querySelector('.child_select_picker');
    this.childBand = new cBlockLinkSelect(this.child_select_picker, this, this.child_edit_panel, this.child_band_picker, true);

    this.dialog.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e => {
      gAPPP.a.resetProfile();
      setTimeout(() => location.reload(), 100);
    });

    this.removeChildButton = this.dialog.querySelector('.main-band-delete-child');
    this.removeChildButton.addEventListener('click', e => this.removeChild(e));

    this.center_sliders_btn = this.dialog.querySelector('.center_sliders_btn');
    this.center_sliders_btn.addEventListener('click', e => {
      this.geo_position_x_slider.value = 0;
      this.geo_position_x_slider.lastValue = 0;
      this.geo_position_y_slider.value = 0;
      this.geo_position_y_slider.lastValue = 0;
      this.geo_position_z_slider.value = 0;
      this.geo_position_z_slider.lastValue = 0;
    });
    this.canvasHelper.closeMenusOnClick = false;

    this.startLat = 0;
    this.startLon = 0;
    this.latitude = '0';
    this.longitude = '0';
    this.offsetX = 0;
    this.offsetY = 15;
    this.offsetZ = 0;

    this.initGPSUpdates();
    this.initLocationAdjustments();
    this.initDimensionAdjustments();
    this._updateSelectedBlock(gAPPP.blockInURL);
  }
  initDimensionAdjustments() {
    this.x_dimension_slider = this.dialog.querySelector('.x_dimension_slider');
    this.y_dimension_slider = this.dialog.querySelector('.y_dimension_slider');
    this.z_dimension_slider = this.dialog.querySelector('.z_dimension_slider');
    this.dimensionType = 'position';

    this.center_object_sliders = this.dialog.querySelector('.center_object_sliders');
    this.center_object_sliders.addEventListener('click', e => this.resetDimensionSliders());

    this.dialog.querySelectorAll('input[name="typeofdimension"]').forEach(i => i.addEventListener('click', e => {
      this.dimensionType = i.dataset.dimension;
      this.resetDimensionSliders();
    }));

    this.dialog.querySelectorAll('.dimension_slider').forEach(i => {
      i.lastValue = 0;
      i.addEventListener('input', e => {
        let field = i.dataset.field;
        if (this.dimensionType === 'position') {
          let offset = Number(i.value) - i.lastValue;

          let block = this.context.activeBlock;
          if (!block)
            return;
          let frames = block.framesHelper.framesStash;
          let frameIds = [];
          for (let i in frames)
            frameIds.push(i);
          let existingValues = gAPPP.a.modelSets['frame'].fireDataValuesByKey[frameIds[0]];

          if (existingValues) {
            let fieldTag = 'position';
            if (field === 'x')
              fieldTag += 'X';
            if (field === 'y')
              fieldTag += 'Y';
            if (field === 'z')
              fieldTag += 'Z';

            let val = GLOBALUTIL.getNumberOrDefault(existingValues[fieldTag], 0);
            val += offset;
            i.lastValue = i.value;

            return gAPPP.a.modelSets['frame'].commitUpdateList([{
              field: fieldTag,
              newValue: val.toString()
            }], frameIds[0]);
          }
        }
      });
    });
  }
  resetDimensionSliders() {
    this.dialog.querySelectorAll('.dimension_slider').forEach(i => {
      i.value = 0;
      i.lastValue = 0;
    });
  }
  initLocationAdjustments() {
    this.geo_position_x_slider = this.dialog.querySelector('.geo_position_x_slider');
    this.geo_position_y_slider = this.dialog.querySelector('.geo_position_y_slider');
    this.geo_position_z_slider = this.dialog.querySelector('.geo_position_z_slider');

    this.geo_position_x_slider.addEventListener('input', e => {
      let lastValue = this.geo_position_x_slider.lastValue;
      if (lastValue === undefined)
        lastValue = 0;
      let newValue = Number(this.geo_position_x_slider.value);
      this.offsetX += newValue - lastValue;
      this.geo_position_x_slider.lastValue = newValue;
      this.__updateLocation();
    });
    this.geo_position_y_slider.addEventListener('input', e => {
      let lastValue = this.geo_position_y_slider.lastValue;
      if (lastValue === undefined)
        lastValue = 0;
      let newValue = Number(this.geo_position_y_slider.value);
      this.offsetY += newValue - lastValue;
      this.geo_position_y_slider.lastValue = newValue;
      this.__updateLocation();
    });
    this.geo_position_z_slider.addEventListener('input', e => {
      let lastValue = this.geo_position_z_slider.lastValue;
      if (lastValue === undefined)
        lastValue = 0;
      let newValue = Number(this.geo_position_z_slider.value);
      this.offsetZ += newValue - lastValue;
      this.geo_position_z_slider.lastValue = newValue;
      this.__updateLocation();
    });
  }
  async canvasReadyPostTimeout() {
    await super.canvasReadyPostTimeout();
    //this.setChildKey(this.childKey);
    if (this.rootBlock)
      this.childBand.refreshUIFromCache();
  }
  setChildKey(key) {
    this.childKey = key;

    if (this.rootBlock) {
      let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
      if (block)
        this.context.setActiveBlock(block);
      else
        this.context.setActiveBlock(this.rootBlock);
    }

  }
  removeChild(e) {
    if (confirm('Remove this child block (only the link)?')) {
      this.childBand.fireSet.removeByKey(this.childKey);
      this.childBand.setKey(null);
      this.setChildKey(null);
    }
  }
  async geoAddItem() {
    let blockName = this.dialog.querySelector('.geo_block_name').value;
    let parent = gAPPP.a.modelSets['block'].fireDataValuesByKey[this.initBlockKey].title;
    let csvRow = {
      asset: 'blockchild',
      name: blockName,
      childtype: 'block',
      x: this.context.camera._position.x,
      y: 3.0,
      z: this.context.camera._position.z,
      sx: 5,
      sy: 5,
      sz: 5,
      parent
    };
    let blockResult = await (new gCSVImport(gAPPP.loadedWID)).addCSVRow(csvRow);

    //select block if not
  }
  __updateLocation(updateCoords) {
    if (updateCoords) {
      this.startLat = Number(this.latitude);
      this.startLon = Number(this.longitude);
      this.offsetX = 0;
      this.offsetY = 15;
      this.offsetZ = 0;
    }
    this.base_location.innerHTML = 'Base :' + this.startLat.toFixed(7) + '°, ' + this.startLon.toFixed(7) + '°';
    let d_result = this.getGPSDiff(this.startLat, this.startLon, this.latitude, this.longitude);
    this.offset_distances.innerHTML = 'crow:' + d_result.distance.toFixed(3) + '<br>h:' + d_result.horizontal.toFixed(3) +
      ', v:' + d_result.vertical.toFixed(3);

    if (!this.context)
      return;

    this.context.camera._position.x = this.offsetX + d_result.vertical * -1.0; //
    this.context.camera._position.y = this.offsetY;
    this.context.camera._position.z = this.offsetZ + d_result.horizontal * 1.0; //
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
      return deg * (Math.PI / 180)
    }

    let earthradius_m = 6371000;
    let dLat = deg2rad(lat2 - lat1);
    let dLon = deg2rad(lon2 - lon1);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
    for (let i in this.bandButtons) {
      this.bandButtons[i].expanded = true;
      this.bandButtons[i].toggle();
    }
  }
  splitLayout() {
    this.dialog.style.display = 'block';
  }
  _canvasPanelTemplate() {
    return `<canvas class="popup-canvas"></canvas>
    <div class="video-overlay">
      <video></video>
    </div>
    <div class="canvas-actions">
      <div class="canvas_play_bar" style="">
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
        <div>
          <button class="btn-sb-icon gps_overlay_btn"><i class="material-icons">explore</i></button>
          <button class="btn-sb-icon geo_add_btn"><i class="material-icons">add</i></button>
          <button class="btn-sb-icon object_list_btn"><i class="material-icons">3d_rotation</i></button>
          <button id="publish-settings-button" class="btn-sb-icon"><i class="material-icons">settings_brightness</i></button>
        </div>
        <div id="publish-profile-panel" style="display:none;">
          <div class="fields-container"></div>
          <button id="user-profile-dialog-reset-button" style="display:none">Reset Options</button>
          <br>
          <div style="clear:both;">
            User Specific Color for Selection <input type="color" />
          </div>
        </div>
        <div class="gps_info_overlay" style="display:none">
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
            <br>
            Adjust Location (local only)<br>
            <div style="display:flex;">
              <span>X:</span>
              <input type="range" min="-50" max="50" class="geo_position_x_slider" step=".005" value="0">
            </div>
            <div style="display:flex;">
              <span>Y:</span>
              <input type="range" min="-50" max="50" class="geo_position_y_slider" step=".005" value="0">
            </div>
            <div style="display:flex;">
              <span>Z:</span>
              <input type="range" min="-50" max="50" class="geo_position_z_slider" step=".005" value="0">
            </div>
            <div style="text-align:center;padding:.25em;">
              <button class="center_sliders_btn">Center Sliders</button>
            </div>
            <div style="display:inline-block;width:100%;position:relative;">
              <div class="camera-slider-label">FOV</div>
              <input class="camera-select-range-fov-slider" type="range" step=".01" min="-1" max="2.5" value=".8" />
            </div>
          </div>
        </div>
        <div class="geo_add_item_panel" style="display:none;">
          <input class="geo_block_name" list="blockdatatitlelookuplist" />
          <button class="geo_add_block">Add</button>
        </div>
        <div class="asset_list_panel" style="display:none;width:100vw;overflow:hidden;">
          <div class="child_band_picker"></div>
          <select class="child_select_picker"></select>
          <button class="main-band-delete-child"><i class="material-icons">link_off</i></button>
          <div class="child_edit_panel">
            <div style="display:flex;">
              <label><input type="radio" name="typeofdimension" data-dimension="position" class="position_dimensions" checked />Position</label>
              <label><input type="radio" name="typeofdimension" data-dimension="rotation" class="rotation_dimensions" />Rotation</label>
              <label><input type="radio" name="typeofdimension" data-dimension="scale" class="scale_dimensions" />Scale</label>
            </div>
            <div style="display:flex;">
              <span>X:</span>
              <input type="range" class="dimension_slider" data-field="x" min="-50" max="50" step=".005" value="0">
            </div>
            <div style="display:flex;">
              <span>Y:</span>
              <input type="range" class="dimension_slider" data-field="y" min="-50" max="50" step=".005" value="0">
            </div>
            <div style="display:flex;">
              <span>Z:</span>
              <input type="range" class="dimension_slider" data-field="z" min="-50" max="50" step=".005" value="0">
            </div>
            <div style="text-align:center;padding:.25em;">
              <button class="center_object_sliders">Center Sliders</button>
            </div>
          </div>
        </div>
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
</div>`;
  }
}
