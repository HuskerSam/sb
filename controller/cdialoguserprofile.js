class cDialogUserProfile extends cDialogSuper {
  show() {
    let userInfoSpan = this.dialog.querySelector('.user-info');
    let userImage = this.dialog.querySelector('.user-image-display');
    this.user = gAPPP.a.currentUser;
    userInfoSpan.innerHTML = this.user.displayName + '<br>' + this.user.email;
    userImage.setAttribute('src', this.user.photoURL);
    this.fireFields.values = gAPPP.a.profile;
    super.show();
  }
}
