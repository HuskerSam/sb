var fireUtil = {};
fireUtil.currentUser = {};
fireUtil.meshesFireSet = null;
fireUtil.fireSets = [];

fireUtil.userWriteData = function() {
  firebase.database().ref('users/' + this.currentUser.uid).set(this.currentUser.toJSON());
};
fireUtil.onAuthStateChanged = function(user) {
  for (let i in this.fireSets)
    this.fireSets[i].destroy();
  this.fireSets = [];

  if (user) {
    this.currentUser = user;
    this.userWriteData();

    this.meshesFireSet = new FireSet('lib_meshes', 'meshes', ['title'], this.defaultItemTemplate);
    this.fireSets.push(this.meshesFireSet);
    this.texturesFireSet = new FireSet('lib_textures', 'textures', ['title'], this.defaultItemTemplate);
    this.fireSets.push(this.texturesFireSet);
    this.texturesFireSet = new FireSet('lib_materials', 'materials', ['title'], this.defaultItemTemplate);
    this.fireSets.push(this.texturesFireSet);
  } else {
    fireUtil.currentUser = {};
  }
};
fireUtil.newMesh = function(meshString, meshName) {
  var me = this;
  return new Promise(function(resolve, reject) {
    var key = me.meshesFireSet.getKey();

    me.meshesFireSet.setString(key, meshString, 'file.babylon').then(function(snapshot) {
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
fireUtil.newTexture = function(textureBlob, title) {
  var me = this;
  return new Promise(function(resolve, reject) {
    let key = me.meshesFireSet.getKey();
    me.texturesFireSet.setBlob(key, textureBlob, 'texturefile').then(function(snapshot) {
      let textureData = me.getNewTextureData();
      textureData.title = title;
      textureData.url = snapshot.downloadURL;
      textureData.size = snapshot.totalBytes;

      me.texturesFireSet.set(key, textureData).then(function(e) {
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
fireUtil.getNewTextureData = function() {
  return {
    title: 'Texture',
    url: '',
    size: 0
  };
};
fireUtil.defaultItemTemplate = function(domPrefix, fireData) {
  return `
<div id="${domPrefix}-${fireData.key}" class="firebase-item">
  <div class="${domPrefix}-title"></div>
  <button class="${domPrefix}-remove mdl-button mdl-js-button mdl-button--icon">
    <i class="material-icons">delete</i>
  </button>
  <button class="${domPrefix}-details mdl-button mdl-js-button mdl-button--icon">
    <i class="material-icons">settings</i>
  </button>
</div>`;
};
