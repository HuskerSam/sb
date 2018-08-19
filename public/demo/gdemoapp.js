'use strict';
class gDemoApp extends gAppSuper {
  constructor() {
    super();
    this.a = new gAuthorization();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    this.a.signInAnon();
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;

    let urlParams = new URLSearchParams(window.location.search);
    let workspace = urlParams.get('w');
    let block = urlParams.get('b');
    let workspaceCode = urlParams.get('z');
    let blockCode = urlParams.get('y');

    blockCode = 'demo';

    if (!workspaceCode)
      workspaceCode = 'Week 1';
    if (workspaceCode) {
      let data = gAPPP.a.modelSets['projectTitles'].getValuesByFieldLookup('code', workspaceCode);
      if (data)
        workspace = gAPPP.a.modelSets['projectTitles'].lastKeyLookup;
    }
    this.a.profile.selectedWorkspace = workspace;
    this.a.initProjectModels(workspace);

    this.a._activateModels();
    this.initialUILoad = false;

    gAPPP.a.workspaceLoadedCallback = () => {
      if (blockCode) {
        let data = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockCode', blockCode);
        if (data)
          block = gAPPP.a.modelSets['block'].lastKeyLookup;
      }

      gAPPP.a.profile['selectedBlockKey' + workspace] = block;
      this.mV = new cViewDemo();
      this._updateApplicationStyle();
    };

    document.getElementById('clear-basket').addEventListener('click', () => this.hideBasketGoods());
    document.getElementById('show-apple').addEventListener('click', () => this.showBasketGood('apples'));
    document.getElementById('show-pear').addEventListener('click', () => this.showBasketGood('pears'));
    document.getElementById('show-plum').addEventListener('click', () => this.showBasketGood('plums'));
    document.getElementById('show-onion').addEventListener('click', () => this.showBasketGood('spring onions'));

    document.getElementById('show-controls').addEventListener('click', () => this.toggleShowControls());

    document.getElementById('week-picker-select').addEventListener('input', () => this.changeSelectedWeek());
    document.getElementById('week-picker-select').value = workspaceCode;
  }
  changeSelectedWeek() {
    let projCode = document.getElementById('week-picker-select').value;
/*
    let data = gAPPP.a.modelSets['projectTitles'].getValuesByFieldLookup('code', projCode);
    if (data) {
      let workspace = gAPPP.a.modelSets['projectTitles'].lastKeyLookup;

      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'selectedWorkspace',
        newValue: workspace
      }]);
      setTimeout(() => location.reload(), 100);
    }
    */
    console.log(location);
    let path = location.origin + location.pathname + '?z=' + projCode;
    window.location = path;
//    setTimeout(() => location.reload(), 100);
  }
  toggleShowControls() {
    if (!this.controlsShown) {
      this.controlsShown = true;
      document.querySelector('.canvas-actions').style.display = 'block';
    } else {
      this.controlsShown = false;
      document.querySelector('.canvas-actions').style.display = 'none';
    }
  }
  hideBasketGoods() {
    this._hideBasketGood('apples');
    this._hideBasketGood('pears');
    this._hideBasketGood('plums');
    this._hideBasketGood('spring onions');
  }
  _hideBasketGood(name) {
    let frames =
      this.mV.rootBlock._findBestTargetObject('block:basketcart').
    _findBestTargetObject('block:display ' + name).framesHelper.framesStash;

    let frameIds = [];
    for (let i in frames)
      frameIds.push(i);

    if (frameIds.length > 0)
      gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionY',
        newValue: "-5"
      }], frameIds[0]);
  }

  showBasketGood(name) {
    let frames =
      this.mV.rootBlock._findBestTargetObject('block:basketcart').
    _findBestTargetObject('block:display ' + name).framesHelper.framesStash;

    let frameIds = [];
    for (let i in frames)
      frameIds.push(i);

    if (frameIds.length > 0)
      gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionY',
        newValue: "1.5"
      }], frameIds[0]);
  }
}
