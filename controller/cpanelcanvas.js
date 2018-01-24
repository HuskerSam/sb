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
    this.cameraSelect.addEventListener('input', e => this.updateArcRangeSlider());
    this.arcRangeSlider = this.dialog.querySelector('.camera-select-range-slider');
    this.arcRangeSlider.addEventListener('input', e => this.arcRangeSliderChange());
    this.arcRangeSlider.value = gAPPP.a.profile.arcCameraRadius;

    this.animateSlider = this.dialog.querySelector('.animate-range');
    this.animateSlider.addEventListener('input', e => this.parent.rootBlock.setAnimationPosition(this.animateSlider.value));

    this.bandButtons = [];
    this.sceneToolsButton = this.dialog.querySelector('.scene-options');
    this.sceneToolsContainer = this.dialog.querySelector('.context-scene-tools-panel');
    this.sceneFields = sDataDefinition.bindingFieldsCloned('sceneToolsBar');
    this.sceneFieldsContainer = this.sceneToolsContainer.querySelector('.fields-container');
    this.sceneTools = new cBandProfileOptions(this.sceneToolsButton, this.sceneFields, this.sceneFieldsContainer, this.sceneToolsContainer);
    this.sceneTools.fireFields.values = gAPPP.a.profile;
    this.sceneTools.activate();
    this.bandButtons.push(this.sceneTools);

    this.cameraToolsButton = this.dialog.querySelector('.camera-options');
    this.cameraToolsContainer = this.dialog.querySelector('.camera-options-panel');
    this.cameraFields = sDataDefinition.bindingFieldsCloned('cameraToolsBar');
    this.cameraFieldsContainer = this.cameraToolsContainer.querySelector('.fields-container');
    this.cameraTools = new cBandProfileOptions(this.cameraToolsButton, this.cameraFields, this.cameraFieldsContainer, this.cameraToolsContainer);
    this.cameraTools.fireFields.values = gAPPP.a.profile;
    this.cameraTools.activate();
    this.bandButtons.push(this.cameraTools);

    this.stopButton.setAttribute('disabled', "true");
    this.pauseButton.setAttribute('disabled', "true");
    this.pauseButton.style.display = 'none';
    this.loadingScreen = this.dialog.querySelector('#renderLoadingCanvas');
    this.cameraDetails = {};
    this.camerasS = '';
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
        cameraName: 'Arc Rotate (default)'
      }
    };
  }
  updateArcRangeSlider() {
    if (this.cameraSelect.selectedIndex === 0)
      this.arcRangeSlider.style.display = '';
    else
      this.arcRangeSlider.style.display = 'none';
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
    this.stopAnimation();
    this.captureStream = this.canvas.captureStream(33);
    this.record();
    this.playAnimation();

    let length = this.activeAnimation.toFrame * 1000 / this.rootBlock.framesHelper.fps;

    setTimeout(() => {
      this.stop();
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
  stop() {
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
}
