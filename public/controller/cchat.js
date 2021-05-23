class cChat {
  constructor() {

  }
  template() {
    return `<div class="shape_and_text_block_options">
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
          <td>Open Face</td>
          <td><input type="checkbox" style="width:1.25em;line-height:1.5em" class="textstroke" /></td>
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
          <td>Tessellation</td>
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
    </div>`;
  }
}
