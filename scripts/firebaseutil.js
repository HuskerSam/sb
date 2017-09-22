var fireUtil = {};
fireUtil.currentUser = {};
fireUtil.meshesFireSet = null;

fireUtil.userWriteData = function() {
  firebase.database().ref('users/' + this.currentUser.uid).set(this.currentUser.toJSON());
};
fireUtil.onAuthStateChanged = function(user) {
  if (this.meshesFireSet)
    this.meshesFireSet.destroy();

  if (user) {
    this.currentUser = user;
    this.userWriteData();
    this.meshesFireSet = new FireSet('lib_meshes', 'meshes', ['author', 'title'], this.meshItemTemplate);
  } else {
    fireUtil.currentUser = {};
  }
};
fireUtil.newMesh = function(meshString, meshName) {
  var me = this;
  return new Promise(function(resolve, reject) {
    var key = me.meshesFireSet.getKey();

    me.meshesFireSet.setBlob(key, meshString, 'file.babylon').then(function(snapshot) {
      let title = meshName;
      if (!title)
        title = new Date().toISOString();

      var meshData = me.getNewMeshData();
      meshData.title = title;
      meshData.meshName = meshName;
      meshData.url = snapshot.downloadURL;
      meshData.type = 'url';
      meshData.size = snapshot.totalBytes;

      me.meshesFireSet.set(key, meshData).then(function(e) {
        resolve(e);
      })
    }).catch(function(error) {
      reject(error);
    });
  });
};
fireUtil.getNewMeshData = function() {
  return {
    title: 'Mesh',
    meshName: '',
    url: '',
    type: 'url',
    size: 0,
    simpleUIDetails: {
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
      positionX: 0.0,
      positionY: 0.0,
      positionZ: 0.0,
      rotateX: 0.0,
      rotateY: 0.0,
      rotateZ: 0.0
    }
  };
};
fireUtil.meshItemTemplate = function(domPrefix, fireData) {
  return '<div id="' + domPrefix + '-' + fireData.key + '" class="firebase-item">' +
    '<div class="meshes-title"></div>' +
    '<div class="meshes-avatar"></div>' +
    '<div class="meshes-author"></div>' +
    '<button class="meshes-remove mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">delete</i></button>' +
    '<button class="meshes-details mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">settings</i></button>' +
    '</div>';
};
