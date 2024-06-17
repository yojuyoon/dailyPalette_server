import * as tf from "@tensorflow/tfjs-node";
import data from "./data";

// Convert hex color to normalized RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b];
};

const words = data.map((item) => item.word);
const colors = data.map((item) => hexToRgb(item.color));

const wordToIndex: { [key: string]: number } = {};
words.forEach((word, index) => {
  wordToIndex[word] = index;
});

const inputData = tf.tensor2d(
  words.map((word) => {
    const vector = new Array(words.length).fill(0);
    vector[wordToIndex[word]] = 1;
    return vector;
  })
);

const outputData = tf.tensor2d(colors);

const model = tf.sequential();
model.add(
  tf.layers.dense({ inputShape: [words.length], units: 50, activation: "relu" })
);
model.add(tf.layers.dense({ units: 3, activation: "sigmoid" })); // Using sigmoid for normalized RGB output

model.compile({
  optimizer: "adam",
  loss: "meanSquaredError",
});

model.fit(inputData, outputData, { epochs: 1000 }).then(() => {
  console.log("Model trained");
  model.save("file://./model");
});
