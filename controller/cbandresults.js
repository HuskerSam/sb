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

      parsedFramesHTML += `<div class="${className}">` +
        rFrame.actualTime.toFixed(0).padStart(7) + 'ms  ' +
        stash.autoGen.padEnd(5) +
        rFrame.key.padEnd(21) +
        stash.autoTime.toFixed(0).padStart(6) + 'ms  ' +

        '  Scale (' +
        rFrame.values['scalingX'].value.toFixed(3).padStart(10) +
        rFrame.values['scalingY'].value.toFixed(3).padStart(10) +
        rFrame.values['scalingZ'].value.toFixed(3).padStart(10) +
        ')    ' +

        '  Offset (' +
        rFrame.values['positionX'].value.toFixed(3).padStart(10) +
        rFrame.values['positionY'].value.toFixed(3).padStart(10) +
        rFrame.values['positionZ'].value.toFixed(3).padStart(10) +
        ')    ' +

        '  Rotate (' +
        rFrame.values['rotationX'].value.toFixed(3).padStart(10) +
        rFrame.values['rotationY'].value.toFixed(3).padStart(10) +
        rFrame.values['rotationZ'].value.toFixed(3).padStart(10) +
        ')    ' +

        '</div>';
      console.log(stash);
    }

    parsedFramesHTML += '<br>';
    parsedFramesHTML += `raw count: ${this.webFrames.orderedKeys.length}`;

    parsedFramesHTML += '<br>';
    parsedFramesHTML += `processed count: ${resultFrames.length}`;


    this.container.innerHTML = parsedFramesHTML;
  }
}
