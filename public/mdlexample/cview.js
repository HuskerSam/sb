class cView extends bView {
  constructor(layoutMode, tag, key) {
    super(layoutMode, tag, key);
    this.canvasHelper.initExtraOptions();

    document.querySelector('.user-name').innerHTML = gAPPP.a.currentUser.email;

    this.profile_description_panel_btn = document.getElementById('profile_description_panel_btn');
    this.profile_description_panel_btn.addEventListener('click', e => this.toggleProfilePanel());
  }
  toggleProfilePanel() {
    if (this.profilePanelShown) {
      this.profilePanelShown = false;
      this.profile_description_panel_btn.classList.remove('button-expanded');
      document.getElementById('profile-header-panel').classList.remove('expanded');
    } else {
      this.profilePanelShown = true;
      this.profile_description_panel_btn.classList.add('button-expanded');
      document.getElementById('profile-header-panel').classList.add('expanded');
    }
  }
  _canvasPanelTemplate() {
    return `<canvas class="popup-canvas"></canvas>
  <div class="video-overlay">
    <video></video>
  </div>
  <div class="canvas-actions">
    <div class="canvas-play-bar">
      <div class="scene-options-panel" style="display:none;">
        <div class="scene-fields-container">
        </div>
        <div class="render-log-wrapper" style="display:none;">
          <button class="btn-sb-icon log-clear"><i class="material-icons">clear_all</i></button>
          <textarea class="render-log-panel" spellcheck="false"></textarea>
          <div class="fields-container" style="display:none;"></div>
        </div>
        <br>
        <button class="btn-sb-icon stop-button"><i class="material-icons">stop</i></button>
        <button class="btn-sb-icon video-button"><i class="material-icons">fiber_manual_record</i></button>
        <button class="btn-sb-icon download-button"><i class="material-icons">file_download</i></button>
        <button class="btn-sb-icon show-hide-log"><i class="material-icons">info_outline</i></button>
      </div>
      <br>
      <button class="btn-sb-icon scene-options" style="clear:both;"><i class="material-icons">settings_brightness</i></button>
      <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary play-button"><i class="material-icons">play_arrow</i></button>
      <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored pause-button"><i class="material-icons">pause</i></button>
      <div class="run-length-label"></div>
      <input class="animate-range" type="range" step="any" value="0" min="0" max="100" />

      <div class="lightbar-fields-container"></div>
      <div class="camera-options-panel" style="display:inline-block;">
        <select class="camera-select" style=""></select>
        <div id="fov-camera-bar">
          <div class="camera-slider-label">FOV</div>
          <input class="camera-select-range-fov-slider" type="range" step=".01" min="-1" max="2.5" value=".8" />
        </div>
        <div style="display:inline-block;">
          <div class="camera-slider-label"><i class="material-icons" style="transform:rotate(90deg)">straighten</i></div>
          <input class="camera-select-range-height-slider" type="range" step=".25" min="-15" max="40" />
        </div>
        <br>
        <div style="display:inline-block;">
          <div class="camera-slider-label"><i class="material-icons">straighten</i></div>
          <input class="camera-select-range-slider" type="range" step="any" min="1" max="300" />
        </div>
        <div class="fields-container" style="float:left"></div>
        <div id="extra-options-camera-area"></div>
      </div>
    </div>
  </div>`;
  }
  _headerTemplate() {
    return `<div id="profile-header-panel">
  <select id="profile_current_role">
    <option>Employee</option>
    <option>Contractor</option>
    <option>Manager</option>
    <option>Owner</option>
    <option>Administrator</option>
  </select>
  &nbsp;
  <span class="user-name"></span>
  &nbsp;
  <button id="sign-out-button" style="font-size:1.1em;" class="btn-sb-icon"><i class="material-icons">account_box</i> Sign out </button>
</div>
<button id="profile_description_panel_btn" style="float:right;" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">person</i></button>
<select id="view_layout_select" style="float:right;">
  <option>Full</option>
  <option>Top</option>
  <option>Left</option>
  <option>Bottom</option>
  <option>Right</option>
  <option>None</option>
</select>
<div id="record_field_list">
  <form autocomplete="off" onsubmit="return false;"></form>
</div>`;
  }
  initHeader() {
    let div = document.createElement('div');
    div.classList.add('header-wrapper');
    div.innerHTML = this._headerTemplate();

    this.canvasWrapper.insertBefore(div, this.canvasWrapper.firstChild);
    this.signOutBtn = document.querySelector('#sign-out-button');
    if (this.signOutBtn)
      this.signOutBtn.addEventListener('click', e => gAPPP.a.signOut(), false);

    this.view_layout_select = document.getElementById('view_layout_select');
    this.view_layout_select.addEventListener('change', e => {
      this.layoutMode = this.view_layout_select.value;
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'formLayoutMode',
        newValue: this.layoutMode
      }]).then(() => {
        setTimeout(() => location.reload(), 1);
      })
    });
    this.layoutMode = gAPPP.a.profile.formLayoutMode;
    this.view_layout_select.value = this.layoutMode;
  }
  initFields() {
    if (!this.tag)
      return;

    this.fields = sDataDefinition.bindingFieldsCloned(this.tag);
    this.fireSet = gAPPP.a.modelSets[this.tag];
    this.fireFields = null;
    this.uiJSON = 'N/A';
    this.fieldsContainer = this.dialog.querySelector('.fields-container');
    this.dataViewContainer = this.fieldsContainer;

    if (this.fields) {
      this.fireFields = new cPanelData(this.fields, this.fieldsContainer, this);
      this.fireFields.updateContextObject = true;
      this.fireSet.childListeners.push((values, type, fireData) => this.fireFields._handleDataChange(values, type, fireData));
    }
/*
    this.okBtn = this.dialog.querySelector('.save-details');
    this.cancelBtn = this.dialog.querySelector('.close-details');
    this.progressBar = this.dialog.querySelector('.popup-progress-bar');
    this.okBtn = this.dialog.querySelector('.save-details');
    this.rotateBtn = this.dialog.querySelector('.rotate-details');
    this.deleteBtn = this.dialog.querySelector('.delete-item');
    this.popupButtons = this.dialog.querySelector('.popup-buttons');

    if (this.cancelBtn)
      this.cancelBtn.addEventListener('click', () => this.close(), false);
    if (this.okBtn)
      this.okBtn.addEventListener('click', () => this.save(), false);
    if (this.rotateBtn)
      this.rotateBtn.addEventListener('click', () => this._rotateView(), false);
    if (this.deleteBtn)
      this.deleteBtn.addEventListener('click', () => this._delete(), false);

    this.dialog.addEventListener('close', e => this.close());
*/
  }
}
