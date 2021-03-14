class mFirebaseProfile extends bFirebase {
  constructor() {
    super();
    this.tag = 'userProfile';
    this.profile = {};
    this.fireData = null;
    this.valueChangedEvents = true;
    this.referencePath = 'usersprofile/anonymous';

    this.childListeners.push((values, type, fireData) => this._handleProfileDataChange(fireData, type));
  }
  _handleProfileDataChange(fireData, type) {
    if (type !== 'value') {
      let value = fireData.val();
      let key = fireData.key;
      this.fireData = fireData;
      this.profile[key] = value;
    }
    else {
      this.profile = fireData.val();
      if (!this.profile)
        this.profile = {};
      gAPPP.profileLoaded = true;
      gAPPP.profileReady();
    }
  }
  activate() {
    this.updateReferencePath();
    super.activate();
  }
  updateReferencePath() {
    let uid = 'anonymous';
    if (! gAPPP.a.anonymous)
      uid = gAPPP.a.currentUser.uid;

    this.referencePath = 'usersprofile/' + uid;
  }
  async setObject(profile) {
    this.profile = profile;
    this.updateReferencePath();
    return firebase.database().ref(this.referencePath).set(this.profile);
  }
  getCache(key) {
    return this.profile;
  }
}
