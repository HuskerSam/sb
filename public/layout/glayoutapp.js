class gLayoutApp extends gInstanceSuper {
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

      this.mV = new cViewLayout();
      this._updateApplicationStyle();
    };
  }
  _updateApplicationStyle() {

  }
  _loginPageTemplate(title = `Dynamic Reality App`) {
    return `<div id="firebase-app-login-page" style="display:none;">Loading...</div>`;
  }
  _layoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;flex-direction:column;">
  <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
  <div id="main-view-wrapper">
    <div class="popup-canvas-wrapper main-canvas-wrapper"></div>

    <div class="inner-split-view" style="display:none;">
      <div id="workspace-add-panel">
        <button id="workspace-add-panel-close-button" class="button-expanded mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">cancel</i></button>
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width:15em;">
          <input class="mdl-textfield__input" type="text" id="new-workspace-name">
          <label class="mdl-textfield__label" for="new-workspace-name">New Animation Name</label>
        </div>
        <button id="add_workspace_button_template" class="mdl-button mdl-js-button mdl-button--fab mdl-button--primary"><i class="material-icons">add</i></button>
        <select id="remove_workspace_select_template">
          <option>Delete Animation</option>
        </select>
        <br>
        <div class="add-panel-item">
          <div>ASSETS</div>
          <select id="add_animation_asset_choice">
            <option>Current</option>
            <option>Animation</option>
            <option>Template</option>
            <option>Empty</option>
          </select>
          <select id="add_animation_asset_animation" style="display:none;"></select>
          <select id="add_animation_asset_template" style="display:none;">
            <option>select template</option>
          </select>
        </div>
        <div class="add-panel-item">
          <div>LAYOUT</div>
          <select id="add_animation_scene_choice">
            <option>Current</option>
            <option>Animation</option>
            <option>Template</option>
            <option>Empty</option>
          </select>
          <select id="add_animation_scene_animation" style="display:none;"></select>
          <select id="add_animation_scene_template" style="display:none;">
            <option>select template</option>
          </select>
        </div>
        <div class="add-panel-item">
          <div>PRODUCTS</div>
          <select id="add_animation_product_choice">
            <option>Empty</option>
            <option>Current</option>
            <option>Animation</option>
            <option>Template</option>
          </select>
          <select id="add_animation_product_animation" style="display:none;"></select>
          <select id="add_animation_product_template" style="display:none;">
            <option>select template</option>
          </select>
        </div>
      </div>
      <div class="mdl-tabs mdl-js-tabs mdl-js-ripple-effect" style="flex:1;">
        <div class="mdl-tabs__tab-bar">
          <div class="tab-item-wrapper">
            <button id="add-workspace-button-expand" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">camera_roll</i></button>
            <select id="workspaces-select"></select>
            <button id="import_products_csv_expand_btn" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">extension</i></button>
            <button id="scene_data_expand_btn" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">movie_filter</i></button>
          </div>
          <a href="#ui-products-panel" id="ui-product-tab" class="mdl-tabs__tab is-active">Products</a>
          <a href="#ui-scene-panel" id="ui-scene-tab" class="mdl-tabs__tab">Layout</a>
          <a href="#ui-assets-panel" id="ui-asset-tab" class="mdl-tabs__tab">Assets</a>
        </div>
        <button id="changes_commit_header" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary" style="display:none;"><i class="material-icons">save</i></button>
        <input type="file" class="csv-import-file" style="display:none;" />
        <div id="ui-assets-panel" class="mdl-tabs__panel" style="width:100%;">
          <div id="import_asset_options" class="import-export-panel">
            <button class="import-export-inpanel-button mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">cancel</i></button>
            <select id="import_asset_templates_select"></select>
            &nbsp;
            <select id="import_asset_workspaces_select"></select>
            &nbsp;
            <button id="import_asset_csv_btn" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">cloud_upload</i></button>
            &nbsp;
            <button id="download_asset_csv" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">get_app</i></button>
          </div>
          <div style="flex:1;width:100%;" id="asset_tab_table">
          </div>
        </div>
        <div id="ui-scene-panel" class="mdl-tabs__panel">
          <div id="import_scene_options" class="import-export-panel">
            <button class="import-export-inpanel-button mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">cancel</i></button>
            <select id="import_scene_templates_select"></select>
            &nbsp;
            <select id="import_scene_workspaces_select"></select>
            &nbsp;
            <button id="import_scene_csv_btn" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">cloud_upload</i></button>
            &nbsp;
            <button id="download_scene_csv" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">get_app</i></button>
          </div>
          <div style="flex:1;width:100%;" id="scene_tab_table">
          </div>
        </div>
        <div id='ui-products-panel' class="mdl-tabs__panel is-active">
          <div id="import_product_options" class="import-export-panel">
            <button class="import-export-inpanel-button mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary button-expanded"><i class="material-icons">cancel</i></button>
            <select id="import_product_templates_select"></select>
            &nbsp;
            <select id="import_product_workspaces_select"></select>
            &nbsp;
            <button id="import_product_csv_btn" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">cloud_upload</i></button>
            &nbsp;
            <button id="download_product_csv" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">get_app</i></button>
          </div>
          <div style="display:flex;flex-direction:row;flex:1;">
            <div id="record_field_list">
              <form autocomplete="off" onsubmit="return false;"></form>
            </div>
            <div id="product_tab_table"></div>
          </div>
        </div>
      </div>
      <div id="scene_options_panel">
        <select id="scene_options_list" size="3"></select>
        <div id="scene_options_edit_fields"></div>
      </div>

    </div>
  </div>
  <datalist id="blocklist"></datalist>
  <datalist id="assetlist">
    <option>product</option>
    <option>message</option>
  </datalist>
</div>`;
  }
  _initAuthUI() {
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('eXtended Reality Grafter');
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
  }
}
