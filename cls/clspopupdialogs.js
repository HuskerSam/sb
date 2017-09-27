class clsPopupDialogs {
  constructor() {
    this.dialogs = {};

    let meshFields = [{
      title: 'Title',
      fireSetField: 'title',
      babylonMeshField: null
    }, {
      title: 'Scale X',
      fireSetField: 'simpleUIDetails.scaleX',
      babylonMeshField: 'scaling.x'
    }, {
      title: 'Scale Y',
      fireSetField: 'simpleUIDetails.scaleY',
      babylonMeshField: 'scaling.y'
    }, {
      title: 'Scale Z',
      fireSetField: 'simpleUIDetails.scaleZ',
      babylonMeshField: 'scaling.z'
    }, {
      title: 'Offset X',
      fireSetField: 'simpleUIDetails.positionX',
      babylonMeshField: 'position.x'
    }, {
      title: 'Offset Y',
      fireSetField: 'simpleUIDetails.positionY',
      babylonMeshField: 'position.y'
    }, {
      title: 'Offset Z',
      fireSetField: 'simpleUIDetails.positionZ',
      babylonMeshField: 'position.z'
    }, {
      title: 'Rotate X',
      fireSetField: 'simpleUIDetails.rotateX',
      babylonMeshField: 'rotation.x'
    }, {
      title: 'Rotate Y',
      fireSetField: 'simpleUIDetails.rotateY',
      babylonMeshField: 'rotation.y'
    }, {
      title: 'Rotate Z',
      fireSetField: 'simpleUIDetails.rotateZ',
      babylonMeshField: 'rotation.z'
    }];

    let materialFields = [{
      fireSetField: 'title',
      babylonMeshField: null
    }];

    let textureFields = [{
      fireSetField: 'title',
      babylonMeshField: null
    }];

    this.dialogs['meshes-edit'] = new clsCanvasPopup('mesh', meshFields, [0, 3, 6]);
    //    this.dialogs['materials-edit'] = new clsCanvasPopup('material', ['details', 'json'], materialFields);
    //  this.dialogs['textures-edit'] = new clsCanvasPopup('texture', ['details', 'json'], textureFields);

    this.dialogs['meshes-create'] = new clsCreatePopup('#mesh-upload-dialog', ['id'], 'uploadMesh');
    this.dialogs['textures-create'] = new clsCreatePopup('#texture-upload-dialog', ['title'], 'uploadTexture');
    this.dialogs['materials-create'] = new clsCreatePopup('#material-upload-dialog', ['title'], 'uploadMaterial');
  }
}
