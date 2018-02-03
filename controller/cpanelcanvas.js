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

    this.cameraSelect = this.dialog.querySelector('.camera-select');
    this.cameraSelect.addEventListener('input', e => this.cameraChangeHandler());
    this.arcRangeSlider = this.dialog.querySelector('.camera-select-range-slider');
    this.arcRangeSlider.addEventListener('input', e => this.arcRangeSliderChange());
    this.arcRangeSlider.value = gAPPP.a.profile.arcCameraRadius;

    this.animateSlider = this.dialog.querySelector('.animate-range');
    this.animateSlider.addEventListener('input', e => this.parent.rootBlock.setAnimationPosition(this.animateSlider.value));

    this.bandButtons = [];
    this.sceneToolsButton = this.dialog.querySelector('.scene-options');
    this.sceneToolsContainer = this.dialog.querySelector('.scene-options-panel');
    this.sceneFields = sDataDefinition.bindingFieldsCloned('sceneToolsBar');
    this.sceneFieldsContainer = this.sceneToolsContainer.querySelector('.fields-container');
    this.sceneTools = new cBandProfileOptions(this.sceneToolsButton, this.sceneFields, this.sceneFieldsContainer, this.sceneToolsContainer);
    this.sceneTools.fireFields.values = gAPPP.a.profile;
    this.sceneTools.activate();
    this.bandButtons.push(this.sceneTools);

    this.renderToggleBtn = this.dialog.querySelector('.render-log-button');
    this.renderFieldsContainer = this.dialog.querySelector('.render-log-panel .fields-container');
    this.renderPanelContainer = this.dialog.querySelector('.render-log-panel');
    this.renderPanelBand = new cBandProfileOptions(this.renderToggleBtn, [], this.renderFieldsContainer, this.renderPanelContainer);
    this.renderPanelBand.fireFields.values = gAPPP.a.profile;
    this.renderPanelBand.activate();
    this.bandButtons.push(this.renderPanelBand);

    this.downloadButton = this.dialog.querySelector('.canvas-actions .download-button');
    this.downloadButton.addEventListener('click', e => this.exportBabylonFile());

    this.stopButton.setAttribute('disabled', "true");
    this.pauseButton.setAttribute('disabled', "true");
    this.pauseButton.style.display = 'none';
    this.loadingScreen = document.querySelector('#renderLoadingCanvas');
    this.cameraDetails = {};
    this.camerasS = '';
    this.isValidAnimation = false;
  }
  exportBabylonFile() {
    let serializedScene = BABYLON.SceneSerializer.Serialize(this.parent.context.scene);
    let strScene = JSON.stringify(serializedScene);

    this.__download('scene.babylon', strScene);
  }
  __download(filename, text) {
    let element = document.createElement('a');
    let url = window.URL.createObjectURL(new Blob([text], {type : 'application/json'}));
    element.setAttribute('href', url);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  arcRangeSliderChange() {
    this.parent.context.camera.radius = this.arcRangeSlider.value;
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'arcCameraRadius',
      newValue: this.arcRangeSlider.value
    }]);
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
  stopAnimation() {
    this.playButton.removeAttribute('disabled');
    this.stopButton.setAttribute('disabled', "true");
    this.pauseButton.setAttribute('disabled', "true");
    this.pauseButton.style.display = 'none';
    this.playButton.style.display = '';
    this.rootBlock.stopAnimation();

    this.activateSliderUpdates(false);
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
    return this.rootBlock.framesHelper.activeAnimation;
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
    this.parent.context.camera.radius = this.arcRangeSlider.value;
    this.loadingScreen.style.display = 'none';
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
  }
  refresh() {
    this.arcRangeSlider.style.display = 'none';

    if (this.cameraSelect.selectedIndex < 1)
      this.arcRangeSlider.style.display = '';
    else {
      let camType = this.cameraDetails[this.cameraSelect.value].childName;

      if (camType === 'ArcRotate' || camType === 'FollowCamera') {
        this.arcRangeSlider.style.display = '';
      }
    }

    let animStatus = true;
    if (!this.rootBlock || this.rootBlock.framesHelper.maxLength === 0)
      animStatus = false;

    if (this.isValidAnimation !== animStatus)
      this.updateButtonStatus();
  }
}
