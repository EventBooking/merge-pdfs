# Template to Pdf

## Usage
``` 
const mergePdf = require('merge-pdf');
var documents = [doc1, doc2];
mergePdf.convert(documents).then(result => {
    var buffer = new Buffer(result, 'base64');
    fs.writeFileSync(path.join(__dirname, `merged.pdf`), buffer);
}).catch( error => {
    console.error(error);
});
```

## Building docker environment
```docker-compose build```

## Starting docker environment
```docker-compose run --rm --service-ports start```

## Running test
```docker-compose run --rm --service-ports start npm test```

## Debugging test
```docker-compose run --rm --service-ports start npm run debug```

...then attach vscode debugger