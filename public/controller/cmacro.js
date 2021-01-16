class cMacro {
  constructor(panel, tag, app, addonmode = false) {
    this.app = app;
    this.panel = panel;
    this.tag = tag;
    this.addonmode = addonmode;

    this.cdnPrefix = this.app.cdnPrefix;
    this.webFonts = [
      'Work Sans',
      'IBM Plex Sans',
      'Space Mono',
      'Libre Franklin',
      'Rubik',
      'Cormorant',
      'Fira Sans',
      'Eczar',
      'Alegreya Sans',
      'Alegreya',
      'Chivo',
      'Lora',
      'Source Sans Pro',
      'Source Serif Pro',
      'Roboto',
      'Roboto Slab',
      'BioRhyme',
      'Poppins',
      'Achivo Narrow',
      'Libre Baskerville',
      'Playfair Display',
      'Karla',
      'Montserrat',
      'Proza Libre',
      'Spectral',
      'Domine',
      'Crimson Text',
      'Inknut Antiqua',
      'PT Sans',
      'PT Serif',
      'Lato',
      'Cardo',
      'Newton',
      'Open Sans',
      'Inconsolata',
      'Cabin',
      'Anonymous Pro',
      'Raleway',
      'Arvo',
      'Merriweather'
    ];
    if (!tag)
      return this.panel.innerHTML = '';

    let base = '';
    if (tag !== 'workspace')
      base = this.baseTemplate();

    let t = '';
    if (this[tag + 'Template'])
      t = this[tag + 'Template']();
    panel.innerHTML = base + t;
    if (tag !== 'workspace') {
      if (!this.addonmode) {
        this.panelCreateBtn = this.panel.querySelector('.add-button');
        this.panelCreateBtn.addEventListener('click', e => this.createItem());
        this.panelCreateBtn2 = this.panel.querySelector('.add-newwindow-button');
        this.panelCreateBtn2.addEventListener('click', e => this.createItem(true));
      }
      this.panelInput = this.panel.querySelector('.add_wizard_item_name');
      this.createMesage = this.panel.querySelector('.creating-message');
    }

    if (this[tag + 'Register'])
      this[tag + 'Register']();

    this.getItemName();
    this.panelInput.addEventListener('input', e => {
      this.panelInputUpdated = true;
      this[tag + 'UpdateCSV']()
    });

    this.defaultParent = null;
    this.addCallback = null;
  }
  updateFontField(textDom) {
    textDom.style.fontFamily = textDom.value;
  }
  baseTemplate() {
    let template = `<div class="block_wizard_add_name_div" style="flex:1;display:flex;flex-direction:row;padding-top:2px;">
      <label class="add_template_name_label" style="padding:2px 4px;"><span style="font-size:.75em;">Name</span>
     </label><input class="add_wizard_item_name" type="text" style="width:11.5em;" value="name" />`;
    if (!this.addonmode)
      template += `<button class="add-button btn-sb-icon"><i class="material-icons">add</i></button>
        <button class="add-newwindow-button btn-sb-icon"><i class="material-icons">open_in_new</i></button>
        <br class="new_button_break">`;

    template += `<div class="creating-message" style="display:none;background:silver;padding: .25em;">Creating...</div></div>`;

    return template;
  }
  _addParentTemplate(hideVisibility) {
    return `<table class="wizard_field_container wizard_parent_details" style="display:none">
      <tr>
        <td>Parent Block</td>
        <td><input type="text" list="blockdatatitlelookuplist" class="wizard_parent" style="width:100%" value="::scene::" /></td>
        <td></td>
      </tr>
      <tr style="${hideVisibility ? "display:none" : "" }">
        <td>Visibility</td>
        <td colspan="2"><input type="text" class="wizard_visibility" style="width:6em" value="" /></td>
      </tr>
      <tr>
        <td colspan="3">
          <div style="display:flex;flex-direction:row">
            <span>Position X</span><input type="text" class="wizard_x" />
            <span>Y</span><input type="text" class="wizard_y" />
            <span>Z</span><input type="text" class="wizard_z" />
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="3">
          <div style="display:flex;flex-direction:row">
            <span>Rotate X</span><input type="text" class="wizard_rx" />
            <span>Y</span><input type="text" class="wizard_ry" />
            <span>Z</span><input type="text" class="wizard_rz" />
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="3">
          <div style="display:flex;flex-direction:row">
            <span>Scale X</span><input type="text" class="wizard_sx" />
            <span>Y</span><input type="text" class="wizard_sy" />
            <span>Z</span><input type="text" class="wizard_sz" />
          </div>
        </td>
      </tr>
    </table>`;
  }
  cameraTemplate() {
    return `<div class="shape_wizard_wrapper" style="display:flex;flex-direction:column;">
      <div style="display:flex;flex-direction:row">
        <select class="camera_wizard_type_select" style="margin-bottom: 8px;margin-top:4px;width: 12em;margin-right:.25em;font-size:.9em">
         <option selected>Native Camera</option>
         <option>Product Camera</option>
        </select>
      </div>
      <div style="flex:1;overflow: hidden auto;">
        <table class="wizard_field_container native_camera_table">
          <tr>
            <td>Camera Type</td>
            <td><input data-field="cameratype" type="text" value="ArcRotate" list="camerasourceslist" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Parent</td>
            <td><input data-field="parent" type="text" value="::scene::" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Start X</td>
            <td><input data-field="startx" type="text" value="" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Start Y</td>
            <td><input data-field="starty" type="text" value="" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Start Z</td>
            <td><input data-field="startz" type="text" value="" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Radius</td>
            <td><input data-field="cameraradius" type="text" value="" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Height</td>
            <td><input data-field="cameraheightoffset" type="text" value="" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Aim Target X</td>
            <td><input data-field="cameraaimtargetx" type="text" value="" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Aim Target Y</td>
            <td><input data-field="cameraaimtargety" type="text" value="" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Aim Target Z</td>
            <td><input data-field="cameraaimtargetz" type="text" value="" /></td>
            <td></td>
          </tr>
          <tr>
            <td>FOV</td>
            <td><input data-field="camerafov" type="text" value="" /></td>
            <td></td>
          </tr>
        </table>
        <table class="wizard_field_container product_camera_table" style="display:none;">
          <tr>
            <td>Height Offset</td>
            <td><input data-field="cameraheightoffset" type="text" value="25" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Move Time (ms)</td>
            <td><input data-field="cameramovetime" type="text" value="500" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Radius</td>
            <td><input data-field="cameraradius" type="text" value="25" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Finish Delay (s)</td>
            <td><input data-field="finishdelay" type="text" value="2" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Finish Delay (s)</td>
            <td><input data-field="introtime" type="text" value="1" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Run Length (s)</td>
            <td><input data-field="runlength" type="text" value="60" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Camera Start X</td>
            <td><input data-field="startx" type="text" value="-40" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Camera Start Y</td>
            <td><input data-field="starty" type="text" value="6" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Camera Start Z</td>
            <td><input data-field="startz" type="text" value="9.5" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Camera Rotate Y</td>
            <td><input data-field="startry" type="text" value="-90deg" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Target Start X</td>
            <td><input data-field="x" type="text" value="-50" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Target Start Y</td>
            <td><input data-field="y" type="text" value="5" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Target Start Z</td>
            <td><input data-field="z" type="text" value="0" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Generic Data</td>
            <td><input data-field="genericblockdata" type="text" value="signyoffset|1" /></td>
            <td></td>
          </tr>
        </table>
      </div>
    </div>
    <div class="copy_clipboard_footer">
      <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
      <button class="show_hide_raw_csv" style="flex:0;margin-left:0"><i class="material-icons">view_stream</i></button>
      <button class="show_hide_table_csv" style="flex:0;margin-left:0"><i class="material-icons">view_module</i></button>
      <label><input type="checkbox" checked class="copy_csv_header_clipboard"><span> headers</span></label>
      <br>
      <div class="csv_import_preview"></div>
    </div>`;
  }
  cameraRegister() {
    this.camera_wizard_type_select = this.panel.querySelector('.camera_wizard_type_select');
    this.product_camera_table = this.panel.querySelector('.product_camera_table');
    this.native_camera_table = this.panel.querySelector('.native_camera_table');
    this.camera_wizard_type_select.addEventListener('input', e => {
      if (this.camera_wizard_type_select.selectedIndex === 0) {
        this.native_camera_table.style.display = '';
        this.product_camera_table.style.display = 'none';
      } else {
        this.native_camera_table.style.display = 'none';
        this.product_camera_table.style.display = '';
      }
    });

    this.csv_import_preview = this.panel.querySelector('.csv_import_preview');
    this.copy_csv_to_clipboard = this.panel.querySelector('.copy_csv_to_clipboard');
    this.copy_csv_header_clipboard = this.panel.querySelector('.copy_csv_header_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      let headers = this.copy_csv_header_clipboard.checked;
      cMacro.copyDataToClipboard([this.export_csv], [], headers);
      this.getItemName(true);
    });
    this.show_hide_raw_csv = this.panel.querySelector('.show_hide_raw_csv');
    this.show_hide_raw_csv.addEventListener('click', e => this._updateCSVDisplay(1));
    this.show_hide_table_csv = this.panel.querySelector('.show_hide_table_csv');
    this.show_hide_table_csv.addEventListener('click', e => this._updateCSVDisplay(2));

    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.cameraUpdateCSV()));
    this.panel.querySelectorAll('select').forEach(i => i.addEventListener('input', e => this.cameraUpdateCSV()));
  }
  cameraUpdateCSV() {
    this.newName = this.panelInput.value.trim();
    let cameraTypeIndex = this.camera_wizard_type_select.selectedIndex;
    let csv_row = {
      name: this.newName
    };

    let tr_rows = [];
    if (cameraTypeIndex === 0) {
      tr_rows = this.panel.querySelectorAll('.native_camera_table tr');
      csv_row.asset = 'blockchild';
      csv_row.childtype = 'camera';
    }
    else {
      tr_rows = this.panel.querySelectorAll('.product_camera_table tr');
      csv_row.asset = 'displaycamera';
    }


    tr_rows.forEach(row => {
      let i = row.querySelector('input[type="text"]');
      if (i) {
        csv_row[i.dataset.field] = i.value;
      }
    });

    let r = csv_row;
    let header = this.copy_csv_header_clipboard.checked;
    this.export_csv = r;
    if (r) {
      if (window.Papa) {
        this.csvImportPreviewRaw = Papa.unparse([r], {
          header
        });
        this.csv_import_preview.innerHTML = this.csvImportPreviewRaw;
        if (this.csv_import_shown === 2) {
          this.csv_import_shown = 0;
          this._updateCSVDisplay(2);
        }
      }
    } else
      this.csv_import_preview.innerHTML = new Date();
  }
  frameTemplate() {
    return `<div class="frame_wizard_wrapper" style="display:flex;flex-direction:column;overflow:hidden auto;flex:1">
      <table class="wizard_field_container">
        <tr data-cats="all">
          <td>Block Child Type</td>
          <td>
            <input class="frametype" type="text" list="blockchildtypelist" data-field="childtype">
          </td>
          <td></td>
        </tr>
        <tr data-cats="all">
          <td>Block Child Name</td>
          <td>
            <input data-field="name" type="text" value="">
          </td>
          <td></td>
        </tr>
        <tr data-cats="all">
          <td>Parent Block</td>
          <td>
            <input data-field="parent" type="text" value="::scene::">
          </td>
          <td></td>
        </tr>
        <tr data-cats="all">
          <td>Time (ms)</td>
          <td><input data-field="frametime" type="text" /></td>
          <td></td>
        </tr>
        <tr data-cats="all">
          <td>Order</td>
          <td><input data-field="frameorder" type="text" value="20" /></td>
          <td></td>
        </tr>
        <tr data-cats="mesh,shape">
          <td>Visibility</td>
          <td><input data-field="visibility" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="mesh,shape,block">
          <td>Position X</td>
          <td><input data-field="positionx" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="mesh,shape,block">
          <td>Position Y</td>
          <td><input data-field="positiony" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="mesh,shape,block">
          <td>Position Z</td>
          <td><input data-field="positionz" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="mesh,shape,block">
          <td>Rotation X</td>
          <td><input data-field="rotationx" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="mesh,shape,block">
          <td>Rotation Y</td>
          <td><input data-field="rotationy" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="mesh,shape,block">
          <td>Rotation Z</td>
          <td><input data-field="rotationz" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="mesh,shape,block">
          <td>Scale X</td>
          <td><input data-field="scalingx" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="mesh,shape,block">
          <td>Scale Y</td>
          <td><input data-field="scalingy" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="mesh,shape,block">
          <td>Scale Z</td>
          <td><input data-field="scalingz" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="mesh,shape">
          <td>Diffuse Color</td>
          <td><input data-field="diffusecolor" class="diffusecolor" type="text" value="" /></td>
          <td><input type="color" class="colorpickerraw" data-inputclass="diffusecolor"></td>
        </tr>
        <tr data-cats="mesh,shape">
          <td>Emissive Color</td>
          <td><input data-field="emissivecolor" class="emissivecolor" type="text" value="" /></td>
          <td><input type="color" class="colorpickerraw" data-inputclass="emissivecolor"></td>
        </tr>
        <tr data-cats="mesh,shape">
          <td>Ambient Color</td>
          <td><input data-field="ambientcolor" class="ambientcolor" type="text" value="" /></td>
          <td><input type="color" class="colorpickerraw" data-inputclass="ambientcolor"></td>
        </tr>
        <tr data-cats="mesh,shape">
          <td>Specular Color</td>
          <td><input data-field="specularcolor" class="specularcolor" type="text" value="" /></td>
          <td><input type="color" class="colorpickerraw" data-inputclass="specularcolor"></td>
        </tr>
        <tr data-cats="camera">
          <td>FOV</td>
          <td><input data-field="camerafov" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Origin X</td>
          <td><input data-field="cameraoriginx" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Origin Y</td>
          <td><input data-field="cameraoriginy" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Origin Z</td>
          <td><input data-field="cameraoriginz" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Rotation X</td>
          <td><input data-field="camerarotationx" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Rotation Y</td>
          <td><input data-field="camerarotationy" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Rotation Z</td>
          <td><input data-field="camerarotationz" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Radius</td>
          <td><input data-field="cameraradius" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Height Offset</td>
          <td><input data-field="cameraheightoffset" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Rotation Offset</td>
          <td><input data-field="camerarotationffset" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Acceleration</td>
          <td><input data-field="cameraacceleration" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Max Speed</td>
          <td><input data-field="maxcameraspeed" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Aim Target X</td>
          <td><input data-field="cameraaimtargetx" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Aim Target Y</td>
          <td><input data-field="cameraaimtargety" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="camera">
          <td>Aim Target Z</td>
          <td><input data-field="cameraaimtargetz" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="light">
          <td>Itensity</td>
          <td><input data-field="lightintensity" type="text" value="1" /></td>
          <td></td>
        </tr>
        <tr data-cats="light">
          <td>Origin X</td>
          <td><input data-field="lightoriginx" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="light">
          <td>Origin Y</td>
          <td><input data-field="lightoriginy" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="light">
          <td>Origin Z</td>
          <td><input data-field="lightoriginz" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="light">
          <td>Direction X</td>
          <td><input data-field="lightdirectionx" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="light">
          <td>Direction Y</td>
          <td><input data-field="lightdirectiony" type="text" value="-1" /></td>
          <td></td>
        </tr>
        <tr data-cats="light">
          <td>Direction Z</td>
          <td><input data-field="lightdirectionz" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="light">
          <td>Angle</td>
          <td><input data-field="lightangle" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="light">
          <td>Decay</td>
          <td><input data-field="lightdecay" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="light">
          <td>Diffuse</td>
          <td><input data-field="lightdiffuse" type="text" class="lightdiffuse" value="1,1,1" /></td>
          <td><input type="color" class="colorpickerraw" data-inputclass="lightdiffuse"></td>
        </tr>
        <tr data-cats="light">
          <td>Specular</td>
          <td><input data-field="lightspecular" type="text" class="lightspecular" value="1,1,1" /></td>
          <td><input type="color" class="colorpickerraw" data-inputclass="lightspecular"></td>
        </tr>
        <tr data-cats="light">
          <td>Ground Color</td>
          <td><input data-field="lightgroundcolor" type="text" class="lightgroundcolor" value="0,0,0" /></td>
          <td><input type="color" class="colorpickerraw" data-inputclass="lightgroundcolor"></td>
        </tr>
        <tr data-cats="block">
          <td>Command</td>
          <td><input data-field="framecommand" list="framecommandoptionslist" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="block">
          <td>Field</td>
          <td><input data-field="framecommandfield" list="framecommandfieldslist" type="text" value="" /></td>
          <td></td>
        </tr>
        <tr data-cats="block">
          <td>Value</td>
          <td><input data-field="framecommandvalue" type="text" value="" /></td>
          <td></td>
        </tr>
      </table>
    </div>
    <div class="copy_clipboard_footer">
      <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
      <button class="show_hide_raw_csv" style="flex:0;margin-left:0"><i class="material-icons">view_stream</i></button>
      <button class="show_hide_table_csv" style="flex:0;margin-left:0"><i class="material-icons">view_module</i></button>
      <label><input type="checkbox" checked class="copy_csv_header_clipboard"><span> headers</span></label>
      <label><input type="checkbox" class="copy_csv_excludeempty_clipboard"><span> exclude empty</span></label>
      <br>
      <div class="csv_import_preview"></div>
    </div>`;
  }
  frameRegister() {
    this.frametype = this.panel.querySelector('.frametype');
    this.frametype.addEventListener('input', e => this.frameUpdateFields());
    this.wizard_field_container = this.panel.querySelector('.wizard_field_container');

    this.csv_import_preview = this.panel.querySelector('.csv_import_preview');
    this.copy_csv_to_clipboard = this.panel.querySelector('.copy_csv_to_clipboard');
    this.copy_csv_header_clipboard = this.panel.querySelector('.copy_csv_header_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      let headers = this.copy_csv_header_clipboard.checked;
      cMacro.copyDataToClipboard([this.export_csv], [], headers);
      this.getItemName(true);
    });
    this.show_hide_raw_csv = this.panel.querySelector('.show_hide_raw_csv');
    this.show_hide_raw_csv.addEventListener('click', e => this._updateCSVDisplay(1));
    this.show_hide_table_csv = this.panel.querySelector('.show_hide_table_csv');
    this.show_hide_table_csv.addEventListener('click', e => this._updateCSVDisplay(2));
    this.copy_csv_excludeempty_clipboard = this.panel.querySelector('.copy_csv_excludeempty_clipboard');

    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.frameUpdateCSV()));
    this.panel.querySelectorAll('select').forEach(i => i.addEventListener('input', e => this.frameUpdateCSV()));
    this.panel.querySelectorAll('.colorpickerraw')
      .forEach(i => i.addEventListener('input', e => this.blockColorPickerClick(e, i, '')));

    this.frameUpdateFields();
  }
  frameUpdateFields() {
    let category = this.frametype.value;
    let rows = this.wizard_field_container.querySelectorAll('tr');

    rows.forEach(row => {
      let cats = row.dataset.cats;
      if (!cats)
        cats = '';
      cats = cats.split(',');
      if (cats.indexOf(category) === -1 && cats[0] !== 'all')
        row.style.display = 'none';
      else
        row.style.display = '';
    });

    this.frameUpdateCSV();
  }
  frameUpdateCSV() {
    let category = this.frametype.value;

    let csv_row = {
      name: '',
      parent: '',
      frametime: '',
      frameorder: '',
      asset: 'blockchildframe'
    };

    let tr_rows = this.panel.querySelectorAll('.wizard_field_container tr');
    tr_rows.forEach(row => {
      let cats = row.dataset.cats;
      if (!cats)
        cats = '';
      cats = cats.split(',');
      if (cats.indexOf(category) !== -1 || cats[0] === 'all') {
        let i = row.querySelector('input[type="text"]');
        if (i) {
          let v = i.value;
          if (i.value.indexOf('%') !== -1)
            v = "=\"" + v + "\"";
          csv_row[i.dataset.field] = v;
        }
      }
    });

    let excludeEmpty = this.copy_csv_excludeempty_clipboard.checked;
    let out_row = csv_row;
    if (excludeEmpty) {
      out_row = {};
      for (let key in csv_row)
        if (csv_row[key] !== '')
          out_row[key] = csv_row[key];
    }

    let r = out_row;
    let header = this.copy_csv_header_clipboard.checked;
    this.export_csv = r;
    if (r) {
      if (window.Papa) {
        this.csvImportPreviewRaw = Papa.unparse([r], {
          header
        });
        this.csv_import_preview.innerHTML = this.csvImportPreviewRaw;
        if (this.csv_import_shown === 2) {
          this.csv_import_shown = 0;
          this._updateCSVDisplay(2);
        }
      }
    } else
      this.csv_import_preview.innerHTML = new Date();
  }
  lightTemplate() {
    return `<div class="shape_wizard_wrapper" style="display:flex;flex-direction:column;">
      <div style="flex:1;overflow: hidden auto;">
        <table class="wizard_field_container light_fields_table">
          <tr data-cats="all">
            <td>Light Type</td>
            <td><input data-field="lighttype" class="lighttypeinput" type="text" list="lightsourceslist" /></td>
            <td></td>
          </tr>
          <tr data-cats="all">
            <td>Parent</td>
            <td><input data-field="parent" type="text" value="::scene::" /></td>
            <td></td>
          </tr>
          <tr data-cats="Point,Spot">
            <td>Origin X</td>
            <td><input data-field="lightoriginx" type="text" value="30" /></td>
            <td></td>
          </tr>
          <tr data-cats="Point,Spot">
            <td>Origin Y</td>
            <td><input data-field="lightoriginy" type="text" value="30" /></td>
            <td></td>
          </tr>
          <tr data-cats="Point,Spot">
            <td>Origin Z</td>
            <td><input data-field="lightoriginz" type="text" value="30" /></td>
            <td></td>
          </tr>
          <tr data-cats="Directional,Hemispheric,Spot">
            <td>Direction X</td>
            <td><input data-field="lightdirectionx" type="text" value="0" /></td>
            <td></td>
          </tr>
          <tr data-cats="Directional,Hemispheric,Spot">
            <td>Direction Y</td>
            <td><input data-field="lightdirectiony" type="text" value="-1" /></td>
            <td></td>
          </tr>
          <tr data-cats="Directional,Hemispheric,Spot">
            <td>Direction Z</td>
            <td><input data-field="lightdirectionz" type="text" value="0" /></td>
            <td></td>
          </tr>
          <tr data-cats="all">
            <td>Intensity</td>
            <td><input data-field="lightintensity" type="text" value="1" /></td>
            <td></td>
          </tr>
          <tr data-cats="all">
            <td>Ground Color</td>
            <td><input data-field="groundcolor" class="groundcolor" type="text" value="0,0,0" /></td>
            <td><input type="color" class="colorpickerraw" data-inputclass="groundcolor"></td>
          </tr>
          <tr data-cats="all">
            <td>Diffuse Color</td>
            <td><input data-field="diffusecolor" class="diffusecolor" type="text" value="1,1,1" /></td>
            <td><input type="color" class="colorpickerraw" data-inputclass="diffusecolor"></td>
          </tr>
          <tr data-cats="all">
            <td>Specular Color</td>
            <td><input data-field="specularcolor" class="specularcolor" type="text" value="1,1,1" /></td>
            <td><input type="color" class="colorpickerraw" data-inputclass="specularcolor"></td>
          </tr>
          <tr data-cats="Spot">
            <td>Decay</td>
            <td><input data-field="lightdecay" type="text" value="" /></td>
            <td></td>
          </tr>
          <tr data-cats="Spot">
            <td>Angle</td>
            <td><input data-field="lightangle" type="text" value="" /></td>
            <td></td>
          </tr>
        </table>
      </div>
    </div>
    <div class="copy_clipboard_footer">
      <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
      <button class="show_hide_raw_csv" style="flex:0;margin-left:0"><i class="material-icons">view_stream</i></button>
      <button class="show_hide_table_csv" style="flex:0;margin-left:0"><i class="material-icons">view_module</i></button>
      <label><input type="checkbox" checked class="copy_csv_header_clipboard"><span> headers</span></label>
      <br>
      <div class="csv_import_preview"></div>
    </div>`;
  }
  lightRegister() {
    this.lighttypeinput = this.panel.querySelector('.lighttypeinput');
    this.lighttypeinput.addEventListener('input', e => this.lightUpdateDisplayedFields());

    this.wizard_field_container = this.panel.querySelector('.wizard_field_container');

    this.panel.querySelectorAll('.colorpickerraw')
      .forEach(i => i.addEventListener('input', e => this.blockColorPickerClick(e, i, '')));

    this.csv_import_preview = this.panel.querySelector('.csv_import_preview');
    this.copy_csv_to_clipboard = this.panel.querySelector('.copy_csv_to_clipboard');
    this.copy_csv_header_clipboard = this.panel.querySelector('.copy_csv_header_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      let headers = this.copy_csv_header_clipboard.checked;
      cMacro.copyDataToClipboard([this.export_csv], [], headers);
      this.getItemName(true);
    });
    this.show_hide_raw_csv = this.panel.querySelector('.show_hide_raw_csv');
    this.show_hide_raw_csv.addEventListener('click', e => this._updateCSVDisplay(1));
    this.show_hide_table_csv = this.panel.querySelector('.show_hide_table_csv');
    this.show_hide_table_csv.addEventListener('click', e => this._updateCSVDisplay(2));

    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.lightUpdateCSV()));
    this.panel.querySelectorAll('select').forEach(i => i.addEventListener('input', e => this.lightUpdateCSV()));

    this.lightUpdateDisplayedFields();
  }
  lightUpdateDisplayedFields() {
    let category = this.lighttypeinput.value;
    let rows = this.wizard_field_container.querySelectorAll('tr');

    rows.forEach(row => {
      let cats = row.dataset.cats;
      if (!cats)
        cats = '';
      cats = cats.split(',');
      if (cats.indexOf(category) === -1 && cats[0] !== 'all')
        row.style.display = 'none';
      else
        row.style.display = '';
    });
    this.lightUpdateCSV();
  }
  lightUpdateCSV() {
    this.newName = this.panelInput.value.trim();
    let category = this.lighttypeinput.value;
    let csv_row = {
      name: this.newName,
      asset: 'blockchild',
      childtype: 'light'
    };

    let tr_rows = this.panel.querySelectorAll('.light_fields_table tr');
    tr_rows.forEach(row => {
      let cats = row.dataset.cats;
      if (!cats)
        cats = '';
      cats = cats.split(',');
      if (cats.indexOf(category) !== -1 || cats[0] === 'all') {
        let i = row.querySelector('input[type="text"]');
        if (i) {
          csv_row[i.dataset.field] = i.value;
        }
      }
    });

    let r = csv_row;
    let header = this.copy_csv_header_clipboard.checked;
    this.export_csv = r;
    if (r) {
      if (window.Papa) {
        this.csvImportPreviewRaw = Papa.unparse([r], {
          header
        });
        this.csv_import_preview.innerHTML = this.csvImportPreviewRaw;
        if (this.csv_import_shown === 2) {
          this.csv_import_shown = 0;
          this._updateCSVDisplay(2);
        }
      }
    } else
      this.csv_import_preview.innerHTML = new Date();
  }
  blockTemplate() {
    return `<div class="block_wizard_wrapper">
      <div style="display:flex;flex-direction:row">
        <select class="block_wizard_type_select" style="margin-bottom: 8px;margin-top:4px;width: 9em;margin-right:.25em;font-size:.9em">
         <option selected>Scene</option>
         <option>Text and Shape</option>
         <option>Animated Line</option>
         <option>Connector Line</option>
         <option>2D Text Plane</option>
         <option>Web Font</option>
        </select>
        <div class="scene_type_option_list" style="text-align:center;flex:1;padding-top:4px;">
          <label><input type="radio" class="sceneaddtype skyboxtemplatetype" data-type="skyboxscenefeatures" name="sceneaddtype" checked /><span style="font-size:.85em"> Skybox</span></label>
          &nbsp;
          <label><input type="radio" class="sceneaddtype buildingtemplatetype" data-type="buildingscenefeatures" name="sceneaddtype" /><span style="font-size:.85em;"> Building</span></label>
        </div>
      </div>
      <div class="create-2d-text-plane">
        <table class="wizard_field_container">
          <tr>
            <td>Text</td>
            <td><input class="texturetext" type="text" value="Text Line" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Line 2</td>
            <td><input class="texturetext2" type="text" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Font</td>
            <td><input class="textfontfamily" type="text" list="fontfamilydatalist" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Font Color</td>
            <td><input class="textfontcolor" type="text" value="0,0,0" /></td>
            <td><input type="color" class="colorpickerraw" data-inputclass="textfontcolor"></td>
          </tr>
          <tr>
            <td>Font Weight</td>
            <td><input class="textfontweight" type="text" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Font Size</td>
            <td><input class="textfontsize" type="text" value="100" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Render Size</td>
            <td><input class="texturetextrendersize" type="text" value="512" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Width</td>
            <td><input class="width" type="text" value="4" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Height</td>
            <td><input class="height" type="text" value="4" /></td>
            <td></td>
          </tr>
        </table>
      </div>
      <div class="web-font-block-add-options" style="display:none;">
        <table class="wizard_field_container">
          <tr>
            <td colspan="3" style="text-align:center">Web Font<br>
              <input type="text" class="genericblockdata webfontname" list="webfontsuggestionlist" style="font-size:2.25em;padding: 8px;width:100%;height:60px;" /></td>
          </tr>
        </table>
      </div>
      <div class="connector-line-block-add-options" style="display:none;">
        <table class="wizard_field_container">
          <tr>
            <td><b>Line</b> Length</td>
            <td><input type="text" class="length" value="10" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Diameter</td>
            <td><input type="text" class="diameter" value=".5" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Tessellation</td>
            <td><input type="text" class="tessellation" value="" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Material</td>
            <td><input type="text" class="material" list="materialdatatitlelookuplist" /></td>
            <td><input type="color" class="colorpicker" data-inputclass="material"></td>
          </tr>
          <tr>
            <td><b>Pointer</b> Shape</td>
            <td><select class="pointshape">
              <option>none</option>
              <option>cylinder</option>
              <option selected>cone</option>
              <option>sphere</option>
            </select></td>
            <td></td>
          </tr>
          <tr>
            <td>Length</td>
            <td><input type="text" class="pointlength" value="1" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Depth</td>
            <td><input type="text" class="pointdiameter" value="2" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Tessellation</td>
            <td><input type="text" class="pointtessellation" value="" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Material</td>
            <td><input type="text" class="pointmaterial" list="materialdatatitlelookuplist" /></td>
            <td><input type="color" class="colorpicker" data-inputclass="pointmaterial"></td>
          </tr>
          <tr>
            <td><b>Tail</b> Shape</td>
            <td><select class="tailshape">
              <option>none</option>
              <option>cylinder</option>
              <option>cone</option>
              <option selected>sphere</option>
            </select></td>
            <td></td>
          </tr>
          <tr>
            <td>Length</td>
            <td><input type="text" class="taillength" value="1" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Depth</td>
            <td><input type="text" class="taildiameter" value="2" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Tessellation</td>
            <td><input type="text" class="tailtessellation" value="" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Material</td>
            <td><input type="text" class="tailmaterial" list="materialdatatitlelookuplist" /></td>
            <td><input type="color" class="colorpicker" data-inputclass="tailmaterial"></td>
          </tr>
          <tr>
            <td>Flip</td>
            <td><input type="checkbox" class="tailshapeflip"  style="width:1.5em;" /></td>
            <td></td>
          </tr>
        </table>
      </div>
      <div class="animated-line-block-add-options">
        <table class="wizard_field_container">
          <tr>
            <td>Number of Dashes</td>
            <td><input type="text" class="dashes" value="5" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Run Length (ms)</td>
            <td><input type="text" class="runlength" value="1500" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Dash Type</td>
            <td><select class="dotshape">
              <option>cylinder</option>
              <option selected>cone</option>
              <option>ellipsoid</option>
              <option>arrow</option>
              </select></td>
            <td></td>
          </tr>
          <tr>
            <td>Dash Length</td>
            <td><input type="text" class="dashlength" value=".5" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Tessellation</td>
            <td><input type="text" class="tessellation" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Material</td>
            <td><input type="text" class="material" list="materialdatatitlelookuplist" /></td>
            <td><input type="color" class="colorpicker" data-inputclass="material"></td>
          </tr>
          <tr>
            <td>Width (x)</td>
            <td><input type="text" class="width" value="1" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Height (y)</td>
            <td><input type="text" class="height" value="2" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Depth (z)</td>
            <td><input type="text" class="depth" value="10" /></td>
            <td></td>
          </tr>
        </table>
      </div>
      <div class="shape_and_text_block_options">
        <table class="wizard_field_container">
          <tr>
            <td>Width (x)</td>
            <td><input type="text" class="width" value="4" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Depth (z)</td>
            <td><input type="text" class="depth" value="1" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Height (y)</td>
            <td><input type="text" class="height" value="1" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Line 1</td>
            <td colspan="2"><input type="text" class="texttext" value="My Message" /></td>
          </tr>
          <tr>
            <td>Line 2</td>
            <td colspan="2"><input type="text" class="texttextline2" /></td>
          </tr>
          <tr>
            <td>Font</td>
            <td colspan="2"><input type="text" class="textfontfamily"  list="fontfamilydatalist" /></td>
          </tr>
          <tr>
            <td>Text Depth</td>
            <td><input type="text" class="textdepth"  value=".25" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Text Material</td>
            <td><input type="text" class="textmaterial"  list="materialdatatitlelookuplist"/></td>
            <td><input type="color" class="colorpicker" data-inputclass="textmaterial"></td>
          </tr>
          <tr>
            <td>Shape Type</td>
            <td><select class="createshapetype">
              <option>cube</option>
              <option>box</option>
              <option selected>cone</option>
              <option>cylinder</option>
              <option>sphere</option>
              <option>ellipsoid</option>
            </select></td>
            <td></td>
          </tr>
          <tr>
            <td>Tess</td>
            <td><input type="text" class="tessellation" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Rotate 90°</td>
            <td><input type="checkbox" style="width:1.25em;line-height:1.5em" class="cylinderhorizontal" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Shape Material</td>
            <td><input type="text" class="shapematerial" list="materialdatatitlelookuplist" /></td>
            <td><input type="color" class="colorpicker" data-inputclass="shapematerial"></td>
          </tr>
        </table>
      </div>
      <div class="scene_block_add_options">
        <div class="skyboxscenefeatures">
          <table class="wizard_field_container">
            <tr>
              <td>Clear Color</td>
              <td><input type="text" class="clearcolor" data-field="clearcolor" /></td>
              <td><input type="color" class="colorpickerraw" data-inputclass="clearcolor"></td>
            </tr>
            <tr>
              <td>Skybox Equirect</td>
              <td><input type="text" class="skybox texturepathinput" list="skyboxlist"  data-field="skybox" /></td>
              <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
            </tr>
            <tr>
              <td style="text-align:center;" colspan="3">
                <img class="skybox_image" crossorigin="anonymous" style="max-width:100%;max-height: 10em;display:none;">
              </td>
            </tr>
            <tr>
              <td>Skybox Size</td>
              <td><input type="text" class="skyboxsize" value="" /></td>
              <td></td>
            </tr>
            <tr>
              <td>Ground</td>
              <td><input type="text" class="groundimage texturepathinput" data-field="groundimage" list="groundTexturesDataList" /></td>
              <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
            </tr>
            <tr>
              <td>Scale v (x)</td>
              <td><input type="text" class="skyboxgroundscalev groundimage_scalev" /></td>
              <td></td>
            </tr>
            <tr>
              <td>Scale u (y)</td>
              <td><input type="text" class="skyboxgroundscaleu groundimage_scaleu" /></td>
              <td></td>
            </tr>
            <tr>
              <td style="text-align:center;" colspan="3">
                <div class="groundimage_preview_div image_preview_div"></div>
              </td>
            </tr>
          </table>
        </div>
        <div class="buildingscenefeatures" style="display:none;">
          <table class="wizard_field_container">
            <tr>
              <td>Width (x)</td>
              <td><input type="text" class="width" value="" /></td>
              <td></td>
            </tr>
            <tr>
              <td>Depth (z)</td>
              <td><input type="text" class="depth" value="" /></td>
              <td></td>
            </tr>
            <tr>
              <td>Height (y)</td>
              <td><input type="text" class="height" value="" /></td>
              <td></td>
            </tr>
            <tr>
              <td>Show Uploads</td>
              <td><input type="checkbox" style="width:1.5em;" class="show_uploads" /></td>
              <td></td>
            </tr>
            <tr>
              <td><b>Floor Material</b></td>
              <td><input type="text" class="floormaterial" list="materialdatatitlelookuplist" /></td>
              <td><input type="color" class="colorpicker" data-inputclass="floormaterial"></td>
            </tr>
            <tr class="image_upload_building">
              <td>Image</td>
              <td><input type="text" class="floorimage texturepathinput" data-field="floorimage" list="floorTexturesDataList" /></td>
              <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale v (x)</td>
              <td><input type="text" class="floorscalev floorimage_scalev" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="floorscaleu floorimage_scaleu" /></td>
              <td></td>
            </tr>
            <tr>
              <td style="text-align:center;" colspan="3">
                <div class="floorimage_preview_div image_preview_div"></div>
              </td>
            </tr>
            <tr>
              <td><b>Backwall Material</b></td>
              <td><input type="text" class="backwallmaterial" list="materialdatatitlelookuplist" /></td>
              <td><input type="color" class="colorpicker" data-inputclass="backwallmaterial"></td>
            </tr>
            <tr class="image_upload_building">
              <td>Image</td>
              <td><input type="text" class="backwallimage texturepathinput" data-field="backwallimage" list="wallTexturesDataList" /></td>
              <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale v (x)</td>
              <td><input type="text" class="backwallscalev backwallimage_scalev" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="backwallscaleu backwallimage_scaleu" /></td>
              <td></td>
            </tr>
            <tr>
              <td style="text-align:center;" colspan="3">
                <div class="backwallimage_preview_div image_preview_div"></div>
              </td>
            </tr>
            <tr>
              <td><b>Front Wall Material</b></td>
              <td><input type="text" class="frontwallmaterial" list="materialdatatitlelookuplist" /></td>
              <td><input type="color" class="colorpicker" data-inputclass="frontwallmaterial"></td>
            </tr>
            <tr class="image_upload_building">
              <td>Image</td>
              <td><input type="text" class="frontwallimage texturepathinput" data-field="frontwallimage" list="wallTexturesDataList" /></td>
              <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale v (x)</td>
              <td><input type="text" class="frontwallscalev frontwallimage_scalev" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="frontwallscaleu frontwallimage_scaleu" /></td>
              <td></td>
            </tr>
            <tr>
              <td style="text-align:center;" colspan="3">
                <div class="frontwallimage_preview_div image_preview_div"></div>
              </td>
            </tr>
            <tr>
              <td><b>Right Wall Material</b></td>
              <td><input type="text" class="rightwallmaterial" list="materialdatatitlelookuplist" /></td>
              <td><input type="color" class="colorpicker" data-inputclass="rightwallmaterial"></td>
            </tr>
            <tr class="image_upload_building">
              <td>Image</td>
              <td><input type="text" class="rightwallimage texturepathinput" data-field="rightwallimage" list="wallTexturesDataList" /></td>
              <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale v (x)</td>
              <td><input type="text" class="rightwallscalev rightwallimage_scalev" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="rightwallscaleu rightwallimage_scaleu" /></td>
              <td></td>
            </tr>
            <tr>
              <td style="text-align:center;" colspan="3">
                <div class="frontwallimage_preview_div image_preview_div"></div>
              </td>
            </tr>
            <tr>
              <td><b>Left Wall Material</b></td>
              <td><input type="text" class="leftwallmaterial" list="materialdatatitlelookuplist" /></td>
              <td><input type="color" class="colorpicker" data-inputclass="leftwallmaterial"></td>
            </tr>
            <tr class="image_upload_building">
              <td>Image</td>
              <td><input type="text" class="leftwallimage texturepathinput" data-field="leftwallimage" list="wallTexturesDataList" /></td>
              <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale v (x)</td>
              <td><input type="text" class="leftwallscalev leftwallimage_scalev" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="leftwallscaleu leftwallimage_scaleu" /></td>
              <td></td>
            </tr>
            <tr>
              <td style="text-align:center;" colspan="3">
                <div class="leftwallimage_preview_div image_preview_div"></div>
              </td>
            </tr>
            <tr>
              <td><b>Ceiling Material</b></td>
              <td><input type="text" class="ceilingwallmaterial" list="materialdatatitlelookuplist" /></td>
              <td><input type="color" class="colorpicker" data-inputclass="ceilingwallmaterial"></td>
            </tr>
            <tr class="image_upload_building">
              <td>Image</td>
              <td><input type="text" class="ceilingwallimage texturepathinput" data-field="ceilingwallimage" list="wallTexturesDataList" /></td>
              <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale v (x)</td>
              <td><input type="text" class="ceilingwallscalev ceilingwallimage_scalev" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="ceilingwallscaleu ceilingwallimage_scaleu" /></td>
              <td></td>
            </tr>
            <tr>
              <td style="text-align:center;" colspan="3">
                <div class="ceilingwallimage_preview_div image_preview_div"></div>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div id="block_wizard_parent_wrapper">
        <table class="wizard_field_container">
          <tr data-types="all">
            <td>Show Parent Details</td>
            <td><input class="show_parent_wizard_details" style="width:1.5em" type="checkbox"></td>
            <td></td>
          </tr>
        </table>
        ${this._addParentTemplate(true)}
      </div>
    </div>
    <div class="copy_clipboard_footer">
      <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
      <button class="show_hide_raw_csv" style="flex:0;margin-left:0"><i class="material-icons">view_stream</i></button>
      <button class="show_hide_table_csv" style="flex:0;margin-left:0"><i class="material-icons">view_module</i></button>
      <label><input type="checkbox" checked class="copy_csv_header_clipboard"><span> headers</span></label>
      <label><input type="checkbox" class="copy_csv_excludeempty_clipboard"><span> exclude empty</span></label>
      <br>
      <div class="csv_import_preview"></div>
    </div>
    <datalist id="webfontsuggestionlist"></datalist>`;
  }
  blockRegister() {
    this.block_wizard_type_select = this.panel.querySelector('.block_wizard_type_select');
    this.block_wizard_type_select.addEventListener('input', e => this.blockHelperChange());

    this.blockShapePanel = this.panel.querySelector('.shape_and_text_block_options');
    this.scene_block_add_options = this.panel.querySelector('.scene_block_add_options');
    this.scene_type_option_list = this.panel.querySelector('.scene_type_option_list');
    this.connectorLinePanel = this.panel.querySelector('.connector-line-block-add-options');
    this.animatedDashPanel = this.panel.querySelector('.animated-line-block-add-options');
    this.webFontPanel = this.panel.querySelector('.web-font-block-add-options');
    this.webfontname = this.panel.querySelector('.webfontname');
    this.webfontname.addEventListener('input', e => {
      let fontName = this.webfontname.value;
      let origFontName = fontName;
      fontName = fontName.replace(/ /g, '+');

      if (this.googleStyleLink)
        this.googleStyleLink.remove();
      if (this.hiddenGoogleSpan)
        this.hiddenGoogleSpan.remove();
      this.googleStyleLink = document.createElement('style');
      this.googleStyleLink.innerHTML = `@import url(https://fonts.googleapis.com/css?family=${fontName});`;
      document.body.append(this.googleStyleLink);
      this.hiddenGoogleSpan = document.createElement('span');
      this.hiddenGoogleSpan.setAttribute('style', `font-family:${origFontName}`);
      document.body.append(this.hiddenGoogleSpan);
      let a = this.hiddenGoogleSpan.offsetHeight;
      this.webfontname.style.fontFamily = origFontName;
      this.hiddenGoogleSpan.style.display = 'none';
    });
    this.text2dpanel = this.panel.querySelector('.create-2d-text-plane');

    this.skyBoxInput = this.scene_block_add_options.querySelector('.skybox');
    this.skyBoxInput.addEventListener('input', e => this.blockSkyboxChange());
    this.skyboximage = this.scene_block_add_options.querySelector('.skybox_image');

    this.show_parent_wizard_details = this.panel.querySelector('.show_parent_wizard_details');
    this.wizard_parent_details = this.panel.querySelector('.wizard_parent_details');
    this.show_parent_wizard_details.addEventListener('input', e => {
      if (this.show_parent_wizard_details.checked)
        this.wizard_parent_details.style.display = '';
      else
        this.wizard_parent_details.style.display = 'none';
    });
    this.block_wizard_parent_wrapper = this.panel.querySelector('#block_wizard_parent_wrapper');

    let sceneRadios = this.panel.querySelectorAll('.sceneaddtype');
    sceneRadios.forEach(rdo => {
      rdo.addEventListener('input', e => {
        this.scene_block_add_options.querySelector('.buildingscenefeatures').style.display = 'none';
        this.scene_block_add_options.querySelector('.skyboxscenefeatures').style.display = 'none';
        let showClass = rdo.dataset.type;
        this.scene_block_add_options.querySelector('.' + showClass).style.display = '';
      });
    });

    this.addSceneLight = this.panel.querySelector('.block-add-hemi-light');
    this.stretchDetailsPanel = this.panel.querySelector('.block-stretch-along-width-label');
    this.csv_import_preview = this.panel.querySelector('.csv_import_preview');
    this.copy_csv_to_clipboard = this.panel.querySelector('.copy_csv_to_clipboard');
    this.copy_csv_header_clipboard = this.panel.querySelector('.copy_csv_header_clipboard');
    this.copy_csv_excludeempty_clipboard = this.panel.querySelector('.copy_csv_excludeempty_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      let headers = this.copy_csv_header_clipboard.checked;
      cMacro.copyDataToClipboard([this.export_csv], [], headers);
      this.getItemName(true);
    });
    this.show_hide_raw_csv = this.panel.querySelector('.show_hide_raw_csv');
    this.show_hide_raw_csv.addEventListener('click', e => this._updateCSVDisplay(1));
    this.show_hide_table_csv = this.panel.querySelector('.show_hide_table_csv');
    this.show_hide_table_csv.addEventListener('click', e => this._updateCSVDisplay(2));

    this.webfontsuggestionlist = this.panel.querySelector('#webfontsuggestionlist');
    let html = '';
    this.webFonts.forEach(font => html += `<option>${font}</option>`);
    this.webfontsuggestionlist.innerHTML = html;

    this.panel.querySelectorAll('.textfontfamily').forEach(i => i.addEventListener('input', e => this.updateFontField(i)));
    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.blockUpdateCSV()));
    this.panel.querySelectorAll('select').forEach(i => i.addEventListener('input', e => this.blockUpdateCSV()));

    this.panel.querySelectorAll('[list=materialdatatitlelookuplist]')
      .forEach(i => i.addEventListener('input', e => this.blockUpdateMaterialField(e, i)));

    this.panel.querySelectorAll('.colorpicker')
      .forEach(i => i.addEventListener('input', e => this.blockColorPickerClick(e, i)));
    this.panel.querySelectorAll('.colorpickerraw')
      .forEach(i => i.addEventListener('input', e => this.blockColorPickerClick(e, i, '')));

    this.__registerFileUploaders();

    this.show_uploads = this.panel.querySelector('.show_uploads');
    this.image_upload_list = this.panel.querySelectorAll('.image_upload_building');
    this.show_uploads.addEventListener('input', e => {
      this.image_upload_list.forEach(ele => ele.style.display = (this.show_uploads.checked) ? 'table-row' : 'none');
    });

    this.wizard_parent = this.panel.querySelector('.wizard_parent');
    this.wizard_x = this.panel.querySelector('.wizard_x');
    this.wizard_y = this.panel.querySelector('.wizard_y');
    this.wizard_z = this.panel.querySelector('.wizard_z');
    this.wizard_sx = this.panel.querySelector('.wizard_sx');
    this.wizard_sy = this.panel.querySelector('.wizard_sy');
    this.wizard_sz = this.panel.querySelector('.wizard_sz');
    this.wizard_rx = this.panel.querySelector('.wizard_rx');
    this.wizard_ry = this.panel.querySelector('.wizard_ry');
    this.wizard_rz = this.panel.querySelector('.wizard_rz');

    this.blockHelperChange();
    this.blockSkyboxChange();
    this.blockUpdateCSV();
  }
  shapeTemplate() {
    return `<div class="standardmeshassetpanel shape_wizard_wrapper" style="display:flex;flex-direction:column;">
      <table class="wizard_field_container shape_wizard_table">
        <tr data-types="all">
          <td>Shape Type</td>
          <td><select data-field="shapetype" style="width: 100%;" class="shapetype_filter_select">
           <option value="box" selected>Box</option>
           <option value="cylinder">Cylinder</option>
           <option value="sphere">Sphere</option>
           <option value="text">3D Text</option>
           <option value="plane">Plane</option>
           <option value="torus">Torus</option>
          </select></td>
          <td></td>
        </tr>
        <tr data-types="all">
          <td>Material</td>
          <td><input type="text" data-field="materialname" class="materialname" list="materialdatatitlelookuplist" /></td>
          <td><input type="color" class="colorpicker" data-inputclass="materialname"></td>
        </tr>
        <tr data-types="box,plane">
          <td>Width</td>
          <td><input type="text" data-field="width"></td>
          <td></td>
        </tr>
        <tr data-types="box,plane">
          <td>Height</td>
          <td><input type="text" data-field="height"></td>
          <td></td>
        </tr>
        <tr data-types="box">
          <td>Depth</td>
          <td><input type="text" data-field="depth"></td>
          <td></td>
        </tr>
        <tr data-types="box">
          <td>Box Size</td>
          <td><input type="text" data-field="boxsize"></td>
          <td></td>
        </tr>
        <tr data-types="text">
          <td>Font</td>
          <td><input type="text" data-field="textfontfamily"  list="fontfamilydatalist"></td>
          <td></td>
        </tr>
        <tr data-types="text">
          <td>Text</td>
          <td><input type="text" data-field="texttext" value="Text"></td>
          <td></td>
        </tr>
        <tr data-types="text">
          <td>Depth</td>
          <td><input type="text" data-field="textdepth" value=".2"></td>
          <td></td>
        </tr>
        <tr data-types="text">
          <td>Text Size</td>
          <td><input type="text" data-field="textsize" value="100"></td>
          <td></td>
        </tr>
        <tr data-types="cylinder">
          <td>Height</td>
          <td><input type="text" data-field="height"></td>
          <td></td>
        </tr>
        <tr data-types="cylinder,torus">
          <td>Diameter</td>
          <td><input type="text" data-field="width"></td>
          <td></td>
        </tr>
        <tr data-types="cylinder,torus">
          <td>Tessellation</td>
          <td><input type="text" data-field="tessellation"></td>
          <td></td>
        </tr>
        <tr data-types="torus">
          <td>Thickness</td>
          <td><input type="text" data-field="height"></td>
          <td></td>
        </tr>
        <tr data-types="cylinder">
          <td>Diameter Top</td>
          <td><input type="text" data-field="diametertop"></td>
          <td></td>
        </tr>
        <tr data-types="cylinder">
          <td>Diameter Bottom</td>
          <td><input type="text" data-field="diameterbottom"></td>
          <td></td>
        </tr>
        <tr data-types="sphere">
          <td>Diameter</td>
          <td><input type="text" data-field="boxsize"></td>
          <td></td>
        </tr>
        <tr data-types="sphere">
          <td>Segments</td>
          <td><input type="text" data-field="tessellation"></td>
          <td></td>
        </tr>
        <tr data-types="sphere">
          <td>Diameter X</td>
          <td><input type="text" data-field="width"></td>
          <td></td>
        </tr>
        <tr data-types="sphere">
          <td>Diameter Y</td>
          <td><input type="text" data-field="height"></td>
          <td></td>
        </tr>
        <tr data-types="sphere">
          <td>Diameter Z</td>
          <td><input type="text" data-field="depth"></td>
          <td></td>
        </tr>
        <tr data-types="all">
          <td>Show Parent Details</td>
          <td><input class="show_parent_wizard_details" style="width:1.5em" type="checkbox"></td>
          <td></td>
        </tr>
      </table>
      ${this._addParentTemplate()}
    </div>
    <div class="copy_clipboard_footer">
      <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
      <button class="show_hide_raw_csv" style="flex:0;margin-left:0"><i class="material-icons">view_stream</i></button>
      <button class="show_hide_table_csv" style="flex:0;margin-left:0"><i class="material-icons">view_module</i></button>
      <label><input type="checkbox" checked class="copy_csv_header_clipboard"><span> headers</span></label>
      <label><input type="checkbox" checked class="copy_csv_allcolumn_clipboard"><span> all fields</span></label>
      <br>
      <div class="csv_import_preview"></div>
    </div>`;
  }
  shapeRegister() {
    this.shapetype_filter_select = this.panel.querySelector('.shapetype_filter_select');
    this.shapetype_filter_select.addEventListener('input', e => this.shapeTypeFilterChange());
    this.wizard_field_container = this.panel.querySelector('.wizard_field_container');

    this.show_parent_wizard_details = this.panel.querySelector('.show_parent_wizard_details');
    this.wizard_parent_details = this.panel.querySelector('.wizard_parent_details');
    this.show_parent_wizard_details.addEventListener('input', e => {
      if (this.show_parent_wizard_details.checked)
        this.wizard_parent_details.style.display = '';
      else
        this.wizard_parent_details.style.display = 'none';
    });

    this.csv_import_preview = this.panel.querySelector('.csv_import_preview');
    this.copy_csv_to_clipboard = this.panel.querySelector('.copy_csv_to_clipboard');
    this.copy_csv_allcolumn_clipboard = this.panel.querySelector('.copy_csv_allcolumn_clipboard');
    this.copy_csv_header_clipboard = this.panel.querySelector('.copy_csv_header_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      let headers = this.copy_csv_header_clipboard.checked;
      cMacro.copyDataToClipboard([this.export_csv], [], headers);
      this.getItemName(true);
    });
    this.show_hide_raw_csv = this.panel.querySelector('.show_hide_raw_csv');
    this.show_hide_raw_csv.addEventListener('click', e => this._updateCSVDisplay(1));
    this.show_hide_table_csv = this.panel.querySelector('.show_hide_table_csv');
    this.show_hide_table_csv.addEventListener('click', e => this._updateCSVDisplay(2));

    this.wizard_parent = this.panel.querySelector('.wizard_parent');
    this.wizard_visibility = this.panel.querySelector('.wizard_visibility');
    this.wizard_x = this.panel.querySelector('.wizard_x');
    this.wizard_y = this.panel.querySelector('.wizard_y');
    this.wizard_z = this.panel.querySelector('.wizard_z');
    this.wizard_sx = this.panel.querySelector('.wizard_sx');
    this.wizard_sy = this.panel.querySelector('.wizard_sy');
    this.wizard_sz = this.panel.querySelector('.wizard_sz');
    this.wizard_rx = this.panel.querySelector('.wizard_rx');
    this.wizard_ry = this.panel.querySelector('.wizard_ry');
    this.wizard_rz = this.panel.querySelector('.wizard_rz');

    this.panel.querySelectorAll('.textfontfamily').forEach(i => i.addEventListener('input', e => this.updateFontField(i)));
    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.shapeUpdateCSV()));
    this.panel.querySelectorAll('select').forEach(i => i.addEventListener('input', e => this.shapeUpdateCSV()));

    this.panel.querySelectorAll('[list=materialdatatitlelookuplist]')
      .forEach(i => i.addEventListener('input', e => this.blockUpdateMaterialField(e, i)));

    this.panel.querySelectorAll('.colorpicker')
      .forEach(i => i.addEventListener('input', e => this.blockColorPickerClick(e, i)));

    this.shapeTypeFilterChange();
  }
  _updateCSVDisplay(btnIndex) {
    this.csv_import_preview.style.display = 'none';
    this.show_hide_raw_csv.style.background = '';
    this.show_hide_raw_csv.style.color = '';
    this.show_hide_table_csv.style.background = '';
    this.show_hide_table_csv.style.color = '';

    if (this.csv_import_shown === btnIndex) {
      this.csv_import_shown = 0;
    } else if (btnIndex === 1) {
      this.csv_import_shown = btnIndex;
      this.csv_import_preview.style.display = 'block';
      this.show_hide_raw_csv.style.background = 'rgb(100,100,100)';
      this.show_hide_raw_csv.style.color = 'white';
      this.csv_import_preview.innerHTML = this.csvImportPreviewRaw;
    } else if (btnIndex === 2) {
      this.csv_import_shown = btnIndex;
      this.csv_import_preview.style.display = 'block';
      this.show_hide_table_csv.style.background = 'rgb(100,100,100)';
      this.show_hide_table_csv.style.color = 'white';

      let headers = this.copy_csv_header_clipboard.checked;
      let html = cMacro._dataRowsToTableHTML([this.export_csv], [], headers);

      this.csv_import_preview.innerHTML = html;
    }
  }
  shapeTypeFilterChange() {
    let rows = this.wizard_field_container.querySelectorAll('tr');
    let category = this.shapetype_filter_select.value;

    rows.forEach(row => {
      let cats = row.dataset.types;
      if (!cats)
        cats = '';
      cats = cats.split(',');
      if (cats.indexOf(category) === -1 && cats[0] !== 'all')
        row.style.display = 'none';
      else
        row.style.display = '';
    });

    this.getItemName();
    this.shapeUpdateCSV();
  }
  shapeUpdateCSV() {
    this.newName = this.panelInput.value.trim();
    let shapetype = this.shapetype_filter_select.value;
    let allColumns = this.copy_csv_allcolumn_clipboard.checked;

    let csv_row = {
      name: this.newName,
      asset: 'shape',
      shapetype
    };

    let t_rows = this.panel.querySelectorAll('.shape_wizard_table input[type="text"]');
    let all_fields = [];
    t_rows.forEach(f => {
      if (all_fields.indexOf(f.dataset.field) === -1)
        all_fields.push(f.dataset.field);
      if (allColumns)
        csv_row[f.dataset.field] = '';
    });

    let tr_rows = this.panel.querySelectorAll('.shape_wizard_table tr');
    tr_rows.forEach(row => {
      let cats = row.dataset.types;
      if (!cats)
        cats = '';
      cats = cats.split(',');
      if (cats.indexOf(shapetype) !== -1 || cats[0] === 'all') {
        let i = row.querySelector('input[type="text"]');
        if (i) {
          csv_row[i.dataset.field] = i.value;
        }
      }
    });

    let includeParent = this.show_parent_wizard_details.checked;
    if (includeParent) {
      csv_row['parent'] = this.wizard_parent.value;
      csv_row['visibility'] = this.wizard_visibility.value;
      csv_row['x'] = this.wizard_x.value;
      csv_row['y'] = this.wizard_y.value;
      csv_row['z'] = this.wizard_z.value;
      csv_row['rx'] = this.wizard_rx.value;
      csv_row['ry'] = this.wizard_ry.value;
      csv_row['rz'] = this.wizard_rz.value;
      csv_row['sx'] = this.wizard_sx.value;
      csv_row['sy'] = this.wizard_sy.value;
      csv_row['sz'] = this.wizard_sz.value;
    }

    let r = csv_row;
    let header = this.copy_csv_header_clipboard.checked;
    this.export_csv = r;
    if (r) {
      if (window.Papa) {
        this.csvImportPreviewRaw = Papa.unparse([r], {
          header
        });
        this.csv_import_preview.innerHTML = this.csvImportPreviewRaw;
        if (this.csv_import_shown === 2) {
          this.csv_import_shown = 0;
          this._updateCSVDisplay(2);
        }
      }
    } else
      this.csv_import_preview.innerHTML = new Date();
  }
  meshTemplate() {
    return `<div class="standardmeshassetpanel mesh_wizard_wrapper" style="display:flex;flex-direction:column;">
        <table class="wizard_field_container">
          <tr>
            <td>Mesh URL</td>
            <td><input type="text" class="mesh_meshpath texturepathinput" data-field="mesh_meshpath" list="meshesDefaultsDataList" /></td>
            <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
          </tr>
          <tr>
            <td>Texture URL</td>
            <td><input type="text" list="sbimageslist" class="mesh_texturepath texturepathinput" data-field="mesh_texturepath" /></td>
            <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
          </tr>
          <tr>
            <td>Normal Map URL</td>
            <td><input type="text" list="sbimageslist" class="mesh_bmppath texturepathinput" data-field="mesh_bmppath" /></td>
            <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
          </tr>
          <tr>
            <td>Specular Map URL</td>
            <td><input type="text" list="sbimageslist" class="mesh_specularpath texturepathinput" data-field="mesh_specularpath" /></td>
            <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
          </tr>
          <tr>
            <td colspan="3">
              <div style="display:flex;flex-direction:row">
                <span style="padding-top:4px;padding-right:4px;">Specular Power</span><input type="text" class="mesh_specularpower" data-field="mesh_specularpower" />

                <span style="padding-left:8px;padding-right:4px;padding-top:4px;">Has Alpha (1)</span><input type="text" class="mesh_hasalpha" data-field="mesh_hasalpha" />
              </div>
            </td>
          </tr>
          <tr>
            <td colspan="3" style="text-align:center">
              <div class="mesh-details-images">
                <img class="mesh_texture_img" crossorigin="anonymous" style="max-width:50%;max-height:12em">
                <img class="mesh_bump_img" crossorigin="anonymous" style="max-width:50%;max-height:12em">
                <img class="mesh-preview-img" crossorigin="anonymous" style="display:none;">
              </div>
              <div class="mesh_message" style=""></div>
            </td>
          </tr>
          <tr data-types="all">
            <td>Show Parent Details</td>
            <td><input class="show_parent_wizard_details" style="width:1.5em" type="checkbox"></td>
            <td></td>
          </tr>
        </table>
        ${this._addParentTemplate()}
      </div>
    </div>
    <div class="copy_clipboard_footer">
      <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
      <button class="show_hide_raw_csv" style="flex:0;margin-left:0"><i class="material-icons">view_stream</i></button>
      <button class="show_hide_table_csv" style="flex:0;margin-left:0"><i class="material-icons">view_module</i></button>
      <label><input type="checkbox" checked class="copy_csv_header_clipboard"><span> headers</span></label>
      <br>
      <div class="csv_import_preview"></div>
    </div>`;
  }
  meshRegister() {
    this.mesh_texture_img = this.panel.querySelector('.mesh_texture_img');
    this.mesh_bump_img = this.panel.querySelector('.mesh_bump_img');
    this.mesh_message = this.panel.querySelector('.mesh_message');
    this.standardmeshassetpanel = this.panel.querySelector('.standardmeshassetpanel');

    this.mesh_meshpath = this.panel.querySelector('.mesh_meshpath');
    this.mesh_texturepath = this.panel.querySelector('.mesh_texturepath');
    this.mesh_bmppath = this.panel.querySelector('.mesh_bmppath');
    this.mesh_specularpath = this.panel.querySelector('.mesh_specularpath');
    this.mesh_specularpower = this.panel.querySelector('.mesh_specularpower');
    this.mesh_hasalpha = this.panel.querySelector('.mesh_hasalpha');

    this.wizard_parent = this.panel.querySelector('.wizard_parent');
    this.wizard_visibility = this.panel.querySelector('.wizard_visibility');
    this.wizard_x = this.panel.querySelector('.wizard_x');
    this.wizard_y = this.panel.querySelector('.wizard_y');
    this.wizard_z = this.panel.querySelector('.wizard_z');
    this.wizard_sx = this.panel.querySelector('.wizard_sx');
    this.wizard_sy = this.panel.querySelector('.wizard_sy');
    this.wizard_sz = this.panel.querySelector('.wizard_sz');
    this.wizard_rx = this.panel.querySelector('.wizard_rx');
    this.wizard_ry = this.panel.querySelector('.wizard_ry');
    this.wizard_rz = this.panel.querySelector('.wizard_rz');

    this.csv_import_preview = this.panel.querySelector('.csv_import_preview');
    this.copy_csv_to_clipboard = this.panel.querySelector('.copy_csv_to_clipboard');
    this.copy_csv_header_clipboard = this.panel.querySelector('.copy_csv_header_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      let headers = this.copy_csv_header_clipboard.checked;
      cMacro.copyDataToClipboard([this.export_csv], [], headers);
      this.getItemName(true);
    });
    this.show_hide_raw_csv = this.panel.querySelector('.show_hide_raw_csv');
    this.show_hide_raw_csv.addEventListener('click', e => this._updateCSVDisplay(1));
    this.show_hide_table_csv = this.panel.querySelector('.show_hide_table_csv');
    this.show_hide_table_csv.addEventListener('click', e => this._updateCSVDisplay(2));

    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.meshUpdateCSV(e, i)));
    this.show_parent_wizard_details = this.panel.querySelector('.show_parent_wizard_details');
    this.wizard_parent_details = this.panel.querySelector('.wizard_parent_details');
    this.show_parent_wizard_details.addEventListener('input', e => {
      if (this.show_parent_wizard_details.checked)
        this.wizard_parent_details.style.display = '';
      else
        this.wizard_parent_details.style.display = 'none';
    });

    this.meshCSVFields = ['message', 'meshpath', 'texturepath', 'bmppath','specularpath','specularpower','hasalpha'];

    this.__registerFileUploaders();

    this.meshUpdateCSV();
  }
  meshUpdateCSV(e, ctl) {
    if (ctl && ctl.classList.contains('mesh_meshpath')) {
      let meshPath = ctl.value;
      let meshIndex = this.app.meshesPaths.indexOf(meshPath);

      if (meshIndex !== -1) {
        let meshD = this.app.meshesDetails[meshIndex];
        this.meshCSVFields.forEach((item, index) => {
          let value = meshD[item];
          if (!value)
            value = '';
          if (this['mesh_' + item].value !== undefined)
            this['mesh_' + item].value = value;
          else
            this['mesh_' + item].innerHTML = value;
        });
      }
    }

    let img = this.mesh_texturepath.value;
    if (img.substr(0, 3) === 'sb:')
      img = this.cdnPrefix + 'textures/' + img.substring(3);
    this.mesh_texture_img.setAttribute('src', img);
    let bump = this.mesh_bmppath.value;
    if (bump.substr(0, 3) === 'sb:')
      bump = this.cdnPrefix + 'textures/' + bump.substring(3);
    this.mesh_bump_img.setAttribute('src', bump);
    let header = this.copy_csv_header_clipboard.checked;
    let csv = this.meshScrape();
    this.export_csv = csv;
    if (csv) {
      this.csvImportPreviewRaw = Papa.unparse([this.export_csv], {
        header
      });
      this.csv_import_preview.innerHTML = this.csvImportPreviewRaw;
      if (this.csv_import_shown === 2) {
        this.csv_import_shown = 0;
        this._updateCSVDisplay(2);
      }
    } else
      this.csv_import_preview.innerHTML = new Date();
  }
  meshScrape() {
    this.newName = this.panelInput.value.trim();
    let includeParent = this.show_parent_wizard_details.checked;

    let csv_row = {
      name: this.newName,
      asset: 'meshtexture'
    };

    csv_row['materialname'] = csv_row['name'] + '_material';

    this.meshCSVFields.forEach((item, index) => {
      if (item === 'message')
        return;

      csv_row[item] = this['mesh_' + item].value;
    });

    csv_row['ambient'] = 'x';
    csv_row['diffuse'] = 'x';
    csv_row['emissive'] = 'x';

    if (includeParent) {
      csv_row['parent'] = this.wizard_parent.value;
      csv_row['visibility'] = this.wizard_visibility.value;
      csv_row['x'] = this.wizard_x.value;
      csv_row['y'] = this.wizard_y.value;
      csv_row['z'] = this.wizard_z.value;
      csv_row['rx'] = this.wizard_rx.value;
      csv_row['ry'] = this.wizard_ry.value;
      csv_row['rz'] = this.wizard_rz.value;
      csv_row['sx'] = this.wizard_sx.value;
      csv_row['sy'] = this.wizard_sy.value;
      csv_row['sz'] = this.wizard_sz.value;
    }

    return csv_row;
  }
  async meshCreate() {
    return this._itemCreate();
  }
  materialTemplate() {
    return `<div class="standardmaterialassetpanel material_wizard_wrapper" style="flex-direction:column">
        <table class="wizard_field_container">
          <tr>
            <td>Texture URL</td>
            <td><input type="text" list="materialsuggestionlist" class="material_texturepath texturepathinput" data-field="material_texturepath" /></td>
            <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
          </tr>
          <tr>
            <td>Normal Map URL</td>
            <td><input type="text" list="sbimageslist" class="material_bmppath texturepathinput" data-field="material_bmppath" /></td>
            <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
          </tr>
          <tr>
            <td>Specular Map URL</td>
            <td><input type="text" list="sbimageslist" class="material_specularpath texturepathinput" data-field="material_specularpath" /></td>
            <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
          </tr>
          <tr>
            <td colspan="3">
              <div style="display:flex;flex-direction:row">
                <span style="padding-top:4px;padding-right:4px;">Specular Power</span><input type="text" class="material_specularpower" data-field="material_specularpower" />

                <span style="padding-left:8px;padding-right:4px;padding-top:4px;">Has Alpha (1)</span><input type="text" class="material_hasalpha" data-field="material_hasalpha" />
              </div>
            </td>
          </tr>
          <tr>
            <td style="text-align:center;" colspan="3">
              <label><span>Scale V (x)</span><input type="text" class="materialscalev" /></label>
              <label><span>Scale U (y)</span><input type="text" class="materialscaleu" /></label>
            </td>
          </tr>
        </table>
        <div class="material-details-images" style="flex:1;text-align:center;">
          <div class="material_image_bkg_div" style="width:90%;height:10em;background-image:repeat;display:inline-block;">
          &nbsp;
          </div>
        </div>
      </div>
      <div class="copy_clipboard_footer">
        <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
        <button class="show_hide_raw_csv" style="flex:0;margin-left:0"><i class="material-icons">view_stream</i></button>
        <button class="show_hide_table_csv" style="flex:0;margin-left:0"><i class="material-icons">view_module</i></button>
        <label><input type="checkbox" checked class="copy_csv_header_clipboard"><span> headers</span></label>
        <br>
        <div class="csv_import_preview"></div>
      </div>
      <datalist id="materialsuggestionlist"></datalist>`;
  }
  _materialGetHTMLOptionList() {
    let paths = [];
    for (let c = 0; c < 17; c++)
      paths.push(`sb:matpack/brickwall${c + 1}_D.jpg`);
    for (let c = 0; c < 11; c++)
      paths.push(`sb:matpack/floor${c + 1}_D.jpg`);
    for (let c = 0; c < 8; c++)
      paths.push(`sb:matpack/grid${c + 1}_D.png`);
    for (let c = 0; c < 2; c++)
      paths.push(`sb:matpack/hedgerow${c + 1}_D.jpg`);
    for (let c = 0; c < 4; c++)
      paths.push(`sb:matpack/metal${c + 1}_D.jpg`);
    for (let c = 0; c < 16; c++)
      paths.push(`sb:matpack/roof${c + 1}_D.jpg`);
    for (let c = 0; c < 7; c++)
      paths.push(`sb:matpack/wood${c + 1}_D.jpg`);
    this.materialTexturePaths = paths;

    let html = '';
    paths.forEach(p => html += `<option>${p}</option>`);
    return html;
  }
  materialRegister() {
    this.standardmaterialassetpanel = this.panel.querySelector('.standardmaterialassetpanel');
    this.csv_import_preview = this.panel.querySelector('.csv_import_preview');
    this.copy_csv_to_clipboard = this.panel.querySelector('.copy_csv_to_clipboard');
    this.copy_csv_header_clipboard = this.panel.querySelector('.copy_csv_header_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      let headers = this.copy_csv_header_clipboard.checked;
      cMacro.copyDataToClipboard([this.export_csv], [], headers);
      this.getItemName(true);
    });
    this.show_hide_raw_csv = this.panel.querySelector('.show_hide_raw_csv');
    this.show_hide_raw_csv.addEventListener('click', e => this._updateCSVDisplay(1));
    this.show_hide_table_csv = this.panel.querySelector('.show_hide_table_csv');
    this.show_hide_table_csv.addEventListener('click', e => this._updateCSVDisplay(2));

    this.material_image_bkg_div = this.panel.querySelector('.material_image_bkg_div');
    this.materialscalev = this.panel.querySelector('.materialscalev');
    this.materialscaleu = this.panel.querySelector('.materialscaleu');
    this.material_texturepath = this.panel.querySelector('.material_texturepath');
    this.material_bmppath = this.panel.querySelector('.material_bmppath');
    this.material_specularpath = this.panel.querySelector('.material_specularpath');
    this.material_specularpower = this.panel.querySelector('.material_specularpower');
    this.material_hasalpha = this.panel.querySelector('.material_hasalpha');
    this.materialsuggestionlist = this.panel.querySelector('#materialsuggestionlist');


    this.materialsuggestionlist.innerHTML = this._materialGetHTMLOptionList();
    this.material_texturepath.addEventListener('input', e => this.materialDiffuseChanged());

    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.materialUpdateCSV()));

    this.__registerFileUploaders();
    this.materialUpdateCSV();
  }
  materialUpdateCSV() {
    let csv = this.materialScrape();
    let header = this.copy_csv_header_clipboard.checked;

    this.export_csv = csv;
    if (csv) {
      this.csvImportPreviewRaw = Papa.unparse([this.export_csv], {
        header
      });
      this.csv_import_preview.innerHTML = this.csvImportPreviewRaw;
      if (this.csv_import_shown === 2) {
        this.csv_import_shown = 0;
        this._updateCSVDisplay(2);
      }
    } else
      this.csv_import_preview.innerHTML = new Date();
  }
  async _crossAnonLoadImg(url) {
    return new Promise((resolve) => {
      let img = document.createElement('img');
      img.addEventListener('load', e => {
        img.remove();
        resolve();
      });
      img.setAttribute('crossorigin', 'anonymous');
      img.setAttribute('src', url);
      img.style.display = 'none';
      document.body.appendChild(img);
    });
  }
  materialDiffuseChanged() {
    let texture = this.material_texturepath.value;

    if (this.materialTexturePaths.indexOf(texture) === -1)
      return;

    let hasAlpha = '';
    if (texture.substring(0, 3) === 'png') {
      hasAlpha = '1';
    }

    this.material_bmppath.value = texture.slice(0, -6) + '_N.jpg';
    this.material_specularpath.value = texture.slice(0, -6) + '_S.jpg';
    this.material_hasalpha.value = hasAlpha;
    this.materialUpdateCSV();
  }
  materialScrape() {
    this.standardmaterialassetpanel.style.display = 'flex';
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      name: this.newName,
      asset: 'material'
    };

    let texture = this.material_texturepath.value;
    let bumptexture = this.material_bmppath.value;
    let speculartexture = this.material_specularpath.value;

    let scaleu = this.materialscaleu.value;
    let scalev = this.materialscalev.value;

    let textureURL = '';
    let hasAlpha = '';
    if (!texture)
      texture = '';

    if (texture) {
      textureURL = texture;
      if (texture.substring(0,3) === 'sb:')
        textureURL = this.cdnPrefix + 'textures/' + texture.substring(3);

      this.material_image_bkg_div.style.backgroundImage = '';
      this._crossAnonLoadImg(textureURL).then(() => {
        this.material_image_bkg_div.style.backgroundImage = 'url(' + textureURL + ')';
      });

      let u = Number(scaleu);
      let v = Number(scalev);
      if (!u)
        u = 1;
      if (!v)
        v = 1;

      let sizeX = 100;
      let sizeY = 100;
      if (v !== 0.0) {
        sizeX = (sizeX / v).toFixed(2);
      }
      if (u !== 0.0) {
        sizeY = (sizeY / u).toFixed(2);
      }
      this.material_image_bkg_div.style.backgroundSize = sizeX + '% ' + sizeY + '%';
    } else {
      this.material_image_bkg_div.style.backgroundImage = '';
    }


    Object.assign(csv_row, {
      texture,
      speculartexture,
      bumptexture,
      scaleu,
      scalev,
      hasalpha: hasAlpha
    });

    return csv_row;
  }
  async materialCreate() {
    return this._itemCreate();
  }
  _handleImageTextureUpload(fileCtl, field) {
    let fileBlob = fileCtl.files[0];

    if (!fileBlob)
      return;

    field.value = 'Uploading...';

    let fireSet = this.app.a.modelSets['block'];
    let uKey = fireSet.getKey();
    let key = this.app.a.profile.selectedWorkspace + `/${uKey}/`;
    fireSet.setBlob(key, fileBlob, fileBlob.name).then(uploadResult => {
      field.value = uploadResult.downloadURL;
      let event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });

      field.dispatchEvent(event);
    });
  }
  _shapeScrapeTextPlane() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      name: this.newName,
      asset: 'textplane'
    };
    let textshapefields = [
      'texturetext', 'texturetext2', 'textfontfamily', 'textfontcolor', 'textfontweight', 'textfontsize',
      'texturetextrendersize', 'width', 'height'
    ];
    textshapefields.forEach(field => {
      let f = this.text2dpanel.querySelector('.' + field);
      if (f.getAttribute('type') === 'checkbox')
        csv_row[field] = f.checked ? '1' : '';
      else
        csv_row[field] = f.value;
    });
    return csv_row;
  }
  blockColorPickerClick(event, ctl, prefix = 'color: ') {
    let bColor = GLOBALUTIL.HexToRGB(ctl.value);
    let rgb = bColor.r.toFixed(2) + ',' + bColor.g.toFixed(2) + ',' + bColor.b.toFixed(2);
    let inputCTL = ctl.parentNode.querySelector('.' + ctl.dataset.inputclass);
    if (!inputCTL)
      inputCTL = ctl.parentNode.parentNode.querySelector('.' + ctl.dataset.inputclass);
    inputCTL.value = prefix + rgb;

    this.blockUpdateMaterialField(null, inputCTL);
  }
  blockUpdateMaterialField(event, ctl) {
    let val = ctl.value;
    let index = val.indexOf('color:');
    if (index !== -1) {
      let color = val.substring(index + 6).trim();
      let rgb = GLOBALUTIL.colorRGB255(color);

      ctl.style.borderStyle = 'solid';
      ctl.style.borderWidth = '.35em';
      ctl.style.borderColor = rgb;

      ctl.parentNode.nextElementSibling.value = GLOBALUTIL.colorToHex(GLOBALUTIL.color(color));
    } else {
      ctl.style.borderStyle = '';
      ctl.style.borderWidth = '';
      ctl.style.borderColor = '';
      ctl.parentNode.nextElementSibling.value = '';
    }

    this[this.tag + 'UpdateCSV']();
  }
  _blockScrapeTextAndShape() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      name: this.newName,
      asset: 'shapeandtext'
    };
    let textshapefields = [
      'texttext', 'texttextline2', 'textfontfamily', 'textdepth', 'textmaterial', 'shapematerial',
      'width', 'height', 'depth', 'tessellation', 'cylinderhorizontal', 'createshapetype'
    ];
    textshapefields.forEach(field => {
      let f = this.blockShapePanel.querySelector('.' + field);
      if (f.getAttribute('type') === 'checkbox')
        csv_row[field] = f.checked ? '1' : '';
      else
        csv_row[field] = f.value;
    });
    return csv_row;
  }
  _blockScrapeConnectorLine() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      name: this.newName,
      asset: 'connectorline'
    };
    let fields = [
      'length', 'diameter', 'tessellation', 'material', 'pointshape', 'pointlength',
      'pointdiameter', 'pointtessellation', 'pointmaterial', 'tailshape', 'taillength',
      'taildiameter', 'tailtessellation', 'tailmaterial', 'tailshapeflip'
    ];
    fields.forEach(field => {
      let f = this.connectorLinePanel.querySelector('.' + field);
      if (f.getAttribute('type') === 'checkbox')
        csv_row[field] = f.checked ? '1' : '';
      else
        csv_row[field] = f.value;
    });
    return csv_row;
  }
  _blockScrapeAnimatedline() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      name: this.newName,
      asset: 'animatedline'
    };
    let fields = [
      'dashes', 'runlength', 'dotshape', 'dashlength', 'tessellation', 'material', 'width', 'height', 'depth'
    ];
    fields.forEach(field => {
      let f = this.animatedDashPanel.querySelector('.' + field);
      if (f.getAttribute('type') === 'checkbox')
        csv_row[field] = f.checked ? '1' : '';
      else
        csv_row[field] = f.value;
    });
    return csv_row;
  }
  _blockScrapeWebFont() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      name: this.newName,
      asset: 'block',
      blockflag: 'googlefont'
    };
    let fields = [
      'genericblockdata'
    ];
    fields.forEach(field => {
      let f = this.webFontPanel.querySelector('.' + field);
      if (f.getAttribute('type') === 'checkbox')
        csv_row[field] = f.checked ? '1' : '';
      else
        csv_row[field] = f.value;
    });
    return csv_row;
  }
  _blockScrapeScene() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      name: this.newName,
      asset: 'sceneblock'
    };
    let fields = [
      'skyboxsize', 'groundimage', 'skyboxgroundscaleu', 'skyboxgroundscalev', 'skybox',
      'width', 'height', 'depth', 'floormaterial', 'backwallmaterial', 'clearcolor',
      'frontwallmaterial', 'leftwallmaterial', 'rightwallmaterial',
      'ceilingmaterial',
      'leftwallscalev', 'leftwallscaleu', 'leftwallimage',
      'rightwallscalev', 'rightwallscaleu', 'rightwallimage',
      'backwallscalev', 'backwallscaleu', 'backwallimage',
      'frontwallscalev', 'frontwallscaleu', 'frontwallimage',
      'floorscalev', 'floorscaleu', 'floorimage',
      'ceilingwallscalev', 'ceilingwallscaleu', 'ceilingwallimage'
    ];

    let fieldValues = {};
    let skyboxType = this.panel.querySelector('.skyboxtemplatetype').checked;

    if (skyboxType)
      csv_row['skyboxtype'] = '';
    else
      csv_row['skyboxtype'] = 'building';

    fields.forEach(field => {
      let f = this.scene_block_add_options.querySelector('.' + field);
      if (f) {
        if (f.getAttribute('type') === 'checkbox')
          csv_row[field] = f.checked ? '1' : '';
        else {
          if (field.indexOf('image') !== -1) {
            let url = f.value;
            if (url.substring(0, 3) === 'sb:')
              url = this.cdnPrefix + 'textures/' + url.substring(3);

            let p_div = this.scene_block_add_options.querySelector('.' + field + '_preview_div');
            if (p_div) {
              if (url) {
                p_div.style.backgroundImage = '';
                this._crossAnonLoadImg(url).then(() => {
                  p_div.style.backgroundImage = 'url(' + url + ')';
                });
                p_div.style.display = 'block';
                let scaleu = this.scene_block_add_options.querySelector('.' + field + '_scaleu');
                let scalev = this.scene_block_add_options.querySelector('.' + field + '_scalev');

                let u = Number(scaleu.value);
                let v = Number(scalev.value);
                if (!u)
                  u = 1;
                if (!v)
                  v = 1;

                let sizeX = 100;
                let sizeY = 100;
                if (v !== 0.0) {
                  sizeX = (sizeX / v).toFixed(2);
                }
                if (u !== 0.0) {
                  sizeY = (sizeY / u).toFixed(2);
                }
                p_div.style.backgroundSize = sizeX + '% ' + sizeY + '%';
              } else {
                p_div.style.display = 'none';
              }
            }
          }
          csv_row[field] = f.value;
        }
      }
    });

    if (skyboxType) {
      csv_row.width = csv_row.skyboxsize;
      csv_row.height = csv_row.skyboxsize;
      csv_row.depth = csv_row.skyboxsize;
    }

    this.blockSkyboxChange();

    return csv_row;
  }
  async _itemCreate() {
    let blockResult = await (new gCSVImport(this.app.loadedWID)).addCSVRow(this.export_csv);
    this.lastRowAdded = this.export_csv;
    this.getItemName();
    return blockResult.key;
  }
  async blockCreate() {
    if (this.block_wizard_type_select.value === 'Web Font')
      this.app._updateGoogleFonts();
    return this._itemCreate();
  }
  async shapeCreate() {
    return this._itemCreate();
  }
  blockSkyboxChange() {
    let skybox = this.skyBoxInput.value.trim();

    if (skybox.substring(0, 3) === 'sb:') {
      skybox = this.cdnPrefix + 'textures/' + skybox.substring(3);
    }

    if (skybox === '')
      this.skyboximage.style.display = 'none';
    else {
      this.skyboximage.style.display = '';
      this.skyboximage.setAttribute('src', skybox);

    }
  }
  blockHelperChange() {
    this.blockShapePanel.style.display = 'none';
    this.scene_block_add_options.style.display = 'none';
    this.scene_type_option_list.style.display = 'none';
    this.animatedDashPanel.style.display = 'none';
    this.connectorLinePanel.style.display = 'none';
    this.webFontPanel.style.display = 'none';
    this.text2dpanel.style.display = 'none';

    let sel = this.block_wizard_type_select.value;

    this.block_wizard_parent_wrapper.style.display = (sel === 'Web Font' || sel === 'Scene') ? 'none' : '';

    if (sel === 'Text and Shape')
      this.blockShapePanel.style.display = '';
    else if (sel === 'Scene') {
      this.scene_block_add_options.style.display = '';
      this.scene_type_option_list.style.display = '';
    } else if (sel === 'Connector Line')
      this.connectorLinePanel.style.display = '';
    else if (sel === 'Animated Line')
      this.animatedDashPanel.style.display = '';
    else if (sel === '2D Text Plane')
      this.text2dpanel.style.display = '';
    else if (sel === 'Web Font')
      this.webFontPanel.style.display = '';

    this.getItemName();
  }
  blockUpdateCSV() {
    let macrotype = this.block_wizard_type_select.value;
    let csv_row = null;
    if (macrotype === 'Text and Shape')
      csv_row = this._blockScrapeTextAndShape();
    if (macrotype === 'Connector Line')
      csv_row = this._blockScrapeConnectorLine();
    if (macrotype === 'Animated Line')
      csv_row = this._blockScrapeAnimatedline();
    if (macrotype === 'Web Font')
      csv_row = this._blockScrapeWebFont();
    if (macrotype === 'Scene')
      csv_row = this._blockScrapeScene();
    if (macrotype === '2D Text Plane')
      csv_row = this._shapeScrapeTextPlane();

    let includeParent = this.show_parent_wizard_details.checked;
    let sel = this.block_wizard_type_select.value;
    if (sel === 'Web Font' || sel === 'Scene')
      includeParent = false;
    if (includeParent) {
      csv_row['parent'] = this.wizard_parent.value;
      csv_row['x'] = this.wizard_x.value;
      csv_row['y'] = this.wizard_y.value;
      csv_row['z'] = this.wizard_z.value;
      csv_row['rx'] = this.wizard_rx.value;
      csv_row['ry'] = this.wizard_ry.value;
      csv_row['rz'] = this.wizard_rz.value;
      csv_row['sx'] = this.wizard_sx.value;
      csv_row['sy'] = this.wizard_sy.value;
      csv_row['sz'] = this.wizard_sz.value;
    }

    let excludeEmpty = this.copy_csv_excludeempty_clipboard.checked;
    let out_row = csv_row;
    if (excludeEmpty) {
      out_row = {};
      for (let key in csv_row)
        if (csv_row[key] !== '')
          out_row[key] = csv_row[key];
    }

    let header = this.copy_csv_header_clipboard.checked;
    this.export_csv = out_row;
    if (this.export_csv) {
      if (window.Papa)
        this.csvImportPreviewRaw = Papa.unparse([this.export_csv], {
          header
        });
      else
        this.csvImportPreviewRaw = '';

      this.csv_import_preview.innerHTML = this.csvImportPreviewRaw;
      if (this.csv_import_shown === 2) {
        this.csv_import_shown = 0;
        this._updateCSVDisplay(2);
      }
    } else
      this.csv_import_preview.innerHTML = new Date();
  }
  __registerFileUploaders() {
    this.imageInputList = this.panel.querySelectorAll('.texturepathinput');
    this.imageUploadButtonList = this.panel.querySelectorAll('.texturepathupload');
    this.imageUploadButtonList.forEach((btn, index) => {
      let file = document.createElement('input');
      file.setAttribute('type', 'file');
      file.style.display = 'none';
      btn.parentNode.appendChild(file);
      let field = this.imageInputList[index];
      file.addEventListener('change', e => this._handleImageTextureUpload(file, field));
      btn.addEventListener('click', e => file.click());
      field.addEventListener('input', e => {
        let path = field.value;
        let obj = this.app.texturesFromFile[path];
        let dirty = false;
        if (obj) {
          let fieldname = field.dataset.field;
          let ctl_scaleu = this.panel.querySelector('.' + fieldname + '_scaleu');
          let ctl_scalev = this.panel.querySelector('.' + fieldname + '_scalev');

          if (ctl_scaleu && obj.scaleu && obj.scaleu.toString() !== ctl_scaleu.value) {
            dirty = true;
            ctl_scaleu.value = obj.scaleu;
          }
          if (ctl_scalev && obj.scalev && obj.scalev.toString() !== ctl_scalev.value) {
            dirty = true;
            ctl_scalev.value = obj.scalev;
          }

          if (dirty) {
            let event = new Event('input', {
              bubbles: true,
              cancelable: true,
            });
            field.dispatchEvent(event);
          }
        }
      });
    });
  }
  static _dataRowsToTableHTML(dataRows, fieldOrder = [], headers = true) {
    if (!dataRows) return;
    if (dataRows.length < 1) return;

    let firstObj = dataRows[0];
    let firstKeys = Object.keys(firstObj);

    firstKeys.forEach(key => {
      if (fieldOrder.indexOf(key) === -1)
        fieldOrder.push(key);
    });

    let tableGuts = '';
    if (headers) {
      tableGuts += '<tr class="header">';
      fieldOrder.forEach((field) => {
        tableGuts += '<td>' + field.toString() + '</td>';
      });
      tableGuts += '</tr>';
    }

    dataRows.forEach((row) => {
      tableGuts += '<tr>';
      fieldOrder.forEach((field) => {
        let v = row[field];
        if (!v) v = '';
        tableGuts += '<td>' + v.toString() + '</td>';
      });
      tableGuts += '</tr>';
    });

    let html = '<table class="table_export">' + tableGuts + '</table>';

    return html;
  }
  static copyDataToClipboard(dataRows, fieldOrder = [], headers = true) {
    if (!dataRows) return;
    if (dataRows.length < 1) return;

    let html = cMacro._dataRowsToTableHTML(dataRows, fieldOrder, headers);
    let el = document.createElement('div');
    el.innerHTML = html;
    el = el.children[0];
    document.body.append(el);
    let range = document.createRange();
    let sel = window.getSelection();
    sel.removeAllRanges();
    try {
      range.selectNodeContents(el);
      sel.addRange(range);
    } catch (e) {
      range.selectNode(el);
      sel.addRange(range);
    }

    document.execCommand("copy");

    el.remove();
  }
  getItemName(resetItemName) {
    if (resetItemName)
      this.panelInputUpdated = false;

    let r = this.panelInput.value.trim();
    let prefix = this.tag;

    if (prefix === 'block') {
      prefix = this.block_wizard_type_select.value;
    } else if (prefix === 'shape') {
      prefix = this.shapetype_filter_select.value;
    }

    if (!this.panelInputUpdated)
      this.panelInput.value = prefix + ' ' + Math.floor(100 + Math.random() * 900).toString();
    this[this.tag + 'UpdateCSV']();
    return r;
  }
  async createItem(newWindow) {
    this.newName = this.panelInput.value.trim();
    let existingTitles = this.app.a.modelSets[this.tag].queryCache('title', this.newName);
    let keys = Object.keys(existingTitles);
    if (keys.length > 0) {
      alert(this.tag + ' asset already exists with title ' + this.newName);
      return;
    }

    this.createMesage.style.display = 'block';

    let newKey;
    if (this[this.tag + 'Create'])
      newKey = await this[this.tag + 'Create']();
    else {
      newKey = await this.app.activeContext.createObject(this.tag, this.newName);
    }
    this.app.mV.selectItem(newKey, newWindow);
    this.createMesage.style.display = 'none';
    if (this.addCallback)
      await this.addCallback(newKey, this.newName);
    return;
  }
}
