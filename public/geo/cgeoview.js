class cGeoView extends bView {
  constructor() {
    let geoOptions = {
      zeroLatitude: GLOBALUTIL.getNumberOrDefault(gAPPP.latitude, 0.0),
      zeroLongitude: GLOBALUTIL.getNumberOrDefault(gAPPP.longitude, 0.0),
      geoRadius: 50.0
    };
    super(undefined, undefined, null, true, undefined, undefined, geoOptions);

    this.initLinkBlockSelect();

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

    this.initBlockAddPanel();
    this.initGPSUpdates();
    this.initLocationAdjustments();
    this.initDimensionAdjustments();
    this._updateSelectedBlock(gAPPP.blockInURL);

    this.status_panel = this.dialog.querySelector('.status_panel');
    this.status_bar_btn = this.dialog.querySelector('.status_bar_btn');
    this.status_bar_btn.addEventListener('click', e => {
      if (this.status_panel.classList.contains('collapsed')) {
        this.status_panel.classList.remove('collapsed');
        this.status_bar_btn.classList.remove('app-inverted');
      } else {
        this.status_panel.classList.add('collapsed');
        this.status_bar_btn.classList.add('app-inverted');
      }
    });

    this.asset_list_panel = this.dialog.querySelector('.asset_list_panel');
    this.geo_add_btn = this.dialog.querySelector('.geo_add_btn');
    this.geo_add_btn.addEventListener('click', e => {
      if (this.asset_list_panel.classList.contains('collapsed')) {
        this.asset_list_panel.classList.remove('collapsed');
        this.geo_add_btn.classList.remove('app-inverted');
      } else {
        this.asset_list_panel.classList.add('collapsed');
        this.geo_add_btn.classList.add('app-inverted');
      }
    });

    this.geo_add_item_panel = this.dialog.querySelector('.geo_add_item_panel');
    this.geo_create_btn = this.dialog.querySelector('.geo_create_btn');
    this.geo_create_btn.addEventListener('click', e => {
      if (this.geo_add_item_panel.classList.contains('collapsed')) {
        this.geo_add_item_panel.classList.remove('collapsed');
        this.geo_create_btn.classList.remove('app-inverted');
      } else {
        this.geo_add_item_panel.classList.add('collapsed');
        this.geo_create_btn.classList.add('app-inverted');
      }
    });

    this.spoof_list_panel = this.dialog.querySelector('.spoof_list_panel');
    this.spoof_location_btn = this.dialog.querySelector('.spoof_location_btn');
    this.spoof_location_btn.addEventListener('click', e => {
      if (this.spoof_list_panel.classList.contains('collapsed')) {
        this.spoof_list_panel.classList.remove('collapsed');
        this.spoof_location_btn.classList.remove('app-inverted');
      } else {
        this.spoof_list_panel.classList.add('collapsed');
        this.spoof_location_btn.classList.add('app-inverted');
      }
    });

    this.geo_status_panel = this.dialog.querySelector('.geo_status_panel');
    this.status_panel_btn = this.dialog.querySelector('.status_panel_btn');
    this.status_panel_btn.addEventListener('click', e => {
      if (this.geo_status_panel.classList.contains('collapsed')) {
        this.geo_status_panel.classList.remove('collapsed');
        this.status_panel_btn.classList.remove('app-inverted');
      } else {
        this.geo_status_panel.classList.add('collapsed');
        this.status_panel_btn.classList.add('app-inverted');
      }
    });

    this.initProfilePanel();
    this.initSpoofPanel();
    this.initStatusPanel();
    this.expandAll();
  }
  initStatusPanel() {

  }
  initSpoofPanel() {
    this.add_spoof_location = this.dialog.querySelector('.add_spoof_location');
    this.use_current_location = this.dialog.querySelector('.use_current_location');
    this.latitude_to_add = this.dialog.querySelector('.latitude_to_add');
    this.longitude_to_add = this.dialog.querySelector('.longitude_to_add');
    this.location_name_to_add = this.dialog.querySelector('.location_name_to_add');
    this.use_current_location = this.dialog.querySelector('.use_current_location');

    //this.use_current_location.addEventListener('click', e => this.__updateLocation(true));
    this.use_current_location.addEventListener('click', e => {
      this.latitude_to_add.value = this.latitude;
      this.longitude_to_add.value = this.longitude;
    });

    this.add_spoof_location.addEventListener('click', e => {
      if (this.latitude_to_add.value == '')
        this.latitude_to_add.value = this.latitude;
      if (this.longitude_to_add.value == '')
        this.longitude_to_add.value = this.longitude;

      let objectData = {
        title: this.location_name_to_add.value,
        latitude: this.latitude_to_add.value,
        longitude: this.longitude_to_add.value
      };

      gAPPP.a.modelSets['spoof_location'].createWithBlobString(objectData).then(e => {
        this.location_name_to_add.value = '';
      })
    });

    gAPPP.a.modelSets['spoof_location'] = new mFirebaseList(this.loadedWID, 'spoof_location', true);
    this.location_list = this.dialog.querySelector('.location_list');
    this.locations_band = new cBandIcons('spoof_location', this, this.location_list, true);
    this.locations_band.getDateString = (values) => {
      return values.latitude + ' ' + values.longitude;
    };
    gAPPP.a.modelSets['spoof_location'].activate();

    this.update_spoof_image = this.dialog.querySelector('.update_spoof_image');
    this.update_spoof_image.addEventListener('click', e => {
      if (! this.spoofKey)
        return;
      this.context.renderPreview('spoof_location', this.spoofKey);
    });
  }
  initLinkBlockSelect() {
    this.geo_link_block_select = this.dialog.querySelector('.geo_link_block_select');
    this.geo_link_block_select.addEventListener('input', e => this.geoAddItem());
    this.__updateLinkableBlocks();
  }
  __updateLinkableBlocks() {
    let html = "<option>Link Block</option>";
    for (let item in gAPPP.a.modelSets['block'].titleMap)
      html += '<option>' + item + '</option>';
    this.geo_link_block_select.innerHTML = html;
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    super._updateContextWithDataChange(tag, values, type, fireData);
    this.__updateLinkableBlocks();
  }
  initProfilePanel() {
    this.fontFields = [];
    this.fontFields.push({
      title: 'Bounds',
      fireSetField: 'showBoundsBox',
      type: 'boolean',
      group: 'depthExtras',
      floatLeft: true,
      clearLeft: true,
      groupClass: 'scene-tools-checkboxes'
    }, {
      title: 'Wireframe',
      fireSetField: 'showForceWireframe',
      type: 'boolean',
      group: 'depthExtras',
      floatLeft: true,
      clearLeft: true,
    }, {
      title: 'Grid',
      fireSetField: 'showFloorGrid',
      type: 'boolean',
      group: 'depthExtras',

      floatLeft: true,
      clearLeft: true
    }, {
      title: 'Guides',
      fireSetField: 'showSceneGuides',
      group: 'depthExtras',
      type: 'boolean',
      floatLeft: true,
      clearLeft: true
    }, {
      title: 'Depth',
      fireSetField: 'gridAndGuidesDepth',
      displayType: 'number',
      group: 'depthExtras',
      clearLeft: true
    }, {
      title: 'Light',
      fireSetField: 'lightIntensity',
      helperType: 'singleSlider',
      rangeMin: '0',
      rangeMax: '2',
      rangeStep: '.01',
      displayType: 'number',
      group: 'group2',
      groupClass: 'light-intensity-user-panel'
    });
    this.publish_profile_panel = this.dialog.querySelector('.publish_profile_panel');
    this.fontFieldsContainer = this.publish_profile_panel.querySelector('.fields-container');
    this.fontFireFields = new cBandProfileOptions(null, this.fontFields, this.fontFieldsContainer, this);
    this.fontFireFields.fireFields.values = gAPPP.a.profile;
    this.fontFireFields.fireFields.paint()
    this.fontFireFields.fireFields.helpers.expandAll();

    this.textFields = sDataDefinition.bindingFieldsCloned('fontFamilyProfile');
    this.publish_profile_panel = this.dialog.querySelector('.publish_profile_panel');
    this.profile_show_btn = this.dialog.querySelector('.profile_show_btn');
    this.profile_show_btn.addEventListener('click', e => {
      if (this.publish_profile_panel.classList.contains('collapsed')) {
        this.publish_profile_panel.classList.remove('collapsed');
        this.profile_show_btn.classList.remove('app-inverted');
      } else {
        this.publish_profile_panel.classList.add('collapsed');
        this.profile_show_btn.classList.add('app-inverted');
      }
    });

    this.text_profile_panel = this.dialog.querySelector('.text_profile_panel');
    this.textFieldsContainer = this.text_profile_panel.querySelector('.fields-container');
    this.textFireFields = new cBandProfileOptions(null, this.textFields, this.textFieldsContainer, this);
    this.textFireFields.fireFields.values = gAPPP.a.profile;
    this.textFireFields.fireFields.paint()
    this.textFireFields.fireFields.helpers.expandAll();

    this.text_profile_panel = this.dialog.querySelector('.text_profile_panel');
    this.textcolor_show_btn = this.dialog.querySelector('.textcolor_show_btn');
    this.textcolor_show_btn.addEventListener('click', e => {
      if (this.text_profile_panel.classList.contains('collapsed')) {
        this.text_profile_panel.classList.remove('collapsed');
        this.textcolor_show_btn.classList.remove('app-inverted');
      } else {
        this.text_profile_panel.classList.add('collapsed');
        this.textcolor_show_btn.classList.add('app-inverted');
      }
    });

  }
  initBlockAddPanel() {
    this.add_block_panel = this.dialog.querySelector('.add_block_panel');
    this.generate = new cMacro(this.add_block_panel, 'block', this);
    this.generate.addCallback = (id, name) => {
      this.geoAddItem(name);
      this.closeHeaderBands();
      this.objectListPopup.expanded = false;
      this.objectListPopup.toggle();
      this.resetDimensionSliders();
    };
    let sel = this.dialog.querySelector('.block-type-select');
    sel.innerHTML = `<option selected>Text and Shape</option>
     <option>Animated Line</option>
     <option>Connector Line</option>`;
    this.generate.blockHelperChange();
  }
  selectItem(newKey, newWindow) {
    let data = gAPPP.a.modelSets['spoof_location'].getCache(newKey);

    this.latitude = Number(data.latitude);
    this.longitude = Number(data.longitude);

    this.spoofKey = newKey;
    this.__updateLocation(true);
  }
  async initDimensionAdjustments() {
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
      i.addEventListener('input', async e => {
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

            await gAPPP.a.modelSets['frame'].commitUpdateList([{
              field: fieldTag,
              newValue: val.toString()
            }], frameIds[0]);

            this.updateBlockGPS();

            return;
          }
        }
        if (this.dimensionType === 'rotation') {
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
            let fieldTag = 'rotation';
            if (field === 'x')
              fieldTag += 'X';
            if (field === 'y')
              fieldTag += 'Y';
            if (field === 'z')
              fieldTag += 'Z';

            let val = GLOBALUTIL.getNumberOrDefault(existingValues[fieldTag], 0);


            val += offset * Math.PI / 50.0;
            i.lastValue = i.value;

            return gAPPP.a.modelSets['frame'].commitUpdateList([{
              field: fieldTag,
              newValue: val.toString()
            }], frameIds[0]);
          }
        }
        if (this.dimensionType === 'scale') {
          let block = this.context.activeBlock;
          if (!block)
            return;
          let frames = block.framesHelper.framesStash;
          let frameIds = [];
          for (let i in frames)
            frameIds.push(i);
          let existingValues = gAPPP.a.modelSets['frame'].fireDataValuesByKey[frameIds[0]];

          if (existingValues) {
            let fieldTag = 'scaling';
            if (field === 'x')
              fieldTag += 'X';
            if (field === 'y')
              fieldTag += 'Y';
            if (field === 'z')
              fieldTag += 'Z';

            let val = GLOBALUTIL.getNumberOrDefault(existingValues[fieldTag], 1.0);
            if (i.lastValue === 0) {
              i.origScale = val;
            }

            let multiplier = 1.0;
            if (i.value > 0) {
              val = i.origScale * (1.0 + (i.value / 10.0));
            } else {
              val = i.origScale / ((i.value - 1) * -0.1);
            }

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
  updateBlockGPS() {
    let block = this.context.activeBlock;
    if (!block)
      return;
    //lat, lon, ewDiff, nsDiff
    //let offsets = GLOBALUTIL.gpsOffsetCoords();
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
  async geoAddItem(blockName) {
    if (blockName === undefined) {
      if (this.geo_link_block_select.selectedIndex < 1)
        return;
      blockName = this.geo_link_block_select.value;
    }
    let parent = gAPPP.a.modelSets['block'].fireDataValuesByKey[this.initBlockKey].title;

    //let x = this.context.camera._position.x;
    //let z = this.context.camera._position.z;
    let offsets = GLOBALUTIL.getGPSDiff(this.context.zeroLatitude, this.context.zeroLongitude, this.latitude, this.longitude);
    let csvRow = {
      asset: 'blockchild',
      name: blockName,
      childtype: 'block',
      x: -1.0 * offsets.vertical,
      y: 3.0,
      z: offsets.horizontal,
      sx: 5,
      sy: 5,
      sz: 5,
      latitude: this.latitude,
      longitude: this.longitude,
      parent
    };
    let blockResult = await (new gCSVImport(gAPPP.loadedWID)).addCSVRow(csvRow);
    this.geo_link_block_select.selectedIndex = 0;
    this.child_select_picker.selectedIndex = 1;
    this.childBand.selectedIndexChanged();
  }
  __updateLocation(updateCoords) {
    if (updateCoords || !this.gpsInited) {
      this.startLat = Number(this.latitude);
      this.startLon = Number(this.longitude);
      this.offsetX = 0;
      this.offsetY = 5;
      this.offsetZ = 0;
      this.gpsInited = true;
    }
    this.base_location.innerHTML = 'Base :' + this.startLat.toFixed(7) + '°, ' + this.startLon.toFixed(7) + '°';
    let d_result = GLOBALUTIL.getGPSDiff(this.startLat, this.startLon, this.latitude, this.longitude);
    this.offset_distances.innerHTML = 'crow:' + d_result.distance.toFixed(3) + '&nbsp;h:' + d_result.horizontal.toFixed(3) +
      ', v:' + d_result.vertical.toFixed(3);

    this.context.camera._position.x = this.offsetX + d_result.vertical * -1.0; //east increasing
    this.context.camera._position.y = this.offsetY;
    this.context.camera._position.z = this.offsetZ + d_result.horizontal * 1.0; //north increasing
  }
  __monitorCameraPosition() {
    let zeroto360 = this.alpha;
    if (zeroto360 === 'none' || zeroto360 === undefined) {
      zeroto360 = (((gAPPP.activeContext.camera.rotation.y * 180 / Math.PI) + 360) % 360.0).toFixed(3);
      this.beta = (gAPPP.activeContext.camera.rotation.x * 180 / Math.PI).toFixed(3);
    }

    if (this.orientationInited) {
      let direction = "N";
      if (zeroto360 > (360 - 22.5))
        direction = "N";
      else if (zeroto360 > (360 - 45 - 22.5))
        direction = "NE";
      else if (zeroto360 > (360 - 90 - 22.5))
        direction = "E";
      else if (zeroto360 > (360 - 135 - 22.5))
        direction = "SE";
      else if (zeroto360 > (360 - 180 - 22.5))
        direction = "S";
      else if (zeroto360 > (360 - 225 - 22.5))
        direction = "SW";
      else if (zeroto360 > (360 - 270 - 22.5))
        direction = "W";
      else if (zeroto360 > (360 - 315 - 22.5))
        direction = "NW";
      // else "N"

      this.device_orientation.innerHTML = 'A: ' + zeroto360 + `° (${direction}) B: ` + this.beta + '°';
    }
    this.gps_location.innerHTML = `La: ${this.latitude}° Lo: ${this.longitude}°`;

    clearTimeout(this.updateCameraPositionLabel);
    this.updateCameraPositionLabel = setTimeout(() => {
      this.__monitorCameraPosition();
    }, 400);
  }
  initGPSUpdates() {
    this.gps_info_overlay = this.dialog.querySelector('.gps_info_overlay');
    this.gps_location = this.dialog.querySelector('.gps_location');
    this.device_orientation = this.dialog.querySelector('.device_orientation');
    this.offset_distances = this.dialog.querySelector('.offset_distances');
    this.base_location = this.dialog.querySelector('.base_location');

    this.gps_location.innerHTML = 'initing...';
    this.device_orientation.innerHTML = 'initing...';

    this.__monitorCameraPosition();

    window.addEventListener('deviceorientation', event => {
      this.orientationInited = true;
      this.alpha = event.alpha ? event.alpha.toFixed(0) : 'none';
      this.beta = event.beta ? event.beta.toFixed(1) : 'none';
      this.gamma = event.gamma ? event.gamma.toFixed(2) : 'none';
    });

    gAPPP.gpsCallback = (data, isError) => {
      if (isError) {
        this.gps_location.innerHTML = 'ERROR(' + data.code + '): ' + data.message;
      } else {
        this.latitude = gAPPP.latitude;
        this.longitude = gAPPP.longitude;
        this.__updateLocation();
      }
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
        <div class="bottom_full_panel">
          <div class="multi-button-panel">
            <div style="flex:0;display:flex;flex-direction:column">
              <div style="flex:1"></div>
              <button class="btn-sb-icon status_panel_btn app-inverted"><i class="material-icons">square_foot</i></button>
              <button class="btn-sb-icon spoof_location_btn app-inverted"><i class="material-icons">assignment</i></button>
              <button class="btn-sb-icon profile_show_btn app-inverted"><i class="material-icons">settings_brightness</i></button>
              <button class="btn-sb-icon textcolor_show_btn app-inverted"><i class="material-icons">text_format</i></button>
              <button class="btn-sb-icon geo_create_btn app-inverted"><i class="material-icons">edit</i></button>
              <button class="btn-sb-icon geo_add_btn app-inverted"><i class="material-icons">add</i></button>
              <button class="btn-sb-icon status_bar_btn"><i class="material-icons">explore</i></button>
            </div>
            <div class="content_flex_wrapper">
              <div style="flex:10"></div>
              <div class="geo_status_panel geo_view_panel app-panel collapsed">
                <span class="base_location">base location</span>
                <br>
                <span class="offset_distances">hor, vert, crow</span>
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
              </div>
              <div class="spoof_list_panel geo_view_panel app-panel collapsed">
                <span>Name:</span><input class="location_name_to_add" />
                <span>Lat:</span><input class="latitude_to_add" />
                <span>Long:</span><input class="longitude_to_add" />
                &nbsp;
                <button class="use_current_location">Current</button>
                &nbsp;
                <button class="add_spoof_location">Add Spoof Location</button>
                <br>
                <div class="location_list"></div>
                <button class="update_spoof_image">Update Spoof Image</button>
              </div>
              <div class="text_profile_panel geo_view_panel app-panel header-expanded collapsed">
                <div class="fields-container"></div>
              </div>
              <div class="publish_profile_panel geo_view_panel app-panel header-expanded collapsed">
                <div class="fields-container"></div>
                <br>
                <div style="clear:both;">
                  Personal Color <input type="color" />
                  <button id="user-profile-dialog-reset-button">Reset Options</button>
                </div>
              </div>
              <div class="geo_add_item_panel geo_view_panel collapsed">
                <div class="add_block_panel"></div>
              </div>
              <div class="asset_list_panel geo_view_panel collapsed">
                <div class="child_band_picker"></div>
                <div style="display:flex;">
                  <div style="flex:1;width:1em;">
                    <select class="child_select_picker" style="width:-webkit-fill-available"></select>
                  </div>
                  <button class="main-band-delete-child"><i class="material-icons">link_off</i></button>
                </div>
                <select class="geo_link_block_select"></select>
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
              <div class="status_panel no_pointer_events geo_view_panel">
                <div class="device_orientation"></div>
                <br>
                <div class="gps_location"></div>
                <div class="fov_slider">
                  <div class="camera-slider-label">FOV</div>
                  <input class="camera-select-range-fov-slider" type="range" step=".01" min="-1" max="2.5" value=".8" />
                </div>
              </div>
            </div>
          </div>
        </div>
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
