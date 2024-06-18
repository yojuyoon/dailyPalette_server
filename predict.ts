import * as tf from "@tensorflow/tfjs-node";
import data from "./data";

const wordToIndex: { [key: string]: number } = {};
data.forEach((item, index) => {
  wordToIndex[item.word] = index;
});

const loadModel = async (): Promise<tf.LayersModel> => {
  const model = await tf.loadLayersModel("file://./model/model.json");
  return model;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    [r, g, b]
      .map((x) =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
};

const predictColor = async (word: string) => {
  const model = await loadModel();

  const inputVector = new Array(data.length).fill(0);
  inputVector[wordToIndex[word]] = 1;

  const input = tf.tensor2d([inputVector], [1, data.length]);

  const prediction = model.predict(input) as tf.Tensor;
  const color = (await prediction.array()) as number[][];

  const [r, g, b] = color[0];
  const hexColor = rgbToHex(r, g, b);

  console.log(`Color for "${word}": ${hexColor}`);
};

predictColor("happy");
