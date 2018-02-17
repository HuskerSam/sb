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

    this.cameraSelect = this.dialog.querySelector('.camera-select');
    this.cameraSelect.addEventListener('input', e => this.cameraChangeHandler());
    this.arcRangeSlider = this.dialog.querySelector('.camera-select-range-slider');
    this.arcRangeSlider.addEventListener('input', e => this.arcRangeSliderChange());
    this.minpos = 1;
    this.maxpos = 200;
    this.scaleFactor = 100;
    this.minlval = Math.log(10);
    this.maxlval = Math.log(100000);
    this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
    this.arcRangeSlider.value = this.cameraSliderPosition(gAPPP.a.profile.arcCameraRadius);

    this.heightSlider = this.dialog.querySelector('.camera-select-range-height-slider');
    this.heightSlider.addEventListener('input', e => this.cameraHeightChange());
    this.heightSlider.value = gAPPP.a.profile.cameraHeight;

    this.fovSlider = this.dialog.querySelector('.camera-select-range-fov-slider');
    this.fovSlider.addEventListener('input', e => this.fovSliderChange());

    this.animateSlider = this.dialog.querySelector('.animate-range');
    this.animateSlider.addEventListener('input', e => {
      this.parent.rootBlock.setAnimationPosition(this.animateSlider.value);
      this._updateSliderPosition(false);
    });
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

    this.lightIntensityLabel = this.sceneToolsContainer.querySelector('.light-intensity-main-page span');

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

    this.errorCount = 0;
  }
  fovSliderChange() {
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
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'arcCameraRadius',
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
      }
    };
  }
  cameraChangeHandler() {
    this.parent.context.selectCamera(this.cameraSelect.value, this.parent);
    this.refresh();
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
    this.playButton.removeAttribute('disabled');
    this.stopButton.removeAttribute('disabled');
    this.pauseButton.setAttribute('disabled', "true");
    this.pauseButton.style.display = 'none';
    this.playButton.style.display = '';

    this.rootBlock.pauseAnimation();
    this.activateSliderUpdates(false);
  }
  stopAnimation() {
    this.playButton.removeAttribute('disabled');
    this.stopButton.setAttribute('disabled', "true");
    this.pauseButton.setAttribute('disabled', "true");
    this.pauseButton.style.display = 'none';
    this.playButton.style.display = '';

    if (this.rootBlock)
      this.rootBlock.stopAnimation();

    this.activateSliderUpdates(false);
  }
  playAnimation() {
    this.playButton.setAttribute('disabled', "true");
    this.pauseButton.removeAttribute('disabled');
    this.stopButton.removeAttribute('disabled');
    this.pauseButton.style.display = '';
    this.playButton.style.display = 'none';
    this.rootBlock.playAnimation(this.animateSlider.value);
    this.activateSliderUpdates();
  }
  show() {
    this.updateButtonStatus();
    this.cameraChangeHandler();
    this.loadingScreen.style.display = 'none';
    this._updateCameraRangeSlider();
    this._updateCameraHeightSlider();
    this.fovSlider.value = '.8';
    this._updateFOVRangeSlider();
  }
  hide() {
    this.loadingScreen.style.display = '';
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
  __addLogLine(str, errStr = '') {
    this.errorCount++;
    if (this.errorCount > 10000) {
      this.errorCount = 0;
      this.renderPanel.innerHTML = this.renderPanel.innerHTML.substring(this.renderPanel.innerHTML.length - 1000);
    }
    this.renderPanel.innerHTML += GLOBALUTIL.msToTime(Date.now()).substring(6) + ' ' + errStr + ' ' + str + '\n';

    if (document.activeElement !== this.renderPanel)
      this.renderPanel.scrollTop = this.renderPanel.scrollHeight;
  }
  clearError() {
    this.sceneToolsButton.style.borderColor = '';
  }
  logMessage(str) {
    this.__addLogLine(str);
  }
  cameraSliderValue(position) {
    return (Math.exp((position - this.minpos) * this.scale + this.minlval) / this.scaleFactor).toFixed(2);
  }
  cameraSliderPosition(value) {
    return (this.minpos + (Math.log(value * this.scaleFactor) - this.minlval) / this.scale).toFixed(2);
  }
}
