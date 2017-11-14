class cBandResults {
  constructor(panel, webFrames) {
    webFrames.updateHandlers.push(() => this.handleUpdate());
    this.webFrames = webFrames;
    this.container = panel;
  }
  handleUpdate() {

    let parsedFramesHTML = '';

    let wF = this.webFrames;
    for (let c = 0, l = wF.orderedKeys.length; c < l; c++) {
      let key = wF.orderedKeys[c];
      let stash = wF.framesStash[key];
      parsedFramesHTML += 'start: ' + stash._frame_start + 'ms key: ' + key + ' gen:' + stash.auto_gen.type + '<br>';
    }

    this.container.innerHTML = parsedFramesHTML;
  }
}
