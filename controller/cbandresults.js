class cBandResults {
  constructor(panel, webFrames) {
    webFrames.updateHandlers.push(() => this.handleUpdate());
    this.webFrames = webFrames;
    this.container = panel;
  }
  handleUpdate() {
    let a = 10;
  }
}
