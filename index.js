var express = require("express"),
    bodyParser = require("body-parser"),
    pdfMerge = require('easy-pdf-merge')
    fs = require("fs"),
    uniqueFilename = require("unique-filename");

var _exec = require('child_process').execSync;
var exec = cmd => {
    console.log(`Executing: ${cmd}`);
    _exec(cmd, {});
};

var app = express();
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));

app.post('/', function(req, res) {
    res.setTimeout(0);

    merge(req.body.documents).then(result => {
        res.send({ data: result });
    }).catch(error => {
        console.error(error);
        res.status(500);
        res.send();
    });
});

var server = app.listen(80);

function readFile(name) {
    return new Promise((resolve, reject) => {
        fs.readFile(name, null, (error, content) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(content);
        });
    });
}

function writeFile(name, buffer) {
    return new Promise((resolve, reject) => {
        var wstream = fs.createWriteStream(name);

        wstream.on('finish', () => {
            console.log('finish writing ' + name);
            resolve(name);
        });
        wstream.on('error', error => {
            reject(error);
        });

        wstream.write(buffer);
        wstream.end();
    });
}

function removeFile(name) {
    exec(`rm ${name}`);
}

function decodePdf(base64) {
    var buffer = new Buffer(base64, 'base64');
    return buffer;
}

function merge(documents) {
    var inputFiles = [];
    var fileWrites = [];

    for(var doc of documents) {
        var buffer = decodePdf(doc);
        var name = uniqueFilename("/tmp") + ".pdf";
        inputFiles.push(name);
        fileWrites.push(writeFile(name, buffer));
    }

    var outputFile = uniqueFilename("/tmp") + ".pdf";
    return new Promise((resolve, reject) => {
        Promise.all(fileWrites).then(() => {
            return new Promise((resolve, reject) => {
                pdfMerge(inputFiles, outputFile, error => {
                    if (error) {
                        reject(error);
                    } else {
                        readFile(outputFile).then(content => {
                            resolve(content)
                        }).catch(error => {
                            reject(error);
                        });
                    }
                });
            });
        }).then(buffer => {
            var base64 = buffer.toString('base64');
            resolve(base64);
        }).catch(error => {
            reject(error);
        }).then(() => {
            for(var name of inputFiles.concat([outputFile]))
                removeFile(name);
        });
    });
}