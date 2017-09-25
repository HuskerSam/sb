class clsSceneBuilder {
  constructor() {
    this.babyHelper = new clsBabylonHelper("#renderCanvas");
    this.scene = this.babyHelper.createDefaultScene();
    this.babyHelper.setScene(this.scene);
    this.toolbarItems = {};
    this.toolbarItems['meshes'] = new clsToolbarItem('meshes', 'Meshes');
    this.toolbarItems['materials'] = new clsToolbarItem('materials', "Materials");
    this.toolbarItems['textures'] = new clsToolbarItem('textures', 'Textures');
  }
}
