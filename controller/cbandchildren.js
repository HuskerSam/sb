class cBandChildren extends cBandSuper {
  constructor(domContainer) {
    this.parentContainer = domContainer;
  }
  clear() {
    this.parentContainer.innerHTML = '';
  }
  _getDomForChild() {
    let d = document.createElement('button');
    d.setAttribute('class', 'block-editor-child');
    }
}
