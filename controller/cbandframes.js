class cBandFrames extends cBandSuper {
  constructor(childrenContainer) {
    super(gAPPP.a.modelSets['frame'], 'frame');

    this.childrenContainer = childrenContainer;
  }
  _getDomForChild(fireData) {
    let values = fireData.val();
    let key = fireData.key;
    let dd = document.createElement('div');
    dd.innerHTML = 'frames div';
    this.childrenContainer.insertBefore(dd, this.childrenContainer.firstChild);
  }
}
