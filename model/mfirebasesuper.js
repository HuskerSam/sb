class mFirebaseSuper {
  constructor(tag, activate) {
    this.tag = tag;
    this.referencePath = this.tag;
    this.active = false;
    this.childListeners = [];
    this.values = {};
    this.keyList = false;
    this.renderImageUpdateNeeded = false;

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
    this.pendingLoad = true;
    this._createFireDBRef();
  }
  _createFireDBRef() {
    this.notiRef = firebase.database().ref(this.referencePath).orderByChild('sortKey');

    this.notiRef.on('value', e => this.valueChanged(e));
    this.notiRef.on('child_added', e => this.childAdded(e));
    this.notiRef.on('child_changed', e => this.childChanged(e));
    this.notiRef.on('child_removed', e => this.childRemoved(e));
    this.notiRef.on('child_moved', e => this.childMoved(e));
  }
  clear() {
    this.values = {};
    this.fireDataByKey = {};
    this.fireDataValuesByKey = {};
    this.notifyChildren(null, 'clear');
  }
  childAdded(fireData) {
    if (this.valueChangedEvents)
      if (this.pendingLoad) {
        return;
      }
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'add');
  }
  childMoved(fireData) {
    if (this.valueChangedEvents)
      if (this.pendingLoad)
        return;

    this.notifyChildren(fireData, 'moved');
  }
  valueChanged(fireData) {
    this.pendingLoad = false;
    gAPPP.a.initModelSet(this.tag);
    if (!this.valueChangedEvents)
      return;
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'value');
  }
  childChanged(fireData) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'change');
  }
  childRemoved(fireData) {
    this.updateStash(fireData, true);
    this.notifyChildren(fireData, 'remove');
  }
  updateStash(fireData) {
    this.values = fireData.val();
    this.fireData = fireData;
  }
  notifyChildren(fireData, type) {
    for (let i in this.childListeners)
      this.childListeners[i](fireData !== null ? this.getCache(fireData.key) : null, type, fireData);
  }
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
    this.renderImageUpdateNeeded = true;
    return firebase.database().ref().update(fireUpdates);
  }
}
