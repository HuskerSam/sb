class cPanelCanvas {
  constructor(parent) {
    this.parent = parent;
    this._addAnimationContext();
    this.loadingScreen = this.dialog.querySelector('#renderLoadingCanvas');
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
  _addAnimationContext() {
    this.playButton = this.dialog.querySelector('.play-button');
    this.playButton.addEventListener('click', e => this.playAnimation());
    this.stopButton = this.dialog.querySelector('.stop-button');
    this.stopButton.addEventListener('click', e => this.stopAnimation());
    this.pauseButton = this.dialog.querySelector('.pause-button');
    this.pauseButton.addEventListener('click', e => this.pauseAnimation());
    this.downloadVideoButton = this.dialog.querySelector('.video-button');
    this.downloadVideoButton.addEventListener('click', e => this.downloadVideo());

    this.cameraSelect = this.dialog.querySelector('.camera-select');

    this.animateSlider = this.dialog.querySelector('.animate-range');
    this.animateSlider.addEventListener('input', e => this.parent.rootBlock.setAnimationPosition(this.animateSlider.value));

    this.stopButton.setAttribute('disabled', "true");
    this.pauseButton.setAttribute('disabled', "true");
  }
  stopAnimation() {
    this.playButton.removeAttribute('disabled');
    this.stopButton.setAttribute('disabled', "true");
    this.pauseButton.setAttribute('disabled', "true");
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

    this.rootBlock.pauseAnimation();
    this.activateSliderUpdates(false);
  }
  playAnimation() {
    this.playButton.setAttribute('disabled', "true");
    this.pauseButton.removeAttribute('disabled');
    this.stopButton.removeAttribute('disabled');
    this.rootBlock.playAnimation(this.animateSlider.value);
    this.activateSliderUpdates();
  }
  show() {
    this.loadingScreen.style.display = 'none';
  //  this.canvas.style.visibility = 'visible';
  }
  hide() {
    this.loadingScreen.style.display = '';
  //  this.canvas.style.visibility = 'hidden';
  //  let abc = this.canvas.offsetHeight;
  }
}
