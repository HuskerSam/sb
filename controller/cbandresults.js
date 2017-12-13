class cBandResults {
  constructor(panel, webFrames) {
    webFrames.updateHandlers.push(() => this.handleUpdate());
    this.webFrames = webFrames;
    this.container = panel;
  }
  handleUpdate() {

    let parsedFramesHTML = '';

    let wF = this.webFrames;
    let resultFrames = this.webFrames.processedFrames;
    for (let c = 0, l = resultFrames.length; c < l; c++) {
      let rFrame = resultFrames[c];
      let stash = resultFrames[c].frameStash;

      let className = '';
      if (rFrame.gen)
        className = 'genFrame';
      parsedFramesHTML += `<div class="${className}">start: ` + rFrame.actualTime.toFixed(0) +
        'ms key: ' + rFrame.key +
        ' gen: ' + stash.autoGen +
        ` autoTime: ${stash.autoTime}` +
         '</div>';
    }

    parsedFramesHTML += '<br>';
    parsedFramesHTML += `raw count: ${this.webFrames.orderedKeys.length}`;

    parsedFramesHTML += '<br>';
    parsedFramesHTML += `processed count: ${resultFrames.length}`;


    this.container.innerHTML = parsedFramesHTML;
  }
}
