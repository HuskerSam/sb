'use strict';
class gDemoApp extends gAppSuper {
  constructor() {
    super();
    this.a.signInAnon();
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;
    let workspace = this.a.profile.selectedWorkspace;
    this.a.initProjectModels(workspace);
    this.a._activateModels();
    this.initialUILoad = false;

    this.workspaceProcessed = false;
    gAPPP.a.workspaceLoadedCallback = () => {
      if (this.workspaceProcessed) return;

      this.workspaceProcessed = true;
      gAPPP.a.profile['selectedBlockKey' + workspace] = gAPPP.a.modelSets['block'].getIdByFieldLookup('blockCode', 'demo');

      this.mV = new cViewDemo();
      this._updateApplicationStyle();
      this.mV.updateProjectList(gAPPP.a.modelSets['projectTitles'].fireDataValuesByKey, gAPPP.a.profile.selectedWorkspace);
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

      <div class="user-options-panel">
        <button class="choice-button-one" style="display:none;">&nbsp;</button>
        <button class="choice-button-two" style="display:none;">&nbsp;</button>
        <button class="choice-button-three" style="display:none;">&nbsp;</button>
        <button class="choice-button-four" style="display:none;">&nbsp;</button>
      </div>
      <div class="cart-total">
        <select id="workspaces-select"></select>
        <button class="choice-button-clear cart-submit">Checkout</button>
        <div class="cart-item-total">$ 0.00</div>
        <div class="cart-contents">
        </div>
        <div style="text-align:center;">
          <button id="cart-contents-more-button">More</button>
        </div>
      </div>
    </div>`;
  }
  _initAuthUI() {
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('eXtended Reality Grafter');
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
    this.updateAppLayout();
    this.__initFormHandlers();
  }
  __initFormHandlers() {}
}
