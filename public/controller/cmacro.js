class cMacro {
  constructor(panel, tag, view) {
    this.panel = panel;
    this.tag = tag;
    this.view = view;
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

    if (this[tag + 'Register'])
      this[tag + 'Register']();

    if (tag !== 'workspace') {
      this.panelCreateBtn = this.panel.querySelector('.add-button');
      this.panelCreateBtn.addEventListener('click', e => this.createItem());
      this.panelCreateBtn2 = this.panel.querySelector('.add-newwindow-button');
      this.panelCreateBtn2.addEventListener('click', e => this.createItem(true));
      this.panelInput = this.panel.querySelector('.add-item-name');
      this.createMesage = this.panel.querySelector('.creating-message');
    }
  }
  updateFontField(textDom) {
    textDom.style.fontFamily = textDom.value;
  }
  baseTemplate() {
    return `<label><b>${this.tag} name</b>
     <input class="add-item-name" type="text" style="width:15em;" /></label>
      <button class="add-button btn-sb-icon"><i class="material-icons">add</i></button>
      <button class="add-newwindow-button btn-sb-icon"><i class="material-icons">open_in_new</i></button>
      <br>
      <div class="creating-message" style="display:none;background:silver;padding: .25em;">Creating...</div>`;
  }
  static assetJSON(tag, key) {
    if (!tag)
      return '';
    if (!key)
      return '';

    let asset = gAPPP.a.modelSets[tag].getCache(key);
    if (!asset)
      return '';
    let ele = Object.assign({}, asset);

    if (tag === 'block') {
      let frames = gAPPP.a.modelSets['frame'].queryCache('parentKey', key);
      let framesArray = [];
      for (let i in frames)
        framesArray.push(frames[i]);
      ele.frames = framesArray;

      let children = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', key);
      let childArray = [];
      for (let childKey in children) {
        let childFrames = gAPPP.a.modelSets['frame'].queryCache('parentKey', childKey);
        let childFramesArray = [];
        for (let i in childFrames)
          childFramesArray.push(childFrames[i]);
        children[childKey].frames = childFramesArray;
        childArray.push(children[childKey]);
      }
      ele.children = childArray;

    }
    delete ele.renderImageURL;
    ele.assetExportTag = tag;
    ele.assetExportKey = key;
    return JSON.stringify(ele, null, 4);
  }
  async createItem(newWindow) {
    this.newName = this.panelInput.value.trim();
    if (this.newName === '') {
      alert('Please enter a name');
      return;
    }
    let existingTitles = gAPPP.a.modelSets[this.tag].queryCache('title', this.newName);
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
      newKey = await this.create();
    }
    this.view.selectItem(newKey, newWindow);
    this.createMesage.style.display = 'none';
  }
  async create() {
    let results = await gAPPP.activeContext.createObject(this.tag, this.newName);
    return results.key;
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
      <label><span>texturetext</span><input class="texturetext" style="width:15em" type="text" value="Text Line" /></label><br>
      <label><span>texturetext2</span><input class="texturetext2" type="text" value="" style="width:15em" /></label><br>
      <label><span>textfontfamily</span><input class="textfontfamily" type="text" list="fontfamilydatalist" style="width:15em" /></label><br>
      <label><span>textfontcolor</span><input class="textfontcolor" type="text" value="0,0,0" style="width:15em" /></label><br>
      <label><span>textfontweight</span><input class="textfontweight" type="text" value="" style="width:15em" /></label><br>
      <label><span>textfontsize</span><input class="textfontsize" type="text" value="100" /></label><br>
      <label><span>texturetextrendersize</span><input class="texturetextrendersize" type="text" value="512" /></label><br>
      <label><span>width</span><input class="width" type="text" value="4" /></label><br>
      <label><span>height</span><input class="height" type="text" value="4" /></label><br>
    </div>
    <div class="web-font-block-add-options" style="display:none;">
      <label><span>Font Name</span><input type="text" class="genericblockdata" list="webfontsuggestionlist" style="width:15em;" value="" /></label>
    </div>
    <div class="connector-line-block-add-options" style="display:none;">
      <label><span>length</span><input type="text" class="length" value="10" /></label>
      <label><span>diameter</span><input type="text" class="diameter" value=".5" /></label>
      <br>
      <label><span>tessellation</span><input type="text" class="tessellation" value="" /></label>
      <br>
      <label><span>material</span>&nbsp;<input type="text" style="width:15em;" class="material" list="materialdatatitlelookuplist" /></label>
      <input type="color" class="colorpicker" data-inputclass="material">
      <br>
      <label>
        <span>pointshape</span>
        <select class="pointshape">
          <option>none</option>
          <option>cylinder</option>
          <option selected>cone</option>
          <option>sphere</option>
        </select>
      </label>
      <br>
      <label><span>pointlength</span><input type="text" class="pointlength" value="1" /></label>
      <label><span>pointdiameter</span><input type="text" class="pointdiameter" value="2" /></label>
      <br>
      <label><span>pointtessellation</span><input type="text" class="pointtessellation" value="" /></label>
      <br>
      <label><span>pointmaterial</span><input type="text" style="width:15em;" class="pointmaterial" list="materialdatatitlelookuplist" /></label>
      <input type="color" class="colorpicker" data-inputclass="pointmaterial">
      <br>
      <label>
        <span>tailshape</span>
        <select class="tailshape">
          <option>none</option>
          <option>cylinder</option>
          <option>cone</option>
          <option selected>sphere</option>
        </select>
      </label>
      <br>
      <label><span>taillength</span><input type="text" class="taillength" value="1" /></label>
      <label><span>taildiameter</span><input type="text" class="taildiameter" value="1" /></label>
      <br>
      <label><span>tailtessellation</span><input type="text" class="tailtessellation" value="" /></label>
      <br>
      <label><span>tailmaterial</span><input type="text" style="width:15em;" class="tailmaterial" list="materialdatatitlelookuplist" /></label>
      <input type="color" class="colorpicker" data-inputclass="tailmaterial">
      <label><input type="checkbox" class="tailshapeflip" />tailshapeflip</label>
    </div>
    <div class="animated-line-block-add-options">
      <label><span>dashes</span><input type="text" class="dashes" value="5" /></label>
      <label><span>runlength</span><input type="text" class="runlength" value="1500" /></label>
      <br>
      <label>
        <span>dotshape</span>
        <select class="dotshape">
          <option>cylinder</option>
          <option selected>cone</option>
          <option>ellipsoid</option>
          <option>arrow</option>
        </select>
      </label>
      <label><span>dashlength</span><input type="text" class="dashlength" value=".5" /></label>
      <br>
      <label><span>tessellation</span><input type="text" class="tessellation" value="" /></label>
      <br>
      <label><span>material</span><input type="text" style="width:15em;" class="material" list="materialdatatitlelookuplist" /></label>
      <input type="color" class="colorpicker" data-inputclass="material">
      <br>
      <label><span>width</span><input type="text" class="width" value="1" /></label>
      <label><span>height</span><input type="text" class="height" value="2" /></label>
      <label><span>depth</span><input type="text" class="depth" value="10" /></label>
    </div>
    <div class="shape-and-text-block-options">
      <label><span>texttext</span><input type="text" style="width:15em;" class="texttext" value="Block Text" /></label>
      <br>
      <label><span>texttextline2</span><input type="text" style="width:15em;" class="texttextline2" value="" /></label>
      <br>
      <label><span>textfontfamily</span><input class="textfontfamily" style="width:15em;" type="text" list="fontfamilydatalist" /></label>
      <label><span>textdepth</span><input type="text" class="textdepth" value=".25" /></label>
      <br>
      <label><span>textmaterial</span>&nbsp;<input type="text" style="width:15em;" class="textmaterial" list="materialdatatitlelookuplist" /></label>
      <input type="color" class="colorpicker" data-inputclass="textmaterial">
      <br>
      <label><span>createshapetype</span><select class="createshapetype">
        <option>cube</option>
        <option>box</option>
        <option selected>cone</option>
        <option>cylinder</option>
        <option>sphere</option>
        <option>ellipsoid</option>
      </select></label>
      <label><span>tessellation</span><input type="text" class="tessellation" /></label>
      <label><input type="checkbox" class="cylinderhorizontal" />cylinderhorizontal</label>
      <br>
      <label><span>shapematerial</span><input type="text" style="width:15em;" class="shapematerial" list="materialdatatitlelookuplist" /></label>
      <input type="color" class="colorpicker" data-inputclass="shapematerial">
      <br>
      <label><span>width</span><input type="text" class="width" value="4" /></label>
      <label><span>height</span><input type="text" class="height" value="1" /></label>
      <label><span>depth</span><input type="text" class="depth" value="1" /></label>
    </div>
    <div class="scene-block-add-options">
      <label><input type="radio" class="sceneaddtype skyboxtemplatetype" data-type="skyboxscenefeatures" name="sceneaddtype" checked /><span>Skybox Format</span></label>
      <label><input type="radio" class="sceneaddtype buildingtemplatetype" data-type="buildingscenefeatures" name="sceneaddtype" /><span>Building Format</span></label>
      <div class="skyboxscenefeatures">
        <label><span>Skybox Size</span><input type="text" class="skyboxsize" value="400" /></label>
        <br>
        <label><span>Ground</span><input type="text" style="width:15em;" class="groundimage" list="sbimageslist" /></label>
        <br>
        <label><span>Scale v</span><input type="text" class="skyboxgroundscalev" value="1" /></label>
        <label><span>Scale u</span><input type="text" class="skyboxgroundscaleu" value="1" /></label>
        <br>
        <img class="cloud-file-ground-preview" crossorigin="anonymous" style="width:5em;height:5em;display:none;">
        <br>
        <label><span>Skybox Template</span><input type="text" style="width:15em;" class="skybox" list="skyboxlist" /></label>
        <div class="skybox-preview-images">
          <img crossorigin="anonymous" style="position:relative;left:5em;top:.25em;">
          <div>
            <img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous">
          </div>
          <img crossorigin="anonymous" style="position:relative;left:5em;top:-.25em;">
        </div>
        <br>
        <div style="text-align:center">
          <img src="/images/scenebox.png" style="width:75%" />
        </div>
      </div>
      <div class="buildingscenefeatures" style="display:none;">
        <label><span>width (x-axis)</span><input type="text" class="width" value="50" /></label>
        <label><span>depth (z-axis)</span><input type="text" class="depth" value="100" /></label>
        <label><span>height (y-axis)</span><input type="text" class="height" value="40" /></label>
        <br>
        <label><span>floormaterial</span><input type="text" style="width:15em;" class="floormaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="floormaterial">
        <br>
        <label><span>floorimage</span><input type="text" style="width:15em;" class="floorimage texturepathinput" list="sbimageslist" /></label>
        <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
        <br>
        <label><span>floorscalev (repeat x)</span><input type="text" class="floorscalev" value="1" /></label>
        <label><span>floorscaleu (repeat z)</span><input type="text" class="floorscaleu" value="1" /></label>
        <br>
        <label><span>backwallmaterial</span>&nbsp;<input type="text" style="width:15em;" class="backwallmaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="backwallmaterial">
        <br>
        <label><span>backwallimage</span><input type="text" style="width:15em;" class="backwallimage texturepathinput" list="sbimageslist" /></label>
        <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
        <br>
        <label><span>backwallscalev</span><input type="text" class="backwallscalev" value="1" /></label>
        <label><span>backwallscaleu</span><input type="text" class="backwallscaleu" value="1" /></label>
        <br>
        <label><span>frontwallmaterial</span>&nbsp;<input type="text" style="width:15em;" class="frontwallmaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="frontwallmaterial">
        <br>
        <label><span>frontwallimage</span><input type="text" style="width:15em;" class="frontwallimage texturepathinput" list="sbimageslist" /></label>
        <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
        <br>
        <label><span>frontwallscalev</span><input type="text" class="frontwallscalev" value="1" /></label>
        <label><span>frontwallscaleu</span><input type="text" class="frontwallscaleu" value="1" /></label>
        <br>
        <label><span>leftwallmaterial</span>&nbsp;<input type="text" style="width:15em;" class="leftwallmaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="leftwallmaterial">
        <br>
        <label><span>leftwallimage</span><input type="text" style="width:15em;" class="leftwallimage texturepathinput" list="sbimageslist" /></label>
        <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
        <br>
        <label><span>leftwallscalev</span><input type="text" class="leftwallscalev" value="1" /></label>
        <label><span>leftwallscaleu</span><input type="text" class="leftwallscaleu" value="1" /></label>
        <br>
        <label><span>rightwallmaterial</span>&nbsp;<input type="text" style="width:15em;" class="rightwallmaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="rightwallmaterial">
        <br>
        <label><span>rightwallimage</span><input type="text" style="width:15em;" class="rightwallimage texturepathinput" list="sbimageslist" /></label>
        <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
        <br>
        <label><span>rightwallscalev</span><input type="text" class="rightwallscalev" value="1" /></label>
        <label><span>rightwallscaleu</span><input type="text" class="rightwallscaleu" value="1" /></label>
        <br>
        <label><span>ceilingmaterial</span>&nbsp;<input type="text" style="width:15em;" class="ceilingmaterial" list="materialdatatitlelookuplist" /></label>
        <input type="color" class="colorpicker" data-inputclass="ceilingmaterial">
        <br>
        <label><span>ceilingwallimage</span><input type="text" style="width:15em;" class="ceilingwallimage texturepathinput" list="sbimageslist" /></label>
        <button class="texturepathupload"><i class="material-icons">cloud_upload</i></button>
        <br>
        <label><span>ceilingwallscalev</span><input type="text" class="ceilingwallscalev" value="1" /></label>
        <label><span>ceilingwallscaleu</span><input type="text" class="ceilingwallscaleu" value="1" /></label>
        <br>
        <div style="text-align:center">
          <img src="/images/buildingtemplate.png" style="width:75%" />
        </div>
      </div>
    </div>
    <div class="csv_block_import_preview"></div>
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
    this.cloudImageInput.addEventListener('input', e => this.blockGroundChange());

    this.addSceneLight = this.panel.querySelector('.block-add-hemi-light');
    this.stretchDetailsPanel = this.panel.querySelector('.block-stretch-along-width-label');
    this.csv_block_import_preview = this.panel.querySelector('.csv_block_import_preview');

    this.webfontsuggestionlist = this.panel.querySelector('#webfontsuggestionlist');
    let html = '';
    this.webFonts.forEach(font => html += `<option>${font}</option>`);
    this.webfontsuggestionlist.innerHTML = html;

    this.panel.querySelectorAll('.textfontfamily').forEach(i => i.addEventListener('input', e => this.updateFontField(i)));
    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.blockUpdateCSV()));
    this.panel.querySelectorAll('select').forEach(i => i.addEventListener('input', e => this.blockUpdateCSV()));

    this.panelInput = document.createElement('input'); //place holder

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
    });

    this.blockHelperChange();
    this.blockSkyboxChange();
    this.blockUpdateCSV();
  }
  _handleImageTextureUpload(fileCtl, field) {
    let fileBlob = fileCtl.files[0];

    if (!fileBlob)
      return;

    field.value = 'Uploading...';

    let fireSet = gAPPP.a.modelSets['block'];
    let uKey = fireSet.getKey();
    let key = gAPPP.a.profile.selectedWorkspace + `/${uKey}/`;
    fireSet.setBlob(key, fileBlob, fileBlob.name).then(uploadResult => {
      field.value = uploadResult.downloadURL;
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
        else
          csv_row[field] = f.value;
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

      let blockResult = await (new gCSVImport(gAPPP.loadedWID)).addCSVRow(row);
      return blockResult.key;
    }
    if (bType === 'Web Font') {
      let row = this._blockScrapeWebFont();

      let blockResult = await (new gCSVImport(gAPPP.loadedWID)).addCSVRow(row);
      gAPPP._updateGoogleFonts();
      return blockResult.key;
    }
    if (bType === 'Text and Shape') {
      let row = this._blockScrapeTextAndShape();

      let blockResult = await (new gCSVImport(gAPPP.loadedWID)).addCSVRow(row);
      return blockResult.key;
    }
    if (bType === 'Scene') {
      let row = this._blockScrapeScene();

      let blockResult = await (new gCSVImport(gAPPP.loadedWID)).addCSVRow(row);
      return blockResult.key;
    }
    if (bType === 'Animated Line') {
      let row = this._blockScrapeAnimatedline();

      let blockResult = await (new gCSVImport(gAPPP.loadedWID)).addCSVRow(row);
      return blockResult.key;
    }
    if (bType === 'Connector Line') {
      let row = this._blockScrapeConnectorLine();

      let blockResult = await (new gCSVImport(gAPPP.loadedWID)).addCSVRow(row);
      return blockResult.key;
    }

  }
  blockGroundChange() {
    let cloudImage = this.cloudImageInput.value.trim();

    this.groundImagePreview.style.display = '';
    if (cloudImage !== '') {
      let url = cloudImage;
      if (url.substring(0, 3) === 'sb:') {
        url = gAPPP.cdnPrefix + 'textures/' + url.substring(3);
      }
      this.groundImagePreview.setAttribute('src', url);
    } else {
      this.groundImagePreview.style.display = 'none';
    }

  }
  blockSkyboxChange() {
    let skybox = this.skyBoxInput.value.trim();

    if (skybox === '')
      this.skyBoxImages.style.display = 'none';
    else {
      this.skyBoxImages.style.display = '';
      let imgs = this.skyBoxImages.querySelectorAll('img');

      let skyboxPath = gAPPP.cdnPrefix + 'box/' + skybox + '/skybox';

      imgs[0].setAttribute('src', skyboxPath + '_py.jpg');
      imgs[1].setAttribute('src', skyboxPath + '_nx.jpg');
      imgs[2].setAttribute('src', skyboxPath + '_pz.jpg');
      imgs[3].setAttribute('src', skyboxPath + '_px.jpg');
      imgs[4].setAttribute('src', skyboxPath + '_nz.jpg');
      imgs[5].setAttribute('src', skyboxPath + '_ny.jpg');
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

    if (r) {
      this.csv_block_import_preview.innerHTML = Papa.unparse([r]);
    } else
      this.csv_block_import_preview.innerHTML = new Date();
  }
}
