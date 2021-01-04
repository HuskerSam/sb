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
    let template = `<div class="block_wizard_add_name_div" style="flex:1;display:flex;flex-direction:row;padding-top:2px;">
      <label class="add_template_name_label" style="padding:4px;"><b>Name</b>
     </label><input class="add-item-name" type="text" style="width:10.5em;" value="name" />`;
    if (!this.addonmode)
      template += `<button class="add-button btn-sb-icon"><i class="material-icons">add</i></button>
        <button class="add-newwindow-button btn-sb-icon"><i class="material-icons">open_in_new</i></button>
        <br class="new_button_break">`;

    template += `<div class="creating-message" style="display:none;background:silver;padding: .25em;">Creating...</div></div>`;

    return template;
  }
  blockTemplate() {
    return `<div class="block_wizard_wrapper">
      <div style="display:flex;flex-direction:row">
        <select class="block-type-select" style="margin-bottom: 8px;margin-top:4px;width: 9em;margin-right:.25em;font-size:.9em">
         <option selected>Scene</option>
         <option>Text and Shape</option>
         <option>Animated Line</option>
         <option>Connector Line</option>
         <option>2D Text Plane</option>
         <option>Web Font</option>
        </select>
        <div class="scene_type_option_list" style="text-align:center;flex:10">
          <label><input type="radio" class="sceneaddtype skyboxtemplatetype" data-type="skyboxscenefeatures" name="sceneaddtype" checked /><span style="font-size:.85em">Skybox</span></label>
          <label><input type="radio" class="sceneaddtype buildingtemplatetype" data-type="buildingscenefeatures" name="sceneaddtype" /><span style="font-size:.85em;">Building</span></label>
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
            <td></td>
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
              <td><input type="text" class="skyboxsize" value="400" /></td>
              <td></td>
            </tr>
            <tr>
              <td>Ground</td>
              <td><input type="text" class="groundimage texturepathinput" data-field="groundimage" list="groundTexturesDataList" /></td>
              <td><button class="texturepathupload"><i class="material-icons">cloud_upload</i></button></td>
            </tr>
            <tr>
              <td>Scale v (x)</td>
              <td><input type="text" class="skyboxgroundscalev groundimage_scalev" value="1" /></td>
              <td></td>
            </tr>
            <tr>
              <td>Scale u (y)</td>
              <td><input type="text" class="skyboxgroundscaleu groundimage_scaleu" value="1" /></td>
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
              <td><input type="text" class="width" value="50" /></td>
              <td></td>
            </tr>
            <tr>
              <td>Depth (z)</td>
              <td><input type="text" class="depth" value="100" /></td>
              <td></td>
            </tr>
            <tr>
              <td>Height (y)</td>
              <td><input type="text" class="height" value="40" /></td>
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
              <td><input type="text" class="floorscalev floorimage_scalev" value="1" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="floorscaleu floorimage_scaleu" value="1" /></td>
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
              <td><input type="text" class="backwallscalev backwallimage_scalev" value="1" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="backwallscaleu backwallimage_scaleu" value="1" /></td>
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
              <td><input type="text" class="frontwallscalev frontwallimage_scalev" value="1" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="frontwallscaleu frontwallimage_scaleu" value="1" /></td>
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
              <td><input type="text" class="rightwallscalev rightwallimage_scalev" value="1" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="rightwallscaleu rightwallimage_scaleu" value="1" /></td>
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
              <td><input type="text" class="leftwallscalev leftwallimage_scalev" value="1" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="leftwallscaleu leftwallimage_scaleu" value="1" /></td>
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
              <td><input type="text" class="ceilingwallscalev ceilingwallimage_scalev" value="1" /></td>
              <td></td>
            </tr>
            <tr class="image_upload_building">
              <td>Scale u (z)</td>
              <td><input type="text" class="ceilingwallscaleu ceilingwallimage_scaleu" value="1" /></td>
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
    </div>
    <div style="padding:4px;text-align:left;border-top:solid 1px silver;">
      <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
      <button class="show_hide_raw_csv" style="flex:0;margin-left:0;"><i class="material-icons">table_rows</i></button>
      <label><input type="checkbox" checked class="copy_csv_header_clipboard"> headers</label>
      <br>
      <div class="csv_import_preview" style="flex:1;display:none;font-size:1.25em;"></div>
    </div>
    <datalist id="webfontsuggestionlist"></datalist>`;
  }
  blockRegister() {
    this.blockOptionsPicker = this.panel.querySelector('.block-type-select');
    this.blockOptionsPicker.addEventListener('input', e => this.blockHelperChange());

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
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      let headers = this.copy_csv_header_clipboard.checked;
      cMacro.copyDataToClipboard([this.export_csv], [], headers);
    });
    this.show_hide_raw_csv = this.panel.querySelector('.show_hide_raw_csv');
    this.show_hide_raw_csv.addEventListener('click', e => {
      if (!this.csv_import_shown) {
        this.csv_import_shown = true;
        this.csv_import_preview.style.display = '';
        this.show_hide_raw_csv.style.background = 'rgb(100,100,100)';
        this.show_hide_raw_csv.style.color = 'white';
      } else {
        this.csv_import_shown = false;
        this.csv_import_preview.style.display = 'none';
        this.show_hide_raw_csv.style.background = '';
        this.show_hide_raw_csv.style.color = '';
      }
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

    this.__registerFileUploaders();

    this.show_uploads = this.panel.querySelector('.show_uploads');
    this.image_upload_list = this.panel.querySelectorAll('.image_upload_building');
    this.show_uploads.addEventListener('input', e => {
      this.image_upload_list.forEach(ele => ele.style.display = (this.show_uploads.checked) ? 'table-row' : 'none');
    });

    this.blockHelperChange();
    this.blockSkyboxChange();
    this.blockUpdateCSV();
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
            <td>Show Parent Details</td>
            <td><input class="show_parent_mesh_details" style="width:1.5em" type="checkbox"></td>
            <td></td>
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
        </table>
        <table class="wizard_field_container mesh_parent_details" style="display:none">
          <tr>
            <td>Parent</td>
            <td><input type="text" list="blockdatatitlelookuplist" class="mesh_parent" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Position X</td>
            <td><input type="text" class="mesh_x" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Position Y</td>
            <td><input type="text" class="mesh_y" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Position Z</td>
            <td><input type="text" class="mesh_z" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Scale X</td>
            <td><input type="text" class="mesh_sx" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Scale Y</td>
            <td><input type="text" class="mesh_sy" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Scale Z</td>
            <td><input type="text" class="mesh_sz" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Rotate X</td>
            <td><input type="text" class="mesh_rx" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Rotate Y</td>
            <td><input type="text" class="mesh_ry" /></td>
            <td></td>
          </tr>
          <tr>
            <td>Rotate Z</td>
            <td><input type="text" class="mesh_rz" /></td>
            <td></td>
          </tr>
        </table>
      </div>
    </div>
    <div style="padding:4px;text-align:left;border-top:solid 1px silver;">
      <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
      <button class="show_hide_raw_csv" style="flex:0;margin-left:0"><i class="material-icons">table_rows</i></button>
      <label><input type="checkbox" checked class="copy_csv_header_clipboard"> headers</label>
      <br>
      <div class="csv_import_preview" style="flex:1;display:none;font-size:1.25em;"></div>
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
    this.copy_csv_header_clipboard = this.panel.querySelector('.copy_csv_header_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      let headers = this.copy_csv_header_clipboard.checked;
      cMacro.copyDataToClipboard([this.export_csv], [], headers);
    });
    this.show_hide_raw_csv = this.panel.querySelector('.show_hide_raw_csv');
    this.show_hide_raw_csv.addEventListener('click', e => {
      if (!this.csv_import_shown) {
        this.csv_import_shown = true;
        this.csv_import_preview.style.display = '';
      } else {
        this.csv_import_shown = false;
        this.csv_import_preview.style.display = 'none';
      }
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
      if (window.Papa)
        this.csv_import_preview.innerHTML = Papa.unparse([csv], {
          header
        });
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
    return `<div class="standardmaterialassetpanel material_wizard_wrapper" style="flex-direction:column">
        <select size="4" style="flex:1;margin:0" class="materialtexturepicker select_list">
        </select>
        <table class="wizard_field_container">
          <tr>
            <td style="text-align:center;">
              <label><span>Scale V (x)</span><input type="text" class="materialscalev" value="1" /></label>
              <label><span>Scale U (y)</span><input type="text" class="materialscaleu" value="1" /></label>
            </td>
          </tr>
        </table>
        <div class="material-details-images" style="flex:1;text-align:center;">
          <div class="material_image_bkg_div" style="width:90%;height:10em;background-image:repeat;display:inline-block;">
          &nbsp;
          </div>
        </div>
      </div>
      <div style="padding:4px;text-align:left;border-top:solid 1px silver;">
        <button class="copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
        <button class="show_hide_raw_csv" style="flex:0;margin-left:0"><i class="material-icons">table_rows</i></button>
        <label><input type="checkbox" checked class="copy_csv_header_clipboard"> headers</label>
        <br>
        <div class="csv_import_preview" style="flex:1;display:none;font-size:1.25em;"></div>
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
    this.copy_csv_header_clipboard = this.panel.querySelector('.copy_csv_header_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      let headers = this.copy_csv_header_clipboard.checked;
      cMacro.copyDataToClipboard([this.export_csv], [], headers);
    });
    this.show_hide_raw_csv = this.panel.querySelector('.show_hide_raw_csv');
    this.show_hide_raw_csv.addEventListener('click', e => {
      if (!this.csv_import_shown) {
        this.csv_import_shown = true;
        this.csv_import_preview.style.display = '';
        this.show_hide_raw_csv.style.background = 'rgb(100,100,100)';
        this.show_hide_raw_csv.style.color = 'white';
      } else {
        this.csv_import_shown = false;
        this.csv_import_preview.style.display = 'none';
        this.show_hide_raw_csv.style.background = '';
        this.show_hide_raw_csv.style.color = '';
      }
    });

    this.materialtexturepicker = this.panel.querySelector('.materialtexturepicker');
    this.material_image_bkg_div = this.panel.querySelector('.material_image_bkg_div');
    this.materialscalev = this.panel.querySelector('.materialscalev');
    this.materialscaleu = this.panel.querySelector('.materialscaleu');

    this.materialtexturepicker.innerHTML = this._materialGetHTMLOptionList();

    this.materialtexturepicker.selectedIndex = 0;

    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.materialUpdateCSV()));
    this.panel.querySelectorAll('select').forEach(i => i.addEventListener('input', e => this.materialUpdateCSV()));

    this.materialUpdateCSV();
  }
  materialUpdateCSV() {
    let csv = this.materialScrape();
    let header = this.copy_csv_header_clipboard.checked;

    this.export_csv = csv;
    if (csv) {
      if (window.Papa)
        this.csv_import_preview.innerHTML = Papa.unparse([csv], { header });
    } else
      this.csv_import_preview.innerHTML = new Date();
  }
  materialScrape() {
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

    let scaleu = this.materialscaleu.value;
    let scalev = this.materialscalev.value;

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

      this.material_image_bkg_div.style.backgroundImage = 'url(' + textureURL + ')';

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
    if (!inputCTL)
      inputCTL = ctl.parentNode.parentNode.querySelector('.' + ctl.dataset.inputclass);
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
    let skyboxType = this.panel.querySelector('.skyboxtemplatetype').checked;

    if (skyboxType)
      csv_row['skyboxtype'] = 'skybox';
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
                p_div.style.backgroundImage = 'url(' + url + ')';
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

    let sel = this.blockOptionsPicker.value;
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

    let header = this.copy_csv_header_clipboard.checked;
    this.export_csv = r;
    if (r) {
      if (window.Papa)
        this.csv_import_preview.innerHTML = Papa.unparse([r], { header });
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
  static copyDataToClipboard(dataRows, fieldOrder = [], headers = true) {
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
      tableGuts += '<tr>';
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
