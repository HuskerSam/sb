class scAuthorization {
  constructor(signInQS, signOutQS) {
    let me = this;
    this.currentUser = {};
    this.fireSets = [];
    this.modelSets = {};

    document.querySelector(signInQS).addEventListener('click', () => me.signIn(), false);
    document.querySelector(signOutQS).addEventListener('click', () => me.signOut(), false);

    firebase.auth().onAuthStateChanged((user) => me.onAuthStateChanged(user));
  }
  userWriteData() {
    firebase.database().ref('users/' + this.currentUser.uid).set(this.currentUser.toJSON());
  }
  signIn() {
    this.provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(this.provider);
  }
  signOut() {
    firebase.auth().signOut();
  }
  updateUI() {
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
    if (user && this.currentUser.uid === user.uid) {
      return;
    }

    for (let i in this.fireSets)
      this.fireSets[i].destroy();
    this.fireSets = [];

    if (user) {
      this.initAuthorizedData(user);
  } else {
      this.currentUser = {};
      this.loggedIn = false;
    }

    this.updateUI();
  }
  initAuthorizedData(user) {
    this.currentUser = user;
    this.loggedIn = true;
    this.userWriteData();

    this.modelSets['meshes'] = new MDLFirebaseList('lib_meshes');
    this.fireSets.push(this.modelSets.meshes);
    this.modelSets['textures'] = new MDLFirebaseList('lib_textures');
    this.fireSets.push(this.modelSets.textures);
    this.modelSets['materials'] = new MDLFirebaseList('lib_materials');
    this.fireSets.push(this.modelSets.materials);
    this.modelSets['scenes'] = new MDLFirebaseList('lib_scenes');
    this.fireSets.push(this.modelSets.scenes);

    gAPPP.initToolbars();
  }
}
