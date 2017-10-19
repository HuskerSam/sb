class cBandFrames extends cBandSuper {
  constructor(childrenContainer) {
    super(gAPPP.a.modelSets['frame'], 'frame');
    this.fireSet = gAPPP.a.modelSets['frame'];
    this.childrenContainer = childrenContainer;
    this.frameDataViewInstances = {};
  }
  _getDomForChild(fireData) {
    let values = fireData.val();
    let key = fireData.key;
    let framesContainer = document.createElement('div');
    framesContainer.setAttribute('class', 'frame-fields-container');

    let instance = {};
    instance.frameFields = sDataDefinition.bindingFieldsCloned('frame');
    instance.key = key;
    instance.tag = 'frame';
    instance.fireSet = this.fireSet;
    instance.dataPanel = new cPanelData(instance.frameFields, framesContainer, instance);
    instance.childListener = (values, type, fireData) => instance.dataPanel._handleDataChange(values, type, fireData);
    this.fireSet.childListeners.push(instance.childListener);
    this.frameDataViewInstances[key] = instance;

    this.childrenContainer.appendChild(framesContainer);
  }
  clearChildren() {
    for (let i in this.frameDataViewInstances) {
      let fd = this.frameDataViewInstances[i];
      for (let c = 0, l = this.fireSet.childListeners.length; c < l; c++) {
        if (this.fireSet.childListeners[c] === fd.childListener) {
          this.fireSet.childListeners.splice(c, 1);
          break;
        }
      }
    }

    this.frameDataViewInstances = {};
    super.clearChildren();
  }
}
