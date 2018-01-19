class cViewMain {
  constructor() {
    this.canvas = document.querySelector('#renderCanvas');
    this.context = new wContext(this.canvas, true);
    this.context.activate(null);
    this.dialog = document.querySelector('#main-page');
    this.key = null;
    this.loadedSceneURL = '';
    gAPPP.a.modelSets['project'].childListeners.push((values, type, fireData) => this.updateProjectList(values, type, fireData));
    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());

    this._updateSelectedBlock();

    gAPPP.a.modelSets['blockchild'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('blockchild', values, type, fireData));
    gAPPP.a.modelSets['block'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('block', values, type, fireData));
    gAPPP.a.modelSets['mesh'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('mesh', values, type, fireData));
    gAPPP.a.modelSets['shape'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('shape', values, type, fireData));
    gAPPP.a.modelSets['material'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('material', values, type, fireData));
    gAPPP.a.modelSets['texture'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('texture', values, type, fireData));
    gAPPP.a.modelSets['frame'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('frame', values, type, fireData));

    this._addAnimationContext();

    setTimeout(() => this._updateSelectedBlock(), 1);

    this.stopButton.setAttribute('disabled', "true");
    this.pauseButton.setAttribute('disabled', "true");
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.rootBlock) {
      this.rootBlock.handleDataUpdate(tag, values, type, fireData);
    }
  }
  _updateSelectedBlock() {
    if (gAPPP.activeContext !== this.context)
      return;

    let profileKey = gAPPP.a.profile.selectedBlockKey;
    if (!profileKey)
      return;

    if (this.key !== profileKey) {
      this.context.activate(null);
      let blockData = gAPPP.a.modelSets['block'].getCache(profileKey);
      if (blockData) {
        let b = new wBlock(this.context);
        b.staticType = 'block';
        b.staticLoad = true;
        b.blockKey = profileKey;
        b.isContainer = true;
        b.setData(blockData);
        this.context.setActiveBlock(b);
        this.rootBlock = b;
        this.key = profileKey;
        setTimeout(() => {
          this.rootBlock.setData();
        }, 1);
      }
      else {
        this.key = '';
      }
    }
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

    this.animateSlider = this.dialog.querySelector('.animate-range');
    this.animateSlider.addEventListener('input', e => this.rootBlock.setAnimationPosition(this.animateSlider.value));
  }
  updateProjectList(values, type, fireData) {
    let records = gAPPP.a.modelSets['project'].fireDataValuesByKey;
    let html = '';

    for (let i in records)
      html += `<option value=${i}>${records[i].title}</option>`;
    this.workplacesSelect.innerHTML = html;
    this.workplacesSelect.value = gAPPP.a.profile.selectedWorkspace;
  }
  selectProject() {
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'selectedWorkspace',
      newValue: gAPPP.mV.workplacesSelect.value
    }]);
    setTimeout(() => location.reload(), 100);
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
    console.dir(this.recStream);
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
    a.download = 'canvaWithAudio.webm';
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
}
