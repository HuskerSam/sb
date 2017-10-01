class scDialogUserProfile extends ctlDialogRoot {
  constructor(id) {
    super(id);

    this.userInfoSpan = this.dialog.querySelector('.user-info');


    this.fontSize = this.dialog.querySelector('#user-profile-default-font-size');
    this.fontFamily = this.dialog.querySelector('#user-profile-default-font-family');
    this.canvasColor = this.dialog.querySelector('#user-profile-default-canvas-color');


    this.fontSize.addEventListener('change', e => me.scrape(), false);
    this.fontFamily.addEventListener('change', e => me.scrape(), false);
    this.canvasColor.addEventListener('change', e => me.scrape(), false);
    this.fontSize.addEventListener('keyup', e => me.scrape(), false);
    this.fontFamily.addEventListener('keyup', e => me.scrape(), false);
    this.canvasColor.addEventListener('keyup', e => me.scrape(), false);
  }
  scrape() {
    let profile = {};
    profile.fontSize = this.fontSize.value;
    profile.fontFamily = this.fontFamily.value;
    profile.canvasColor = this.canvasColor.value;

    gAPPP.renderEngine.setColorLabel(this.canvasColor, '1,1,1');
    gAPPP.a.modelSets['userProfile'].setObject(profile);
  }
  paint() {
    this.userInfoSpan.innerHTML = this.user.displayName + '<br>' + this.user.email;
    this.popupContent.style.backgroundImage = 'url(' + this.user.photoURL + ')';

    if (gAPPP.a.profile.fontSize)
      this.fontSize.value = gAPPP.a.profile.fontSize;
    if (gAPPP.a.profile.fontFamily)
      this.fontFamily.value = gAPPP.a.profile.fontFamily;
    if (gAPPP.a.profile.canvasColor)
      this.canvasColor.value = gAPPP.a.profile.canvasColor;

    gAPPP.renderEngine.setColorLabel(this.canvasColor, '1,1,1');
  }
  show() {
    let me = this;
    this.user = gAPPP.a.currentUser;
    super.show();
  }
}
