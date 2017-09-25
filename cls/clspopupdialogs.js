class clsPopupDialogs {
  constructor() {
    this.dialogs = {};

    let meshEditorIds = ['mesh-details-json', 'mesh-babylon-json'];
    let meshTabs = ['mesh-details', 'fire-json', 'mesh-json'];
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
    this.dialogs['meshes'] = new clsCanvasPopup('#mesh-details-dialog', meshTabs, meshFields, meshEditorIds);

    this.dialogs['meshes-create'] = new clsCreatePopup('#mesh-upload-dialog', ['id'], 'uploadMesh');
    this.dialogs['textures-create'] = new clsCreatePopup('#texture-upload-dialog', ['title'], 'uploadTexture');
    this.dialogs['materials-create'] = new clsCreatePopup('#material-upload-dialog', ['title', 'color'], 'uploadMaterial');
  }
}
