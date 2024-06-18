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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tf = __importStar(require("@tensorflow/tfjs-node"));
const data_1 = __importDefault(require("./data"));
const wordToIndex = {};
data_1.default.forEach((item, index) => {
    wordToIndex[item.word] = index;
});
const loadModel = () => __awaiter(void 0, void 0, void 0, function* () {
    const model = yield tf.loadLayersModel("file://./model/model.json");
    return model;
});
const rgbToHex = (r, g, b) => {
    return ("#" +
        [r, g, b]
            .map((x) => Math.round(x * 255)
            .toString(16)
            .padStart(2, "0"))
            .join(""));
};
const predictColor = (word) => __awaiter(void 0, void 0, void 0, function* () {
    const model = yield loadModel();
    const inputVector = new Array(data_1.default.length).fill(0);
    inputVector[wordToIndex[word]] = 1;
    const input = tf.tensor2d([inputVector], [1, data_1.default.length]);
    const prediction = model.predict(input);
    const color = (yield prediction.array());
    const [r, g, b] = color[0];
    const hexColor = rgbToHex(r, g, b);
    console.log(`Color for "${word}": ${hexColor}`);
});
predictColor("happy");
