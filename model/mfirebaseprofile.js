class mFirebaseProfile extends mFirebaseSuper {
  constructor() {
    super();
    this.profile = {};
    this.fireData = null;
    this.childListeners.push((values, type, fireData) => this._handleProfileDataChange(fireData, type));
  }
  _handleProfileDataChange(fireData, type) {
    let value = fireData.val();
    let key = fireData.key;
    this.fireData = fireData;
    this.profile[key] = value;
    gAPPP.handleDataUpdate();
  }
  activate() {
    this.user = gAPPP.a.currentUser;
    this.referencePath = 'usersprofile/' + this.user.uid;
    super.activate();
  }
  setObject(profile) {
    this.profile = profile;
    firebase.database().ref(this.referencePath).set(this.profile);
  }
  getCache(key) {
    return this.profile;
  }
}
