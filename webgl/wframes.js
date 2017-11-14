class wFrames {
  constructor(parentKey = null) {
    this.parentKey = parentKey;
    this.fireSet = gAPPP.a.modelSets['frame'];
    this.compiledFrames = [];
    this.rawFrames = {};
    this.framesStash = {};
    this.orderedKeys = [];
    this._compileFrames();
    this.runLength = 0;
    this.baseOffset = 0;
    this.maxLength = 0;
    this.runningState = {};
    this.frameAttributeFields = ['scaleX', 'scaleY', 'scaleZ', 'offsetX', 'offsetY', 'offsetZ',
      'rotateX', 'rotateY', 'rotateZ', 'visibility'
    ];
    this.processedFrames = [];
    this.updateHandlers = [];
  }
  handleFrameChanges() {
    this._compileFrames();
  }
  applyFrameValues(block, time) {

  }
  __str_to_frame_time(str) {
    let offset_type = 'n';
    let auto_gen = {
      type: 'n'
    };
    let working_str = str;
    if (!working_str || (working_str == ''))
      working_str = '0';

    let rap_pos = working_str.indexOf('rap');
    let cprap_pos = working_str.indexOf('cprap');
    let cplf_pos = working_str.indexOf('cplf');
    let cp_pos = working_str.indexOf('cp');
    let lf_pos = working_str.indexOf('lf');

    if (cplf_pos > -1) {
      let str_array = working_str.split('cplf');
      working_str = str_array[0];
      let str_2 = str_array[1];
      let time_ms = this.__str_to_frame_time(str_2).time_ms;
      auto_gen = {
        type: 'cplf',
        time_ms: time_ms
      };
    } else if (cprap_pos > -1) {
      let str_array = working_str.split('cprap');
      working_str = str_array[0];
      let str_2 = str_array[1];
      let time_ms = this.__str_to_frame_time(str_2).time_ms;
      auto_gen = {
        type: 'cprap',
        time_ms: time_ms
      };
    } else if (rap_pos > -1) {
      let str_array = working_str.split('rap');
      working_str = str_array[0];
      auto_gen = {
        type: 'r'
      };
    } else if (cp_pos > -1) {
      let str_array = working_str.split('cp');
      working_str = str_array[0];
      let str_2 = str_array[1];
      let time_ms = this.__str_to_frame_time(str_2).time_ms;
      auto_gen = {
        type: 'cp',
        time_ms: time_ms
      };
    } else if (lf_pos > -1) {
      let str_array = working_str.split('lf');
      working_str = str_array[0];
      auto_gen = {
        type: 'lf'
      };
    }

    if (working_str.length > 1) {
      var first_trail = working_str.substr(working_str.length - 1);
      if (first_trail == '+') {
        var second_trail = working_str.substr(working_str.length - 2, 1);
        if (second_trail == '+') { //++ case - offset time from last frame
          offset_type = 'p';
          working_str = working_str.substring(0, working_str.length - 2);
        } else { //+ case - offset time from base frame
          offset_type = 'b';
          working_str = working_str.substring(0, working_str.length - 1);
        }
      }
    }
    var unit_factor = 1.0;
    if (working_str.length > 1) {
      var first_trail = working_str.substr(working_str.length - 1);
      var second_trail = working_str.substr(working_str.length - 2, 1);
      if (first_trail == '%') { //is %
        unit_factor = this.properties.run_length / 100.0;
        working_str = working_str.substring(0, working_str.length - 1);
      } else if (first_trail == 's') { //is seconds or ms
        if (second_trail != 'm') { //not ms
          unit_factor = 1000;
          working_str = working_str.substring(0, working_str.length - 1);
        } else {
          working_str = working_str.substring(0, working_str.length - 2);
        }
      } else if (first_trail == 'm') { //minutes - for slow animations?
        unit_factor = 60000;
        working_str = working_str.substring(0, working_str.length - 1);
      }
    }
    var time = parseFloat(working_str);
    if (!time)
      time = 0;
    return {
      offset_type: offset_type,
      time_ms: time * unit_factor,
      auto_gen: auto_gen
    };
  }
  _calcFrameTimes() {
    let previous_frame_start = this.baseOffset;
    let max_frame_start = previous_frame_start;
    this.framesStash = {};
    for (let c = 0, l = this.orderedKeys.length; c < l; c++) {
      let key = this.orderedKeys[c];
      this.framesStash[key] = this.__str_to_frame_time(this.rawFrames[key].frameTime);

      if (this.framesStash[key].offset_type === 'n') // use leading offset only
        previous_frame_start = 0;
      else if (this.framesStash[key].offset_type === 'p') // offset from previous frame
        previous_frame_start = previous_frame_start;
      else if (this.framesStash[key].offset_type === 'b') // offset from base frame
        previous_frame_start = this.baseOffset;

      previous_frame_start += this.framesStash[key].time_ms;
      this.framesStash[key]._frame_start = previous_frame_start;
      max_frame_start = Math.max(max_frame_start, previous_frame_start);
    }
    this.maxLength = max_frame_start;
  }
  __baseDetails() {
    let details = {};
    for (let c = 0, l = this.frameAttributeFields.length; c < l; c++)
      details[this.frameAttributeFields[c]] = '';
    return details;
  }
  __runningValue(css_str) {
    let offset_type = 'n';
    let working_str = css_str;
    if (!working_str || (working_str === ''))
      working_str = '0';

    if (working_str.length > 1) {
      let first_trail = working_str.substr(working_str.length - 1);
      if (first_trail === '+') {
        let second_trail = working_str.substr(working_str.length - 2, 1);
        if (second_trail === '+') { //++ case - offset value from last frame
          offset_type = 'p';
          working_str = working_str.substring(0, working_str.length - 2);
        } else { //+ case - offset value from base frame
          offset_type = 'b';
          working_str = working_str.substring(0, working_str.length - 1);
        }
      }
    }

    let unit_type = '';
    while (working_str.length > 0) {
      let first_trail = working_str.substr(working_str.length - 1);
      if ((first_trail >= '0') && (first_trail <= '9'))
        break;

      working_str = working_str.substring(0, working_str.length - 1);
      unit_type = first_trail + unit_type;
    }
    let value = parseFloat(working_str);
    if (isNaN(value))
      value = 0.0;

    return {
      offset_type: offset_type,
      value: value,
      unit_type: unit_type,
      orig_value: css_str
    };
  }
  _processRunningValues(frame, isBaseFrame = false) {
    let runningState = this.runningState;
    let baseDetails = this.__baseDetails();

    for (let i in baseDetails) {
      let runningValue = this.__runningValue(baseDetails[i]);
      let skip = false;
      let dataValue;
      if (isBaseFrame) {
        runningState.base[i] = runningValue;
        runningState.running[i] = runningValue;
        dataValue = runningValue.orig_value;
      } else if (runningValue.offset_type === 'n') {
        runningState.running[i] = runningValue;
        dataValue = runningValue.orig_value;
      } else if (runningValue.offset_type === 'b') {
        let base_data = runningState.base[i];
        if (base_data == undefined)
          runningState.base[i] = base_data = {
            offset_type: 'n',
            value: 0,
            unit_type: '',
            orig_value: '0'
          };

        //convert the running value into absolute units
        runningValue.value = baseDetails.value + runningValue.value;
        //use the original units if they exist
        if (baseDetails.unit_type != '')
          css_state.unit_type = base_data.unit_type;
        runningState.running[i] = css_state;
        dataValue = css_state.value.toString() + css_state.unit_type;
      } else if (css_state.offset_type === 'p') {
        let rData = runningState.running[i];
        if (rData === undefined)
          runningState.running[i] = rData = {
            offset_type: 'n',
            value: 0,
            unit_type: '',
            orig_value: '0'
          };

        //convert the running value into absolute units
        css_state.value = rData.value + css_state.value;
        //use the original units if they exist
        if (rData.unit_type != '')
          css_state.unit_type = rData.unit_type;
        runningState.running[i] = css_state;
        dataValue = css_state.value.toString() + css_state.unit_type;
      }

      //  frame_details.dgrid_rows[i]['actual'] = merged_css_str_value;
    }


  }
  __getFrame(index) {

  }
  _processFrames() {
    this.runningState = {
      base: {},
      running: {}
    };

    this._processRunningValues(this.__baseDetails(), true);
    let rap_index = -1;
    let cp_frame_times = {};
    for (let c = 0, l = this.orderedKeys.length; c < l; c++) {
      let key = this.orderedKeys[c];
      let frame = this.framesStash[key];
      this._processRunningValues(frame);

      let autoType = frame.auto_gen.type;
      if (['cp', 'cplf', 'cprap'].indexof(autoType) !== -1) {
        let time_ms = frame.auto_gen.time_ms;
        time_ms = parseInt(time_ms);
        if (isNaN(time_ms))
          time_ms = 0;
        if (time_ms === 0)
          time_ms = 50;
        else if (time_ms < 0)
          time_ms *= -1;
        cp_frame_times[c] = frame._frame_start - time_ms;
      }

      if ((autoType === 'r') || (autoType === 'cprap')) {
        rap_index = c;
        break;
      }
    }

    let rip_length = this.properties.run_length;
    let rip_frame_count = this.orderedKeys.length;
    if (rap_index !== -1) {
      let lf = node.frames[rap_index];
      rip_length = lf._frame_start;
      rip_frame_count = rap_index + 1;
    }

    let f = node.base_frame;
    if (f._frame_start != 0)
      if (f.time.indexOf('nff') == -1)
        css_frames += this.__wrap_css_value_with_time(0, f.frame_middle_css, rip_length);
    css_frames += this.__wrap_css_value_with_time(f._frame_start, f.frame_middle_css, rip_length);
    if (cp_frames[0] != undefined)
      css_frames += this.__wrap_css_value_with_time(cp_frames[0], f.frame_middle_css, rip_length);
    for (let i = 0; i < rip_frame_count; i++) {
      f = node.frames[i];
      css_frames += this.__wrap_css_value_with_time(f._frame_start, f.frame_middle_css, rip_length);
      //add next clone frame if needed
      if (cp_frames[i + 1] != undefined)
        css_frames += this.__wrap_css_value_with_time(cp_frames[i + 1], f.frame_middle_css, rip_length);
    }
    //add last frame if needed
    if (rip_frame_count > 0)
      if (f._frame_start != rip_length)
        if ((frame.auto_gen.type == 'lf') || (frame.auto_gen.type == 'cplf'))
          css_frames += this.__wrap_css_value_with_time(rip_length, f.frame_middle_css, rip_length);

    var css_frame_internal = css_frames;
    if (node.frames.length > 0) {
      css_frames = '\n\n@-webkit-keyframes ' + node_class_name + '_keyframes\n{\n';
      css_frames += css_frame_internal + ' }\n';
      css_frames += '\n\n@keyframes ' + node_class_name + '_keyframes\n{\n';
      css_frames += css_frame_internal + ' }\n';
    } else
      css_frames = '';

    var runtime_s = rip_length / (this.time_scale_factor * 1000);
    var base_frame_style = node.base_frame.frame_middle_css;
    css_frames += '.' + node_class_name + ' { ' + base_frame_style;

    if (node.frames.length > 0) {
      var timing_f = 'infinite';
      var iterate_count = Number(node['iteration_count']);
      if (!isNaN(iterate_count))
        if (iterate_count != 0)
          timing_f = iterate_count.toString();

      css_frames += ' -webkit-animation: ' +
        node_class_name + '_keyframes ' +
        runtime_s.toString() + 's ' + timing_f + ';' +
        'animation: ' +
        node_class_name + '_keyframes ' +
        runtime_s.toString() + 's ' + timing_f + ';';
    }
  }
  setParentKey(parentKey) {
    this.parentKey = parentKey;
    this._compileFrames();
  }
  _compileFrames() {
    if (!this.parentKey)
      this.rawFrames = {};
    else
      this.rawFrames = this.fireSet.queryCache('parentKey', this.parentKey);

    this._sortFrames();
    this._calcFrameTimes();
    this._processFrames();
    this.notifyHandlers();
  }
  _sortFrames() {
    this.orderedKeys = [];

    for (let i in this.rawFrames)
      this.orderedKeys.push(i);

    this.orderedKeys.sort((a, b) => {
      let a_order = 0;
      let b_order = 0;
      if (GLOBALUTIL.isNumeric(this.fireSet.getCache(a).frameOrder))
        a_order = Number(this.fireSet.getCache(a).frameOrder);
      if (GLOBALUTIL.isNumeric(this.fireSet.getCache(b).frameOrder))
        b_order = Number(this.fireSet.getCache(b).frameOrder);

      if (a_order !== b_order) return a_order - b_order;
      if (a > b) return 1;
      if (a < b) return -1;

      return 0;
    });
  }
  getNextOrder() {
    let next = 1;
    for (let c = 0, l = this.orderedKeys.length; c < l; c++) {
      let frameCache = this.fireSet.getCache(this.orderedKeys[c]);
      if (!GLOBALUTIL.isNumeric(frameCache.frameOrder))
        continue;

      let order = Number(frameCache.frameOrder);
      if (order >= next)
        next = order + 1;
    }

    return next;
  }
  notifyHandlers() {
    for (let i in this.updateHandlers)
      this.updateHandlers[i]();
  }
}
