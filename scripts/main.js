'use strict';

// Shortcuts to DOM Elements.
var messageForm = document.getElementById('message-form');
var messageInput = document.getElementById('new-post-message');
var titleInput = document.getElementById('new-post-title');
var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var loginPage = document.getElementById('login-page');
var mainPage = document.getElementById('main-page');
var addPost = document.getElementById('add-post');
var addButton = document.getElementById('add');
var templatesList = document.getElementById('templates-list');
var recentMenuButton = document.getElementById('menu-recent');
var myPostsMenuButton = document.getElementById('menu-my-posts');
var myTopPostsMenuButton = document.getElementById('menu-my-top-posts');
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
      '<div class="post-' + postId + ' mdl-cell mdl-grid mdl-grid--no-spacing">' +
        '<h4 class="mdl-card__title-text"></h4>' +
        '<div class="avatar"></div>' +
        '<div class="username mdl-color-text--black"></div>' +
        '<div class="text"></div>' +
      '</div>';

  // Create the DOM element from the HTML.
  var div = document.createElement('div');
  div.innerHTML = html;
  var postElement = div.firstChild;
//  if (componentHandler) {
  //  componentHandler.upgradeElements(postElement.getElementsByClassName('mdl-textfield')[0]);
//  }

  // Set values.
  postElement.getElementsByClassName('text')[0].innerText = text;
  postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = title;
  postElement.getElementsByClassName('username')[0].innerText = author || 'Anonymous';
  postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
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
      var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
      containerElement.insertBefore(
          createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic),
          containerElement.firstChild);
    });
    postsRef.on('child_changed', function(data) {
		var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
		var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
		postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
		postElement.getElementsByClassName('username')[0].innerText = data.val().author;
		postElement.getElementsByClassName('text')[0].innerText = data.val().body;
		postElement.getElementsByClassName('star-count')[0].innerText = data.val().starCount;
    });
    postsRef.on('child_removed', function(data) {
		var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
		var post = containerElement.getElementsByClassName('post-' + data.key)[0];
	    post.parentElement.removeChild(post);
    });
  };

  // Fetching and displaying all posts of each sections.
  fetchPosts(recentPostsRef, templatesList);

  // Keep track of all Firebase refs we are listening to.
  listeningFirebaseRefs.push(recentPostsRef);
}

/**
 * Writes the user's data to the database.
 */
// [START basic_write]
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}
// [END basic_write]

/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
  // Remove all previously displayed posts.
  templatesList.getElementsByClassName('posts-container')[0].innerHTML = '';

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

/**
 * Displays the given section element and changes styling of the given button.
 */
function showSection(sectionElement, buttonElement) {
  templatesList.style.display = 'none';
  addPost.style.display = 'none';
  recentMenuButton.classList.remove('is-active');
  addButton.classList.remove('is-active');

  if (sectionElement) {
    sectionElement.style.display = 'block';
  }
  if (buttonElement) {
    buttonElement.classList.add('is-active');
  }
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

  // Bind menu buttons.
  recentMenuButton.onclick = function() {
    showSection(templatesList, recentMenuButton);
  };
  addButton.onclick = function() {
    showSection(addPost, addButton);
    messageInput.value = '';
    titleInput.value = '';
  };
  recentMenuButton.onclick();
}, false);
