import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as faceApi from "face-api.js";

function App() {
  const [currentExpression,setCurrentExpression] = useState({text:"Neutral",emoji:"😐"})
  const videoRef = useRef(null);
  useEffect(() => {
    init().then(() => console.log("initialized"));
  }, []);

  async function init() {
    await faceApi.nets.tinyFaceDetector.load("/models");
    await faceApi.loadFaceExpressionModel("/models");
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    videoRef.current.srcObject = stream;
  }

  async function detect() {
    let inputSize = 512;
    let scoreThreshold = 0.5;

    const result = await faceApi
      .detectSingleFace(
        videoRef.current,
        new faceApi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
      )
      .withFaceExpressions();

    if (result) {

      //use emoji instead of text

      // get the highest score
      const maxScore = Math.max(...Object.values(result.expressions));
      const expression = Object.keys(result.expressions).find(
        (key) => result.expressions[key] === maxScore
      );


      const expressionToEmoji = {
        happy: {text:"Happy",emoji:"😄"},
        sad: {text:"Sad",emoji:"😢"},
        angry: {text:"Angry",emoji:"😡"},
        disgusted: {text:"Disgusted",emoji:"🤢"},
        surprised: {text:"Surprised",emoji:"😲"},
        neutral: {text:"Neutral",emoji:"😐"},
        fearful: {text:"Fearful",emoji:"😨"},
      }
      setCurrentExpression(expressionToEmoji[expression])
    }

    setTimeout(() => detect().then())
  }

  return (
    <>
      <div>
        <h2>Facial Expressions Detection</h2>
        <h1 style={{fontSize:120,marginBottom:2}} >{currentExpression.emoji}</h1>
        <h2 >{currentExpression.text}</h2>
        <video
          hidden
          onLoadedMetadata={() => detect().then()}
          ref={videoRef}
          id="inputVideo"
          autoPlay
          playsInline
        ></video>
        <canvas id="overlay" />
      </div>
    </>
  );
}

export default App;
