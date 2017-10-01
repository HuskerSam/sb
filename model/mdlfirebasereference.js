// base class for firebase realtime data
class mdlFirebaseReference {
  constructor(referencePath) {
    let me = this;
    this.active = true;
    this.notiRef = firebase.database().ref(referencePath);
    this.notiRef.on('child_added', (data) => me.childAdded(data));
    this.notiRef.on('child_changed', (data) => me.childChanged(data));
    this.notiRef.on('child_removed', (data) => me.childRemoved(data));
    this.childListeners = [];
    this.values = {};
  }
  destroy() {
    if (!this.active)
      return;
    this.notiRef.off();
    this.active = false;
  }
  childAdded(data) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'remove');
  }
  childChanged(data) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'change');
  }
  childRemoved(data) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'add');
  }
  updateStash(fireData) {
    this.values = fireData.val();
    this.fireData = fireData;
  }
  childAdded(fireData) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'add');
  }
  notifyChildren(fireData, type) {
    for (let i in this.childListeners)
      this.childListeners[i](fireData, type);
  }
}
