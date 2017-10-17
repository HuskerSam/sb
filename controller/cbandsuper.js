class cBandSuper {
  constructor(modelSet, tag) {
    this.modelSet = modelSet;
    this.tag = tag;

    this.bindingsList = [{
        dataName: 'title',
        type: 'innerText'
      }, {
        dataName: 'renderImageURL',
        type: 'background-image',
        classKey: 'OUTER'
      }];

    this.modelSet.childListeners.push((values, type, fireData) => this.handleDataChange(fireData, type));
  }
  childAdded(fireData) {
    this.createDOM(fireData);
  }
  childChanged(fireData) {
    let div = document.querySelector('.' + this.tag + '-' + fireData.key);
    let values = fireData.val();
    this.nodeApplyValues(values, div.querySelector('.band-background-preview'));
  }
  childRemoved(fireData) {
    let post = this.childrenContainer.querySelector('.' + this.tag + '-' + fireData.key);
    if (post)
      this.childrenContainer.removeChild(post);
  }
  handleDataChange(fireData, type) {
    if (type === 'add')
      return this.childAdded(fireData);
    if (type === 'change')
      return this.childChanged(fireData);
    if (type === 'remove')
      return this.childRemoved(fireData);
  }
  createDOM(fireData) {
    let values = fireData.val();
    let key = fireData.key;

  }
  _nodeApplyValues(values, outer) {
    for (let i in this.bindingsList) {
      let binding = this.bindingsList[i];
      try {
        let classKey = binding.dataName;
        if (binding.classKey)
          classKey = binding.classKey;
        let element = outer.querySelector('.band-' + classKey);
        if (classKey === 'OUTER')
          element = outer;
        if (element === null)
          continue;
        let val = values[binding.dataName];
        if (val === undefined)
          continue;
        if (binding.type === 'innerText')
          element.innerText = val;
        if (binding.type === 'background-image') {
          element.style.backgroundImage = 'url("' + val + '")';
        }
      } catch (e) {
        console.log('cbandsuper apply value', e, binding);
      }
    }
  }
}
