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
      let className = '';
      if (rFrame.gen)
        className = 'genFrame';
      parsedFramesHTML += `<div class="${className}">start: ` + rFrame.actualTime +
        'ms key: ' + rFrame.key +
        ' gen:' + rFrame.frameStash.auto_gen.type + '</div>';
    }

    parsedFramesHTML += '<br>';
    parsedFramesHTML += `raw count: ${this.webFrames.orderedKeys.length}`;

    parsedFramesHTML += '<br>';
    parsedFramesHTML += `processed count: ${resultFrames.length}`;


    this.container.innerHTML = parsedFramesHTML;
  }
}
