function promiseBodyFailure(resolveFunction, rejectFunction) {
  let errorMessage = 'Promise Rejected';
  let errorType = 'Intentional Error';
  rejectFunction({
    errorMessage,
    errorType
  });
}

let failPromise = new Promise(promiseBodyFailure);
failPromise.then(results => console.log("this won't run"))
  .catch(error => {
    console.log('errorMessage', error.errorMessage);
    console.log('errorType', error.errorType);
  });

console.log('promise status', failPromise);
