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
    this.meshValues =  {
      scalingX: 1,
      scalingY: 1,
      scalingZ: 1,
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      visibility: 1
    };
    this.frameAttributeFields = ['scalingX', 'scalingY', 'scalingZ', 'positionX', 'positionY', 'positionZ',
      'rotationX', 'rotationY', 'rotationZ', 'visibility'
    ];
    this.processedFrames = [];
    this.updateHandlers = [];
    this._compileFrames();
  }
  __baseDetails() {
    if (this.orderedKeys.length === 0)
      return this.meshValues;

    let details = {};
    let frameData = this.rawFrames[this.orderedKeys[0]];

    for (let c = 0, l = this.frameAttributeFields.length; c < l; c++) {
      let field = this.frameAttributeFields[c];
      details[field] = frameData[field];
      if (details[field] === undefined)
        details[field] = this.meshValues[field];
    }

    details.timeMS = 0;
    return details;
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
  __getFrame(index) {
    let key = this.orderedKeys[index];
    let frame = this.framesStash[key];
    return frame;
  }
  __runningValue(frameValue) {
    let valueOffset = 'none';
    let rawFrameValue = frameValue;
    if (!rawFrameValue || (rawFrameValue === ''))
      rawFrameValue = '0';

    if (rawFrameValue.length > 1) {
      let firstTrail = rawFrameValue.substr(rawFrameValue.length - 1);
      if (firstTrail === '+') {
        let secondTrail = rawFrameValue.substr(rawFrameValue.length - 2, 1);
        if (secondTrail === '+') { //++ case - offset value from last frame
          valueOffset = 'previous';
          rawFrameValue = rawFrameValue.substring(0, rawFrameValue.length - 2);
        } else { //+ case - offset value from base frame
          valueOffset = 'base';
          rawFrameValue = rawFrameValue.substring(0, rawFrameValue.length - 1);
        }
      }
    }

    let unitDesc = '';
    while (rawFrameValue.length > 0) {
      let firstTrail = rawFrameValue.substr(rawFrameValue.length - 1);
      if ((firstTrail >= '0') && (firstTrail <= '9'))
        break;

      rawFrameValue = rawFrameValue.substring(0, rawFrameValue.length - 1);
      unitDesc = firstTrail + unitDesc;
    }
    let value = parseFloat(rawFrameValue);
    if (isNaN(value))
      value = 0.0;

    return {
      valueOffset,
      value,
      unitDesc,
      rawFrameValue
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
  _compileFrames() {
    if (!this.parentKey)
      this.rawFrames = {};
    else
      this.rawFrames = this.fireSet.queryCache('parentKey', this.parentKey);

    this._sortFrames();
    this._calcFrameTimes();
    this._processFrames();
    this._notifyHandlers();
  }
  _notifyHandlers() {
    for (let i in this.updateHandlers)
      this.updateHandlers[i]();
  }
  _processFrameValues(key) {
    let runningState = this.runningState;
    let baseDetails = this.__baseDetails();
    let frameValues = {};
    let isRoot = false;
    if (key === 'root') {
      frameValues = baseDetails;
      isRoot = true;
    } else
      frameValues = this.rawFrames[key];

    let processedValues = {};
    for (let i in baseDetails) {
      let runningValue = this.__runningValue(frameValues[i]);
      let skip = false;
      let dataValue;
      if (isRoot) {
        runningState.base[i] = runningValue;
        runningState.running[i] = runningValue;
        dataValue = runningValue.rawFrameValue;
      } else if (runningValue.valueOffset === 'none') {
        runningState.running[i] = runningValue;
        dataValue = runningValue.rawFrameValue;
      } else if (runningValue.valueOffset === 'base') {
        let base_data = runningState.base[i];
        if (base_data == undefined)
          runningState.base[i] = base_data = {
            valueOffset: 'none',
            value: 0,
            unitDesc: '',
            rawFrameValue: '0'
          };

        //convert the running value into absolute units
        runningValue.value = base_data.value + runningValue.value;
        //use the original units if they exist
        if (baseDetails.unitDesc != '')
          runningValue.unitDesc = base_data.unitDesc;
        runningState.running[i] = runningValue;
        dataValue = runningValue.value.toString() + runningValue.unitDesc;
      } else if (runningValue.valueOffset === 'previous') {
        let rData = runningState.running[i];
        if (rData === undefined)
          runningState.running[i] = rData = {
            valueOffset: 'none',
            value: 0,
            unitDesc: '',
            rawFrameValue: '0'
          };

        //convert the running value into absolute units
        runningValue.value = rData.value + runningValue.value;
        //use the original units if they exist
        if (rData.unitDesc != '')
          runningValue.unitDesc = rData.unitDesc;
        runningState.running[i] = runningValue;
        dataValue = runningValue.value.toString() + runningValue.unitDesc;
      }

      processedValues[i] = runningValue;
    }

    return processedValues;
  }
  __pushFrame(time, stash, gen, key, values, ownerKey) {
    this.processedFrames.push({
      actualTime: time,
      frameStash: stash,
      gen,
      key,
      values,
      ownerKey
    });
  }
  _processFrames() {
    this.runningState = {
      base: {},
      running: {}
    };
    this.processedFrames = [];
    this.processedFrameValues = {};
    this.processedFrameValues['root'] = this._processFrameValues('root');
    let repeatAllIndex = -1;
    let clonePreviousTimes = {};
    for (let c = 0, l = this.orderedKeys.length; c < l; c++) {
      let frame = this.__getFrame(c);
      let key = this.orderedKeys[c];
      this.processedFrameValues[key] = this._processFrameValues(key);

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
        clonePreviousTimes[c] = frame.processedTime - time_ms;
      }

      if ((autoType === 'rap') || (autoType === 'cprap')) {
        repeatAllIndex = c;
        break;
      }
    }

    let rip_length = 0;
    let frameCount = this.orderedKeys.length;
    if (repeatAllIndex !== -1) {
      let lastFrame = this.__getFrame(repeatAllIndex);
      rip_length = lastFrame.processedTime;
      frameCount = repeatAllIndex + 1;
    }

    let f = this.__baseDetails();
    if (frameCount > 0) {
      let firstFrame = this.__getFrame(0);
      let firstKey = this.orderedKeys[0];
      if (firstFrame.processedTime !== 0)
        this.__pushFrame(0, firstFrame, true, 'first frame', this.processedFrameValues[firstKey], firstKey);

      if (clonePreviousTimes[0] !== undefined)
        this.__pushFrame(clonePreviousTimes[0], firstFrame, true, 'clone previous', this.processedFrameValues[firstKey], firstKey);
    }

    for (let c = 0; c < frameCount; c++) {
      let f = this.__getFrame(c);
      let key =  this.orderedKeys[c];

      this.__pushFrame(f.processedTime, f, false, key, this.processedFrameValues[key], key);

      //add next clone frame if needed
      if (clonePreviousTimes[c + 1] !== undefined)
        this.__pushFrame(clonePreviousTimes[c + 1], f, true, 'clone previous', this.processedFrameValues[key], this.orderedKeys[c + 1]);
    }
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
  nextFrameOrder() {
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
  setParentKey(parentKey) {
    this.parentKey = parentKey;
    this._compileFrames();
  }
}
