'use strict';

// Shortcuts to DOM Elements.
var messageForm = document.getElementById('message-form');
var messageInput = document.getElementById('new-post-message');
var titleInput = document.getElementById('new-post-title');
var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var loginPage = document.getElementById('login-page');
var mainPage = document.getElementById('main-page');
var templatesList = document.getElementById('templates-list');
var postsContainer = document.getElementById('posts-container');
var listeningFirebaseRefs = [];

function writeNewPost(uid, username, picture, title, body) {
  // A post entry.
  var postData = {
    author: username,
    uid: uid,
    body: body,
    title: title,
    starCount: 0,
    authorPic: picture
  };

  var newPostKey = firebase.database().ref().child('posts').push().key;
  var updates = {};
  updates['/posts/' + newPostKey] = postData;
  updates['/user-posts/' + uid + '/' + newPostKey] = postData;

  return firebase.database().ref().update(updates);
}

function createPostElement(postId, title, text, author, authorId, authorPic) {
  var uid = firebase.auth().currentUser.uid;

  var html =
    '<div id="model-' + postId + '" class="model-item">' +
    '<div class="model-title"></div>' +
    '<div class="model-avatar"></div>' +
    '<div class="model-username"></div>'
  '</div>';

  // Create the DOM element from the HTML.
  var div = document.createElement('div');
  div.innerHTML = html;
  var postElement = div.firstChild;

  postElement.getElementsByClassName('model-title')[0].innerText = title;
  postElement.getElementsByClassName('model-username')[0].innerText = author || 'Anonymous';
  postElement.getElementsByClassName('model-avatar')[0].style.backgroundImage = 'url("' +
    (authorPic || './silhouette.jpg') + '")';

  return postElement;
}

/**
 * Starts listening for new posts and populates posts lists.
 */
function startDatabaseQueries() {
  // [START my_top_posts_query]
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
      var post = postsContainer.getElementsByClassName('post-' + data.key)[0];
      post.parentElement.removeChild(post);
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
// [END basic_write]

/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
  // Remove all previously displayed posts.
  postsContainer.innerHTML = '';

  // Stop all currently listening Firebase listeners.
  listeningFirebaseRefs.forEach(function(ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}

/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
var currentUID;

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
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

/**
 * Creates a new post for the current user.
 */
function newPostForCurrentUser(title, text) {
  // [START single_value_read]
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
    var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // [START_EXCLUDE]
    return writeNewPost(firebase.auth().currentUser.uid, username,
      firebase.auth().currentUser.photoURL,
      title, text);
    // [END_EXCLUDE]
  });
  // [END single_value_read]
}

// Bindings on load.
window.addEventListener('load', function() {
  // Bind Sign in button.
  signInButton.addEventListener('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  });

  // Bind Sign out button.
  signOutButton.addEventListener('click', function() {
    firebase.auth().signOut();
  });

  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

  // Saves message on form submit.
  messageForm.onsubmit = function(e) {
    e.preventDefault();
    var text = messageInput.value;
    var title = titleInput.value;
    if (text && title) {
      newPostForCurrentUser(title, text).then(function() {
        myPostsMenuButton.click();
      });
      messageInput.value = '';
      titleInput.value = '';
    }
  };
}, false);


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
window.addEventListener("resize", function() {
  engine.resize();
});
