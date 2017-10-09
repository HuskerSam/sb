class mFirebaseSuper {
  constructor(referencePath, activate) {
    this.referencePath = referencePath;
    this.active = false;
    this.childListeners = [];
    this.values = {};
    this.keyList = false;

    if (activate)
      this.activate();
  }
  deactivate() {
    if (!this.active)
      return;
    this.notiRef.off();
    this.active = false;
  }
  activate(referencePath) {
    if (this.active)
      return;
    if (referencePath)
      this.referencePath = referencePath;

    this.active = true;
    this.notiRef = firebase.database().ref(this.referencePath);
    this.notiRef.on('child_added', e => this.childAdded(e));
    this.notiRef.on('child_changed', e => this.childChanged(e));
    this.notiRef.on('child_removed', e => this.childRemoved(e));
  }
  childAdded(fireData) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'add');
  }
  childChanged(fireData) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'change');
  }
  childRemoved(fireData) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'remove');
  }
  updateStash(fireData) {
    this.values = fireData.val();
    this.fireData = fireData;
  }
  notifyChildren(fireData, type) {
    for (let i in this.childListeners)
      this.childListeners[i](this.getCache(fireData.key), type, fireData);
  }
  commitData(values, key) {}
  getCache(key) {
    return this.values;
  }
  commitUpdateList(fieldUpdates, key) {
    let basePath = '/' + this.referencePath;
    if (key)
      basePath += '/' + key;

    let fireUpdates = {};
    for (let i in fieldUpdates) {
      let upd = fieldUpdates[i];
      let fieldPath = upd.field.replace(/\./g, '/');

      let refPath = basePath + '/' + fieldPath;
      fireUpdates[refPath] = upd.newValue;
    }

    return firebase.database().ref().update(fireUpdates);
  }
}
