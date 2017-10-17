class cBandSuper {
  constructor(modelSet, tag) {
    this.modelSet = modelSet;
    this.tag = tag;
    modelSet.childListeners.push((values, type, fireData) => this.handleDataChange(fireData, type));
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
}
