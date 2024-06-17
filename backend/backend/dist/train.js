"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tf = __importStar(require("@tensorflow/tfjs-node"));
const data_1 = __importDefault(require("./data"));
// Convert hex color to normalized RGB
const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return [r, g, b];
};
const words = data_1.default.map((item) => item.word);
const colors = data_1.default.map((item) => hexToRgb(item.color));
const wordToIndex = {};
words.forEach((word, index) => {
    wordToIndex[word] = index;
});
const inputData = tf.tensor2d(words.map((word) => {
    const vector = new Array(words.length).fill(0);
    vector[wordToIndex[word]] = 1;
    return vector;
}));
const outputData = tf.tensor2d(colors);
const model = tf.sequential();
model.add(tf.layers.dense({ inputShape: [words.length], units: 50, activation: "relu" }));
model.add(tf.layers.dense({ units: 3, activation: "sigmoid" })); // Using sigmoid for normalized RGB output
model.compile({
    optimizer: "adam",
    loss: "meanSquaredError",
});
model.fit(inputData, outputData, { epochs: 1000 }).then(() => {
    console.log("Model trained");
    model.save("file://./model");
});
