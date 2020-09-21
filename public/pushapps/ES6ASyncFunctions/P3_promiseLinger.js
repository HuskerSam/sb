// point is to show the promise body runs without calling .then() - but still lingers unresolved

let lingerPromise = new Promise(() => {
  console.log('runs body but Promise lingers');
});

console.log('promise state', lingerPromise);
