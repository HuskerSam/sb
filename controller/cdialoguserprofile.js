class cDialogUserProfile extends cDialogSuper {
  show() {
    let userInfoSpan = this.dialog.querySelector('.user-info');
    this.user = gAPPP.a.currentUser;
    userInfoSpan.innerHTML = this.user.displayName + '<br>' + this.user.email;
    this.popupContent.style.backgroundImage = 'url(' + this.user.photoURL + ')';
    this.fireFields.values = gAPPP.a.profile;
    super.show();
  }
}
