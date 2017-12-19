class wFrames {
  constructor(parentKey = null) {
    this.parentKey = parentKey;
    this.fireSet = gAPPP.a.modelSets['frame'];
    this.compiledFrames = [];
    this.rawFrames = {};
    this.framesStash = {};
    this.orderedKeys = [];
    this.runLength = 0;
    this.baseOffset = 0;
    this.maxLength = 0;
    this.runningState = {};
    this.frameAttributeFields = ['scaleX', 'scaleY', 'scaleZ', 'offsetX', 'offsetY', 'offsetZ',
      'rotateX', 'rotateY', 'rotateZ', 'visibility'
    ];
    this.processedFrames = [];
    this.updateHandlers = [];
    this._compileFrames();
  }
  __defaultAttributes() {
    return {
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      offsetX: 0,
      offsetY: 0,
      offsetZ: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      visibility: 1
    };
  }
  handleFrameChanges() {
    this._compileFrames();
  }
  applyFrameValues(block, time) {

  }
  __frameFromTimeToken(timeToken) {
    timeToken = timeToken.trim();
    if (timeToken === '')
      timeToken = '0';

    let autoGen = 'n';
    let autoTime = 0;
    let actualTime = timeToken;
    let parts = [timeToken];
    if (timeToken.indexOf('cprap') > -1) {
      parts = timeToken.split('cprap');
      autoGen = 'cprap';
    }
    if (timeToken.indexOf('rap') > -1) {
      parts = timeToken.split('rap');
      autoGen = 'rap';
    }
    if (timeToken.indexOf('cp') > -1) {
      parts = timeToken.split('cp');
      autoGen = 'cp';
    }

    if (parts.length > 1) {
      actualTime = parts[0];
      autoTime = this.__frameFromTimeToken(parts[1]).timeMS;
    }

    let timeOffsetType = 'none';
    if (actualTime.length > 1) {
      let firstTrail = actualTime.substr(actualTime.length - 1);
      if (firstTrail === '+') {
        let secondTrail = actualTime.substr(actualTime.length - 2, 1);
        if (secondTrail === '+') { //++ case - offset time from last frame
          timeOffsetType = 'previous';
          actualTime = actualTime.substring(0, actualTime.length - 2);
        } else { //+ case - offset time from base frame
          timeOffsetType = 'base';
          actualTime = actualTime.substring(0, actualTime.length - 1);
        }
      }
    }
    let unitFactor = 1.0;
    if (actualTime.length > 1) {
      let firstTrail = actualTime.substr(actualTime.length - 1);
      let secondTrail = actualTime.substr(actualTime.length - 2, 1);
      if (firstTrail === '%') { //is %
        unitFactor = this.maxLength / 100.0;
        actualTime = actualTime.substring(0, actualTime.length - 1);
      } else if (firstTrail === 's') { //is seconds or ms
        if (secondTrail !== 'm') { //not ms
          unitFactor = 1000;
          actualTime = actualTime.substring(0, actualTime.length - 1);
        } else {
          actualTime = actualTime.substring(0, actualTime.length - 2);
        }
      } else if (firstTrail === 'm') { //minutes - for slow animations?
        unitFactor = 60000;
        actualTime = actualTime.substring(0, actualTime.length - 1);
      }
    }
    let timeRaw = parseFloat(actualTime);
    if (!timeRaw)
      timeRaw = 0;
    let timeMS = timeRaw * unitFactor;

    return {
      autoGen,
      autoTime,
      timeMS,
      timeToken,
      timeOffsetType
    };
  }
  _calcFrameTimes() {
    let previousFrameTime = 0;
    let max_frame_start = previousFrameTime;
    this.framesStash = {};
    for (let c = 0, l = this.orderedKeys.length; c < l; c++) {
      let key = this.orderedKeys[c];
      this.framesStash[key] = this.__frameFromTimeToken(this.rawFrames[key].frameTime);

      if (this.framesStash[key].timeOffsetType === 'none')
        previousFrameTime = 0;
      else if (this.framesStash[key].timeOffsetType === 'previous')
        previousFrameTime = previousFrameTime;
      else if (this.framesStash[key].timeOffsetType === 'base')
        previousFrameTime = this.baseOffset;

      previousFrameTime += this.framesStash[key].timeMS;
      this.framesStash[key].processedTime = previousFrameTime;
      max_frame_start = Math.max(max_frame_start, previousFrameTime);

      if (c === 0)
        this.baseOffset = previousFrameTime;
    }
    this.maxLength = max_frame_start;
  }
  __baseDetails() {
    let details = {};
    for (let c = 0, l = this.frameAttributeFields.length; c < l; c++)

      if (this.orderedKeys.length > 1) {


      }
      else {
        details[this.frameAttributeFields[c]] = '';
      }
    details.timeMS = 0;
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

      frame[i] = dataValue;
    }
  }
  __getFrame(index) {
    let key = this.orderedKeys[index];
    let frame = this.framesStash[key];
    return frame;
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
      let frame = this.__getFrame(c);
      this._processRunningValues(frame);

      let autoType = frame.autoGen;
      if (['cp', 'cprap'].indexOf(autoType) !== -1) {
        let time_ms = frame.autoTime;
        time_ms = parseInt(time_ms);
        if (isNaN(time_ms))
          time_ms = 0;
        if (time_ms === 0)
          time_ms = 1;
        else if (time_ms < 0)
          time_ms *= -1;
        cp_frame_times[c] = frame.processedTime - time_ms;
      }

      if ((autoType === 'r') || (autoType === 'cprap')) {
        rap_index = c;
        break;
      }
    }

    let rip_length = 0;
    let rip_frame_count = this.orderedKeys.length;
    if (rap_index !== -1) {
      let lastFrame = this.__getFrame(rap_index);
      rip_length = lastFrame.processedTime;
      rip_frame_count = rap_index + 1;
    }

    let f = this.__baseDetails();
    let processed_frames = [];
    if (cp_frame_times[0] !== undefined)
      processed_frames.push({
        actualTime: cp_frame_times[0],
        frameStash: f,
        gen: true,
        key: 'gen'
      });

    for (let c = 0; c < rip_frame_count; c++) {
      let f = this.__getFrame(c);
      if (c === 0 && f.processedTime !== 0)
        processed_frames.push({
          actualTime: 0,
          frameStash: f,
          gen: true,
          key: 'first frame'
        });
      processed_frames.push({
        actualTime: f.processedTime,
        frameStash: f,
        gen: false,
        key: this.orderedKeys[c]
      });

      //add next clone frame if needed
      if (cp_frame_times[c + 1] !== undefined)
        processed_frames.push({
          actualTime: cp_frame_times[c + 1],
          frameStash: f,
          gen: true,
          key: 'clone previous'
        });
    }

    this.processedFrames = processed_frames;
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
