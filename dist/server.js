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
const express_1 = __importDefault(require("express"));
const tf = __importStar(require("@tensorflow/tfjs-node"));
const data_1 = __importDefault(require("./data")); // Assume this is your training data module
const app = (0, express_1.default)();
const port = 3000;
// Load the model
const loadModel = () => __awaiter(void 0, void 0, void 0, function* () {
    const model = yield tf.loadLayersModel("file://./model/model.json");
    return model;
});
// API endpoint to process a paragraph and return the color based on feelings
app.post("/analyze-feelings", express_1.default.json(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { paragraph } = req.body;
    // Extract words (basic example, you might want to use a more sophisticated NLP tool)
    const words = paragraph.split(/\s+/);
    console.log(paragraph);
    // Dummy method to detect feelings
    // const detectedFeelings = words.filter((word) =>
    //   ["happy", "gloomy", "sad"].includes(word.toLowerCase())
    // );
    const detectedFeelings = words
        .filter((word) => data_1.default.some((item) => item.word === word.toLowerCase()))
        .map((word) => {
        const matchedItem = data_1.default.find((item) => item.word === word.toLowerCase());
        return matchedItem ? matchedItem.color : null;
    })
        .filter((color) => color !== null);
    if (detectedFeelings.length === 0) {
        return res.status(200).json({ color: "#FFFFFF" }); // Default or no emotion color
    }
    // Assuming a single detected feeling for simplicity
    const model = yield loadModel();
    const inputVector = new Array(data_1.default.length).fill(0);
    detectedFeelings.forEach((feeling) => {
        const index = data_1.default.findIndex((item) => item.word === feeling.toLowerCase());
        if (index !== -1)
            inputVector[index] = 1;
    });
    const input = tf.tensor2d([inputVector], [1, data_1.default.length]);
    const prediction = model.predict(input);
    const colorArray = yield prediction.array();
    const colorHex = rgbToHex(colorArray[0][0], colorArray[0][1], colorArray[0][2]);
    res.json({ color: colorHex });
}));
function rgbToHex(r, g, b) {
    const toHex = (n) => Math.round(n * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
