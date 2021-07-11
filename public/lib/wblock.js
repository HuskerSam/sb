class wFrames {
  constructor(context, parentKey = null, parentBlock = null) {
    this.context = context;
    this.parentKey = parentKey;
    this.parentBlock = parentBlock;
    this.fireSet = gAPPP.a.modelSets['frame'];
    this.compiledFrames = [];
    this.rawFrames = {};
    this.framesStash = {};
    this.orderedKeys = [];
    this.baseOffset = 0;
    this.maxLength = 0;
    this.runningState = {};
    this.fps = 30;
    this.activeAnimation = null;
    this.playState = 0;
    this.meshValues = {
      scalingX: 1,
      scalingY: 1,
      scalingZ: 1,
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      visibility: 1,
      diffuseColorR: '',
      diffuseColorG: '',
      diffuseColorB: '',
      emissiveColorR: '',
      emissiveColorG: '',
      emissiveColorB: '',
      ambientColorR: '',
      ambientColorG: '',
      ambientColorB: '',
      specularColorR: '',
      specularColorG: '',
      specularColorB: ''
    };
    this.processedFrames = [];
    this.animations = {};
    this.compileFrames();
  }
  get isRoot() {
    let root = true;
    if (this.parentBlock)
      if (this.parentBlock.parent !== null)
        root = false;
    return root;
  }
  __baseDetails() {
    let root = this.isRoot;
    let frameData = Object.assign({}, this.meshValues);
    if (!root || this.orderedKeys.length < 1)
      Object.assign(frameData, this.parentBlock.blockRenderData);

    if (this.orderedKeys.length > 0) {
      let data = this.rawFrames[this.orderedKeys[0]];
      for (let i in data) {
        if (data[i] !== undefined && data[i] !== '')
          frameData[i] = data[i];
      }
    }

    let details = {};
    for (let c = 0, l = this.frameAttributeFields.length; c < l; c++) {
      let field = this.frameAttributeFields[c];
      details[field] = frameData[field];
      if (details[field] === undefined || details[field] === '')
        details[field] = this.meshValues[field];
    }

    details.timeMS = 0;

    return details;
  }
  firstFrameValues() {
    this._validateFieldList();
    if (this.processedFrames.length === 0)
      return this.__baseDetails();

    let result = {};
    let data = this.processedFrames[0].values;
    for (let i in data)
      result[i] = data[i].value;

    return result;
  }
  __frameFromTimeToken(timeToken) {
    timeToken = timeToken.toString().trim();
    let easingFunction = 'n';
    let timeParts = timeToken.split(':');
    if (timeParts.length > 1) {
      timeToken = timeParts[0].trim();
      easingFunction = timeParts[1].trim().toLowerCase();
    }

    if (timeToken === '')
      timeToken = '0++';

    let autoGen = 'n';
    let autoTime = 0;
    let actualTime = timeToken;
    let parts = [timeToken];
    if (timeToken.indexOf('cplf') > -1) {
      parts = timeToken.split('cplf');
      autoGen = 'cplf';
    } else if (timeToken.indexOf('lf') > -1) {
      parts = timeToken.split('lf');
      autoGen = 'lf';
    } else if (timeToken.indexOf('cp') > -1) {
      parts = timeToken.split('cp');
      autoGen = 'cp';
    }

    if (parts.length > 1) {
      actualTime = parts[0];
      autoTime = this.__frameFromTimeToken(parts[1]).timeMS;
    }

    let timeOffsetType = 'none';
    let firstTrail = actualTime.substr(actualTime.length - 1);
    let secondTrail = actualTime.substr(actualTime.length - 2, 1);
    if (actualTime.length > 1) {
      if (firstTrail === '+') {
        if (secondTrail === '+') { //++ case - offset time from last frame
          timeOffsetType = 'previous';
          actualTime = actualTime.substring(0, actualTime.length - 2);
        } else { //+ case - offset time from base frame
          timeOffsetType = 'base';
          actualTime = actualTime.substring(0, actualTime.length - 1);
        }
      }
      if (firstTrail === '*') {
        timeOffsetType = 'parent';
        actualTime = actualTime.substring(0, actualTime.length - 1);
        this.parentBaseOffset = 0;
        if (this.parentBlock.parent) {
          this.parentBaseOffset = this.parentBlock.parent.framesHelper.baseOffset;
        }
      }
    }

    let unitFactor = 1.0;
    if (actualTime.length > 1) {
      if (firstTrail === '%') { //is %
        unitFactor = this.parentLength / 100.0;
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
      timeOffsetType,
      easingFunction
    };
  }
  __getFrame(index) {
    let key = this.orderedKeys[index];
    let frame = this.framesStash[key];
    return frame;
  }
  __runningValue(frameValue, fieldKey) {
    let valueOffset = 'none';
    let rawFrameValue = frameValue;

    if (rawFrameValue === undefined)
      rawFrameValue = '';

    let isColor = fieldKey.indexOf('Color') !== -1;
    if (!isColor)
      if (rawFrameValue === '')
        rawFrameValue = '0++';

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
    let value = '';
    if (!isColor || rawFrameValue !== '') {
      value = parseFloat(rawFrameValue);
      if (isNaN(value)) {
        value = 0.0;
      }
    }

    return {
      valueOffset,
      value,
      unitDesc,
      rawFrameValue,
      isColor,
      origValue: frameValue
    };
  }
  _getParentLength() {
    this.parentLength = 0;
    if (this.parentBlock.parent)
      this.parentLength = this.parentBlock.parent.framesHelper.getRunLength();

    if (!this.parentLength)
      this.parentLength = this.getRootFrames().getRunLength();
  }
  getRunLength() {
    if (this.maxLength !== 0)
      return this.maxLength;

    if (this.processedFrames.length > 1) {
      return this.processedFrames[this.processedFrames.length - 1].actualTime;
    }

    return 0;
  }
  _calcFrameTimes() {
    let previousFrameTime = 0;
    let max_frame_start = 0;
    this.framesStash = {};

    this._getParentLength();

    let frame;
    for (let c = 0, l = this.orderedKeys.length; c < l; c++) {
      let key = this.orderedKeys[c];
      frame = this.__frameFromTimeToken(this.rawFrames[key].frameTime);

      if (frame.timeOffsetType === 'previous')
        previousFrameTime = previousFrameTime;
      else if (frame.timeOffsetType === 'base')
        previousFrameTime = this.baseOffset;
      else if (frame.timeOffsetType === 'parent')
        previousFrameTime = this.parentBaseOffset;
      else
        previousFrameTime = 0;

      previousFrameTime += frame.timeMS;

      if (previousFrameTime <= max_frame_start && max_frame_start !== 0)
        break;

      this.framesStash[key] = frame;
      this.framesStash[key].processedTime = previousFrameTime;
      max_frame_start = Math.max(max_frame_start, previousFrameTime);

      if (c === 0)
        this.baseOffset = previousFrameTime;
    }
    this.maxLength = max_frame_start;

    if (frame)
      if (['lf', 'cplf'].indexOf(frame.autoGen) !== -1)
        this.maxLength = this.parentLength;
  }
  compileFrames() {
    if (!this.parentKey)
      return;

    this._validateFieldList();
    this.rawFrames = this.fireSet.queryCache('parentKey', this.parentKey);

    this._sortFrames();
    this._calcFrameTimes();
    this._processFrames();
    this.updateAnimation();
  }
  getRootFrames() {
    let root = this.parentBlock;

    while (root.parent)
      root = root.parent;

    return root.framesHelper;
  }
  updateAnimation(playState = null) {
    let rootFrames = this.getRootFrames();
    if (playState === null)
      playState = rootFrames.playState;

    if (this.parentBlock.blockRawData.childType === 'camera')
      if (this.parentBlock.blockKey === this.context.blockCameraId)
        this.parentBlock.sceneObject = this.context.camera;

    if (!this.parentBlock.sceneObject)
      return;

    this.processAnimationFrames(this.parentBlock.sceneObject);

    this.context.refreshFocus();

    if (this.processedFrames.length > 1 && this.maxLength > 10) {
      let frameIndex = 0;
      try {
        if (this.activeAnimation) {
          frameIndex = GLOBALUTIL.getNumberOrDefault(this.activeAnimation._runtimeAnimations[0].currentFrame, 1);
        } else {
          if (rootFrames.activeAnimation)
            frameIndex = GLOBALUTIL.getNumberOrDefault(rootFrames.activeAnimation._runtimeAnimations[0].currentFrame, 1);
        }

        if (!this.activeAnimation || this.activeAnimation.masterFrame === 0)
          this.activeAnimation = this.context.scene.beginAnimation(this.parentBlock.sceneObject, 0, this.lastFrame, true);

        if (playState === 0) {
          this.activeAnimation.stop();
          this.activeAnimation.reset();
        } else if (playState === 1) {
          this.activeAnimation.goToFrame(frameIndex);
        } else {
          this.activeAnimation.goToFrame(frameIndex);
          this.activeAnimation.pause();
        }
      } catch (e) {
        console.log('play anim error', e);
      }
    }

    for (let i in this.parentBlock.childBlocks)
      this.parentBlock.childBlocks[i].framesHelper.updateAnimation(playState);
  }
  startAnimation(frameIndex) {
    this.activeAnimation = this.context.scene.beginAnimation(this.parentBlock.sceneObject, 0, this.lastFrame, true);
    this.activeAnimation.goToFrame(frameIndex);
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
      let runningValue = this.__runningValue(frameValues[i], i);
      if (runningValue.unitDesc.toLowerCase() === 'deg')
        runningValue.value *= 2 * Math.PI / 360.0;

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
  _gpsOffsetFrames() {
    if (!this.context.geoFilter)
      return;

    let block = this.parentBlock;
    if (block.parent)
      if (!block.parent.parent)
        if (['mesh', 'shape', 'block'].indexOf(block.blockRawData.childType) !== -1) {
          let offsets = GLOBALUTIL.getGPSDiff(this.context.zeroLatitude, this.context.zeroLongitude,
            block.blockRawData.latitude, block.blockRawData.longitude);
          block.gpsPositionX = 1.0 * offsets.vertical;
          block.gpsPositionZ = offsets.horizontal;
          return true;
        }

    return false;
  }
  _processFrames() {
    this.runningState = {
      base: {},
      running: {}
    };
    this.processedFrames = [];
    this.processedFrameValues = {};
    this.processedFrameValues['root'] = this._processFrameValues('root');

    let clonePreviousTimes = {};
    for (let c = 0, l = this.orderedKeys.length; c < l; c++) {
      let frame = this.__getFrame(c);
      if (!frame)
        break;

      let key = this.orderedKeys[c];
      this.processedFrameValues[key] = this._processFrameValues(key);

      let autoType = frame.autoGen;
      if (['cp', 'cplf'].indexOf(autoType) !== -1) {
        let time_ms = frame.autoTime;
        time_ms = parseInt(time_ms);
        if (isNaN(time_ms))
          time_ms = 0;
        if (time_ms === 0)
          time_ms = 0;
        else if (time_ms < 0)
          time_ms *= -1;
        clonePreviousTimes[c] = frame.processedTime - time_ms;
      }
    }

    let rip_length = 0;
    let frameCount = this.orderedKeys.length;
    let f = this.__baseDetails();
    if (frameCount > 0) {
      let firstFrame = this.__getFrame(0);
      let firstKey = this.orderedKeys[0];
      if (this.context.geoFilter) {
        let offsetNeeded = this._gpsOffsetFrames();
        if (offsetNeeded) {
          this.processedFrameValues[firstKey].positionX.value = -1.0 * this.parentBlock.gpsPositionX;
          this.processedFrameValues[firstKey].positionZ.value = -1.0 * this.parentBlock.gpsPositionZ;
        }
      }


      if (firstFrame.processedTime !== 0)
        this.__pushFrame(0, firstFrame, true, 'first frame', this.processedFrameValues[firstKey], firstKey);

      if (clonePreviousTimes[0] !== undefined)
        this.__pushFrame(clonePreviousTimes[0], firstFrame, true, 'clone previous', this.processedFrameValues[firstKey], firstKey);
    }

    let key;
    for (let c = 0; c < frameCount; c++) {
      f = this.__getFrame(c);
      key = this.orderedKeys[c];
      if (!f)
        break;
      if (!f.processedTime && c > 0)
        continue;

      this.__pushFrame(f.processedTime, f, false, key, this.processedFrameValues[key], key);

      //add next clone frame if needed
      if (clonePreviousTimes[c + 1] !== undefined)
        this.__pushFrame(clonePreviousTimes[c + 1], f, true, 'clone previous', this.processedFrameValues[key], this.orderedKeys[c + 1]);
    }
    if (f)
      if (['lf', 'cplf'].indexOf(f.autoGen) !== -1)
        this.__pushFrame(this.parentLength, f, true, 'last frame', this.processedFrameValues[key], key);
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

    return next + 9;
  }
  _validateFieldList(childType = null) {
    let frameType = 'blockFrame';
    if (this.parentBlock) {
      if (!childType) {
        if (this.parentBlock.blockRawData)
          childType = this.parentBlock.blockRawData.childType;
      }

      if (!childType) {
        if (this.parentBlock.blockRenderData)
          childType = this.parentBlock.blockRenderData.childType;
      }
    }

    if (!childType) {
      this.frameAttributeFields = [];
      return;
    }

    if (childType === 'mesh')
      frameType = 'meshFrame';
    if (childType === 'shape')
      frameType = 'shapeFrame';
    if (childType === 'camera')
      frameType = 'cameraFrame';
    if (childType === 'light')
      frameType = 'lightFrame';

    if (this.cachedChildType === childType && childType)
      return;

    this.cachedChildType = childType;
    this.cachedFrameType = frameType;

    this.fieldsData = sDataDefinition.bindingFieldsLookup(frameType);
    this.frameAttributeFields = this.getFieldList(this.fieldsData);
  }
  setParentKey(parentKey, parentBlock) {
    this.parentKey = parentKey;
    this.parentBlock = parentBlock;
    this.compileFrames();
  }
  getFieldList(fields) {
    let fieldKeys = [];

    for (let i in fields)
      fieldKeys.push(fields[i].fireSetField);

    return fieldKeys;
  }
  processAnimationFrames(sceneObject) {
    this.animations = {};
    this.animationsArray = [];
    this.lastFrame = Math.round(this.maxLength / 1000.0 * this.fps);

    if (this.processedFrames.length < 2) {} else if (this.maxLength === 0) {
      //    this.maxLength = this.processedFrames[this.processedFrames.length - 1].actualTime;
    } else {
      let keySetCreated = false;
      let eF = this.processedFrames[0].frameStash.easingFunction;
      let forceFirstAnimation = true;
      if (!this.isRoot)
        forceFirstAnimation = false;
      for (let i in this.frameAttributeFields) {
        let fieldKey = this.frameAttributeFields[i];
        let field = this.fieldsData[fieldKey];

        if (!field.contextObjectField)
          continue;
        let frameEmpty = true;
        let firstFrameKey = this.orderedKeys[0];
        if (!forceFirstAnimation) {
          for (let c in this.rawFrames) {
            if (c === firstFrameKey)
              continue;
            if (this.rawFrames[c][fieldKey] !== '' && this.rawFrames[c][fieldKey] !== undefined) {
              frameEmpty = false;
              break;
            }
          }
        } else
          frameEmpty = false;

        if (!frameEmpty) {
          keySetCreated = true;
          let fieldKeys = [];
          for (let ii in this.processedFrames) {
            let frame = this.processedFrames[ii];

            let frameNumber = Math.round(frame.actualTime / 1000.0 * this.fps);

            if (frame.values[fieldKey]) {
              let value = frame.values[fieldKey].value;
              fieldKeys.push({
                frame: frameNumber,
                value
              });
            }
          }
          this.animations[i] = new BABYLON.Animation(this.parentKey + i + 'anim',
            field.contextObjectField, this.fps, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
          this.animations[i].setKeys(fieldKeys);

          let eFunc = new BABYLON.SineEase();
          if (eF === 'eio') {
            eFunc.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
            this.animations[i].setEasingFunction(eFunc);
          }
          if (eF === 'ei') {
            eFunc.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
            this.animations[i].setEasingFunction(eFunc);
          }
          if (eF === 'eo') {
            eFunc.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
            this.animations[i].setEasingFunction(eFunc);
          }
        }

        forceFirstAnimation = false;
      }
      for (let i in this.animations)
        this.animationsArray.push(this.animations[i]);

      if (this.isRoot) {
        for (let ii in this.processedFrames) {
          let frame = this.processedFrames[ii];
          let frameNumber = Math.round(frame.actualTime / 1000.0 * this.fps);

          if (frame.values.frameCommand.origValue && !frame.gen) {
            let anim = this.animationsArray[0];
            let fN = frameNumber;
            if (fN === 0)
              fN = 1;
            if (fN > this.lastFrame - 1)
              fN = this.lastFrame - 1;
            let event = new BABYLON.AnimationEvent(fN, () => this.animationCallback(frame, frameNumber, anim));
            anim.addEvent(event);
          }
        }
      }

      if (!keySetCreated) {
        this.maxLength = 0;
        this.lastFrame = 0;
      }
    }
    sceneObject.animations = this.animationsArray;
  }
  animationCallback(frame, frameNumber, anim) {
    let cmd = frame.values.frameCommand.origValue;
    let cmdField = frame.values.frameCommandField.origValue;
    let cmdValue = frame.values.frameCommandValue.origValue;
    this.context.sceneCommand(cmd, cmdField, cmdValue, this.parentKey);
  }
  async importFrames(importArray) {
    for (let i in this.rawFrames)
      this.fireSet.removeByKey(i);

    let promises = [];
    for (let i in importArray) {
      importArray[i].parentKey = this.parentKey;
      promises.push(gAPPP.a.modelSets['frame'].createWithBlobString(importArray[i]));
    }

    return await Promise.all(promises);
  }
  __getLightDetails(values) {
    let result = {};
    result.originX = GLOBALUTIL.getNumberOrDefault(values['lightOriginX'], 10);
    result.originY = GLOBALUTIL.getNumberOrDefault(values['lightOriginY'], 10);
    result.originZ = GLOBALUTIL.getNumberOrDefault(values['lightOriginZ'], 10);
    result.directionX = GLOBALUTIL.getNumberOrDefault(values['lightDirectionX'], 1);
    result.directionY = GLOBALUTIL.getNumberOrDefault(values['lightDirectionY'], 1);
    result.directionZ = GLOBALUTIL.getNumberOrDefault(values['lightDirectionZ'], 1);

    result.origin = new BABYLON.Vector3(result.originX, result.originY, result.originZ);
    result.direction = new BABYLON.Vector3(result.directionX, result.directionY, result.directionZ);

    result.angle = GLOBALUTIL.getNumberOrDefault(values['lightAngle'], Math.PI / 2.0);
    result.decay = GLOBALUTIL.getNumberOrDefault(values['lightDecay'], 1);
    result.diffuseR = GLOBALUTIL.getNumberOrDefault(values['lightDiffuseR'], 1);
    result.diffuseG = GLOBALUTIL.getNumberOrDefault(values['lightDiffuseG'], 1);
    result.diffuseB = GLOBALUTIL.getNumberOrDefault(values['lightDiffuseB'], 1);
    result.specularR = GLOBALUTIL.getNumberOrDefault(values['lightSpecularR'], 1);
    result.specularG = GLOBALUTIL.getNumberOrDefault(values['lightSpecularG'], 1);
    result.specularB = GLOBALUTIL.getNumberOrDefault(values['lightSpecularB'], 1);
    result.groundR = GLOBALUTIL.getNumberOrDefault(values['lightGroundR'], 0);
    result.groundG = GLOBALUTIL.getNumberOrDefault(values['lightGroundG'], 0);
    result.groundB = GLOBALUTIL.getNumberOrDefault(values['lightGroundB'], 0);

    result.specular = GLOBALUTIL.color(result.diffuseR + ',' + result.diffuseG + ',' + result.diffuseR);
    result.diffuse = GLOBALUTIL.color(result.specularR + ',' + result.specularG + ',' + result.specularR);
    result.ground = GLOBALUTIL.color(result.groundR + ',' + result.groundG + ',' + result.groundR);
    result.intensity = GLOBALUTIL.getNumberOrDefault(values['lightIntensity'], .75);
    return result;
  }
}

export default class wBlock {
  constructor(context, parent = null, sceneObject = null) {
    this._blockKey = null;
    this.blockTargetKey = null;
    this.sceneObject = sceneObject;
    this.childBlocks = {};
    this.parentBlocks = {}; //root only
    this.context = context;
    this.parent = parent;
    this.staticType = '';
    this.blockRenderData = {};
    this.blockRawData = {};
    this.currentMaterialName = '';
    this.containerFieldList = ['width', 'height', 'depth', 'childName', 'childType'];
    this.containerCache = {};
    this.containerCenter = {
      x: 0,
      y: 0,
      z: 0
    };
    this.containerDirection = {
      x: 1,
      y: 0,
      z: .5
    };
    this.framesHelper = new wFrames(this.context);
    this.skyboxObject = null;
    this.groundObject = null;
    this.updateVideoCallback = () => {};
    this.updatesDisabled = false;
  }
  set blockKey(key) {
    this._blockKey = key;
    this.framesHelper.setParentKey(key, this);
  }
  get blockKey() {
    return this._blockKey;
  }
  _addSkyBox() {
    if (this.lastSkyBox === this.blockRawData.skybox &&
      this.lastskyboxSize === this.blockRawData.skyboxSize)
      return;
    this.lastSkyBox = this.blockRawData.skybox;
    this.lastskyboxSize = this.blockRawData.skyboxSize;

    if (this.skyboxObject) {
      this.skyboxObject.dispose();
    }
    this.skyboxObject = null;

    if (this.blockRawData.skybox) {
      let equipath = this.blockRawData.skybox;
      if (equipath.substring(0, 3) === 'sb:') {
        equipath = gAPPP.cdnPrefix + 'textures/' + equipath.substring(3);
      }
      let skyboxSize = GLOBALUTIL.getNumberOrDefault(this.blockRawData.skyboxSize, 800.0);

      if (!BABYLON.equirectLoadFixed) {
        BABYLON.equirectLoadFixed = true;
        BABYLON.EquiRectangularCubeTexture.prototype.loadImage =
          function(e, t) {
            var i = this,
              n = document.createElement("canvas"),
              r = new Image;
            r.setAttribute('crossorigin', 'anonymous');
            r.addEventListener("load", (function() {
                i._width = r.width,
                  i._height = r.height,
                  n.width = i._width,
                  n.height = i._height;
                var t = n.getContext("2d");
                t.drawImage(r, 0, 0);
                var o = t.getImageData(0, 0, r.width, r.height);
                i._buffer = o.data.buffer,
                  n.remove(),
                  e()
              })),
              r.addEventListener("error", (function(e) {
                t && t(i.getClassName() + " could not be loaded", e)
              })),
              r.src = this.url
          };
      }

      if (equipath.substring(0, 6) === 'skybox')
        return;

      let skybox = BABYLON.Mesh.CreateBox("skyBox" + (new Date().getTime()).toString(), skyboxSize, this.context.scene);
      skybox.isPickable = false;
      let skyboxMaterial = new BABYLON.StandardMaterial(equipath, this.context.scene);
      skyboxMaterial.backFaceCulling = false;

      skyboxMaterial.reflectionTexture = new BABYLON.EquiRectangularCubeTexture(equipath, this.context.scene, skyboxSize);
      skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.disableLighting = true;
      skybox.material = skyboxMaterial;
      this.skyboxObject = skybox;
    }

    if (this.skyboxInit) {
      this.context._updateCamera('default');
      setTimeout(() => {
        this.context._updateCamera(this.context.canvasHelper.cameraSelect.value);
      }, 1);
    }
    this.skyboxInit = true;
  }
  containsLight() {
    if (this.blockRawData.childType === 'light')
      return true;
    for (let i in this.childBlocks)
      if (this.childBlocks[i].containsLight())
        return true;
    return false;
  }
  _renderGround() {
    let gMat = this.blockRawData.groundMaterial;
    if (!gMat)
      gMat = '';

    if (gMat === '') {
      if (this.groundObject)
        this.groundObject.dispose();
      this.groundObject = null;
      return;
    }

    let bWidth = this.blockRawData.width;
    let bDepth = this.blockRawData.depth;
    let setMat = false;
    if (!this.groundObject || this.lastbWidth !== bWidth || this.lastbDepth !== bDepth) {
      if (this.groundObject)
        this.groundObject.dispose();
      this.lastbWidth = bWidth;
      this.thislastbDepth = bDepth;
      this.groundObject = BABYLON.Mesh.CreateGround("sceneblocksdefaultground", bWidth, bDepth, 1, this.context.scene, false);
      this.groundObject.parent = this.sceneObject;
      setMat = true;
    }

    if (this.lastGroundMaterial !== this.blockRawData.groundMaterial || setMat) {
      this.lastGroundMaterial = this.blockRawData.groundMaterial;
      this.groundObject.material = this._materialFromName(this.blockRawData.groundMaterial);
    }
  }
  handleDataUpdate(tag, values, type, fireData) {
    let rootBlock = this.context.canvasHelper.rootBlock;
    if (this !== rootBlock) {
      if (rootBlock.updatesDisabled)
        return;

      if (!this.skipInitEvent) {
        this.skipInitEvent = true;
      } else
        this.context.canvasHelper.logMessage('event - ' + tag + ' ' + type, true);
    }

    if (rootBlock.updatesDisabled && type !== 'change')
      return;

    if ((tag === 'frame' || tag === 'blockchild') && type === 'add')
      if (values.parentKey && this.parentBlocks[values.parentKey])
        if (this.parentBlocks[values.parentKey] !== this)
          return this.parentBlocks[values.parentKey].handleDataUpdate(tag, values, type, fireData);

    if (type === 'add') {
      if (tag === 'mesh' || tag === 'shape' || tag === 'block')
        return;
    }

    if (type === 'moved')
      return;
    else if (tag === 'texture') {
      return this._handleTextureUpdate(values);
    } else if (tag === 'material') {
      if (!values || !values.title)
        return;
      let materialName = values.title;
      if (materialName === this.blockRenderData.materialName)
        return this.setData();
      if (materialName === this.blockRenderData.groundMaterial) {
        this.lastGroundMaterial = undefined;
        this._renderGround();
      }
    } else if (type === 'remove' && tag === 'blockchild') {
      if (values && values.parentKey === this._blockKey)
        return this.setData(this.blockRawData, true);

      if (this.parent)
        if (values.parentKey === this.blockRawData.parentKey) {
          this.parent.containerCache = {};
          return this.parent.setData();
        }

      for (let cb in this.childBlocks) {
        if (this.childBlocks[cb].blockTargetKey === values.parentKey) {
          return this.childBlocks[cb].setData(null, true);
        }
      }
    } else if (type === 'remove' && this.blockRawData.childType === 'block') {
      if (tag === 'shape' || tag === 'block' || tag === 'mesh') {
        for (let cb in this.childBlocks) {
          if (this.childBlocks[cb].blockTargetKey === fireData.key) {
            return this.setData();
          }
        }
      }
    } else if ((type === 'add' || type === 'change') && tag === 'blockchild') {
      if (values.parentKey === this._blockKey) {
        if (type === 'change') {
          let childBlock = this.childBlocks[fireData.key];
          if (childBlock) {
            let oldType = childBlock.blockRawData.childType;
            let newType = values.childType;

            let oldAsset = wBlock._fetchChildAssetData(oldType, childBlock.blockRawData.childName);
            let newAsset = wBlock._fetchChildAssetData(newType, values.childName);

            if (!oldAsset && !newAsset)
              return; //skip if asset didn't and still doesn't exist
          }
        }

        return this.setData();
      }

      if (this.parent)
        if (values.parentKey === this.blockRawData.parentKey) {
          return this.parent.setData();
        }

      for (let cb in this.childBlocks) {
        if (this.childBlocks[cb].blockTargetKey === values.parentKey) {
          return this.childBlocks[cb].setData();
        }
      }

      return;
    } else if (tag === 'frame') {
      let parentKey = null;
      if (values)
        parentKey = values.parentKey;
      if (type === 'remove' && gAPPP.a.modelSets['frame'].lastValuesDeleted)
        parentKey = gAPPP.a.modelSets['frame'].lastValuesDeleted.parentKey;

      if (parentKey === this._blockKey) {
        this._framesRedraw();
        return;
      }
    } else if (tag === 'block') {
      if (this.context.canvasHelper.rootBlock === this) {
        if (values.generationState === 'ready') {
          this.context.handleAnimationReady();
        }
      }
    }

    if (values) {
      if (this._blockKey === fireData.key) {
        if (tag === 'block') {
          if (this.context.canvasHelper.rootBlock === this) {
            if (values.generationState === 'not ready') {
              this.context.handleAnimationNotReady();
            }
          }
          return this.setData(values);
        }
      }

      if (values.title) {
        if (fireData.lastValuesChanged) {
          let oldTitle = fireData.lastValuesChanged.title;
          if (values.title !== oldTitle) {
            if (this.blockRawData.childType === tag && oldTitle === this.blockRawData.childName) {
              if (this.parent)
                return this.parent.setData();
            }
          }
        }

        if (this.blockRawData.childType === tag && values.title === this.blockRawData.childName) {
          if (type === 'add') {
            return this.setData();
          }

          return this.setData();
        }
      }
    }

    for (let i in this.childBlocks) {
      if (type === 'remove') {
        if (i === fireData.key) {
          if (tag === 'blockchild')
            return this.setData();

          this.childBlocks[i].dispose();
          delete this.childBlocks[i];
          break;
        }
      }

      this.childBlocks[i].handleDataUpdate(tag, values, type, fireData);
    }
  }
  _restartRootAnimation() {
    let rootBlock = this.context.canvasHelper.rootBlock;
    //  clearTimeout(rootBlock.restartTimeoutPtr);

    //  rootBlock.restartTimeoutPtr = setTimeout(() => {
    let curValue = 0;
    if (this.context.canvasHelper.activeAnimation) {
      let elapsed = this.context.canvasHelper.activeAnimation._runtimeAnimations[0].currentFrame;
      let total = this.context.canvasHelper.activeAnimation.toFrame;
      curValue = elapsed / total * 100.0;
    }

    //    this.context.canvasHelper.rootBlock.stopAnimation();
    this.context.canvasHelper.rootBlock.playAnimation(curValue);
    //  }, 150);
  }
  _framesRedraw() {
    if (this.blockRawData.childType === 'block') {
      this.framesHelper.compileFrames();

      if (this.framesHelper.processedFrames.length > 1) {
        this.setData(); //recalc block child frames if % values used
        //this._restartRootAnimation();
      } else {
        this.__applyFirstFrameValues();
      }

      return;
    }
    this.framesHelper.compileFrames();
    this.__applyFirstFrameValues();
  }
  _handleTextureUpdate(values) {
    if (!values || !values.title)
      return;
    let textureName = values.title;
    let matDetails = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', this.blockRenderData.materialName);
    let gnd = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', this.blockRenderData.groundMaterial);
    if (matDetails)
      if (matDetails.diffuseTextureName === textureName || matDetails.emissiveTextureName === textureName ||
        matDetails.specularTextureName === textureName || matDetails.ambientTextureName === textureName ||
        matDetails.bumpTextureName === textureName || matDetails.reflectionTextureName === textureName
      )
        return this.setData();

    if (gnd)
      if (gnd.diffuseTextureName === textureName || gnd.emissiveTextureName === textureName ||
        gnd.specularTextureName === textureName || gnd.ambientTextureName === textureName ||
        gnd.bumpTextureName === textureName || gnd.reflectionTextureName === textureName
      ) {
        this.lastGroundMaterial = undefined;
        this._renderGround();
      }

    for (let i in this.childBlocks)
      this.childBlocks[i]._handleTextureUpdate(values);
  }
  recursiveGetBlockForKey(key) {
    if (this._blockKey === key)
      return this;
    for (let i in this.childBlocks) {
      if (i === key)
        return this.childBlocks[key];

      let block = this.childBlocks[i].recursiveGetBlockForKey(key);
      if (block !== null)
        return block;
    }
    return null;
  }
  _createShape() {
    this.dispose();
    let name = 'singleShapeObject' + this._blockKey;

    let options = {};
    let fields = sDataDefinition.bindingFields('shape');
    for (let i in fields) {
      let field = fields[i];
      if (field.shapeOption) {
        let addKey = false;
        if (Array.isArray(field.displayGroup))
          if (field.displayGroup.indexOf(this.blockRenderData['shapeType']) !== -1)
            addKey = true;

        if (field.displayGroup === this.blockRenderData['shapeType'])
          addKey = true;

        if (addKey)
          if (field.displayType === 'number') {
            if (GLOBALUTIL.isNumeric(this.blockRenderData[field.fireSetField]))
              options[field.shapeOption] = Number(this.blockRenderData[field.fireSetField]);
          } else
            options[field.shapeOption] = this.blockRenderData[field.fireSetField];
      }
    }

    if (this.blockRenderData['shapeType'] === 'sphere')
      return this.sceneObject = BABYLON.MeshBuilder.CreateSphere(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'box')
      return this.sceneObject = BABYLON.MeshBuilder.CreateBox(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'plane')
      return this.sceneObject = BABYLON.MeshBuilder.CreatePlane(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'cylinder')
      return this.sceneObject = BABYLON.MeshBuilder.CreateCylinder(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'text')
      return this.__createTextMesh(name, options);

    if (this.blockRenderData['shapeType'] === 'torus')
      return this.sceneObject = BABYLON.MeshBuilder.CreateTorus(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'torusknot')
      return this.sceneObject = BABYLON.MeshBuilder.CreateTorusKnot(name, options, this.context.scene);

    this.sceneObject = BABYLON.MeshBuilder.CreateBox(name, options, this.context.scene);
  }
  __applyFirstFrameValues() {
    if (!this.sceneObject)
      return;

    let values = this.framesHelper.firstFrameValues();
    for (let i in this.framesHelper.fieldsData) {
      let field = this.framesHelper.fieldsData[i];
      let value = values[field.fireSetField];

      if (field.contextObjectField)
        if (value !== '')
          this.__updateObjectValue(field, value, this.sceneObject);
    }
  }
  createGuides(size) {
    this.dispose();

    let wrapper = null;
    let sObjects = [];
    let axisX = BABYLON.Mesh.CreateLines("axisX", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    ], this.context.scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    wrapper = axisX;

    let localScene = this.context.scene;

    function __make2DTextMesh(text, color, size) {
      let dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, localScene, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
      let plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, localScene, true);
      plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", localScene);
      plane.material.backFaceCulling = false;
      plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
      plane.material.diffuseTexture = dynamicTexture;
      return plane;
    }

    let xChar = __make2DTextMesh("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    xChar.setParent(wrapper);

    let axisY = BABYLON.Mesh.CreateLines("axisY", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    ], this.context.scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    axisY.setParent(wrapper);

    let yChar = __make2DTextMesh("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    yChar.setParent(wrapper);

    let axisZ = BABYLON.Mesh.CreateLines("axisZ", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    ], this.context.scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    axisZ.setParent(wrapper);

    let zChar = __make2DTextMesh("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    zChar.setParent(wrapper);

    this.sceneObject = wrapper;
  }
  createGrid(gridDepth) {
    this.dispose();
    let grid = BABYLON.Mesh.CreateGround("ground1", gridDepth, gridDepth, 2, this.context.scene);
    let material = new BABYLON.StandardMaterial('scenematerialforfloorgrid', this.context.scene);
    let texture = new BABYLON.Texture('/images/greengrid.png', this.context.scene);
    texture.hasAlpha = true;
    material.diffuseTexture = texture;
    texture.vScale = gridDepth;
    texture.uScale = gridDepth;
    grid.material = material;
    this.sceneObject = grid;
  }
  dispose() {
    for (let i in this.childBlocks)
      this.childBlocks[i].dispose();
    this.childBlocks = {};

    if (this.sceneObject)
      this.sceneObject.dispose();
    this.sceneObject = null;

    clearTimeout(this.framesRedrawTimeout);

    this.containerCache = {};
  }
  async loadMesh() {
    return new Promise((resolve, reject) => {
      let path = gAPPP.storagePrefix;
      let url = this.blockRenderData['url'];
      let filename = '';
      let texture;
      if (url.substring(0, 3) === 'sb:') {
        path = gAPPP.cdnPrefix + 'meshes/';
        filename = url.substring(3);
      } else if (url.indexOf(gAPPP.storagePrefix) === -1) {
        let parts = url.split('/');
        filename = parts[parts.length - 1];
        path = url.replace(filename, '');
      } else {
        filename = this.context._url(url);
      }

      if (filename === '') {
        this.dispose();
        return resolve();
      }

      BABYLON.SceneLoader.ImportMesh('', path, filename, this.context.scene,
        (newMeshes, particleSystems, skeletons) => {
          this.dispose();
          this.sceneObject = newMeshes[0];
          this.sceneObjectMeshData = {};
          let newMesh = this.sceneObject;
          let objectData = this.sceneObjectMeshData;

          objectData.scalingX = newMesh.scaling.x;
          objectData.scalingY = newMesh.scaling.y;
          objectData.scalingZ = newMesh.scaling.z;

          objectData.positionX = newMesh.position.x;
          objectData.positionY = newMesh.position.y;
          objectData.positionZ = newMesh.position.z;

          objectData.rotationX = newMesh.rotation.x;
          objectData.rotationY = newMesh.rotation.y;
          objectData.rotationZ = newMesh.rotation.z;

          resolve({
            error: false
          });
        },
        progress => {},
        (scene, msg, err) => {
          this.context.logError('wBlock.loadMesh');
          resolve({
            error: true,
            message: msg,
            errorObject: err,
            scene: scene
          });
        });
    });
  }
  __setpreviewshape(values) {
    let shape = values['previewShape'];
    if (!shape)
      shape = 'box';
    this.blockRenderData = {
      shapeType: shape,
      cylinderDiameter: 2,
      cylinderHeight: 2,
      sphereDiameter: 3,
      width: 2,
      height: 2,
      boxSize: 2,
      textText: 'Preview',
      textDepth: 1,
      textSize: 30
    };
  }
  setData(values = null, forceRedraw = false) {
    if (this.context !== gAPPP.activeContext)
      return;

    if (this.staticType === 'texture') {
      this.__setpreviewshape(values);
      this._createShape();

      let objectData = sDataDefinition.getDefaultDataCloned('material');
      let m = this.__material(objectData);
      m.diffuseTexture = this.__texture(values);
      m.emissiveTexture = this.__texture(values);
      this.context.__setMaterialOnObj(this.sceneObject, m);
      return;
    }
    if (this.staticType === 'material') {
      this.__setpreviewshape(values);
      this._createShape();
      let m = this.__material(values);
      this.context.__setMaterialOnObj(this.sceneObject, m);
      return;
    }

    if (values) {
      this.blockRawData = values;
      if (values.childType === 'light') {
        this.staticLoad = true;
        this.staticType = values.childType;
      }
      if (values.childType === 'camera') {
        this.staticLoad = true;
        this.staticType = values.childType;
      }
    }

    let rootBlock = this.context.canvasHelper.rootBlock;
    if (rootBlock.updatesDisabled)
      return;

    if (this.staticLoad) {
      this.blockRenderData = this.blockRawData;
      this.blockRenderData.childType = this.staticType;
      this.framesHelper._validateFieldList(this.blockRenderData.childType);
      this.framesHelper.blockWrapper = this;
      this._renderBlock(forceRedraw);
    } else
      this._loadBlock(forceRedraw);

    this.context.refreshFocus();
  }
  get rootBlock() {
    if (this.parent)
      return this.parent.rootBlock;
    return this;
  }
  _circularTest(blockName) {
    return false;

    if (!this.parent)
      return false;

    if (this.parent.blockRawData.title === blockName)
      return true;

    return this.parent._circularTest(this.blockRawData.childName);
  }
  static _fetchChildAssetData(childType, childName) {
    let fireSet = gAPPP.a.modelSets[childType];
    let data = null;

    if (fireSet)
      data = fireSet.getValuesByFieldLookup('title', childName);

    return data;
  }
  _loadBlock(forceRedraw) {
    let children = {};
    if (this._circularTest(this.blockRawData.childName)) {
      this.context.logError('Circular Reference Error  :' + this.__getParentRoute());
      return;
    }
    if (gAPPP.a.modelSets[this.blockRawData.childType])
      children = gAPPP.a.modelSets[this.blockRawData.childType].queryCache('title', this.blockRawData.childName);

    let keys = Object.keys(children);
    if (keys.length === 0) {
      this.dispose();
      this.context.logError('no block found: ' + this.__getParentRoute());
      return;
    }

    if (keys.length > 1) {
      this.context.logError('duplicate block name found: ' + this.__getParentRoute());
    }
    this.blockTargetKey = keys[0];
    this.blockRenderData = children[keys[0]];
    if (this.blockRawData.childType === 'mesh')
      this.loadMesh().then(r => {
        this._renderBlock();
        this.context.refreshFocus();
      });
    else
      this._renderBlock(forceRedraw);
  }
  __getParentRoute() {
    let thisPart = '[' + this.blockRawData.childName + ' / ' + this.blockRawData.childType + ']';
    if (this.parent)
      thisPart += this.parent.__getParentRoute();
    else
      return '';
    return thisPart;
  }
  _renderBlock(forceRedraw = false) {
    if (this.blockRawData.childType === 'mesh')
      this.__renderMeshBlock();
    if (this.blockRawData.childType === 'shape')
      this.__renderShapeBlock();
    if (this.blockRawData.childType === 'block')
      this.__renderContainerBlock(forceRedraw);
    if (this.blockRawData.childType === 'light')
      this.__renderLightBlock();

    this.currentMaterialName = this.blockRenderData.materialName;

    if (this.parent && this.sceneObject)
      this.sceneObject.parent = this.parent.sceneObject;
    if (this.sceneObject)
      this.sceneObject.blockWrapper = this;

    this.framesHelper.activeAnimation = null;
    this.framesHelper.setParentKey(this.blockKey, this);

    let rootBlock = this.context.canvasHelper.rootBlock;
    rootBlock.parentBlocks[this.blockKey] = this;
    this.__applyFirstFrameValues();
  }
  __renderMeshBlock() {
    let fields = sDataDefinition.bindingFields('mesh');
    for (let i in fields) {
      let field = fields[i];
      let value = this.blockRenderData[field.fireSetField];

      if (field.contextObjectField)
        if (this.sceneObject)
          this.__updateObjectValue(field, value, this.sceneObject);
    }
  }
  __renderShapeBlock() {
    this.dispose();
    let newShape = this._createShape();
    if (!this.sceneObject)
      return;

    if (this.blockRenderData['shapeType'] === 'plane')
      this.sceneObject.isPickable = false;

    let fields = sDataDefinition.bindingFields('shape');
    for (let i in fields) {
      let field = fields[i];
      let value = this.blockRenderData[field.fireSetField];

      if (field.contextObjectField)
        this.__updateObjectValue(field, value, this.sceneObject);
    }
  }
  __renderContainerBlock(forceRedraw = false) {
    if (!this._blockKey)
      return;

    let oldContainerMesh = null;
    let width = this.blockRenderData['width'];
    let height = this.blockRenderData['height'];
    let depth = this.blockRenderData['depth'];

    let fieldDirty = false;
    for (let i = 0; i < this.containerFieldList.length; i++) {
      let f = this.containerFieldList[i];
      if (this.containerCache[f] !== this.blockRenderData[f]) {
        fieldDirty = true;
        this.containerCache[f] = this.blockRenderData[f];
      }
    }
    if (fieldDirty || forceRedraw) {
      oldContainerMesh = this.sceneObject;
      this.sceneObject = BABYLON.MeshBuilder.CreateBox(this._blockKey, {
        width,
        height,
        depth
      }, this.context.scene);
      this.sceneObject.isPickable = false;
      if (this.blockRenderData.isPickable)
        this.sceneObject.isPickable = true;
      this.sceneObject.isContainerBlock = true;
      this.sceneObject._blockKey = this._blockKey;
      this.sceneObject.isVisible = false;
      this.sceneObject.blockWrapper = this;
      this.sceneObject.material = new BABYLON.StandardMaterial(this._blockKey + 'material', this.context.scene);
      this.sceneObject.material.alpha = 0;
    }

    this.__renderSceneOptions(this.blockRenderData);

    let containerKey = this.blockKey;
    if (!this.staticLoad) {
      containerKey = this.blockTargetKey;
    }

    let children = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', containerKey);
    for (let i in children)
      this.__updateChild(i, children[i]);

    if (!this.parent) {
      this.updateCamera();
    }

    if (oldContainerMesh !== null)
      oldContainerMesh.dispose();
  }
  __renderSceneOptions(renderData) {
    this._renderGround();

    if (this.parent)
      return;

    if (!renderData) {
      if (gAPPP.a.profile.canvasColor)
        this.context.scene.clearColor = GLOBALUTIL.color(gAPPP.a.profile.canvasColor);

      return;
    }

    this._addSkyBox();
    let fogMode = renderData.fogType;

    this.context.scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
    if (!fogMode)
      fogMode === 'none';
    if (fogMode != 'none') {
      if (fogMode === 'EXP')
        this.context.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
      if (fogMode === 'EXP2')
        this.context.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
      if (fogMode === 'LINEAR')
        this.context.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
      this.context.scene.fogDensity = GLOBALUTIL.getNumberOrDefault(renderData.fogDensity, .2);
      this.context.scene.fogStart = GLOBALUTIL.getNumberOrDefault(renderData.fogStart, 20.0);
      this.context.scene.fogEnd = GLOBALUTIL.getNumberOrDefault(renderData.fogEnd, 60.0);

      if (renderData.fogColor)
        this.context.scene.fogColor = GLOBALUTIL.color(renderData.fogColor);
      else
        this.context.scene.fogColor = GLOBALUTIL.color('0.2,0.2,0.3');
    }

    if (renderData.ambientColor)
      this.context.scene.ambientColor = GLOBALUTIL.color(renderData.ambientColor);
    else
      this.context.scene.ambientColor = GLOBALUTIL.color('0,0,0');

    if (renderData.clearColor)
      this.context.scene.clearColor = GLOBALUTIL.color(renderData.clearColor);
    else {
      if (gAPPP.a.profile.canvasColor) {
        this.context.scene.clearColor = GLOBALUTIL.color(gAPPP.a.profile.canvasColor);
      } else
        this.context.scene.clearColor = GLOBALUTIL.color('.2,.4,.4');
    }

    this.updateVideoCallback(renderData);
  }
  __renderLightBlock() {
    let values = this.framesHelper.firstFrameValues();
    let lP = this.framesHelper.__getLightDetails(values);

    let light = this.blockRawData['lightType'];
    if (this.lightObject) {
      this.lightObject.dispose();
      this.lightObject = null;
      this.sceneObject = null;
    }

    if (light === 'Hemispheric') {
      this.lightObject = new BABYLON.HemisphericLight("HemiLight", lP.direction, this.context.scene);
      this.lightObject.position = new BABYLON.Vector3.Zero();
    }
    if (light === 'Point') {
      this.lightObject = new BABYLON.PointLight("PointLight", lP.origin, this.context.scene);
      this.lightObject.direction = new BABYLON.Vector3.Zero();
    }
    if (light === 'Directional') {
      this.lightObject = new BABYLON.DirectionalLight("DirectionalLight", lP.direction, this.context.scene);
      this.lightObject.position = new BABYLON.Vector3.Zero();
    }
    if (light === 'Spot') {
      this.lightObject = new BABYLON.SpotLight("SpotLight", lP.origin, lP.direction, lP.angle, lP.decay, this.context.scene);
    }

    if (!this.lightObject)
      return;

    this.sceneObject = this.lightObject;

    this.lightObject.diffuse = lP.diffuse;
    this.lightObject.specular = lP.specular;
    this.lightObject.groundColor = lP.ground;
    this.lightObject.intensity = lP.intensity;
  }
  __updateChild(key, data) {
    if (!this.childBlocks[key])
      this.childBlocks[key] = new wBlock(this.context, this);
    this.childBlocks[key].blockKey = key;
    this.childBlocks[key].setData(data);
  }
  __createTextMesh(name, options) {
    this.dispose();

    let canvas = document.getElementById("highresolutionhiddencanvas");
    if (!canvas) {
      let cWrapper = document.createElement('div');
      cWrapper.innerHTML = `<canvas id="highresolutionhiddencanvas" width="4500" height="1500" style="display:none"></canvas>`;
      canvas = cWrapper.firstChild;
      document.body.appendChild(canvas);
    }
    let context2D = canvas.getContext("2d");
    let size = 100;
    let vectorOptions = {
      polygons: true,
      textBaseline: "top",
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontFamily: 'Arial',
      size: size,
      stroke: false
    };
    for (let i in vectorOptions)
      if (options[i])
        vectorOptions[i] = options[i];
    if (options['size'])
      size = Number(options['size']);

    let vectorData = vectorizeText(options['text'], canvas, context2D, vectorOptions);
    let x = 0;
    let y = 0;
    let z = 0;
    let thick = 10;
    if (options['depth'])
      thick = Number(options['depth']);
    let scale = size / 100;
    let lenX = 0;
    let lenY = 0;
    let polies = [];

    for (var i = 0; i < vectorData.length; i++) {
      var letter = vectorData[i];
      var conners = [];
      for (var k = 0; k < letter[0].length; k++) {
        conners[k] = new BABYLON.Vector2(scale * letter[0][k][1], scale * letter[0][k][0]);
        if (lenX < conners[k].x) lenX = conners[k].x;
        if (lenY < conners[k].y) lenY = conners[k].y;
      }
      var polyBuilder = new BABYLON.PolygonMeshBuilder("pBuilder" + i, conners, this.context.scene);

      for (var j = 1; j < letter.length; j++) {
        var hole = [];
        for (var k = 0; k < letter[j].length; k++) {
          hole[k] = new BABYLON.Vector2(scale * letter[j][k][1], scale * letter[j][k][0]);
        }
        hole.reverse();
        polyBuilder.addHole(hole);
      }

      try {
        var polygon = polyBuilder.build(false, thick);
        //polygon.receiveShadows = true;

        polies.push(polygon);
      } catch (e) {
        console.log('text 3d render polygon error', e);
      }
    }

    if (lenY < .001 && lenX < .001)
      this.context.logError('Zero Length result for text shape ' + this.__getParentRoute());
    if (lenY === 0)
      lenY = 0.001;
    if (lenX === 0)
      lenX = 0.001;

    let deltaY = thick / 2.0;
    let deltaX = lenX / 2.0;
    let deltaZ = lenY / 2.0;

    let textWrapperMesh = BABYLON.MeshBuilder.CreateBox(this._blockKey + 'textdetailswrapper', {
      width: lenX,
      height: thick,
      depth: lenY
    }, this.context.scene);
    textWrapperMesh.isVisible = false;
    for (let i = 0, l = polies.length; i < l; i++) {
      polies[i].position.x -= deltaX;
      polies[i].position.y += deltaY;
      polies[i].position.z -= deltaZ;
      polies[i].setParent(textWrapperMesh);
    }

    this.sceneObject = textWrapperMesh;
  }
  __material(values) {
    let material = new BABYLON.StandardMaterial('material' + Math.random().toFixed(4), this.context.scene);
    let fields = sDataDefinition.bindingFields('material');

    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.contextObjectField)
        this.__updateObjectValue(field, value, material);
    }
    return material;
  }
  __getMaterialFromParent(value) {
    let parent = this;

    while (parent.parent) {
      if (parent.blockRawData.inheritMaterial) {
        if (parent.parent.blockRenderData.materialName)
          value = parent.parent.blockRenderData.materialName;
      } else {
        return value;
      }

      parent = parent.parent;
    }

    return value;
  }
  __updateObjectValue(field, value, object) {
    try {
      if (value === undefined) return;

      if (field.displayType === 'number')
        value = GLOBALUTIL.getNumberOrDefault(value, 0.0);

      if (field.type === undefined) return GLOBALUTIL.path(object, field.contextObjectField, value);

      if (field.type === 'material') {
        this.__updateMaterial(value, object);

        return;
      }

      if (value === '') return;

      if (field.type === 'visibility') return this.context.__fadeObject(object, value);

      if (field.type === 'color') {
        let parts = value.split(',');
        let cA = [];
        let color = new BABYLON.Color3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
        return GLOBALUTIL.path(object, field.contextObjectField, color);
      }

      if (field.type === 'texture') {
        let t = this._textureFromName(value);
        return GLOBALUTIL.path(object, field.contextObjectField, t);
      }

      GLOBALUTIL.path(object, field.contextObjectField, value);
    } catch (e) {
      this.context.logError('set ui object error: ' + field.contextObjectField + ' : ' + value + '  ' + this.__getParentRoute());
    }
  }
  _materialFromName(materialName) {
    if (materialName.substring(0, 8) === 'decolor:') {
      let color = materialName.substring(8).trim();
      let objectData = sDataDefinition.getDefaultDataCloned('material');
      let m = this.__material(objectData);

      m.diffuseColor = GLOBALUTIL.color(color);
      m.emissiveColor = GLOBALUTIL.color(color);
      return m;
    } else if (materialName.substring(0, 7) === 'ecolor:') {
      let color = materialName.substring(7).trim();
      let objectData = sDataDefinition.getDefaultDataCloned('material');
      let m = this.__material(objectData);

      m.emissiveColor = GLOBALUTIL.color(color);
      return m;
    } else if (materialName.substring(0, 6) === 'color:') {
      let color = materialName.substring(6).trim();
      let objectData = sDataDefinition.getDefaultDataCloned('material');
      let m = this.__material(objectData);

      m.diffuseColor = GLOBALUTIL.color(color);
      return m;
    } else {
      let tD = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', materialName);
      let m;
      if (!tD) {
        m = new BABYLON.StandardMaterial('material', this.context.scene);
        if (materialName !== '' && materialName !== 'inherit')
          this.context.logError('material missing ' + materialName);
      } else
        m = this.__material(tD);

      return m;
    }
  }
  __updateMaterial(materialName, object) {
    materialName = this.__getMaterialFromParent(materialName);
    let m = this._materialFromName(materialName);
    this.context.__setMaterialOnObj(object, m);
  }
  _textureFromName(textureName) {
    let texture;
    if (textureName.substring(0, 3) === 'sb:') {
      let url = gAPPP.cdnPrefix + 'textures/' + textureName.substring(3);
      let t = new BABYLON.Texture(url, this.context.scene);
      if (textureName.indexOf('.png') !== -1 || textureName.indexOf('.svg') !== -1)
        t.hasAlpha = true;
      return t;
    }

    let texturePrefix = textureName.substring(0, 7);
    if (texturePrefix === 'https:/' || texturePrefix === 'http://') {
      let t = new BABYLON.Texture(textureName, this.context.scene);
      if (textureName.indexOf('.png') !== -1 || textureName.indexOf('.svg') !== -1)
        t.hasAlpha = true;
      return t;
    }

    let tD = gAPPP.a.modelSets['texture'].getValuesByFieldLookup('title', textureName);
    if (tD === undefined)
      return;

    return this.__texture(tD);
  }
  __texture(values) {
    let url = values['url'];
    let texture;
    if (url.substring(0, 3) === 'sb:')
      url = gAPPP.cdnPrefix + 'textures/' + url.substring(3);

    if (values.isFittedText) {
      let renderSize = GLOBALUTIL.getNumberOrDefault(values.textureTextRenderSize, 512);
      texture = new BABYLON.DynamicTexture("dynamic texture", renderSize, this.context.scene, true);

      let fontWeight = 'normal';
      if (values.textFontWeight)
        fontWeight = values.textFontWeight;
      let textFontFamily = 'Geneva';
      if (values.textFontFamily)
        textFontFamily = values.textFontFamily;
      let textFontSize = GLOBALUTIL.getNumberOrDefault(values.textFontSize, 75);
      let textFontSizeOrig = textFontSize;

      if (!values.textureText)
        values.textureText = '';
      if (!values.textureText2)
        values.textureText2 = '';
      let numChar = values.textureText.length;
      let minFontSize = Math.ceil(renderSize * 1.5 / numChar);

      let numChar2 = values.textureText2.length;
      let minFontSize2 = Math.ceil(renderSize * 1.5 / numChar2);

      let minFontTotalSize = Math.max(minFontSize2, minFontSize);
      textFontSize = Math.min(textFontSize, minFontSize);

      let font = fontWeight + ' ' + textFontSize + 'px ' + textFontFamily;
      let invertY = true;
      let clearColor = "transparent";
      let color = "white"

      if (values.textFontColor)
        color = GLOBALUTIL.colorRGB255(values.textFontColor);
      if (values.textFontClearColor)
        clearColor = GLOBALUTIL.colorRGB255(values.textFontClearColor);
      let x = 0;
      let y = GLOBALUTIL.getNumberOrDefault(textFontSize, 50);

      texture._context.font = font;
      let wResult = texture._context.measureText(values.textureText);
      let text1Width = wResult.width;
      let leftOffset = (renderSize - text1Width) / 2.0;
      texture.drawText(values.textureText, x + leftOffset, y, font, color, clearColor);

      if (values.textureText2) {
        //y += minFontSize2;
        y = renderSize / 2.25;
        let textFontSize2 = GLOBALUTIL.getNumberOrDefault(values.textFontSize, 75);

        textFontSize2 = Math.min(textFontSize2, minFontSize2);
        x = 0;

        font = fontWeight + ' ' + textFontSize2 + 'px ' + textFontFamily;

        texture._context.font = font;
        let wResult = texture._context.measureText(values.textureText2);
        let text1Width = wResult.width;
        let leftOffset2 = (renderSize - text1Width) / 2.0;

        texture.drawText(values.textureText2, x + leftOffset2, y, font, color, clearColor);
      }
    } else if (values.isText) {
      let renderSize = GLOBALUTIL.getNumberOrDefault(values.textureTextRenderSize, 512);
      texture = new BABYLON.DynamicTexture("dynamic texture", renderSize, this.context.scene, true);

      let fontWeight = 'normal';
      if (values.textFontWeight)
        fontWeight = values.textFontWeight;
      let textFontFamily = 'Geneva';
      if (values.textFontFamily)
        textFontFamily = values.textFontFamily;
      let textFontSize = GLOBALUTIL.getNumberOrDefault(values.textFontSize, 75);
      let font = fontWeight + ' ' + textFontSize + 'px ' + textFontFamily;
      let invertY = true;
      let clearColor = "transparent";
      let color = "white"

      if (values.textFontColor)
        color = GLOBALUTIL.colorRGB255(values.textFontColor);
      if (values.textFontClearColor)
        clearColor = GLOBALUTIL.colorRGB255(values.textFontClearColor);
      let x = 10;
      let y = GLOBALUTIL.getNumberOrDefault(textFontSize, 50);

      texture.drawText(values.textureText, x, y, font, color, clearColor);

      if (values.textureText2)
        texture.drawText(values.textureText2, x, y * 2, font, color, clearColor);
      if (values.textureText3)
        texture.drawText(values.textureText3, x, y * 3, font, color, clearColor);
      if (values.textureText4)
        texture.drawText(values.textureText4, x, y * 4, font, color, clearColor);

    } else if (values.isVideo)
      texture = new BABYLON.VideoTexture("video", [url], this.context.scene, true);
    else if (url === '')
      return null;
    else
      texture = new BABYLON.Texture(url, this.context.scene);

    if (GLOBALUTIL.isNumeric(values['vScale']))
      texture.vScale = Number(values['vScale']);
    if (GLOBALUTIL.isNumeric(values['uScale']))
      texture.uScale = Number(values['uScale']);
    if (GLOBALUTIL.isNumeric(values['vOffset']))
      texture.vOffset = Number(values['vOffset']);
    if (GLOBALUTIL.isNumeric(values['uOffset']))
      texture.uOffset = Number(values['uOffset']);

    texture.hasAlpha = values['hasAlpha'];
    return texture;
  }
  getBlockDimDesc() {
    let width = 1;
    if (GLOBALUTIL.isNumeric(this.blockRawData.width))
      width = Math.round(Number(this.blockRawData.width));
    let height = 1;
    if (GLOBALUTIL.isNumeric(this.blockRawData.height))
      height = Math.round(Number(this.blockRawData.height));
    let depth = 1;
    if (GLOBALUTIL.isNumeric(this.blockRawData.depth))
      depth = Math.round(Number(this.blockRawData.depth));

    return width + ' x ' + depth + ' x ' + height;
  }
  get activeAnimation() {
    if (!this.framesHelper.activeAnimation)
      this.framesHelper.compileFrames();
    return this.framesHelper.activeAnimation;
  }
  playAnimation(startPercent = 0, setSceneTime = true) {
    if (this.activeAnimation) {
      if (this.activeAnimation._paused)
        this.activeAnimation.restart();
      else {
        let frameIndex = startPercent / 100.0 * this.framesHelper.lastFrame;
        if (setSceneTime) {
          this.context.scene._animationTimeLast = BABYLON.Tools.now;
          this.context.scene._animationTime = 0;
        }
        this.framesHelper.startAnimation(frameIndex);
      }
    }

    this.framesHelper.playState = 1;

    for (let i in this.childBlocks)
      this.childBlocks[i].playAnimation(startPercent, false);
  }
  setAnimationPosition(currentPercent = 0) {
    if (this.activeAnimation) {
      let frame = Math.round(currentPercent / 100.0 * this.framesHelper.lastFrame);
      this.activeAnimation.goToFrame(frame);
    }

    for (let i in this.childBlocks)
      this.childBlocks[i].setAnimationPosition(currentPercent);
  }
  pauseAnimation() {
    if (this.activeAnimation)
      this.activeAnimation.pause();
    this.framesHelper.playState = 2;
    for (let i in this.childBlocks)
      this.childBlocks[i].pauseAnimation();
  }
  stopAnimation() {
    if (this.activeAnimation) {
      this.setAnimationPosition(0);
      this.activeAnimation.stop();
      this.activeAnimation.reset();
      this.activeAnimation._paused = false;
    }

    this.framesHelper.playState = 0;

    for (let i in this.childBlocks)
      this.childBlocks[i].stopAnimation();


  }
  updateCamera() {
    let cameras = this.traverseCameraList();
    let camerasS = JSON.stringify(cameras);
    let sel = this.context.canvasHelper.cameraSelect;
    let startValue = sel.value;
    if (camerasS !== this.context.canvasHelper.camerasS) {
      this.camerasCache = cameras;
      this.context.canvasHelper.cameraDetails = cameras;
      this.context.canvasHelper.camerasS = camerasS;
      let html = '';
      let count = 0;
      for (let i in this.context.canvasHelper.cameraDetails) {
        html += `<option value="${i}">${this.context.canvasHelper.cameraDetails[i].childName}</option>`;
        count++;
      }
      sel.innerHTML = html;
      sel.value = startValue;
      if (sel.selectedIndex === -1)
        sel.selectedIndex = 0;
      if (count > 2)
        sel.selectedIndex = count - 1;
    }

    if (this.context.canvasHelper.cameraSelect.value !== startValue)
      this.context._updateCamera(this.context.canvasHelper.cameraSelect.value);
  }
  traverseCameraList(cameras = null) {
    if (cameras === null)
      cameras = this.context.canvasHelper.defaultCameras;

    if (this.blockRawData.childType === 'camera') {
      cameras[this._blockKey] = this.blockRawData;
      this.blockRawData.firstFrameValues = this.framesHelper.firstFrameValues();
    }

    for (let i in this.childBlocks)
      this.childBlocks[i].traverseCameraList(cameras);

    return cameras;
  }
  _findBestTargetObject(findString) {
    let parts = findString.split(':');
    if (parts.length < 2)
      return null;
    let childType = parts[0].trim();
    let childName = parts[1].trim();
    for (let i in this.childBlocks) {
      if (this.childBlocks[i].blockRawData.childType === childType)
        if (this.childBlocks[i].blockRawData.childName === childName)
          return this.childBlocks[i];
      let childResult = this.childBlocks[i]._findBestTargetObject(findString);
      if (childResult)
        return childResult;
    }
    return null;
  }
  generateTargetFollowList() {
    let resultTargets = [];
    for (let i in this.childBlocks)
      resultTargets = resultTargets.concat(this.childBlocks[i].generateTargetFollowList());

    if (this.parent)
      resultTargets.push(this.blockRawData.childType + ':' + this.blockRawData.childName);

    return resultTargets;
  }
}
