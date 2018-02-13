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
    this.myKey = Math.floor(Math.random() * 100).toString();
  }
  childAdded(fireData) {
    this._getDomForChild(fireData.key, fireData.val());
  }
  childChanged(fireData) {
    let div = document.querySelector('.' + this.tag + this.myKey + '-' + fireData.key);
    if (!div)
      return console.log(fireData, 'changed cbandsuper missing dom');
    let values = fireData.val();
    this._nodeApplyValues(values, div.querySelector('.band-background-preview'));
  }
  childRemoved(fireData) {
    let post = this.childrenContainer.querySelector('.'  + this.tag + this.myKey + '-' + fireData.key);
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
    if (type === 'clear')
      return this.clearChildren();
    if (type === 'moved')
      return this.childMoved(fireData);
  }
  childMoved(fireData) {}
  clearChildren() {
    this.childrenContainer.innerHTML = '';
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

        if (binding.type === 'background-image') {
          let url = val;
          if (! url)
            url = 'logo64.png';
          let imgHolder = element.querySelector('.img-holder');
          if (imgHolder)
            imgHolder.style.backgroundImage = 'url("' + url + '")';
        }

        if (val === undefined)
          continue;
        if (binding.type === 'innerText')
          element.innerText = val;
      } catch (e) {
        console.log('cbandsuper apply value', e, binding);
      }
    }
  }
}
