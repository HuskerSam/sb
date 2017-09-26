class clsPopupDialogs {
  constructor() {
    this.dialogs = {};

    let meshFields = [{
      fireSetField: 'title',
      domQuerySelector: '#mesh-details-title',
      babylonMeshField: null
    }, {
      fireSetField: 'simpleUIDetails.scaleX',
      domQuerySelector: '#mesh-details-scale-x',
      babylonMeshField: 'scaling.x'
    }, {
      fireSetField: 'simpleUIDetails.scaleY',
      domQuerySelector: '#mesh-details-scale-y',
      babylonMeshField: 'scaling.y'
    }, {
      fireSetField: 'simpleUIDetails.scaleZ',
      domQuerySelector: '#mesh-details-scale-z',
      babylonMeshField: 'scaling.z'
    }, {
      fireSetField: 'simpleUIDetails.positionX',
      domQuerySelector: '#mesh-details-pos-x',
      babylonMeshField: 'position.x'
    }, {
      fireSetField: 'simpleUIDetails.positionY',
      domQuerySelector: '#mesh-details-pos-y',
      babylonMeshField: 'position.y'
    }, {
      fireSetField: 'simpleUIDetails.positionZ',
      domQuerySelector: '#mesh-details-pos-z',
      babylonMeshField: 'position.z'
    }, {
      fireSetField: 'simpleUIDetails.rotateX',
      domQuerySelector: '#mesh-details-rotate-x',
      babylonMeshField: 'rotation.x'
    }, {
      fireSetField: 'simpleUIDetails.rotateY',
      domQuerySelector: '#mesh-details-rotate-y',
      babylonMeshField: 'rotation.y'
    }, {
      fireSetField: 'simpleUIDetails.rotateZ',
      domQuerySelector: '#mesh-details-rotate-z',
      babylonMeshField: 'rotation.z'
    }];

    let materialFields = [{
      fireSetField: 'title',
      domQuerySelector: '#material-details-title',
      babylonMeshField: null
    }];

    this.dialogs['meshes-edit'] = new clsCanvasPopup('mesh', ['details', 'json', 'babylon'], meshFields);
    this.dialogs['materials-edit'] = new clsCanvasPopup('material', ['details', 'json'], materialFields);

    this.dialogs['meshes-create'] = new clsCreatePopup('#mesh-upload-dialog', ['id'], 'uploadMesh');
    this.dialogs['textures-create'] = new clsCreatePopup('#texture-upload-dialog', ['title'], 'uploadTexture');
    this.dialogs['materials-create'] = new clsCreatePopup('#material-upload-dialog', ['title'], 'uploadMaterial');
  }
}
