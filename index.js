var express = require("express"),
    bodyParser = require("body-parser"),
    fs = require("fs"),
    uniqueFilename = require("unique-filename");

var _execFile = require("child_process").execFile;
var execFile = (path, args, callback) => {
    console.log(`Executing: ${path} ${args.join(' ')}`);
    _execFile(path, args, callback);
};

var _execSync = require('child_process').execSync;
var execSync = cmd => {
    console.log(`Executing: ${cmd}`);
    _execSync(cmd, {});
};

var app = express();
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));

app.post('/', function (req, res) {
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
    execSync(`rm ${name}`);
}

function pdftk(inputFiles, outputFile) {
    return new Promise((resolve, reject) => {
        var args = inputFiles.concat(["cat", "output", outputFile]);
        var command = execFile("/usr/bin/pdftk", args, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

function merge(documents) {
    var inputFiles = [],
        fileWritePromises = [];

    for (var doc of documents) {
        var buffer = new Buffer(doc, 'base64');
        var name = uniqueFilename("/tmp") + ".pdf";
        inputFiles.push(name);
        fileWritePromises.push(writeFile(name, buffer));
    }

    var outputFile = uniqueFilename("/tmp") + ".pdf";
    return new Promise((resolve, reject) => {
        Promise.all(fileWritePromises).then(() => {
            return pdftk(inputFiles, outputFile);
        }).then(() => {
            return readFile(outputFile);
        }).then(buffer => {
            var base64 = buffer.toString('base64');
            resolve(base64);
        }).catch(error => {
            reject(error);
        }).then(() => {
            for (var name of inputFiles.concat([outputFile]))
                removeFile(name);
        });
    });
}