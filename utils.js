var fs = require("fs");

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

module.exports = {
    readFile: readFile,
    writeFile: writeFile,
    removeFile: removeFile,
    pdftk: pdftk
};