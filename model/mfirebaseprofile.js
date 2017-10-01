class mFirebaseProfile extends mFirebaseSuper {
  constructor() {
    super();
    let me = this;
    this.profile = {};
    this.styleProfileDom = null;
    this.fireData = null;
    this.childListeners.push((fireData, type) => me._handleProfileDataChange(fireData, type));
  }
  _handleProfileDataChange(fireData, type) {
    let value = fireData.val();
    let key = fireData.key;
    this.fireData = fireData;
    this.profile[key] = value;
    this._applyProfileToApplication();
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
  commitData(values, key) {
    setObject(values);
  }
  getCache(key) {
    return this.profile;
  }
  _applyProfileToApplication() {
    if (this.styleProfileDom !== null) {
      this.styleProfileDom.parentNode.removeChild(this.styleProfileDom);
    }

    let css = 'html, body { ';
    if (this.profile.fontSize !== '')
      css += 'font-size:' + this.profile.fontSize + ';';
    if (this.profile.fontFamily !== '')
      css += 'font-family:' + this.profile.fontFamily + ';';
    css += '}';

    this.styleProfileDom = document.createElement('style');
    this.styleProfileDom.innerHTML = css;
    document.body.appendChild(this.styleProfileDom);

    if (gAPPP.renderEngine.sceneDetails)
      gAPPP.renderEngine.sceneDetails.scene.clearColor = gAPPP.renderEngine.color(gAPPP.a.profile.canvasColor);
  }
}
