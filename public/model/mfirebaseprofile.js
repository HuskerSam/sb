class mFirebaseProfile extends bFirebase {
  constructor() {
    super();
    this.tag = 'userProfile';
    this.profile = this._defaultProfile();
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
      if (!this.profile) {
        this.profile = this._defaultProfile();
        this.setObject(this.profile);
      }
      gAPPP.profileLoaded = true;
      gAPPP.profileReady();
    }
  }
  _defaultProfile(anon = true) {
    let profileData = {
      fontSize: '10',
      lightIntensity: '.7',
      selectedWorkspace: 'default',
      showBoundsBox: true,
      showFloorGrid: true,
      cameraUpdates: true,
      cameraSaves: true,
      opacityLevel: '.5',
      showForceWireframe: false,
      showSceneGuides: true,
      cameraName: "Camera",
      gridAndGuidesDepth: '15'
    };

    if (anon) {
      profileData.cameraUpdates = true;
      profileData.cameraSaves = true;
      profileData.showSceneGuides = false;
      profileData.showBoundsBox = false;
      profileData.showFloorGrid = false;
    }

    return profileData;
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
