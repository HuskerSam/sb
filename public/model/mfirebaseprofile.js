class mFirebaseProfile extends mFirebaseSuper {
  constructor() {
    super();
    this.tag = 'userProfile';
    this.profile = {};
    this.fireData = null;
    this.valueChangedEvents = true;
    this.childListeners.push((values, type, fireData) => this._handleProfileDataChange(fireData, type));
  }
  _handleProfileDataChange(fireData, type) {
    if (type !== 'value') {
      let value = fireData.val();
      let key = fireData.key;
      this.fireData = fireData;
      this.profile[key] = value;

      gAPPP.handleDataUpdate();
    }
    else {
      this.profile = fireData.val();
      gAPPP.profileLoaded = true;
      gAPPP.profileReady();
    }
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
