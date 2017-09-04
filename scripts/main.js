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
  initUploadDialog();
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

function initUploadDialog() {
  var dialog = document.querySelector('dialog');
  if (! dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
  }
  document.getElementById('upload-button').addEventListener('click', function() {
    dialog.showModal();
  });
  dialog.querySelector('.close').addEventListener('click', function() {
    dialog.close();
  });
  dialog.querySelector('.import').addEventListener('click', function() {
    var file = document.getElementById('model-upload-file').files[0];
    var title = document.getElementById('object-id').value.trim();
    fireUtil.uploadModel(file, title).then(function(result) {
      document.getElementById('object-id').value = '';
      document.getElementById('model-upload-file').value = '';
      dialog.close();
    });
  });
}
