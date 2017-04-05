var fs = require("fs"),
    uniqueFilename = require("unique-filename");

var port = process.argv.length > 2 ? parseInt(process.argv[2]) : 80;

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
    return new Promise((resolve, reject) => {
        fs.exists(name, exists => {
            if (!exists) {
                console.log(`${name} not found.`);
                resolve();
                return;
            }

            fs.unlink(name, err => {
                if (err) {
                    reject(err);
                    return;
                }

                console.log(`${name} removed.`);
                resolve();
            });
        })
    });
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
    return new Promise((resolve, reject) => {
        var inputFiles = [],
            fileWritePromises = [];

        for (var doc of documents) {
            var buffer = new Buffer(doc, 'base64');
            var name = uniqueFilename("/tmp") + ".pdf";
            inputFiles.push(name);
            fileWritePromises.push(writeFile(name, buffer));
        }

        var outputFile = uniqueFilename("/tmp") + ".pdf";

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

exports.merge = merge;