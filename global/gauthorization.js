class gAuthorization {
  constructor(signInQS, signOutQS) {
    this.currentUser = null;
    this.uid = null;
    this.fireSets = [];
    this.modelSets = {};

    this.modelSets['userProfile'] = new mFirebaseProfile();
    this.fireSets.push(this.modelSets['userProfile']);

    this.modelSets['mesh'] = new mFirebaseList('lib_meshes', 'mesh');
    this.fireSets.push(this.modelSets['mesh']);
    this.modelSets['shape'] = new mFirebaseList('lib_shapes', 'shape');
    this.fireSets.push(this.modelSets['shape']);
    this.modelSets['block'] = new mFirebaseList('lib_blocks', 'block');
    this.fireSets.push(this.modelSets['block']);
    this.modelSets['blockchild'] = new mFirebaseList('lib_blockchildren', 'blockchild');
    this.fireSets.push(this.modelSets['blockchild']);
    this.modelSets['texture'] = new mFirebaseList('lib_textures', 'texture');
    this.fireSets.push(this.modelSets['texture']);
    this.modelSets['material'] = new mFirebaseList('lib_materials', 'material');
    this.fireSets.push(this.modelSets['material']);
    this.modelSets['scene'] = new mFirebaseList('lib_scenes', 'scene');
    this.fireSets.push(this.modelSets['scene']);
    this.modelSets['scene'].childListeners.push(v => gAPPP.handleDataUpdate());

    document.querySelector(signInQS).addEventListener('click', e => this.signIn(), false);
    document.querySelector(signOutQS).addEventListener('click', e => this.signOut(), false);

    firebase.auth().onAuthStateChanged(u => this.onAuthStateChanged(u));
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
        this.resetProfile();

      //save user data to firebase (WWWHHHYYYY?)
      firebase.database().ref('users/' + this.currentUser.uid).set(this.currentUser.toJSON());

      this._activateModels();
    } else {
      this.currentUser = null;
      this.loggedIn = false;
      this.uid = null;
      this._deactivateModels();
    }

    this.updateAuthUI();
  }
  get profile() {
    let model = this.modelSets['userProfile'];
    if (model.active)
      if (model.profile)
        return model.profile;
      else
        this.resetProfile();
    return {};
  }
  signIn() {
    this.provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(this.provider);
    firebase.auth().onAuthStateChanged((user) => this.onAuthStateChanged(user));
  }
  signOut() {
    firebase.auth().signOut();
    location.reload(); // just dump the dom and restart
  }
  updateAuthUI() {
    let loginPage = document.getElementById('login-page');
    let mainPage = document.getElementById('main-page');

    if (this.loggedIn) {
      loginPage.style.display = 'none';
      mainPage.style.display = 'block';
    } else {
      loginPage.style.display = 'block';
      mainPage.style.display = 'none';
    }
  }
  resetProfile() {
    this.modelSets['userProfile'].setObject({
      fontSize: '12',
      canvasColor: '.4,.9,1',
      lightIntensity: '.8'
    });
  }
  _activateModels() {
    for (let c in this.fireSets)
      this.fireSets[c].activate();
  }
  _deactivateModels() {
    for (let c in this.fireSets)
      this.fireSets[c].deactivate();
  }
}
