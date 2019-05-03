class cMacroView extends bView {
  constructor(layoutMode, tag, key, childKey) {
    super('None', tag, key, false, childKey);
    this.canvasHelper.initExtraOptions();

    this.refreshProjectList().then(() => {});
    this._updateGoogleFonts().then(() => {});

    this.profilePanelRegister();
  }
  initDataUI() {
  }
  initDataFields() {
    if (this.fireSetCallback)
      this.fireSet.removeListener(this.fireSetCallback);
  }
  splitLayoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;flex-direction:column;">
      <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
      <div id="main-view-wrapper">
        <div class="form_canvas_wrapper"></div>
        <div class="form_panel_view_dom">
          <div id="profile-header-panel">${this.profilePanelTemplate()}</div>
          <div class="header_wrapper" style="line-height: 3em;">
            <b>&nbsp;Workspace</b>
            <select id="workspaces-select"></select>
            <button id="profile_description_panel_btn" style="float:right;" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">person</i></button>
          </div>
          <div class="data-view-container">
          </div>
        </div>
      </div>
    </div>
    <datalist id="fontfamilydatalist"></datalist>
    <datalist id="skyboxlist"></datalist>
    <datalist id="sbmesheslist"></datalist>`;
  }
}
