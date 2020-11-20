'use strict';

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const CPUTIL_PATH = path.join(__dirname, './bin/macos/cputil');

function readFile(filename) {
  if (!filename) return Promise.reject(new Error('filename'));

  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
}

function writeFile(filename, data) {
  if (!filename) return Promise.reject(new Error('filename'));
  if (!data) return Promise.reject(new Error('data'));

  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
}

function deleteFile(filename) {
  if (!filename) return Promise.reject(new Error('filename'));

  return new Promise((resolve, reject) => {
    fs.unlink(filename, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
}

function execCputil(command, args) {
  args = !args || !args.length ? [] : args;

  args = args.map(arg => `"${arg}"`);

  const cputilArgs = [
    command,
    ...args
  ];

  console.log('cputilArgs', cputilArgs);

  const fullCommand = `${CPUTIL_PATH} ${cputilArgs.join(' ')}`;

  console.log('fullCommand', fullCommand);

  return new Promise((resolve, reject) => {
    child_process.exec(fullCommand, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      if (stderr) {
        console.log('stderr', stderr);

        return resolve(stderr);
      }

      return resolve(stdout);
    });
  });
}

function makeDir(path) {
  return checkIfDirAlreadyExists(path)
    .then(exists => {
      if (!exists) return createDir(path);
    });
}

function createDir(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, err => {
      if (err) {
        return reject(err);
      }

      return resolve(null);
    })
  });
}

function checkIfDirAlreadyExists(path) {
  return new Promise(resolve => {
    fs.access(path, error => {
      if (error) {
        return resolve(false);
      }

      return resolve(true);
    })
  });
}

module.exports = {
  /**
   * @desc takes a string of Star Prnt MarkUp and converts it to a format that can be handed to Star printers for printing.
   * @param {String} starPrintMarkUp
   * @returns {String}
   */
  convertStarPrintMarkUp(starPrintMarkUp) {
    if (!starPrintMarkUp) return Promise.reject(new Error('starPrintMarkUp'));

    const fileName = 'starMarkUp.stm';
    const tmpFilePath = path.join(__dirname, `./tmp/${fileName}`);
    const outputFilePath = path.join(__dirname, `./output/${fileName.replace('.stm', '.txt')}`);

    return Promise.all([
        makeDir(path.join(__dirname, './tmp')),
        makeDir(path.join(__dirname, './output'))
      ])
      .then(() => {
        writeFile(tmpFilePath, starPrintMarkUp)
      })
      .then(() => {
        return execCputil('decode', [
            'application/vnd.star.starprnt',
            tmpFilePath,
            outputFilePath
          ])
          .then(() => {
            return readFile(outputFilePath);
          })
          .then(fileData => {
            return Promise.all([
                deleteFile(tmpFilePath),
                deleteFile(outputFilePath)
              ])
              .then(() => {
                return fileData;
              });
          })
          .then(fileBuffer => {
            const fileData = fileBuffer.toString();

            return fileData;
          });
      });
  }
};
