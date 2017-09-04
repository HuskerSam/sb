'use strict';

window.addEventListener("resize", function() {
  engine.resize();
});
window.addEventListener('load', function() {
  babyUtil.initCanvas("renderCanvas");
  /*
  babyUtil.serializeMesh("King", "", "models.babylon").then(function(r) {
    console.log(r);
  });
  */
  document.getElementById('sign-in-button').addEventListener('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  });
  document.getElementById('sign-out-button').addEventListener('click', function() {
    firebase.auth().signOut();
  });
  firebase.auth().onAuthStateChanged(onAuthStateChanged);
  document.getElementById('model-upload').addEventListener('change', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];
    var title = document.getElementById('file-title').value.trim();
    fireUtil.uploadModel(file, title).then(function(result) {
      document.getElementById('file-title').value = '';
      evt.target.value = '';
    });
  }, false);
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
