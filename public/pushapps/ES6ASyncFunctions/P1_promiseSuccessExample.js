console.log('');
console.log('Promise Success Example');
console.log('');

//the resolve and reject functions only accept 1 parameter
function promiseBodySuccess(resolveFunction, rejectFunction) {
  let successStatus = 'Promise Resolved';
  let successData = 'Data Payload';
  resolveFunction({
    successStatus,
    successData
  });
}

//a class that consumes a function that consumes 2 functions as parameters
let successPromise = new Promise(promiseBodySuccess);
successPromise.then(results => {
  console.log('success status', results.successStatus);
  console.log('success data', results.successData);
});

console.log('promise status', successPromise);
console.log('-------');
console.log('');
