'use strict';
class gPublishApp extends gAppSuper  {
  constructor() {
    super();
    this.a.signInAnon();
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;

    let urlParams = new URLSearchParams(window.location.search);
    let workspace = urlParams.get('w');
    let block = urlParams.get('b');
    let workspaceCode = urlParams.get('z');
    let blockCode = urlParams.get('y');

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
      this.mV = new cViewPublished();
      this._updateApplicationStyle();
    };
  }
  _loginPageTemplate(title = `Dynamic Reality App`) {
    return `<div id="firebase-app-login-page" style="display:none;">Loading...</div>`;
  }
  _fullScreenPageLayout() {
    return `<div id="firebase-app-main-page" style="display:none;">
  <div id="renderLoadingCanvas" style="display:none;"><br><br>LOADING...</div>
  <div class="popup-canvas-wrapper main-canvas-wrapper"></div>
  <button id="user-profile-dialog-reset-button">Reset Options</button>
  <button id="publish-settings-button" style='display:none' class="btn-sb-icon"><i class="material-icons">settings_brightness</i></button>
  <a href="/" id="change-view-anchor">Change View</a>
  <div id="publish-profile-panel" style="display:none;">
    <div id="value-set-panel">
      <label><span>Element</span>
      <select id="element-type-to-edit">
        <option>Block</option>
        <option>BlockChild</option>
        <option>Shape</option>
        <option>Mesh</option>
        <option>Texture</option>
        <option>Material</option>
        <option>Frame</option>
      </select>
      </label>
      <br>
      <label><span>ID</span><input id="element-id-to-edit" type="text" list="elementidlist" /></label>
      <br>
      <label><span>Field</span><input id="field-name-to-edit" type="text" list="fieldnamelist" /></label>
      <br>
      <label><span>Value</span><input id="value-to-edit" type="text" /></label>
      <br>
      <button id="button-to-edit">Set</button>
    </div>

    <div class="fields-container"></div>
  </div>
</div>`;
  }
  _initAuthUI() {
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('eXtended Reality Viewer');
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
    this.updateAppLayout();
    this.__initFormHandlers();
  }
  __initFormHandlers() {}
}
