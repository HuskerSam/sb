'use strict';
class gApplication extends gAppSuper {
  constructor() {
    super();
    document.addEventListener("keyup", e => {
      if (e.keyCode === 27) {
        if (this.mV)
          this.mV.closeOpenPanels();
      }
    });
    this.loadDataLists('sbimageslist').then(() => {});
    this.loadDataLists('sbmesheslist').then(() => {});
    this.loadDataLists('skyboxlist').then(() => {});
    this.loadDataLists('fontfamilydatalist').then(() => {});
  }
  loadDataLists(name) {
    return fetch(`/global/${name}.json`)
      .then(rrr => rrr.json())
      .then(json => {
        let list = document.getElementById(name);
        if (!list) {
          list = document.createElement('datalist');
          list.setAttribute('id', name);
          document.body.appendChild(list);
        }
        let outHtml = '';
        for (let c = 0, l = json.length; c < l; c++)
          outHtml += `<option>${json[c]}</option>`
        list.innerHTML = outHtml;
      });
  }
  _initAuthUI() {
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('eXtended Reality Grafter');
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
    this.updateAppLayout();
    this.__initFormHandlers();
  }
  __initFormHandlers() {
    document.querySelector('#sign-in-button').addEventListener('click', e => gAPPP.a.signIn(), false);
    this.emailBtn = document.querySelector('#sign-in-email-button');
    this.emailBtn.addEventListener('click', e => {
      let email = document.querySelector('#sign-in-by-email-link').value;
      gAPPP.a.signInByEmail(email);
      this.emailBtn.innerHTML = 'Email Sent';
      setTimeout(() => this.emailBtn.innerHTML = 'Send Link', 5000);
    }, false);
  }
  _fullScreenPageLayout() {
    return `<div id="firebase-app-main-page" style="display:none;">
    <div id="renderLoadingCanvas" style="display:none;"><br><br>LOADING...</div>
    <div class="popup-canvas-wrapper main-canvas-wrapper"></div>
    <div style="display:none;position:absolute;top:0;right:.25em;z-index:1000;">
      <button id="toggle-all-toolbands-down" class="btn-sb-icon"><i class="material-icons doubled-up-first">expand_more</i><i class="material-icons doubled-up-second">expand_more</i></button>
      <button id="toggle-all-toolbands" class="btn-sb-icon"><i class="material-icons doubled-up-first">expand_less</i><i class="material-icons doubled-up-second">expand_less</i></button>
    </div>
    <a id="publish-link-url" target="_blank">Publish</a>
    <button id="help-button-on-user-panel" class="btn-sb-icon"><i class="material-icons">help</i></button>

    <div id="sb-floating-toolbar-expanded">
    </div>

    <button class="btn-sb-icon" id="sb-floating-toolbar-import-btn"><i class="material-icons">import_export</i></button>
    <button class="btn-sb-icon" id="sb-floating-toolbar-create-btn"><i class="material-icons">add</i></button>
    <button id="workspace-settings-button" class="btn-sb-icon"><i class="material-icons">group</i></button>
    <button id="workspace-gig-view-button" class="btn-sb-icon"><i class="material-icons">assignment</i></button>
    <div id="gig-options-panel" style="display:none;white-space:nowrap;">
      <div class="fields-container" style="clear:both;"></div>
      <div class="mdl-tabs mdl-js-tabs mdl-js-ripple-effect" style="flex:1;">
        <div class="mdl-tabs__tab-bar">
          <a href="#ui-tracking-panel" id="ui-tracking-tab" class="mdl-tabs__tab is-active">Tracking</a>
          <a href="#ui-projects-panel" id="ui-project-tab" class="mdl-tabs__tab">Projects</a>
          <a href="#ui-scene-panel" id="ui-scene-tab" class="mdl-tabs__tab">Grafters</a>
          <a href="#ui-assets-panel" id="ui-asset-tab" class="mdl-tabs__tab">Account</a>
          <div class="tab-item-wrapper" style="flex:1">
            <span style="float:right;margin:.25em;">
              Weekly: <b>$ 450</b>
              Available: <b>$ 2320</b>
              Total: <b>$ 3430</b>
              <br>
              Pending <b>$ -250</b>
              Queued <b>$ -800</b>
              Incomplete <b>$ 500</b>
            </span>
            <span style="float:right;">
              <input style="width:8em;" placeholder="Search..." />
              <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">keyboard_voice</i></button>
            </span>
          </div>
        </div>
        <button id="changes_commit_header" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary" style="display:none;"><i class="material-icons">save</i></button>
        <input type="file" class="csv-import-file" style="display:none;" />
        <div id="ui-assets-panel" class="mdl-tabs__panel"></div>
        <div id="ui-scene-panel" class="mdl-tabs__panel"></div>
        <div id='ui-project-panel' class="mdl-tabs__panel is-active">
          <div style="height:100%;width:100%;" id="project_tab_table"></div>
        </div>
        <div id="ui-review-panel" class="mdl-tabs__panel"></div>
        <div id="ui-training-panel" class="mdl-tabs__panel" style="flex:1">
          <textarea style="width:100%;height:100%;">
          </textarea>
        </div>
      </div>
    </div>

    <div id="user-profile-panel" style="display:none;white-space:nowrap;">
      <div>
        <label><span>Workspace </span><select id="workspaces-select"></select></label>
        <button id="remove-workspace-button" class="btn-sb-icon" style="font-size:1.2em;"><i class="material-icons">delete</i></button>
        <br>
        <label><span>Name </span><input id="edit-workspace-name" /></label><label><span> Z Code </span><input id="edit-workspace-code" style="width:5em;" /></label>
        <br>
        <label><span>New Workspace </span><input id="new-workspace-name" /></label><label><span> Z Code </span><input id="new-workspace-code" style="width:5em;" /></label>
        <button id="add-workspace-button" class="btn-sb-icon" style="font-size:1.2em;"><i class="material-icons">add</i></button>
        </label>
      </div>
      <div class="user-info"></div>
      <button id="user-profile-dialog-reset-button" style="font-size:1.1em;" class="btn-sb-icon"><i class="material-icons">account_circle</i> Reset Profile </button>
      <button id="sign-out-button" style="font-size:1.1em;" class="btn-sb-icon"><i class="material-icons">account_box</i> Sign out </button>
      <div class="fields-container" style="clear:both;"></div>
    </div>
    <div id="import-export-panel-main-view" style="display:none;">
      <div style="float:left;text-align:center;">
        <label>Element <select class="fetch-element-type">
          <option>Block</option>
          <option>Mesh</option>
          <option>Shape</option>
          <option>Material</option>
          <option>Texture</option>
        </select></label>
        <br>
        <label>Title <input class="fetch-element-name" /></label>
        <br>
        <button class="btn-sb-icon refresh-button">Fetch</button>
        <br>
        <br>
        <br>
        <button class="btn-sb-icon import-button">Import Text</button>
        <button class="btn-sb-icon import-meshes-button">Import CSV</button>
        <input type="file" class="meshes-import-file" style="display:none;" />
      </div>
      <textarea class="element-textarea-export" rows="6" cols="6"></textarea>
      <div style="clear:both"></div>
      <div class="fields-container" style="clear:both;"></div>
    </div>
    <div class="add-item-panel" style="display:none;text-align:right;">
      <div class="texture-add-options" style="display:none">
        <select class="texture-type-select">
          <option>Upload</option>
          <option>Path</option>
        </select>
        <input type="file" class="file-upload-texture" />
        <label class="texture-path-label"><span>Path</span><input type="text" style="width:17em;" class="text-path-texture" list="sbimageslist" /></label>
      </div>
      <div class="material-add-options" style="display:none;">
        <label><input type="checkbox" class="diffuse-color-checkbox" checked />Diffuse</label>
        <label><input type="checkbox" class="ambient-color-checkbox" checked />Ambient</label>
        <label><input type="checkbox" class="emissive-color-checkbox" />Emissive</label>
        <label><input type="checkbox" class="specular-color-checkbox" />Specular</label>
        <br>
        <label>Color <input style="width:12em;" class="material-color-add" type="text" value="1,.5,0" /></label>
        <input type="color" class="material-color-add-colorinput" />
        <br>
        <label><span>Texture</span><input type="text" style="width:15em;" class="texture-picker-select" list="texturedatatitlelookuplist" /></label>
      </div>
      <div class="block-add-options" style="display:none">
        <div class="scene-empty-block-add-options">
          <label><span>W</span><input type="text" class="block-box-width" value="" /></label>
          <label><span>H</span><input type="text" class="block-box-height" value="" /></label>
          <label><span>D</span><input type="text" class="block-box-depth" value="" /></label>
        </div>

        <div class="connector-line-block-add-options" style="display:none;">
          <label><span>Length</span><input type="text" class="line-length" value="10" /></label>
          <label><span>Diameter</span><input type="text" class="line-diameter" value=".5" /></label>
          <label><span>Sides</span><input type="text" class="line-sides" value="" /></label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="line-material" list="materialdatatitlelookuplist" /></label>
          <br>
          <label>
            <span>Point</span>
            <select class="point-shape">
              <option>None</option>
              <option>Cylinder</option>
              <option selected>Cone</option>
              <option>Ellipsoid</option>
            </select>
          </label>
          <br>
          <label><span>Length</span><input type="text" class="point-length" value="1" /></label>
          <label><span>Diameter</span><input type="text" class="point-diameter" value="2" /></label>
          <label><span>Sides</span><input type="text" class="point-sides" value="" /></label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="point-material" list="materialdatatitlelookuplist" /></label>
          <br>
          <label>
            <span>Tail Shape</span>
            <select class="tail-shape">
              <option>None</option>
              <option>Cylinder</option>
              <option>Cone</option>
              <option selected>Ellipsoid</option>
            </select>
          </label>
          <br>
          <label><span>Length</span><input type="text" class="tail-length" value="1" /></label>
          <label><span>Diameter</span><input type="text" class="tail-diameter" value="1" /></label>
          <label><span>Sides</span><input type="text" class="tail-sides" value="" /></label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="tail-material" list="materialdatatitlelookuplist" /></label>
        </div>
        <div class="store-item-block-add-options" style="text-align:right;display:none;">
          <b>Highlight Details</b>
          <br>
          <label><span>Description</span><textarea style="width:15em;" rows="2" cols="1"  class="store-item-block-description"></textarea></label>
          <br>
          <label><span>Image</span><input style="width:15em;"  class="store-item-block-description-image" /></label>
          <br>
          <label><span>Video</span><input style="width:15em;"  class="store-item-block-description-video" /></label>
          <br>
          <b>Item Details</b>
          <br>
          <label><span>Price</span><input type="text" style="width:7em;"  class="store-item-block-price" value="$1.00" /></label>
          &nbsp;
          <label><span>Name</span><input type="text" style="width:10em;"  class="store-item-block-name" value="" /></label>
          <br>
          <label>
            <span></span>
            <select class="store-item-block-type-options">
              <option selected>Block</option>
              <option>Mesh</option>
              <option>Shape</option>
            </select>
          </label>
          <label><span></span><input type="text" style="width:15em;"  class="store-item-block-block" list="blockdatatitlelookuplist" /></label>

          <!--label><span></span><input type="text" style="width:15em;"  class="store-item-block-mesh" list="sbmesheslist" /></label>
          <br>
          <label><span></span><input type="text" style="width:15em;"  class="store-item-block-shape" list="shapedatatitlelookuplist" /></label>
          <br-->
          <br>
          <label><span>Location</span><input type="text" style="width:6em;" class="store-item-block-location" value="0,0,0" /></label>
          &nbsp;
          <label><span>Rotation</span><input type="text" style="width:8em;" class="store-item-block-rotation" value="" /></label>
          <br>
          <label><span>Parent Block</span><input type="text" style="width:15em;"  class="store-item-parent-block" list="blockdatatitlelookuplist"  /></label>
        </div>
        <div class="animated-line-block-add-options">
          <label><span>Dashes</span><input type="text" class="animated-line-dash-count" value="5" /></label>
          <label><span>Run Time</span><input type="text" class="animated-run-time" value="1500" /></label>
          <br>
          <label>
            <span>Shape</span>
            <select class="block-add-dash-shape-type-options">
              <option>Cylinder</option>
              <option selected>Cone</option>
              <option>Ellipsoid</option>
            </select>
          </label>
          <label><span>Sides</span><input type="text" class="dash-shape-sides" value="" /></label>
          <label><span>Length</span><input type="text" class="dash-box-depth" value=".5" /></label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="dash-shape-material-picker-select" list="materialdatatitlelookuplist" /></label>
          <br>
          <label><span>W</span><input type="text" class="block-box-width" value="1" /></label>
          <label><span>H</span><input type="text" class="block-box-height" value="2" /></label>
          <label><span>Len</span><input type="text" class="block-box-depth" value="10" /></label>
        </div>
        <div class="shape-and-text-block-options">
          <label><span>Line 1</span><input type="text" style="width:15em;" class="block-box-text" value="Block Text" /></label>
          <br>
          <label><span>Line 2</span><input type="text" style="width:15em;" class="block-box-text-line2" value="" /></label>
          <br>
          <label><span>Font</span><input class="font-family-block-add" list="fontfamilydatalist" /></label>
          <label><span>Depth</span><input type="text" class="block-text-depth" value=".1" /></label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="block-material-picker-select" list="materialdatatitlelookuplist" /></label>
          <hr>

          <label><span>Shape</span><select class="block-add-shape-type-options"><option>Cube</option><option>Box</option><option selected>Cone</option>
            <option>Cylinder</option><option>Sphere</option><option>Ellipsoid</option></select></label>
          <label class="block-shape-add-label"><span>Divs</span><input type="text" class="block-add-shape-sides" /></label>
          <label class="block-stretch-along-width-label"><input type="checkbox" class="shape-stretch-checkbox" />Horizontal</label>
          <br>
          <label><span>Material</span><input type="text" style="width:15em;" class="block-shapematerial-picker-select" list="materialdatatitlelookuplist" /></label>
          <br>
          <label><span>W</span><input type="text" class="block-box-width" value="4" /></label>
          <label><span>H</span><input type="text" class="block-box-height" value="1" /></label>
          <label><span>D</span><input type="text" class="block-box-depth" value="1" /></label>
        </div>
        <div class="scene-block-add-options" style="text-align:center;">
          <label><input type="checkbox" class="block-add-hemi-light" /><span>Add Hemispheric Light</span></label>
          <hr>
          <label><input type="checkbox" class="block-generate-ground" /><span>Create Ground Material</span></label>
          <br>
          <label><span>Image Path</span><input type="text" style="width:15em;" class="block-scene-cloudfile-picker-input" list="sbimageslist" /></label>
          <br>
          <img class="cloud-file-ground-preview" crossorigin="anonymous" style="width:5em;height:5em;display:none;">
          <hr>
          <label><span>Skybox</span><input type="text" style="width:15em;" class="block-skybox-picker-select" list="skyboxlist" /></label>
          <div class="skybox-preview-images"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"></div>
          <br>
          <label><span>W</span><input type="text" class="block-box-width" value="50" /></label>
          <label><span>H</span><input type="text" class="block-box-height" value="16" /></label>
          <label><span>D</span><input type="text" class="block-box-depth" value="50" /></label>
        </div>
        <select class="block-type-select">
         <option>Empty</option>
         <option>Scene</option>
         <option selected>Text and Shape</option>
         <option>Animated Line</option>
         <option>Connector Line</option>
         <option>Store Item</option>
        </select>
      </div>
      <div class="mesh-add-options" style="display:none">
        <select class="mesh-type-select">
            <option>Upload</option>
            <option>Path</option>
          </select>
        <input type="file" class="mesh-file-upload" />
        <label class="mesh-path-label"><span>Path</span><input type="text" style="width:17em;" class="text-path-mesh" list="sbmesheslist" /></label>
        <br>
        <label><span>Material</span><input type="text" style="width:15em;" class="mesh-material-picker-select" list="materialdatatitlelookuplist" /></label>
      </div>
      <div class="shape-add-options" style="display:none;">
        <div class="create-sphere-options">
          <label><span>Diameter</span><input type="text" class="sphere-diameter" /></label>
        </div>
        <div class="create-2d-text-plane">
          <label><span>Text</span><input class="text-2d-line-1" value="Text Line" /></label>
          <br>
          <label><span>Line 2</span><input class="text-2d-line-2" value="" /></label>
          <br>
          <label><span>Line 3</span><input class="text-2d-line-3" value="" /></label>
          <br>
          <label><span>Line 4</span><input class="text-2d-line-4" value="" /></label>
          <br>
          <label><span>Font</span><input class="font-family-2d-add" list="fontfamilydatalist" /></label>
          <br>
          <label><span>Color</span><input class="font-2d-color" color="0,0,0" /></label>
          <br>
          <label><span>Text Size</span><input class="font-2d-text-size" value="100" /></label>
          <br>
          <label><span>Plane Size</span><input class="font-2d-plane-size" value="4" /></label>
        </div>
        <div class="create-cylinder-options">
          <label><span>Diameter</span><input type="text" class="cylinder-diameter"></label>
          <label><span>Height</span><input type="text" class="cylinder-height"></label>
        </div>
        <div class="create-text-options">
          <label><span>Text</span><input class="text-shape-add" value="3D Text" /></label>
          <br>
          <label><span>Font</span><input class="font-family-shape-add" list="fontfamilydatalist" /></label>
        </div>
        <label><span>Material</span><input type="text" style="width:15em;" class="shape-material-picker-select" list="materialdatatitlelookuplist" /></label>
        <div class="create-box-options">
          <label><span>Width</span><input type="text" class="box-width" /></label>
          <label><span>Height</span><input type="text" class="box-height" /></label>
          <label><span>Depth</span><input type="text" class="box-depth" /></label>
        </div>
        <br>
        <select class="shape-type-select">
         <option>2D Text Plane</option>
         <option selected>3D Text</option>
         <option>Box</option>
         <option>Sphere</option>
         <option>Cylinder</option>
        </select>
      </div>
      <div class="fields-container" style="clear:both;"></div>
      <hr>
      <div class="block-type-radio-wrapper" style="white-space:nowrap;font-weight:bold;padding:.25em;">
        <label><input type="radio" name="elementtyperadio" checked value="Block"><span>Block</span></label>
        <label><input type="radio" name="elementtyperadio" value="Mesh"><span>Mesh</span></label>
        <label><input type="radio" name="elementtyperadio" value="Shape"><span>Shape</span></label>
        <label><input type="radio" name="elementtyperadio" value="Material"><span>Material</span></label>
        <label><input type="radio" name="elementtyperadio" value="Texture"><span>Texture</span></label>
      </div>
      <label><span>Title</span><input style="width:20em;" class="add-item-name" /></label>
      <button class="add-button btn-sb-icon" style="background:rgb(0,127,0);color:white;"><i class="material-icons">add_circle</i></button>
      <div class="creating-message" style="display:none;background:silver;padding: .25em;">Creating...</div>
    </div>
  </div>`;
  }
}
