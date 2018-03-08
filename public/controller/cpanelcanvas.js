class cPanelCanvas {
  constructor(parent) {
    this.parent = parent;
    this.playButton = this.dialog.querySelector('.play-button');
    this.playButton.addEventListener('click', e => this.playAnimation());
    this.stopButton = this.dialog.querySelector('.stop-button');
    this.stopButton.addEventListener('click', e => this.stopAnimation());
    this.pauseButton = this.dialog.querySelector('.pause-button');
    this.pauseButton.addEventListener('click', e => this.pauseAnimation());
    this.downloadVideoButton = this.dialog.querySelector('.video-button');
    this.downloadVideoButton.addEventListener('click', e => this.downloadVideo());
    this.canvasPlayBar = this.dialog.querySelector('.canvas-play-bar');
    this.videoWrapper = this.dialog.querySelector('.video-overlay');
    this.videoDom = this.videoWrapper.querySelector('video');

    this.cameraSelect = this.dialog.querySelector('.camera-select');
    this.cameraSelect.addEventListener('input', e => this.cameraChangeHandler());
    this.arcRangeSlider = this.dialog.querySelector('.camera-select-range-slider');
    this.arcRangeSlider.addEventListener('input', e => this.arcRangeSliderChange());
    this.minpos = 1;
    this.maxpos = 200;
    this.negativeSize = 100;
    this.scaleFactor = 50;
    this.minlval = Math.log(10);
    this.maxlval = Math.log(100000);
    this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
    this.arcRangeSlider.value = this.cameraSliderPosition(18);
    this.saveAnimState = false;

    this.heightSlider = this.dialog.querySelector('.camera-select-range-height-slider');
    this.heightSlider.addEventListener('input', e => this.cameraHeightChange());
    this.heightSlider.value = gAPPP.a.profile.cameraHeight;

    this.fovSlider = this.dialog.querySelector('.camera-select-range-fov-slider');
    this.fovSlider.addEventListener('input', e => this.fovSliderChange());
    this.fovSlider.value = .8;

    this.animateSlider = this.dialog.querySelector('.animate-range');
    this.animateSlider.addEventListener('input', e => this.animSliderChange());
    this.animateSliderLabel = this.dialog.querySelector('.run-length-label');

    this.bandButtons = [];
    this.sceneToolsButton = this.dialog.querySelector('.scene-options');
    this.sceneToolsContainer = this.dialog.querySelector('.scene-options-panel');
    this.sceneFields = sDataDefinition.bindingFieldsCloned('sceneToolsBar');
    this.sceneFieldsContainer = this.sceneToolsContainer.querySelector('.scene-fields-container');
    this.sceneTools = new cBandProfileOptions(this.sceneToolsButton, this.sceneFields, this.sceneFieldsContainer, this.sceneToolsContainer);
    this.sceneTools.fireFields.values = gAPPP.a.profile;
    this.sceneTools.activate();
    this.bandButtons.push(this.sceneTools);

    this.lightIntensityLabel = this.sceneToolsContainer.querySelector('.light-intensity-user-panel span');

    this.renderShowBtn = this.sceneToolsContainer.querySelector('.show-hide-log');
    this.renderPanel = this.sceneToolsContainer.querySelector('.render-log-panel');
    this.renderPanelWrapper = this.sceneToolsContainer.querySelector('.render-log-wrapper');
    this.renderPanelClear = this.sceneToolsContainer.querySelector('.log-clear');
    this.renderPanelClear.addEventListener('click', e => this.logClear());
    this.renderFieldsContainer = this.renderPanel.parentElement.querySelector('.fields-container');
    this.renderTools = new cBandProfileOptions(this.renderShowBtn, [], this.renderFieldsContainer, this.renderPanelWrapper);
    this.renderTools.fireFields.values = gAPPP.a.profile;
    this.renderTools.activate();
    this.bandButtons.push(this.renderTools);

    this.downloadButton = this.dialog.querySelector('.canvas-actions .download-button');
    this.downloadButton.addEventListener('click', e => this.exportBabylonFile());

    this.stopButton.setAttribute('disabled', "true");
    this.pauseButton.setAttribute('disabled', "true");
    this.pauseButton.style.display = 'none';
    this.loadingScreen = document.querySelector('#renderLoadingCanvas');
    this.cameraDetails = {};
    this.camerasS = '';
    this.isValidAnimation = false;

    this.canvas.addEventListener('click', e => {
      gAPPP.mV.closeHeaderBands();
    });

    this._playState = 0;
    this.errorCount = 0;
  }
  animSliderChange() {
    this.rootBlock.setAnimationPosition(this.animateSlider.value);
    this._updateSliderPosition(false);
    if (this.playState === 0)
      this.playState = 2;
    else
      this.playState = this.playState;
  }
  fovSliderChange() {
    if (this.rootBlock)
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'cameraFOVSave' + this.rootBlock.blockKey,
        newValue: this.fovSlider.value
      }]);

    this._updateFOVRangeSlider();
  }
  _updateFOVRangeSlider() {
    this.parent.context.camera.fov = Number(this.fovSlider.value);
    this.fovSlider.parentElement.querySelector('.camera-slider-label').innerHTML = 'FOV: ' + this.fovSlider.value;
  }
  exportBabylonFile() {
    let serializedScene = BABYLON.SceneSerializer.Serialize(this.parent.context.scene);
    let strScene = JSON.stringify(serializedScene);

    this.__download('scene.babylon', strScene);
  }
  __download(filename, text) {
    let element = document.createElement('a');
    let url = window.URL.createObjectURL(new Blob([text], {
      type: 'application/json'
    }));
    element.setAttribute('href', url);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  _updateCameraRangeSlider() {
    let val = this.cameraSliderValue(this.arcRangeSlider.value);
    this.parent.context.camera.radius = val;
    this.arcRangeSlider.parentElement.querySelector('.camera-slider-label').innerHTML = 'Radius: ' + val;
  }
  arcRangeSliderChange() {
    let val = this.cameraSliderValue(this.arcRangeSlider.value);

    if (this.rootBlock)
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'cameraRadiusSave' + this.rootBlock.blockKey,
        newValue: val
      }]);

    this._updateCameraRangeSlider();
  }
  _updateCameraHeightSlider() {
    this.parent.context.camera.heightOffset = Number(this.heightSlider.value);
    this.heightSlider.parentElement.querySelector('.camera-slider-label').innerHTML = 'Height: ' + this.heightSlider.value;
  }
  cameraHeightChange() {
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'cameraHeight',
      newValue: this.heightSlider.value
    }]);
    this._updateCameraHeightSlider();
  }
  get rootBlock() {
    return this.parent.rootBlock;
  }
  get dialog() {
    return this.parent.dialog;
  }
  get canvas() {
    return this.parent.canvas;
  }
  get activeAnimation() {
    return this.parent.activeAnimation;
  }
  get defaultCameras() {
    return {
      default: {
        cameraName: 'Camera'
      },
      reset: {
        cameraName: 'Reset'
      }
    };
  }
  cameraChangeHandler() {
    if (this.cameraSelect.value === 'reset') {
      this.cameraSelect.value = 'default';
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'cameraPositionSave' + this.rootBlock.blockKey,
        newValue: false
      }, {
        field: 'cameraRadiusSave' + this.rootBlock.blockKey,
        newValue: false
      }, {
        field: 'cameraTargetSave' + this.rootBlock.blockKey,
        newValue: false
      }, {
        field: 'cameraFOVSave' + this.rootBlock.blockKey,
        newValue: false
      }]);

      gAPPP.a.profile['cameraPositionSave' + this.rootBlock.blockKey] = '3,15,-15';
      gAPPP.a.profile['cameraRadiusSave' + this.rootBlock.blockKey] = false;
      gAPPP.a.profile['cameraTargetSave' + this.rootBlock.blockKey] = '0,0,0';
      gAPPP.a.profile['cameraFOVSave' + this.rootBlock.blockKey] = '.8';

      this.parent.context.selectCamera(this.cameraSelect.value, this.parent);
      this.refresh();
      this.__updateCameraFromSettings();
    } else {
      this.parent.context.selectCamera(this.cameraSelect.value, this.parent);
      this.refresh();
    }
  }
  downloadVideo() {
    if (this.rootBlock.framesHelper.maxLength === 0)
      return;

    this.stopAnimation();
    this.captureStream = this.canvas.captureStream(33);
    this.record();
    this.playAnimation();

    let length = this.activeAnimation.toFrame * 1000 / this.rootBlock.framesHelper.fps;

    setTimeout(() => {
      this.stopRecord();
    }, length);
  }
  record() {
    let options = {
      mimeType: 'video/webm'
    };
    this.recordedBlobs = [];
    this.recStream = new MediaStream();
    this.canvasStream = this.canvas.captureStream();
    //this.recStream.addTrack(this.stream.getAudioTracks()[0]);
    this.recStream.addTrack(this.canvasStream.getVideoTracks()[0]);
    this.mediaRecorder = new MediaRecorder(this.recStream, options);
    this.mediaRecorder.ondataavailable = event => this.recordedBlobs.push(event.data);
    this.mediaRecorder.start(33);
  }
  stopRecord() {
    this.recStream.getTracks().forEach(track => track.stop());

    let recordedBlob = new Blob(this.recordedBlobs, {
      type: "video/webm"
    });
    var url = window.URL.createObjectURL(recordedBlob);
    var a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'sceneblock.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
  get activeAnimation() {
    if (this.rootBlock)
      return this.rootBlock.framesHelper.activeAnimation;

    return null;
  }
  activateSliderUpdates(updateSlider = true) {
    this._updateSliderPosition();
    clearTimeout(this.sliderTimeout);

    if (updateSlider)
      this.sliderTimeout = setTimeout(() => {
        this._updateSliderPosition();
        this.activateSliderUpdates();
      }, 50);
  }
  _updateSliderPosition(startTimer = true) {
    let elapsed = 0;
    let total = 100;
    if (this.activeAnimation) {
      elapsed = this.activeAnimation._runtimeAnimations[0].currentFrame;
      total = this.activeAnimation.toFrame;
    }

    this.animateSlider.value = elapsed / total * 100.0;

    if (this.activeAnimation) {
      let timeE = elapsed / this.rootBlock.framesHelper.fps;
      let timeLength = total / this.rootBlock.framesHelper.fps;
      this.animateSliderLabel.innerHTML = 'Time: ' + timeE.toFixed(1) + '/' + timeLength.toFixed(1) + 's';
    } else
      this.animateSliderLabel.innerHTML = '';
  }
  pauseAnimation() {
    this.playState = 2;
  }
  stopAnimation() {
    this.playState = 0;
  }
  playAnimation() {
    this.playState = 1;
  }
  get playState() {
    return this._playState;
  }
  set playState(newState) {
    this._playState = newState;

    if (this.saveAnimState && gAPPP.a.profile.cameraSaves)
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'playState' + this.rootBlock.blockKey,
        newValue: this._playState
      }, {
        field: 'playStateAnimTime' + this.rootBlock.blockKey,
        newValue: this.animateSlider.value
      }]);
    this.__updatePlayState();
  }
  __updatePlayState() {
    if (!this.rootBlock)
      return;
    if (gAPPP.a.profile.cameraUpdates) {
      let sliderValue = gAPPP.a.profile['playStateAnimTime' + this.rootBlock.blockKey];
      if (this.lastSliderValue !== sliderValue) {
        this.lastSliderValue = sliderValue;
        this.animateSlider.value = sliderValue;
      }
    }
    if (this.playState === 0) {
      this.playButton.removeAttribute('disabled');
      this.stopButton.setAttribute('disabled', "true");
      this.pauseButton.setAttribute('disabled', "true");
      this.pauseButton.style.display = 'none';
      this.playButton.style.display = '';

      if (this.rootBlock)
        this.rootBlock.stopAnimation();

      this.activateSliderUpdates(false);
    } else if (this.playState === 1) {
      this.playButton.setAttribute('disabled', "true");
      this.pauseButton.removeAttribute('disabled');
      this.stopButton.removeAttribute('disabled');
      this.pauseButton.style.display = '';
      this.playButton.style.display = 'none';
      this.rootBlock.playAnimation(this.animateSlider.value);
      this.activateSliderUpdates();
    } else if (this.playState === 2) {
      this.playButton.removeAttribute('disabled');
      this.stopButton.removeAttribute('disabled');
      this.pauseButton.setAttribute('disabled', "true");
      this.pauseButton.style.display = 'none';
      this.playButton.style.display = '';

      this.rootBlock.pauseAnimation();
      this.activateSliderUpdates(false);
    }
  }
  show() {
    this.updateButtonStatus();

    if (!this.cameraShown) {
      this.cameraChangeHandler();
      this.loadingScreen.style.display = 'none';
      this._updateCameraHeightSlider();
      this._updateFOVRangeSlider();

      this.cameraShown = true;
    }
    if (this.rootBlock) {
      if (this.cameraSelect.value === 'default')
        this.__updateCameraFromSettings();

      this.parent.context.preRenderFrame = () => {
        if (this.cameraSelect.value !== 'default')
          return;

        let camera = this.parent.context.camera;
        let cp = GLOBALUTIL.vectorToStr(camera.position);
        let tp = GLOBALUTIL.vectorToStr(camera.target);
        let stored = gAPPP.a.profile['cameraPositionSave' + this.rootBlock.blockKey];
        let storedFOV = gAPPP.a.profile['cameraFOVSave' + this.rootBlock.blockKey];

        if (cp !== this.lastCP || tp !== this.lastTP || camera.radius !== this.lastRadius || this.lastFOV !== camera.fov)
          this.__saveCameraPosition(cp, tp);
        else {
          if (cp !== stored || camera.fov !== storedFOV) {
            if (gAPPP.a.profile.cameraUpdates)
              this.__updateCameraFromSettings();
          }
        }
      };
    }

    this.__updateVideoCallback();
    this._updateFOVRangeSlider();
    this._updateCameraRangeSlider();
  }
  __updateVideoCallback() {
    if (this.rootBlock)
      this.rootBlock.updateVideoCallback = renderData => this.__updateVideo(renderData);
  }
  __updateVideo(renderData) {
    let showVideo = false;
    //gAPPP.a.profile.noVideo
    let src = document.createElement('source');
    src.setAttribute('src', renderData.videoURL);
    if (renderData.videoType)
      src.setAttribute('type', renderData.videoType);
    this.videoDom.innerHTML = '';
    this.videoDom.appendChild(src);

    if (renderData.videoURL !== this.currentVideoURL || gAPPP.a.profile.noVideo !== this.currentNoVideo) {
      this.currentVideoURL = renderData.videoURL;
      let videoURL = renderData.videoURL;
      if (!videoURL)
        videoURL = '';

      if (videoURL === '') {
        this.videoWrapper.style.display = 'none';
      } else {
        this.videoWrapper.style.display = 'block';
      }
    }
    if (renderData.videoHeight !== this.currentVideoHeight) {
      this.currentVideoHeight = renderData.videoHeight;
      let videoHeight = renderData.videoHeight;
      if (!videoHeight)
        videoHeight = '';

      this.videoWrapper.style.height = videoHeight;
    }
    if (renderData.videoWidth !== this.currentVideoWidth) {
      this.currentVideoWidth = renderData.videoWidth;
      let videoWidth = renderData.videoWidth;
      if (!videoWidth)
        videoWidth = '';

      this.videoWrapper.style.width = videoWidth;
    }
  }
  __updateCameraFromSettings() {
    let camera = this.parent.context.camera;
    let cameraPosition = GLOBALUTIL.getVector(gAPPP.a.profile['cameraPositionSave' + this.rootBlock.blockKey], 3, 15, -15);
    let cameraTarget = GLOBALUTIL.getVector(gAPPP.a.profile['cameraTargetSave' + this.rootBlock.blockKey], 0, 0, 0);
    let fov = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile['cameraFOVSave' + this.rootBlock.blockKey], .8);
    if (!camera.setPosition)
      return;

    camera.setPosition(cameraPosition);
    camera.setTarget(cameraTarget);
    camera.fov = fov;

    this.arcRangeSlider.value = this.cameraSliderPosition(camera.radius);
    this.fovSlider.value = camera.fov;
    this.lastCP = GLOBALUTIL.vectorToStr(camera.position);
    this.lastTP = GLOBALUTIL.vectorToStr(camera.target);
    this.lastFOV = fov;
    this.lastRadius = camera.radius;
    this._updateCameraRangeSlider();
    this._updateFOVRangeSlider();
  }
  __saveCameraPosition(cp, tp) {
    if (!gAPPP.a.profile.cameraSaves)
      return;

    this.lastCP = cp;
    this.lastTP = tp;
    let camera = this.parent.context.camera;
    this.lastRadius = camera.radius;
    this.lastFOV = camera.fov;

    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'cameraPositionSave' + this.rootBlock.blockKey,
      newValue: cp
    }, {
      field: 'cameraRadiusSave' + this.rootBlock.blockKey,
      newValue: camera.radius
    }, {
      field: 'cameraTargetSave' + this.rootBlock.blockKey,
      newValue: tp
    }, {
      field: 'cameraFOVSave' + this.rootBlock.blockKey,
      newValue: camera.fov
    }]);
  }
  hide() {
    this.loadingScreen.style.display = '';
    this.cameraShown = false;
  }
  collapseAll() {
    for (let i in this.bandButtons) {
      this.bandButtons[i].expanded = true;
      this.bandButtons[i].toggle();
    }
  }
  updateButtonStatus() {
    if (!this.rootBlock || this.rootBlock.framesHelper.maxLength === 0) {
      this.animateSlider.setAttribute('disabled', 'true');
      this.downloadVideoButton.setAttribute('disabled', 'true');
      this.pauseButton.setAttribute('disabled', 'true');
      this.stopButton.setAttribute('disabled', 'true');
      this.playButton.setAttribute('disabled', 'true');
      this.pauseButton.style.display = 'none';
      this.playButton.style.display = '';
      this.isValidAnimation = false;
    } else {
      this.animateSlider.removeAttribute('disabled');
      this.downloadVideoButton.removeAttribute('disabled');
      this.stopButton.setAttribute('disabled', 'true');
      this.playButton.removeAttribute('disabled');
      this.pauseButton.style.display = 'none';
      this.playButton.style.display = '';
      this.isValidAnimation = true;
    }
    this._updateSliderPosition(false);
  }
  refresh() {
    this.arcRangeSlider.parentNode.style.display = 'none';
    this.heightSlider.parentNode.style.display = 'none';
    this.fovSlider.parentNode.style.display = 'none';

    if (this.cameraSelect.selectedIndex === -1) {
      this.cameraSelect.style.display = 'none';
    } else {
      this.cameraSelect.style.display = 'inline-block';
    }

    if (this.cameraSelect.selectedIndex < 1) {
      this.arcRangeSlider.parentNode.style.display = 'inline-block';
      this.fovSlider.parentNode.style.display = 'inline-block';
    } else {
      let camType = this.cameraDetails[this.cameraSelect.value].childName;

      if (camType === 'ArcRotate' || camType === 'FollowCamera') {
        this.arcRangeSlider.parentNode.style.display = 'inline-block';
        this.fovSlider.parentNode.style.display = 'inline-block';
      }

      if (camType === 'FollowCamera')
        this.heightSlider.parentNode.style.display = 'inline-block';
    }

    let animStatus = true;
    if (!this.rootBlock || this.rootBlock.framesHelper.maxLength === 0)
      animStatus = false;

    if (this.isValidAnimation !== animStatus)
      this.updateButtonStatus();

    if (!this.parent.context.defaultLight) {
      this.lightIntensityLabel.innerHTML = '(disabled)';
    } else {
      this.lightIntensityLabel.innerHTML = 'Light';
    }
  }
  logError(errorLine) {
    this.__addLogLine(errorLine, 'ERR');
    this.sceneToolsButton.style.borderColor = 'rgb(255,0,0)';
    this.lastError = Date.now();
  }
  testError() {
    clearTimeout(this.recompileTimeout);
    this.recompileTimeout = setTimeout(() => this.__recompileTestError(), 500);
  }
  __recompileTestError() {
    clearTimeout(this.recompileTimeout);

    if (!this.lastError)
      return;

    this.lastError = null;
    this.clearError();
    this.rootBlock.setData();
  }
  logAnimDetails() {
    if (!this.activeAnimation) {
      this.logMessage('No animation found');
    } else {
      let length = GLOBALUTIL.formatNumber(this.activeAnimation.toFrame / this.rootBlock.framesHelper.fps).trim();
      this.logMessage('Length ' + length.toString() + 's');
    }
  }
  logClear() {
    this.renderPanel.innerHTML = '';
    this.sceneToolsButton.style.borderColor = '';
  }
  __addLogLine(str, errStr = '', testError = false) {
    this.errorCount++;
    if (this.errorCount > 10000) {
      this.errorCount = 0;
      this.renderPanel.innerHTML = this.renderPanel.innerHTML.substring(this.renderPanel.innerHTML.length - 1000);
    }
    this.renderPanel.innerHTML += GLOBALUTIL.msToTime(Date.now()).substring(6) + ' ' + errStr + ' ' + str + '\n';

    if (document.activeElement !== this.renderPanel)
      this.renderPanel.scrollTop = this.renderPanel.scrollHeight;

    if (testError)
      this.testError();
  }
  clearError() {
    this.sceneToolsButton.style.borderColor = '';
  }
  logMessage(str, testError = false) {
    this.__addLogLine(str, '', testError);
  }
  cameraSliderValue(position) {
    if (position > this.negativeSize)
      return (Math.exp(((position - this.negativeSize) - this.minpos) * this.scale + this.minlval) / this.scaleFactor).toFixed(2);

    return (-1.0 * (Math.exp(((this.negativeSize - position) - this.minpos) * this.scale + this.minlval) / this.scaleFactor)).toFixed(2);
  }
  cameraSliderPosition(value) {
    if (value > 0)
      return (this.minpos + (Math.log(value * this.scaleFactor) - this.minlval) / this.scale + this.negativeSize).toFixed(2);

    return (-1.0 * (this.minpos + (Math.log((this.negativeSize - value) * this.scaleFactor) - this.minlval) / this.scale)).toFixed(2);
  }
  reportEngineDetails() {
    let info = this.parent.context.engine.getGlInfo();
    this.logMessage('Renderer: ' + info.renderer);
    this.logMessage('Version: ' + info.version);
    this.logMessage('Vendor: ' + info.vendor);
    this.logMessage('Hardware Scale: ' + this.parent.context.engine.getHardwareScalingLevel());
  }
}
