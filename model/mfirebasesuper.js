// base class for firebase realtime data
class mFirebaseSuper {
  constructor(referencePath, activate) {
    let me = this;
    this.referencePath = referencePath;
    this.active = false;
    this.childListeners = [];
    this.values = {};

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
    let me = this;
    if (referencePath)
      this.referencePath = referencePath;

    this.active = true;
    this.notiRef = firebase.database().ref(this.referencePath);
    this.notiRef.on('child_added', e => me.childAdded(e));
    this.notiRef.on('child_changed', e => me.childChanged(e));
    this.notiRef.on('child_removed', e => me.childRemoved(e));
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
  childAdded(fireData) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'add');
  }
  notifyChildren(fireData, type) {
    for (let i in this.childListeners)
      this.childListeners[i](fireData, type);
  }
}
