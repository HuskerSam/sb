class cBandChildren extends cBandSuper {
  constructor(domContainer){

    super(gAPPP.a.modelSets['blockchild'], 'blockchildren');
    this.childrenContainer = domContainer;
  }
  _getDomForChild() {
    let d = document.createElement('button');
    d.setAttribute('class', 'block-editor-child');
    this.childrenContainer.appendChild(d);
  }
}
