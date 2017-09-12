'use strict';
var babyUtil = {};

window.addEventListener("resize", function() {
  engine.resize();
});
window.addEventListener('load', function() {
  babyUtil = new BabylonHelper("renderCanvas");

  meshes.init();
  meshespopup.init();
  document.getElementById('sign-in-button').addEventListener('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  });
  document.getElementById('sign-out-button').addEventListener('click', function() {
    firebase.auth().signOut();
  });
  firebase.auth().onAuthStateChanged(onAuthStateChanged);
}, false);

function onAuthStateChanged(user) {
  //ignore unwanted events
  if (user && fireUtil.currentUser.uid === user.uid) {
    return;
  }

  fireUtil.onAuthStateChanged(user, document.getElementById('models-content'));

  var loginPage = document.getElementById('login-page');
  var mainPage = document.getElementById('main-page');

  if (user) {
    loginPage.style.display = 'none';
    mainPage.style.display = '';
  } else {
    loginPage.style.display = '';
    mainPage.style.display = 'none';
  }
}
