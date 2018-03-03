class cViewPublished extends cViewSuper {
  constructor() {
    super();

    this.elementSelect = document.getElementById('element-type-to-edit');
    this.elementSelect.addEventListener('input', e => this.elementTypeChange());
    this.blockId = document.getElementById('element-id-to-edit');
    this.blockField = document.getElementById('field-name-to-edit');
    this.fieldValue = document.getElementById('value-to-edit');
    this.setButton = document.getElementById('button-to-edit');
    this.setButton.addEventListener('click', e => this.setValue());

    this.elementTypeChange();
  }
  closeHeaderBands() {

  }
  setValue() {
    let t = this.elementSelect.value.toLowerCase();
    let id = this.blockId.value.split(' ')[0].trim();
    let field = this.blockField.value.trim();
    let v = this.fieldValue.value;

    if (id === '')
      return;

    if (field === '')
      return;

    gAPPP.a.modelSets[t].commitUpdateList([{
      field: field,
      newValue: v
    }], id);

  }
  elementTypeChange() {
    let t = this.elementSelect.value.toLowerCase();

    let options = '';
    let fS = gAPPP.a.modelSets[t].fireDataValuesByKey;
    for (let i in fS)
      options += '<option>' + i + ' ' + fS[i].title + '</option>';

    document.getElementById('elementidlist').innerHTML = options;

    if (t === 'frame')
      t = 'shapeFrame';
    let fields = sDataDefinition.bindingFields(t);

    let fieldOptions = '';
    for (let c = 0, l = fields.length; c< l; c++)
      fieldOptions += '<option>' + fields[c].fireSetField + '</option>';

    document.getElementById('fieldnamelist').innerHTML = fieldOptions;
  }
}
