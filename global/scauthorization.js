/*  singleton firebase authorization controller (owns firebase bound models)   */
class scAuthorization {
  constructor(signInQS, signOutQS) {
    let me = this;
    this.currentUser = null;
    this.uid = null;
    this.fireSets = [];
    this.modelSets = {};

    this.modelSets['userProfile'] = new mdlFirebaseProfile();
    this.fireSets.push(this.modelSets['userProfile']);

    this.modelSets['mesh'] = new mdlFirebaseList('lib_meshes');
    this.fireSets.push(this.modelSets['mesh']);
    this.modelSets['texture'] = new mdlFirebaseList('lib_textures');
    this.fireSets.push(this.modelSets['texture']);
    this.modelSets['material'] = new mdlFirebaseList('lib_materials');
    this.fireSets.push(this.modelSets['material']);
    this.modelSets['scene'] = new mdlFirebaseList('lib_scenes');
    this.fireSets.push(this.modelSets['scene']);

    document.querySelector(signInQS).addEventListener('click', () => me.signIn(), false);
    document.querySelector(signOutQS).addEventListener('click', () => me.signOut(), false);

    firebase.auth().onAuthStateChanged((user) => me.onAuthStateChanged(user));
  }
  get profile() {
    let model = this.modelSets['userProfile'];
    if (model.active)
      return model.profile;
    return {};
  }
  signIn() {
    this.provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(this.provider);
  }
  signOut() {
    firebase.auth().signOut();
  }
  updateAuthUI() {
    let loginPage = document.getElementById('login-page');
    let mainPage = document.getElementById('main-page');

    if (this.loggedIn) {
      loginPage.style.display = 'none';
      mainPage.style.display = '';
    } else {
      loginPage.style.display = '';
      mainPage.style.display = 'none';
    }
  }

  onAuthStateChanged(user) {
    //ignore unwanted events
    if (user && this.uid === user.uid) {
      return;
    }

    if (user) {
      this.currentUser = user;
      this.uid = user.uid;
      this.loggedIn = true;

      //check for profile reset
      let searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('reset') === 'true')
        this.mdlProfile.setObject(null);

      firebase.database().ref('users/' + this.currentUser.uid).set(this.currentUser.toJSON());

      this._activateModels();
    } else {
      this.currentUser = null;
      this.loggedIn = false;
      this._deactivateModels();
    }

    this.updateAuthUI();
  }
  _activateModels() {
    for (let c in this.fireSets)
      this.fireSets[c].activate();
  }
  _deactivate() {
    for (let c in this.fireSets)
      this.fireSets[c].deactivate();
  }
}
