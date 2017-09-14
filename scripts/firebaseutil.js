var fireUtil = {};
fireUtil.currentUser = {};
fireUtil.domModelContainer = null;
fireUtil.listeningFirebaseRefs = [];

fireUtil.userWriteData = function() {
  firebase.database().ref('users/' + this.currentUser.uid).set(this.currentUser.toJSON());
};
fireUtil.updateModel = function(id, data) {
  var updates = {};
  updates['/modelslib/' + id] = data;
  return firebase.database().ref().update(updates);
};
fireUtil.initModelList = function() {
  var myUserId = firebase.auth().currentUser.uid;
  var modelsRef = firebase.database().ref('modelslib');

  var me = this;
  modelsRef.on('child_added', function(data) {
    me.domModelContainer.insertBefore(me.createModelDOM(data), me.domModelContainer.firstChild);
  });
  modelsRef.on('child_changed', function(data) {
    var div = me.domModelContainer.getElementsByClassName('post-' + data.key)[0];
    div.getElementsByClassName('model-title')[0].innerText = data.val().title;
    div.getElementsByClassName('model-username')[0].innerText = data.val().author;
  });
  modelsRef.on('child_removed', function(data) {
    var post = document.getElementById('model-' + data.key);
    if (post)
      me.domModelContainer.removeChild(post);
  });
  this.listeningFirebaseRefs.push(modelsRef);
};
fireUtil.createModelDOM = function(data) {
  var html =
    '<div id="model-' + data.key + '" class="model-item">' +
    '<div class="model-title"></div>' +
    '<div class="model-avatar"></div>' +
    '<div class="model-username"></div>' +
    '<button class="model-remove">Remove</button>' +
    '<button class="model-details">Details</button>' +
  '</div>';

  var outer = document.createElement('div');
  outer.innerHTML = html;
  var div = outer.firstChild;

  div.getElementsByClassName('model-title')[0].innerText = data.val().title;
  div.getElementsByClassName('model-username')[0].innerText = data.val().author;
  div.getElementsByClassName('model-avatar')[0].style.backgroundImage = 'url("' +
    (data.val().authorPic || './silhouette.jpg') + '")';
  div.getElementsByClassName('model-remove')[0].addEventListener('click', function(e) {
    var updates = {};
    updates['/modelslib/' + data.key] = null;
    firebase.database().ref().update(updates).then(function(e) {});
  });
  div.getElementsByClassName('model-details')[0].addEventListener('click', function(e) {
    meshespopup.show(data);
  });

  return div;
};
fireUtil.onAuthStateChanged = function(user, domModelContainer) {
  this.domModelContainer = domModelContainer;
  this.domModelContainer.innerHTML = '';

  this.listeningFirebaseRefs.forEach(function(ref) {
    ref.off();
  });
  this.listeningFirebaseRefs = [];

  if (user) {
    this.currentUser = user;
    this.userWriteData();
    fireUtil.initModelList();
  } else {
    fireUtil.currentUser = {};
  }
};
fireUtil.uploadModel = function(modelString, title) {
  return new Promise(function(resolve, reject) {
    var modelId = firebase.database().ref().child('modelslib').push().key;
    var storageRef = firebase.storage().ref();
    var auth = firebase.auth();
    storageRef.child('images/' + modelId + '/file.babylon').putString(modelString).then(function(snapshot) {
      if (!title)
        title = new Date().toISOString();

      fireUtil.updateModel(modelId, {
        title: title,
        url: snapshot.downloadURL,
        type: 'url',
        size: snapshot.totalBytes
      }).then(function(e) {
        resolve(e);
      })
    }).catch(function(error) {
      reject(error);
    });
  });
};
