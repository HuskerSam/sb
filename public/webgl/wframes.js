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
    let frameData = this.meshValues;
    if (!root)
      frameData = this.parentBlock.blockRenderData;
    else if (this.orderedKeys.length > 0)
      frameData = this.rawFrames[this.orderedKeys[0]];
    else
      frameData = this.parentBlock.blockRenderData;

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
