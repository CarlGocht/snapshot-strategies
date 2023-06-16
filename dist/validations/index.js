"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const basic_1 = __importDefault(require("./basic"));
const passport_gated_1 = __importDefault(require("./passport-gated"));
const passport_weighted_1 = __importDefault(require("./passport-weighted"));
const arbitrum_1 = __importDefault(require("./arbitrum"));
const validationClasses = {
    basic: basic_1.default,
    'passport-gated': passport_gated_1.default,
    'passport-weighted': passport_weighted_1.default,
    arbitrum: arbitrum_1.default
};
const validations = {};
Object.keys(validationClasses).forEach(function (validationName) {
    let examples = null;
    let schema = null;
    let about = '';
    try {
        examples = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, validationName, 'examples.json'), 'utf8'));
    }
    catch (error) {
        examples = null;
    }
    try {
        schema = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, validationName, 'schema.json'), 'utf8'));
    }
    catch (error) {
        schema = null;
    }
    try {
        about = (0, fs_1.readFileSync)(path_1.default.join(__dirname, validationName, 'README.md'), 'utf8');
    }
    catch (error) {
        about = '';
    }
    const validationClass = validationClasses[validationName];
    const validationInstance = new validationClass();
    validations[validationName] = {
        validation: validationClass,
        examples,
        schema,
        about,
        id: validationInstance.id,
        github: validationInstance.github,
        version: validationInstance.version,
        title: validationInstance.title,
        description: validationInstance.description,
        proposalValidationOnly: validationInstance.proposalValidationOnly,
        votingValidationOnly: validationInstance.votingValidationOnly
    };
});
exports.default = validations;
