//async function execution timing/queuing
var sumTotal = 0;

function addOne() {
  sumTotal += 1;
  console.log('regular', sumTotal);
  return sumTotal;
}

async function addOneHundred() {
  sumTotal += 100;
  console.log('no promise async', sumTotal);
  return sumTotal;
}

async function addOneThousand() {
  return new Promise(res => {
    sumTotal += 1000;
    console.log('promise with resolve', sumTotal);
    res(sumTotal);
  });
}

async function addTenThousand() {
  return new Promise(res => {
    setTimeout(() => {
      sumTotal += 10000;
      console.log('promise with timeout resolve', sumTotal);
      res(sumTotal);
    }, 0);
  });
}

function sumTotals() {
  console.log('start', sumTotal);

  addOne();
  addOneHundred();
  addOneThousand();
  addTenThousand();

  console.log('function ending value', sumTotal);
}

sumTotals();
