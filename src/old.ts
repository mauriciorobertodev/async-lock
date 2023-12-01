import AsyncLock from 'async-lock';
var lock = new AsyncLock();


const secondsPerOperation = 1;
const totalOfOperations = 10;

async function operation(id: number) {
    console.log("Execute operation %d", id);
    lock.acquire("key1", function(done) {
        console.log("lock %d enter", id)
        setTimeout(function() {
            console.log("lock %d Done", id)
            done(null, `eu sou o retorno do lock ${id}`);
        }, secondsPerOperation * 1000)
    }, function(err, ret) {
        console.log("lock %d release, return ->", id, ret);
    }, {});
}

for (let i = 1; i <= totalOfOperations; i++) {
    operation(i);
}