class SCDialogUserProfile {
  constructor(id) {
    let me = this;
    this.dialog = document.getElementById(id);
    this.okBtn = this.dialog.querySelector('.save-details');
    this.cancelBtn = this.dialog.querySelector('.cancel-details');
    this.popupContent = this.dialog.querySelector('.popup-content');
    this.userInfoSpan = this.dialog.querySelector('.user-info');
    this.fontSize = this.dialog.querySelector('#user-profile-default-font-size');
    this.fontFamily = this.dialog.querySelector('#user-profile-default-font-family');
    this.canvasColor = this.dialog.querySelector('#user-profile-default-canvas-color');

    this.cancelBtn.addEventListener('click', () => me.close(), false);
    this.okBtn.addEventListener('click', () => me.save(), false);

    this.fontSize.addEventListener('change', e => me.scrape(), false);
    this.fontFamily.addEventListener('change', e => me.scrape(), false);
    this.canvasColor.addEventListener('change', e => me.scrape(), false);
  }
  save() {
    this.scrape();
    gAPPP.a.userWriteProfileData();
    $(this.dialog).modal('hide');
  }
  scrape() {
    gAPPP.a.profile = {};
    gAPPP.a.profile.fontSize = this.fontSize.value;
    gAPPP.a.profile.fontFamily = this.fontFamily.value;
    gAPPP.a.profile.canvasColor = this.canvasColor.value;

    gAPPP.renderEngine.setColorLabel(this.canvasColor, '1,1,1');
    gAPPP.a.applyProfileSettings();
  }
  close() {
    gAPPP.a.profile.fontSize = this.original.fontSize;
    gAPPP.a.profile.fontFamily = this.original.fontFamily;
    gAPPP.a.profile.fontSize = this.original.fontSize;
    gAPPP.a.applyProfileSettings();
    $(this.dialog).modal('hide');
  }
  paint() {
    this.userInfoSpan.innerHTML = this.user.displayName + '<br>' + this.user.email;
    this.popupContent.style.backgroundImage = 'url(' + this.user.photoURL + ')';
    this.fontSize.value = gAPPP.a.profile.fontSize;
    this.fontFamily.value = gAPPP.a.profile.fontFamily;
    this.canvasColor.value = gAPPP.a.profile.canvasColor;

    gAPPP.renderEngine.setColorLabel(this.canvasColor, '1,1,1');
    gAPPP.a.applyProfileSettings();
  }
  show() {
    let me = this;

    this.user = gAPPP.a.currentUser;
    this.original = {};
    this.original.fontSize = gAPPP.a.profile.fontSize;
    this.original.fontFamily = gAPPP.a.profile.fontFamily;
    this.original.canvasColor = gAPPP.a.profile.canvasColor;

    this.paint();
    $(this.dialog).modal('show');

    this.cancelBtn.focus();
  }
}
