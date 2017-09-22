var fireUtil = {};
fireUtil.currentUser = {};
fireUtil.domModelContainer = null;
fireUtil.listeningFirebaseRefs = [];

fireUtil.userWriteData = function() {
  firebase.database().ref('users/' + this.currentUser.uid).set(this.currentUser.toJSON());
};
fireUtil.setModel = function(id, data) {
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
    var div = document.getElementById('model-' + data.key);
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
    '<button class="model-remove mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">delete</i></button>' +
    '<button class="model-details mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">settings</i></button>' +
    '</div>';

  var outer = document.createElement('div');
  outer.innerHTML = html;
  var div = outer.firstChild;

  div.getElementsByClassName('model-title')[0].innerText = data.val().title;
  div.getElementsByClassName('model-username')[0].innerText = data.val().author;
  div.getElementsByClassName('model-avatar')[0].style.backgroundImage = 'url("' +
    (data.val().authorPic || './silhouette.jpg') + '")';
  div.getElementsByClassName('model-remove')[0].addEventListener('click', function(e) {
    if (!confirm('Are you sure you want to delete this model?'))
      return;
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
fireUtil.newModel = function(modelString, meshName) {
  var me = this;
  return new Promise(function(resolve, reject) {
    var modelId = firebase.database().ref().child('modelslib').push().key;

    me.uploadData(modelId, modelString, 'file.babylon', 'mesh').then(function(snapshot) {
      let title = meshName;
      if (!title)
        title = new Date().toISOString();

      var meshData = JSON.parse(JSON.stringify(defaultMeshData));
      meshData.title = title;
      meshData.meshName = meshName;
      meshData.url = snapshot.downloadURL;
      meshData.type = 'url';
      meshData.size = snapshot.totalBytes;

      fireUtil.setModel(modelId, meshData).then(function(e) {
        resolve(e);
      })
    }).catch(function(error) {
      reject(error);
    });
  });
};
fireUtil.uploadData = function(id, dataString, filename, prefix) {
  return new Promise(function(resolve, reject) {
    var storageRef = firebase.storage().ref();
    var auth = firebase.auth();
    storageRef.child(prefix + '/' + id + '/' + filename).putString(dataString).then(function(snapshot) {
      resolve(snapshot);
    }).catch(function(error) {
      reject(error);
    });
  });
};
