'use strict';

var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var loginPage = document.getElementById('login-page');
var mainPage = document.getElementById('main-page');
var templatesList = document.getElementById('templates-list');
var postsContainer = document.getElementById('posts-container');
var uploadModel = document.getElementById('upload-model');
var modelUpload = document.getElementById('model-upload');
var fileTitle = document.getElementById('file-title');
var listeningFirebaseRefs = [];

function writeNewPost(postKey, uid, username, picture, title, fileSize, meta) {
  var postData = {
    author: username,
    uid: uid,
    title: title,
    authorPic: picture,
    size: fileSize,
    meta: meta
  };

  var updates = {};
  updates['/posts/' + postKey] = postData;
  updates['/user-posts/' + uid + '/' + postKey] = postData;

  return firebase.database().ref().update(updates);
}
function createPostElement(postId, title, text, author, authorId, authorPic) {
  var uid = firebase.auth().currentUser.uid;

  var html =
    '<div id="model-' + postId + '" class="model-item">' +
    '<div class="model-title"></div>' +
    '<div class="model-avatar"></div>' +
    '<div class="model-username"></div>' +
    '<button class="model-remove">Remove</button>'
  '</div>';

  var div = document.createElement('div');
  div.innerHTML = html;
  var postElement = div.firstChild;

  postElement.getElementsByClassName('model-title')[0].innerText = title;
  postElement.getElementsByClassName('model-username')[0].innerText = author || 'Anonymous';
  postElement.getElementsByClassName('model-avatar')[0].style.backgroundImage = 'url("' +
    (authorPic || './silhouette.jpg') + '")';
  postElement.getElementsByClassName('model-remove')[0].addEventListener('click', function(e) {
    var updates = {};
    updates['/posts/' + postId] = null;
    updates['/user-posts/' + uid + '/' + postId] = null;
    firebase.database().ref().update(updates).then(function(e) {
      //live data will refresh itself
    });
  });
  return postElement;
}
function startDatabaseQueries() {
  var myUserId = firebase.auth().currentUser.uid;
  var recentPostsRef = firebase.database().ref('posts').limitToLast(100);

  var fetchPosts = function(postsRef, sectionElement) {
    postsRef.on('child_added', function(data) {
      var author = data.val().author || 'Anonymous';
      postsContainer.insertBefore(
        createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic),
        postsContainer.firstChild);
    });
    postsRef.on('child_changed', function(data) {
      var postElement = postsContainer.getElementsByClassName('post-' + data.key)[0];
      postElement.getElementsByClassName('model-title')[0].innerText = data.val().title;
      postElement.getElementsByClassName('model-username')[0].innerText = data.val().author;
    });
    postsRef.on('child_removed', function(data) {
      var post = document.getElementById('model-' + data.key);
      if (post)
        postsContainer.removeChild(post);
    });
  };

  fetchPosts(recentPostsRef, templatesList);

  listeningFirebaseRefs.push(recentPostsRef);
}
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture: imageUrl
  });
}
function cleanupUi() {
  postsContainer.innerHTML = '';

  listeningFirebaseRefs.forEach(function(ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}

var currentUID;

function onAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && currentUID === user.uid) {
    return;
  }

  cleanupUi();
  if (user) {
    currentUID = user.uid;
    loginPage.style.display = 'none';
    mainPage.style.display = '';
    writeUserData(user.uid, user.displayName, user.email, user.photoURL);
    startDatabaseQueries();
  } else {
    // Set currentUID to null.
    currentUID = null;
    // Display the splash page where you can sign-in.
    loginPage.style.display = '';
    mainPage.style.display = 'none';
  }
}
function newPostForCurrentUser(postKey, title, fileUrl, totalBytes, meta) {
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
    var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    return writeNewPost(postKey, firebase.auth().currentUser.uid, username,
      firebase.auth().currentUser.photoURL,
      title, fileUrl, totalBytes, meta);
  });
}
function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var file = evt.target.files[0];
  var storageRef = firebase.storage().ref();
  var auth = firebase.auth();

  var metadata = {
    'contentType': file.type
  };

  storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {

    var newPostKey = firebase.database().ref().child('posts').push().key;
    var title = fileTitle.value.trim();
    if (title === '')
      title = new Date().toISOString();

    newPostForCurrentUser(newPostKey, title, snapshot.downloadURL, snapshot.totalBytes, snapshot.metadata)
      .then(function(e) {
        fileTitle.value = '';
        evt.target.value = '';
      });
  }).catch(function(error) {
    console.error('Upload failed:', error);
  });
}
function initCanvas() {
  var canvas = document.getElementById("renderCanvas");
  var engine = new BABYLON.Engine(canvas, true);
  var createScene = function() {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0, 1, 0);
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .5;
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
    sphere.position.y = 1;
    var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
    return scene;

  };
  var scene = createScene();
  engine.runRenderLoop(function() {
    scene.render();
  });
}

initCanvas();
window.addEventListener("resize", function() {
  engine.resize();
});
window.addEventListener('load', function() {
  // Bind Sign in button.
  signInButton.addEventListener('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  });

  signOutButton.addEventListener('click', function() {
    firebase.auth().signOut();
  });
  firebase.auth().onAuthStateChanged(onAuthStateChanged);
  modelUpload.addEventListener('change', handleFileSelect, false);
}, false);
