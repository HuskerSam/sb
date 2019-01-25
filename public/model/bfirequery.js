class FireQuery {
  constructor(projectId = 'default', dataType = 'block') {
    this.path = '/project/' + projectId + '/' + dataType + '/';
  }
  dbFetchByFieldLookup(field, value) {
    return firebase.database().ref(this.path)
      .orderByChild(field)
      .equalTo(value)
      .once('value')
      .then(result => {
        console.log(result);
        console.log(result.val());
      })
  }
}
