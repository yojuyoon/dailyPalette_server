import express from "express";
import * as tf from "@tensorflow/tfjs-node";
import data from "./data"; // Assume this is your training data module

const app = express();
const port = 3000;

// Load the model
const loadModel = async (): Promise<tf.LayersModel> => {
  const model = await tf.loadLayersModel("file://./model/model.json");
  return model;
};

// API endpoint to process a paragraph and return the color based on feelings
app.post("/analyze-feelings", express.json(), async (req, res) => {
  const { paragraph } = req.body;

  // Extract words (basic example, you might want to use a more sophisticated NLP tool)
  const words = paragraph.split(/\s+/);
  console.log(paragraph);
  // Dummy method to detect feelings
  // const detectedFeelings = words.filter((word) =>
  //   ["happy", "gloomy", "sad"].includes(word.toLowerCase())
  // );

  const detectedFeelings = words
    .filter((word) => data.some((item) => item.word === word.toLowerCase()))
    .map((word) => {
      const matchedItem = data.find((item) => item.word === word.toLowerCase());
      return matchedItem ? matchedItem.color : null;
    })
    .filter((color) => color !== null);

  if (detectedFeelings.length === 0) {
    return res.status(200).json({ color: "#FFFFFF" }); // Default or no emotion color
  }

  // Assuming a single detected feeling for simplicity
  const model = await loadModel();
  const inputVector = new Array(data.length).fill(0);
  detectedFeelings.forEach((feeling) => {
    const index = data.findIndex((item) => item.word === feeling.toLowerCase());
    if (index !== -1) inputVector[index] = 1;
  });

  const input = tf.tensor2d([inputVector], [1, data.length]);
  const prediction = model.predict(input) as tf.Tensor;
  const colorArray = await prediction.array();
  const colorHex = rgbToHex(
    colorArray[0][0],
    colorArray[0][1],
    colorArray[0][2]
  );

  res.json({ color: colorHex });
});

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
