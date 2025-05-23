class bBand {
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
    this.childMoved();
  }
  childMoved() {}
  childChanged(fireData) {
    let div = this.childrenContainer.querySelector('.' + this.tag + this.myKey + '-' + fireData.key);
    if (!div)
      return console.log(fireData, 'changed bBand missing dom');
    let values = fireData.val();
    this._nodeApplyValues(values, div.querySelector('.band-background-preview'));
    this.childMoved();
  }
  childRemoved(fireData) {
    let post = this.childrenContainer.querySelector('.' + this.tag + this.myKey + '-' + fireData.key);
    if (post)
      this.childrenContainer.removeChild(post);
    this.childMoved();
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
  refreshUIFromCache() {
    this.clearChildren();

    let children = this.fireSet.fireDataValuesByKey;

    for (let i in children)
      this._getDomForChild(i, children[i]);
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
          if (url) {        
            let imgHolder = element.querySelector('.img-holder');
            if (imgHolder)
              imgHolder.style.backgroundImage = 'url("' + url + '")';
          }
        }

        if (val === undefined)
          continue;
        if (binding.type === 'innerText')
          element.innerText = val;
      } catch (e) {
        console.log('bBand apply value', e, binding);
      }
    }
  }
}
