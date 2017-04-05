const mergePdf = require('../index.js'),
    fs = require("fs"),
    path = require('path');

var documents = [
    fs.readFileSync(path.join(__dirname, 'sample-1.pdf')),
    fs.readFileSync(path.join(__dirname, 'sample-2.pdf'))
];

async function test() {
    var result = await mergePdf.merge(documents);
    var buffer = new Buffer(result, 'base64');
    fs.writeFileSync(path.join(__dirname, `merged.pdf`), buffer);
}

test().then(() => {
    console.log('Done');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});;