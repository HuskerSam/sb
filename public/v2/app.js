import cWebApplication from "/lib/firestoreapp.js";

export class cApplication extends cWebApplication {
  constructor() {
    super();

    this.loadPickerData();
//    this.a.signInAnon();
  }
  async mainUpdateUI() {
    await super.mainUpdateUI();
    this.canvasHelper.initExtraOptions();

    this.userProfileName = this.dialog.querySelector('.user-profile-info');
    this.userprofileimage = this.dialog.querySelector('.user-profile-image');
    if (this.a.currentUser.isAnonymous)
      this.userProfileName.innerHTML = 'Anonymous User';
    else {
      this.userProfileName.innerHTML = this.a.currentUser.email;
      this.userprofileimage.setAttribute('src', this.a.currentUser.photoURL);
    }

  //  this.refreshProjectList();

  //  this.profilePanelRegister();
  }
  splitLayoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;flex-direction:column;">
      <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
      <div id="main-view-wrapper" class="app-collapsed">
        <div class="form_canvas_wrapper"></div>
        <div class="form_panel_view_dom">
          <div id="profile-header-panel" class="app-panel">${this.profilePanelTemplate()}</div>
          <div class="header_wrapper">
            <div class="header_bar_top_row">
              <button id="profile_description_panel_btn" style="float:right;"><i class="material-icons">settings</i></button>
              <select id="workspaces-select"></select>
              <button class="workspace_show_home_btn"><i class="material-icons">home</i></button>
              <button class="asset_show_home_btn"><i class="material-icons">library_books</i></button>
              <button class="expand_all_global_btn"><i class="material-icons">unfold_more</i></button>
              <button class="open_workspace_new_window"><i class="material-icons">open_in_new</i></button>
              <div style="clear:both;"></div>
            </div>
            <select class="dataview_record_tag">
              <option value="" selected>Workspace</option>
              <option value="block">Block</option>
              <option value="shape">Shape</option>
              <option value="mesh">Mesh</option>
              <option value="material">Material</option>
              <option value="texture">Texture</option>
            </select>
            <select class="dataview_record_key"></select>
            <button class="add-asset-button btn-sb-icon"><i class="material-icons">add</i></button>
            <button class="workspace_regenerate_layout_changes"><i class="material-icons">gavel</i></button>
            <button class="workspace_show_layout_positions"><i class="material-icons">grid_on</i></button>
            <button class="workspace_display_layout_new_window"><i class="material-icons">shop</i></button>
            <button class="delete-asset-button"><i class="material-icons">delete</i></button>
            <button class="view-asset-button"><i class="material-icons">animation</i></button>
            <button class="snapshot-asset-button"><i class="material-icons">add_photo_alternate</i></button>
            <div class="block_child_details_block">
              <select class="main-band-children-select" style="display:none;"></select>
              <button class="main-band-delete-child"><i class="material-icons">link_off</i></button>
              <button class="main-band-add-child"><i class="material-icons">link</i></button>
              <div class="main-band-sub-view-picker app-control">
                <button class="block_child_detail_view_btn app-inverted"><i class="material-icons">details</i></button>
                <button class="block_child_frames_view_btn"><i class="material-icons">dehaze</i></button>
                <button class="block_child_import_view_btn"><i class="material-icons">import_export</i></button>
              </div>
              <button class="add_frame_button" style="display:none;"><i class="material-icons">playlist_add</i></button>
              <div style="clear:both;"></div>
              <div class="child_band_picker_expanded"></div>
            </div>
          </div>
          <div class="data-view-container app-border">
          </div>
        </div>
      </div>
    </div>`;
  }
  __dataviewTemplate() {
    return `<div class="asset-fields-container"></div>
      <div class="frames-panel"><div class="no-frames"></div></div>
      <div class="node-details-panel">
        <div class="cblock-child-details-panel"></div>
        <div class="scene-fields-panel"></div>
      </div>
      <div class="export-frames-details-panel">
        <div>
          <button class="btn-sb-icon refresh-export-json-button">Fetch JSON</button>
          &nbsp;
          <button class="btn-sb-icon refresh-export-frames-button">Fetch Frames</button>
          &nbsp;
          <button class="btn-sb-icon import-frames-button">Import Frames</button>
        </div>
        <textarea class="frames-textarea-export" rows="1" cols="6"></textarea>
      </div>`;
  }
}
