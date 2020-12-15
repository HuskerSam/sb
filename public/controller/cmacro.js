class cMacro {
  constructor(panel, tag, app, addonmode = false) {
    this.app = app;
    this.panel = panel;
    this.tag = tag;
    this.addonmode = true;

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
    panel.innerHTML = base + t + `<hr>`;
    if (tag !== 'workspace') {
      if (!this.addonmode) {
        this.panelCreateBtn = this.panel.querySelector('.add-button');
        this.panelCreateBtn.addEventListener('click', e => this.createItem());
        this.panelCreateBtn2 = this.panel.querySelector('.add-newwindow-button');
        this.panelCreateBtn2.addEventListener('click', e => this.createItem(true));
      }
      this.panelInput = this.panel.querySelector('.add-item-name');
      this.createMesage = this.panel.querySelector('.creating-message');
    }

    if (this[tag + 'Register'])
      this[tag + 'Register']();

    this.defaultParent = null;
    this.addCallback = null;
  }
  updateFontField(textDom) {
    textDom.style.fontFamily = textDom.value;
  }
  baseTemplate() {
    let template = `<label class="add_template_name_label"><b>${this.tag} name</b>
     <input class="add-item-name" type="text" style="width:10em;" /></label>`;
     if (!this.addonmode)
      template += `<button class="add-button btn-sb-icon"><i class="material-icons">add</i></button>
      <button class="add-newwindow-button btn-sb-icon"><i class="material-icons">open_in_new</i></button>`;

    template += `<br class="new_button_break">
      <div class="creating-message" style="display:none;background:silver;padding: .25em;">Creating...</div>`;

    return template;
  }
  blockTemplate() {
    return `<select class="block-type-select">
     <option selected>Scene</option>
     <option>Text and Shape</option>
     <option>Animated Line</option>
     <option>Connector Line</option>
     <option>2D Text Plane</option>
     <option>Web Font</option>
    </select>
    <div class="create-2d-text-plane">
      <label><span>texturetext</span><input class="texturetext" style="width:10em" type="text" value="Text Line" /></label><br>
      <label><span>texturetext2</span><input class="texturetext2" type="text" value="" style="width:10em" /></label><br>
      <label><span>textfontfamily</span><input class="textfontfamily" type="text" list="fontfamilydatalist" style="width:10em" /></label><br>
      <label><span>textfontcolor</span><input class="textfontcolor" type="text" value="0,0,0" style="width:10em" /></label><br>
      <label><span>textfontweight</span><input class="textfontweight" type="text" value="" style="width:10em" /></label><br>
      <label><span>textfontsize</span><input class="textfontsize" type="text" value="100" /></label><br>
      <label><span>texturetextrendersize</span><input class="texturetextrendersize" type="text" value="512" /></label><br>
      <label><span>width</span><input class="width" type="text" value="4" /></label><br>
      <label><span>height</span><input class="height" type="text" value="4" /></label><br>
    </div>
    <div class="web-font-block-add-options" style="display:none;">
      <label><span>Font Name</span><input type="text" class="genericblockdata" list="webfontsuggestionlist" style="width:10em;" value="" /></label>
    </div>
    <div class="connector-line-block-add-options" style="display:none;">
      <label><span>L </span><input type="text" class="length" value="10" /></label>
      <label><span>D </span><input type="text" class="diameter" value=".5" /></label>
      <br>
      <label><span>Tess </span><input type="text" class="tessellation" value="" /></label>
      <br>
      <label><span>Mat </span>&nbsp;<input type="text" class="material" list="materialdatatitlelookuplist" /></label>
      <input type="color" class="colorpicker" data-inputclass="material">
      <br>
      <label>
        <span>Pt </span>
        <select class="pointshape">
          <option>none</option>
          <option>cylinder</option>
          <option selected>cone</option>
          <option>sphere</option>
        </select>
      </label>
      <br>
      <label><span>Pt L </span><input type="text" class="pointlength" value="1" /></label>
      <label><span>Pt D </span><input type="text" class="pointdiameter" value="2" /></label>
      <br>
      <label><span>Pt Tess </span><input type="text" class="pointtessellation" value="" /></label>
      <br>
      <label><span>Pt Mat </span><input type="text" class="pointmaterial" list="materialdatatitlelookuplist" /></label>
      <input type="color" class="colorpicker" data-inputclass="pointmaterial">
      <br>
      <label>
        <span>Tl</span>
        <select class="tailshape">
          <option>none</option>
          <option>cylinder</option>
          <option>cone</option>
          <option selected>sphere</option>
        </select>
      </label>
      <br>
      <label><span>Tl L </span><input type="text" class="taillength" value="1" /></label>
      <label><span>Tl D </span><input type="text" class="taildiameter" value="1" /></label>
      <br>
      <label><span>Tl Tess </span><input type="text" class="tailtessellation" value="" /></label>
      <br>
      <label><span>Tl Mat </span><input type="text" class="tailmaterial" list="materialdatatitlelookuplist" /></label>
      <input type="color" class="colorpicker" data-inputclass="tailmaterial">
      <label><input type="checkbox" class="tailshapeflip"  style="width:auto;line-height:1.5em" />Flip</label>
    </div>
    <div class="animated-line-block-add-options">
      <label><span>Num </span><input type="text" class="dashes" value="5" /></label>
      <label><span>Run </span><input type="text" class="runlength" value="1500" /></label>
      <br>
      <label>
        <span>Shape </span>
        <select class="dotshape">
          <option>cylinder</option>
          <option selected>cone</option>
          <option>ellipsoid</option>
          <option>arrow</option>
        </select>
      </label>
      <label><span>Len </span><input type="text" class="dashlength" value=".5" /></label>
      <br>
      <label><span>Tess </span><input type="text" class="tessellation" value="" /></label>
      <br>
      <label><span>Mat </span><input type="text" class="material" list="materialdatatitlelookuplist" /></label>
      <input type="color" class="colorpicker" data-inputclass="material">
      <br>
      <label><span>W </span><input type="text" class="width" value="1" /></label>
      <label><span>H </span><input type="text" class="height" value="2" /></label>
      <label><span>D </span><input type="text" class="depth" value="10" /></label>
    </div>
    <div class="shape-and-text-block-options">
      <label><span>W </span><input type="text" class="width" value="4" /></label>
      <label><span>H </span><input type="text" class="height" value="1" /></label>
      <label><span>D </span><input type="text" class="depth" value="1" /></label>
      <br>
      <label><span>L1 </span><input type="text" class="texttext" value="My Message" /></label>
      <label><span>L2 </span><input type="text" class="texttextline2" value="" /></label>
      <label><span>Font </span><input class="textfontfamily" type="text" list="fontfamilydatalist" /></label>
      <label><span>D </span><input type="text" class="textdepth" value=".25" /></label>
      <label><span>Fill </span><input type="text" class="textmaterial" list="materialdatatitlelookuplist" />
      </label>
      <input type="color" class="colorpicker" data-inputclass="textmaterial">
      <br>
      <br>
      <label><select class="createshapetype">
        <option>cube</option>
        <option>box</option>
        <option selected>cone</option>
        <option>cylinder</option>
        <option>sphere</option>
        <option>ellipsoid</option>
      </select></label>
      <label><span>Tess </span><input type="text" class="tessellation" /></label>
      <label><input type="checkbox" style="width:auto;line-height:1.5em" class="cylinderhorizontal" /> <span>Rotate</span></label>
      <br>
      <label><span>Mat </span><input type="text" class="shapematerial" list="materialdatatitlelookuplist" /></label>
      <input type="color" class="colorpicker" data-inputclass="shapematerial">
      <br>
    </div>
    <div class="scene-block-add-options">
      <label><input type="radio" class="sceneaddtype skyboxtemplatetype" data-type="skyboxscenefeatures" name="sceneaddtype" checked /><span>Skybox</span></label>
      <label><input type="radio" class="sceneaddtype buildingtemplatetype" data-type="buildingscenefeatures" name="sceneaddtype" /><span>Building</span></label>
      <div class="skyboxscenefeatures">
        <label><span>Skybox Size</span><input type="text" class="skyboxsize" value="400" /></label>
        <br>
        <label><span>Ground</span><input type="text" style="width:10em;" class="groundimage" list="sbimageslist" /></label>
        <br>
        <label><span>Scale v</span><input type="text" class="skyboxgroundscalev" value="1" /></label>
        <label><span>Scale u</span><input type="text" class="skyboxgroundscaleu" value="1" /></label>
        <br>
        <img class="cloud-file-ground-preview" crossorigin="anonymous" style="width:5em;height:5em;display:none;">
        <br>
        <label><span>Skybox Template</span><input type="text" style="width:10em;" class="skybox" list="skyboxlist" /></label>
        <div class="skybox-preview-images">
          <img crossorigin="anonymous">
        </div>
        <br>
        <div style="text-align:center">
          <img src="${this.app.jsonLibPrefix}/images/scenebox.png" style="width:75%" />
        </div>
      </div>
      <div class="buildingscenefeatures" style="display:none;">
        <label><span>w (x)</span><input type="text" class="width" value="50" /></label>
        <label><span>d (z)</span><input type="text" class="depth" value="100" /></label>
        <label><span>h (y)</span><input type="text" class="height" value="40" /></label>
        <label><input type="checkbox" class="show_uploads" /><span>uploads</span></label>
        <br>
        <label><span>floormaterial</span><input type="text" style="width:10em;" class="floormaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="floormaterial">
        <br>
        <div class="image_upload_building">
          <label><span>floorimage</span><input type="text" style="width:10em;" class="floorimage texturepathinput" list="floorTexturesDataList" /></label>
          <br>
          <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
          <img src="" style="width:2em;height:2em;" crossorigin="anonymous">
          <br>
          <label><span>floorscalev (x)</span><input type="text" class="floorscalev" value="1" /></label>
          <label><span>floorscaleu (z)</span><input type="text" class="floorscaleu" value="1" /></label>
        </div>
        <label><span>backwallmaterial</span>&nbsp;<input type="text" style="width:10em;" class="backwallmaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="backwallmaterial">
        <br>
        <div class="image_upload_building">
          <label><span>backwallimage</span><input type="text" style="width:10em;" class="backwallimage texturepathinput" list="wallTexturesDataList" /></label>
          <br>
          <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
          <img src="" style="width:2em;height:2em;" crossorigin="anonymous">
          <br>
          <label><span>backwallscalev</span><input type="text" class="backwallscalev" value="1" /></label>
          <label><span>backwallscaleu</span><input type="text" class="backwallscaleu" value="1" /></label>
        </div>
        <label><span>frontwallmaterial</span>&nbsp;<input type="text" style="width:10em;" class="frontwallmaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="frontwallmaterial">
        <br>
        <div class="image_upload_building">
          <label><span>frontwallimage</span><input type="text" style="width:10em;" class="frontwallimage texturepathinput" list="wallTexturesDataList" /></label>
          <br>
          <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
          <img src="" style="width:2em;height:2em;" crossorigin="anonymous">
          <br>
          <label><span>frontwallscalev</span><input type="text" class="frontwallscalev" value="1" /></label>
          <label><span>frontwallscaleu</span><input type="text" class="frontwallscaleu" value="1" /></label>
        </div>
        <label><span>leftwallmaterial</span>&nbsp;<input type="text" style="width:10em;" class="leftwallmaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="leftwallmaterial">
        <br>
        <div class="image_upload_building">
          <label><span>leftwallimage</span><input type="text" style="width:10em;" class="leftwallimage texturepathinput" list="wallTexturesDataList" /></label>
          <br>
          <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
          <img src="" style="width:2em;height:2em;" crossorigin="anonymous">
          <br>
          <label><span>leftwallscalev</span><input type="text" class="leftwallscalev" value="1" /></label>
          <label><span>leftwallscaleu</span><input type="text" class="leftwallscaleu" value="1" /></label>
        </div>
        <label><span>rightwallmaterial</span>&nbsp;<input type="text" style="width:10em;" class="rightwallmaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="rightwallmaterial">
        <br>
        <div class="image_upload_building">
          <label><span>rightwallimage</span><input type="text" style="width:10em;" class="rightwallimage texturepathinput" list="wallTexturesDataList" /></label>
          <br>
          <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
          <img src="" style="width:2em;height:2em;" crossorigin="anonymous">
          <br>
          <label><span>rightwallscalev</span><input type="text" class="rightwallscalev" value="1" /></label>
          <label><span>rightwallscaleu</span><input type="text" class="rightwallscaleu" value="1" /></label>
        </div>
        <label><span>ceilingmaterial</span>&nbsp;<input type="text" style="width:10em;" class="ceilingmaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="ceilingmaterial">
        <br>
        <div class="image_upload_building">
          <label><span>ceilingwallimage</span><input type="text" style="width:10em;" class="ceilingwallimage texturepathinput" list="wallTexturesDataList" /></label>
          <br>
          <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
          <img src="" style="width:2em;height:2em;" crossorigin="anonymous">
          <br>
          <label><span>ceilingwallscalev</span><input type="text" class="ceilingwallscalev" value="1" /></label>
          <label><span>ceilingwallscaleu</span><input type="text" class="ceilingwallscaleu" value="1" /></label>
        </div>
        <div style="text-align:center">
          <img src="${this.app.jsonLibPrefix}/images/buildingtemplate.png" style="width:75%" />
        </div>
      </div>
    </div>
    <div style="display:flex">
      <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
      <div class="csv_import_preview" style="flex:1"></div>
    </div>
    <datalist id="webfontsuggestionlist"></datalist>`;
  }
  blockRegister() {
    this.blockOptionsPicker = this.panel.querySelector('.block-type-select');
    this.blockOptionsPicker.addEventListener('input', e => this.blockHelperChange());

    this.blockShapePanel = this.panel.querySelector('.shape-and-text-block-options');
    this.sceneBlockPanel = this.panel.querySelector('.scene-block-add-options');
    this.connectorLinePanel = this.panel.querySelector('.connector-line-block-add-options');
    this.animatedDashPanel = this.panel.querySelector('.animated-line-block-add-options');
    this.webFontPanel = this.panel.querySelector('.web-font-block-add-options');
    this.text2dpanel = this.panel.querySelector('.create-2d-text-plane');

    this.skyBoxImages = this.sceneBlockPanel.querySelector('.skybox-preview-images');
    this.skyBoxInput = this.sceneBlockPanel.querySelector('.skybox');
    this.skyBoxInput.addEventListener('input', e => this.blockSkyboxChange());

    let sceneRadios = this.sceneBlockPanel.querySelectorAll('.sceneaddtype');
    sceneRadios.forEach(rdo => {
      rdo.addEventListener('input', e => {
        this.sceneBlockPanel.querySelector('.buildingscenefeatures').style.display = 'none';
        this.sceneBlockPanel.querySelector('.skyboxscenefeatures').style.display = 'none';
        let showClass = rdo.dataset.type;
        this.sceneBlockPanel.querySelector('.' + showClass).style.display = '';
      });
    });

    this.cloudImageInput = this.sceneBlockPanel.querySelector('.groundimage');
    this.groundImagePreview = this.sceneBlockPanel.querySelector('.cloud-file-ground-preview');

    this.addSceneLight = this.panel.querySelector('.block-add-hemi-light');
    this.stretchDetailsPanel = this.panel.querySelector('.block-stretch-along-width-label');
    this.csv_import_preview = this.panel.querySelector('.csv_import_preview');
    this.copy_csv_to_clipboard = this.panel.querySelector('.copy_csv_to_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      cMacro.copyDataToClipboard([this.export_csv]);
    });

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
        if (obj) {
          let inputs = field.parentElement.parentElement.querySelectorAll('input');
          if (obj.scaleu)
            inputs[2].value = obj.scaleu;
          if (obj.scalev)
            inputs[1].value = obj.scalev;
        }
      });
    });

    this.show_uploads = this.panel.querySelector('.show_uploads');
    this.image_upload_list = this.panel.querySelectorAll('.image_upload_building');
    this.show_uploads.addEventListener('input', e => {
      this.image_upload_list.forEach(ele => ele.style.display = (this.show_uploads.checked) ? 'block' : '');
    });

    this.blockHelperChange();
    this.blockSkyboxChange();
    this.blockUpdateCSV();
  }
  meshTemplate() {
    return `<div class="standardmeshassetpanel" style="flex:1;flex-direction:column;">
      <div>
        <label><span>meshpath</span><input type="text" style="width:50%;" class="mesh_meshpath" value="" list="meshesDefaultsDataList" /></label>
        <br>
        <label><span>texturepath</span><input type="text" style="width:50%;" list="texturedatatitlelookuplist" class="mesh_texturepath" value="" /></label>
        <br>
        <label><span>bmppath</span><input type="text" style="width:50%;" list="texturedatatitlelookuplist" class="mesh_bmppath" value="" /></label>
        <br>
        <label><input class="show_parent_mesh_details" type="checkbox"><span>show parent details</span></label>
        <div class="mesh_parent_details" style="display:none">
          <label><span>parent</span><input type="text" style="width:50%;" list="blockdatatitlelookuplist" class="mesh_parent" value="" /></label>
          <br>
          <label><span>x</span><input type="text" class="mesh_x" value="" /></label>
          <label><span>y</span><input type="text" class="mesh_y" value="" /></label>
          <label><span>z</span><input type="text" class="mesh_z" value="" /></label>
          <br>
          <label><span>sx</span><input type="text" class="mesh_sx" value="" /></label>
          <label><span>sy</span><input type="text" class="mesh_sy" value="" /></label>
          <label><span>sz</span><input type="text" class="mesh_sz" value="" /></label>
          <br>
          <label><span>rx</span><input type="text" class="mesh_rx" value="" /></label>
          <label><span>ry</span><input type="text" class="mesh_ry" value="" /></label>
          <label><span>rz</span><input type="text" class="mesh_rz" value="" /></label>
        </div>
      </div>
      <div class="mesh-details-images" style="flex:3;flex-direction:row;display:flex;">
        <img class="mesh_texture_img" crossorigin="anonymous" style="flex:1;max-width:45%;max-height:100%;">
        <img class="mesh_bump_img" crossorigin="anonymous" style="flex:1;max-width:45%;max-height:100%;">
        <img class="mesh-preview-img" crossorigin="anonymous" style="display:none;">
      </div>
      <div class="mesh_message" style=""></div>
    </div>
    <div style="display:flex">
      <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
      <div class="csv_import_preview" style="flex:1"></div>
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
    this.mesh_parent = this.panel.querySelector('.mesh_parent');
    this.mesh_x = this.panel.querySelector('.mesh_x');
    this.mesh_y = this.panel.querySelector('.mesh_y');
    this.mesh_z = this.panel.querySelector('.mesh_z');
    this.mesh_sx = this.panel.querySelector('.mesh_sx');
    this.mesh_sy = this.panel.querySelector('.mesh_sy');
    this.mesh_sz = this.panel.querySelector('.mesh_sz');
    this.mesh_rx = this.panel.querySelector('.mesh_rx');
    this.mesh_ry = this.panel.querySelector('.mesh_ry');
    this.mesh_rz = this.panel.querySelector('.mesh_rz');

    this.csv_import_preview = this.panel.querySelector('.csv_import_preview');
    this.copy_csv_to_clipboard = this.panel.querySelector('.copy_csv_to_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      cMacro.copyDataToClipboard([this.export_csv]);
    });

    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.meshUpdateCSV(e, i)));
    this.show_parent_mesh_details = this.panel.querySelector('.show_parent_mesh_details');
    this.mesh_parent_details = this.panel.querySelector('.mesh_parent_details');
    this.show_parent_mesh_details.addEventListener('input', e => {
      if (this.show_parent_mesh_details.checked)
        this.mesh_parent_details.style.display = '';
      else
        this.mesh_parent_details.style.display = 'none';
    });

    this.meshCSVFields = ['message', 'meshpath', 'texturepath', 'bmppath', 'x', 'y', 'z', 'sx', 'sy', 'sz', 'rx', 'ry', 'rz'];

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

    let csv = this.meshScrape();
    this.export_csv = csv;
    if (csv) {
      this.csv_import_preview.innerHTML = Papa.unparse([csv]);
    } else
      this.csv_import_preview.innerHTML = new Date();
  }
  meshScrape() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      asset: 'meshtexture',
      name: this.newName
    };

    csv_row['materialname'] = csv_row['name'] + '_material';
    csv_row['parent'] = this.mesh_parent.value;

    this.meshCSVFields.forEach((item, index) => {
      if (item === 'message')
        return;

      csv_row[item] = this['mesh_' + item].value;
    });
    csv_row['ambient'] = 'x';
    csv_row['diffuse'] = 'x';
    csv_row['emissive'] = 'x';

    return csv_row;
  }
  async meshCreate() {
    let row = this.meshScrape();

    let blockResult = await (new gCSVImport(this.app.loadedWID)).addCSVRow(row);
    return blockResult.key;
  }
  materialTemplate() {
    return `<div style="font-weight:bold;line-height:2em;text-align:center;"><label><input class="importstandardmaterial" type="checkbox" checked /><span>Import Standard Asset</span></label></div>
      <div class="standardmaterialassetpanel" style="flex:1;display:none;flex-direction:column;min-height:400px;height:75vh">
        <div style="flex:1;display:flex;flex-direction:row;">
          <select size="4" style="flex:1;" class="materialtexturepicker">
          </select>
        </div>
        <div style="text-align:center;">
          <label><span>scalev</span><input type="text" class="materialscalev" value="1" /></label>
          <label><span>scaleu</span><input type="text" class="materialscaleu" value="1" /></label>
        </div>
        <div class="material-details-images" style="flex:1;flex-direction:row;display:flex;overflow:hidden;">
          <img class="material_texture_img" crossorigin="anonymous" style="max-width:100%;max-height:50vh;">
        </div>
      </div>
      <div style="display:flex">
        <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
        <div class="csv_import_preview" style="flex:1"></div>
      </div>`;
  }
  _materialGetHTMLOptionList() {
    let html = '';
    for (let c = 0; c < 17; c++)
      html += `<option>sb:matpack/brickwall${c + 1}</option>`;
    for (let c = 0; c < 11; c++)
      html += `<option>sb:matpack/floor${c + 1}</option>`;
    for (let c = 0; c < 8; c++)
      html += `<option>sb:matpack/grid${c + 1}</option>`;
    for (let c = 0; c < 2; c++)
      html += `<option>sb:matpack/hedgerow${c + 1}</option>`;
    for (let c = 0; c < 4; c++)
      html += `<option>sb:matpack/metal${c + 1}</option>`;
    for (let c = 0; c < 16; c++)
      html += `<option>sb:matpack/roof${c + 1}</option>`;
    for (let c = 0; c < 7; c++)
      html += `<option>sb:matpack/wood${c + 1}</option>`;
    return html;
  }
  materialRegister() {
    this.standardmaterialassetpanel = this.panel.querySelector('.standardmaterialassetpanel');
    this.csv_import_preview = this.panel.querySelector('.csv_import_preview');
    this.copy_csv_to_clipboard = this.panel.querySelector('.copy_csv_to_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      cMacro.copyDataToClipboard([this.export_csv]);
    });

    this.materialtexturepicker = this.panel.querySelector('.materialtexturepicker');
    this.material_texture_img = this.panel.querySelector('.material_texture_img');
    this.materialscalev = this.panel.querySelector('.materialscalev');
    this.materialscaleu = this.panel.querySelector('.materialscaleu');

    this.materialtexturepicker.innerHTML = this._materialGetHTMLOptionList();

    this.materialtexturepicker.selectedIndex = 0;

    this.importstandardmaterial = this.panel.querySelector('.importstandardmaterial');
    this.importstandardmaterial.addEventListener('input', e => this.materialUpdateCSV());
    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.materialUpdateCSV()));
    this.panel.querySelectorAll('select').forEach(i => i.addEventListener('input', e => this.materialUpdateCSV()));

    this.materialUpdateCSV();
  }
  materialUpdateCSV() {
    let csv = this.materialScrape();
    this.export_csv = csv;
    if (csv) {
      this.csv_import_preview.innerHTML = Papa.unparse([csv]);
    } else
      this.csv_import_preview.innerHTML = new Date();
  }
  materialScrape() {
    if (!this.importstandardmaterial.checked) {
      this.standardmaterialassetpanel.style.display = 'none';
      return {};
    }
    this.standardmaterialassetpanel.style.display = 'flex';
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      asset: 'material',
      name: this.newName
    };

    let texture = this.materialtexturepicker.value;
    let textureURL = '';
    let speculartexture = '';
    let bumptexture = '';
    let hasAlpha = '';
    if (!texture)
      texture = '';
    if (texture) {
      textureURL = this.cdnPrefix + 'textures/' + texture.substring(3) + '_D.jpg';
      speculartexture = texture + '_S.jpg';
      bumptexture = texture + '_N.jpg';
      if (texture.substr(-5).substring(0, 4) === 'grid') {
        textureURL = this.cdnPrefix + 'textures/' + texture.substring(3) + '_D.png';
        hasAlpha = '1';
        texture += '_D.png';
      } else {
        texture += '_D.jpg';
      }

      this.material_texture_img.setAttribute('src', textureURL);
      this.material_texture_img.style.display = '';
    } else {
      this.material_texture_img.setAttribute('src', '');
      this.material_texture_img.style.display = 'none';
    }

    let scaleu = this.materialscaleu.value;
    let scalev = this.materialscalev.value;

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
    let row = this.materialScrape();

    let blockResult = await (new gCSVImport(this.app.loadedWID)).addCSVRow(row);
    return blockResult.key;
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
      this.blockUpdateCSV();
    });
  }
  _shapeScrapeTextPlane() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      asset: 'textplane',
      name: this.newName
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
  blockColorPickerClick(event, ctl) {
    let bColor = GLOBALUTIL.HexToRGB(ctl.value);
    let rgb = bColor.r.toFixed(2) + ',' + bColor.g.toFixed(2) + ',' + bColor.b.toFixed(2);
    let inputCTL = ctl.parentNode.querySelector('.' + ctl.dataset.inputclass);
    inputCTL.value = 'color: ' + rgb;

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
    this.blockUpdateCSV();
  }
  _blockScrapeTextAndShape() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      asset: 'shapeandtext',
      name: this.newName
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
      asset: 'connectorline',
      name: this.newName
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
      asset: 'animatedline',
      name: this.newName
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
      asset: 'block',
      name: this.newName,
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
      asset: 'sceneblock',
      name: this.newName
    };
    let fields = [
      'skyboxsize', 'groundimage', 'skyboxgroundscaleu', 'skyboxgroundscalev', 'skybox',
      'width', 'height', 'depth', 'floormaterial', 'backwallmaterial',
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
    let skyboxType = this.sceneBlockPanel.querySelector('.skyboxtemplatetype').checked;

    if (skyboxType)
      csv_row['skyboxtype'] = 'skybox';
    else
      csv_row['skyboxtype'] = 'building';

    fields.forEach(field => {
      let f = this.sceneBlockPanel.querySelector('.' + field);
      if (f) {
        if (f.getAttribute('type') === 'checkbox')
          csv_row[field] = f.checked ? '1' : '';
        else {
          if (field.indexOf('image') !== -1) {
            let p = f.parentElement.parentElement;
            let img = p.querySelector('img');
            let url = f.value;
            if (url.substring(0, 3) === 'sb:')
              url = this.cdnPrefix + 'textures/' + url.substring(3);

            img.setAttribute('src', url);
            if (f.value)
              img.style.display = '';
            else
              img.style.display = 'none';
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
    return csv_row;
  }
  async blockCreate() {
    let bType = this.blockOptionsPicker.value;
    this.mixin = {};
    this.file = null;
    this.mixin.materialName = '';

    if (bType === '2D Text Plane') {
      let row = this._shapeScrapeTextPlane();

      let blockResult = await (new gCSVImport(this.app.loadedWID)).addCSVRow(row);
      return blockResult.key;
    }
    if (bType === 'Web Font') {
      let row = this._blockScrapeWebFont();

      let blockResult = await (new gCSVImport(this.app.loadedWID)).addCSVRow(row);
      this.app._updateGoogleFonts();
      return blockResult.key;
    }
    if (bType === 'Text and Shape') {
      let row = this._blockScrapeTextAndShape();

      let blockResult = await (new gCSVImport(this.app.loadedWID)).addCSVRow(row);
      this.lastRowAdded = row;
      return blockResult.key;
    }
    if (bType === 'Scene') {
      let row = this._blockScrapeScene();

      let blockResult = await (new gCSVImport(this.app.loadedWID)).addCSVRow(row);
      return blockResult.key;
    }
    if (bType === 'Animated Line') {
      let row = this._blockScrapeAnimatedline();

      let blockResult = await (new gCSVImport(this.app.loadedWID)).addCSVRow(row);
      this.lastRowAdded = row;
      return blockResult.key;
    }
    if (bType === 'Connector Line') {
      let row = this._blockScrapeConnectorLine();

      let blockResult = await (new gCSVImport(this.app.loadedWID)).addCSVRow(row);
      this.lastRowAdded = row;
      return blockResult.key;
    }

  }
  blockSkyboxChange() {
    let skybox = this.skyBoxInput.value.trim();

    if (skybox === '')
      this.skyBoxImages.style.display = 'none';
    else {
      this.skyBoxImages.style.display = '';
      let imgs = this.skyBoxImages.querySelectorAll('img');

      imgs[0].setAttribute('src', skybox);

    }
  }
  blockHelperChange() {
    this.blockShapePanel.style.display = 'none';
    this.sceneBlockPanel.style.display = 'none';
    this.animatedDashPanel.style.display = 'none';
    this.connectorLinePanel.style.display = 'none';
    this.webFontPanel.style.display = 'none';
    this.text2dpanel.style.display = 'none';

    let sel = this.blockOptionsPicker.value;
    if (sel === 'Text and Shape')
      this.blockShapePanel.style.display = '';
    else if (sel === 'Scene')
      this.sceneBlockPanel.style.display = 'inline';
    else if (sel === 'Connector Line')
      this.connectorLinePanel.style.display = '';
    else if (sel === 'Animated Line')
      this.animatedDashPanel.style.display = '';
    else if (sel === '2D Text Plane')
      this.text2dpanel.style.display = '';
    else if (sel === 'Web Font')
      this.webFontPanel.style.display = '';
  }
  blockUpdateCSV() {
    let macrotype = this.blockOptionsPicker.value;
    let r = null;
    if (macrotype === 'Text and Shape')
      r = this._blockScrapeTextAndShape();
    if (macrotype === 'Connector Line')
      r = this._blockScrapeConnectorLine();
    if (macrotype === 'Animated Line')
      r = this._blockScrapeAnimatedline();
    if (macrotype === 'Web Font')
      r = this._blockScrapeWebFont();
    if (macrotype === 'Scene')
      r = this._blockScrapeScene();
    if (macrotype === '2D Text Plane')
      r = this._shapeScrapeTextPlane();

    this.export_csv = r;
    if (r) {
      if (window.Papa)
        this.csv_import_preview.innerHTML = Papa.unparse([r]);
    } else
      this.csv_import_preview.innerHTML = new Date();
  }

  static copyDataToClipboard(dataRows, fieldOrder = []) {
    if (!dataRows) return;
    if (dataRows.length < 1)  return;

    let firstObj = dataRows[0];
    let firstKeys = Object.keys(firstObj);

    firstKeys.forEach(key => {
      if (fieldOrder.indexOf(key) === -1)
        fieldOrder.push(key);
    });

    let tableGuts = '';
    tableGuts += '<tr>';
    fieldOrder.forEach((field) => {
      tableGuts += '<td>' + field.toString() + '</td>';
    });
    tableGuts += '</tr>';
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
  async createItem(newWindow) {
    this.newName = this.panelInput.value.trim();
    if (this.panelInput.value === '') {
      this.panelInput.value = 'Created ' + new Date().toISOString();
      //alert('Please enter a name');
      //return;
    }
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
    this.panelInput.value = '';

    return;
  }
}
