"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertStarPrintMarkUp = exports.StarContentType = exports.StarPrinterType = void 0;
var fs = require("fs");
var path = require("path");
var child_process = require("child_process");
var uuid_1 = require("uuid");
var CPUTIL_PATH = process.platform === 'darwin'
    ? path.join(__dirname, './bin/macos/cputil')
    : path.join(__dirname, './bin/linux/cputil');
var StarPrinterType;
(function (StarPrinterType) {
    StarPrinterType["THERMAL_2"] = "thermal2";
    StarPrinterType["THERMAL_3"] = "thermal3";
    StarPrinterType["THERMAL_4"] = "thermal4";
})(StarPrinterType = exports.StarPrinterType || (exports.StarPrinterType = {}));
var StarContentType;
(function (StarContentType) {
    StarContentType["STAR_VND_PRNT"] = "application/vnd.star.starprnt";
    StarContentType["STAR_VND_LINE"] = "application/vnd.star.line";
})(StarContentType = exports.StarContentType || (exports.StarContentType = {}));
/**
 * @desc takes a string of Star Prnt MarkUp and converts it to a format that can be handed to Star printers for printing.
 * @param {String} text
 * @returns {String}
 */
var convertStarPrintMarkUp = function (_a) {
    var text = _a.text, printerType = _a.printerType, contentType = _a.contentType;
    return __awaiter(void 0, void 0, void 0, function () {
        var fileName, tmpFilePath, outputFilePath, outputFormat, cmd, fileBuffer;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!text)
                        return [2 /*return*/, Promise.reject(new Error('text'))];
                    fileName = "html-".concat((0, uuid_1.v4)(), ".stm");
                    tmpFilePath = path.join(__dirname, "./tmp/".concat(fileName));
                    outputFilePath = path.join(__dirname, "./output/".concat(fileName.replace('.stm', '.bin')));
                    outputFormat = contentType !== null && contentType !== void 0 ? contentType : StarContentType.STAR_VND_PRNT;
                    printerType = printerType !== null && printerType !== void 0 ? printerType : StarPrinterType.THERMAL_3;
                    cmd = "".concat(CPUTIL_PATH, " ").concat(printerType, " scale-to-fit decode ").concat(outputFormat, " ").concat(tmpFilePath, " ").concat(outputFilePath);
                    return [4 /*yield*/, Promise.all([
                            makeDir(path.join(__dirname, './tmp')),
                            makeDir(path.join(__dirname, './output')),
                        ])];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, writeFile(tmpFilePath, text)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, execCputil(cmd)];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, readFile(outputFilePath)];
                case 4:
                    fileBuffer = (_b.sent());
                    return [4 /*yield*/, Promise.all([deleteFile(tmpFilePath), deleteFile(outputFilePath)])];
                case 5:
                    _b.sent();
                    return [2 /*return*/, fileBuffer];
            }
        });
    });
};
exports.convertStarPrintMarkUp = convertStarPrintMarkUp;
function readFile(filename) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!filename)
                return [2 /*return*/, Promise.reject(new Error('filename'))];
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs.readFile(filename, function (err, result) {
                        if (err)
                            return reject(err);
                        return resolve(result);
                    });
                })];
        });
    });
}
function writeFile(filename, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs.writeFile(filename, data, {
                        encoding: 'utf-8',
                    }, function (err) {
                        if (err)
                            return reject(err);
                        return resolve(null);
                    });
                })];
        });
    });
}
function deleteFile(filename) {
    return new Promise(function (resolve, reject) {
        fs.unlink(filename, function (err) {
            if (err)
                return reject(err);
            return resolve(null);
        });
    });
}
function execCputil(command) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('CPUTIL COMMAND', command);
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    child_process.exec(command, function (error, stdout, stderr) {
                        if (error) {
                            return reject(error);
                        }
                        if (stderr) {
                            return resolve(stderr);
                        }
                        return resolve(stdout);
                    });
                })];
        });
    });
}
function makeDir(path) {
    return checkIfDirAlreadyExists(path).then(function (exists) {
        if (!exists)
            return createDir(path);
    });
}
function createDir(path) {
    return new Promise(function (resolve, reject) {
        fs.mkdir(path, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve(null);
        });
    });
}
function checkIfDirAlreadyExists(path) {
    return new Promise(function (resolve) {
        fs.access(path, function (error) {
            if (error) {
                return resolve(false);
            }
            return resolve(true);
        });
    });
}
