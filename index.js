const utils = require("./utils.js"),
    uniqueFilename = require("unique-filename");

async function merge(documents) {
    var allFiles = [];

    try {
        var inputFiles = [],
            fileWritePromises = [];

        for (var doc of documents) {
            var buffer = new Buffer(doc, 'base64');
            var name = uniqueFilename("/tmp") + ".pdf";
            inputFiles.push(name);
            fileWritePromises.push(utils.writeFile(name, buffer));
        }

        var outputFile = uniqueFilename("/tmp") + ".pdf";

        await Promise.all(fileWritePromises);
        await utils.pdftk(inputFiles, outputFile);
        allFiles = inputFiles.concat([outputFile]);

        var buffer = await utils.readFile(outputFile);
        var base64 = buffer.toString('base64');

        return base64;
    } finally {
        for (var name of allFiles)
            utils.removeFile(name);
    }
}

exports.merge = merge;