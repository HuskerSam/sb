class gApplication extends gInstanceSuper {
  constructor() {
    super();
    document.addEventListener("keyup", e => {
      if (e.keyCode === 27) {
        if (this.mV)
          this.mV.closeOpenPanels();
      }
    });
    this.loadDataLists('sbimageslist').then(() => {});
    this.loadDataLists('sbmesheslist').then(() => {});
    this.loadDataLists('skyboxlist').then(() => {});
    this.loadDataLists('fontfamilydatalist').then(() => {});
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;
    this.a.initProjectModels(this.workspace);
    this.mV = new cViewMain();
    this.a._activateModels();
    this.initialUILoad = false;
    this.mV.updateProjectList(gAPPP.a.modelSets['projectTitles'].fireDataValuesByKey, gAPPP.a.profile.selectedWorkspace);
    this._updateApplicationStyle();
  }
  initializeAuthUI() {
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('eXtended Reality Grafter');
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
    document.querySelector('#sign-in-button').addEventListener('click', e => gAPPP.a.signIn(), false);
    this.emailBtn = document.querySelector('#sign-in-email-button');
    this.emailBtn.addEventListener('click', e => {
      let email = document.querySelector('#sign-in-by-email-link').value;
      gAPPP.a.signInByEmail(email);
      this.emailBtn.innerHTML = 'Email Sent';
      setTimeout(() => this.emailBtn.innerHTML = 'Send Link', 5000);
    }, false);
  }
}
