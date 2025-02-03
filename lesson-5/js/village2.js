// Get the canvas element as a const
const canvas = document.getElementById("renderCanvas");
// Create the BABYON 3D engine, and attach it to the canvas
const engine = new BABYLON.Engine(canvas, true);
// The createScene function
const createScene = async function() {
    // Create a new BABYLON scene, passing in the engine as an argument
    const scene = new BABYLON.Scene(engine);
    
    // Add a camera and allow it to control the canvas
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0)); // Add Arc Rotate Camera
    camera.attachControl(canvas, true);
    
    // Include a light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

    BABYLON.SceneLoader.ImportMeshAsync("", "./meshes/", "wheel.glb", scene).then((result) => {
        const wheelMesh = result.meshes[1];
        wheelMesh.scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);
        wheelMesh.position = BABYLON.Vector3.Zero(); // Start at the origin
 
        wheelMesh.computeWorldMatrix(true);
        wheelMesh.showBoundingBox = true;
        wheelMesh.getBoundingInfo().boundingBox.color = BABYLON.Color3.Red();
 
        console.log("Bounding Box:", wheelMesh.getBoundingInfo().boundingBox);
    }).catch((error) => {
        console.error("Error loading wheel:", error);
    });

    return scene;
};

// Continually render the scene in an endless loop
createScene().then((sceneToRender) => {
    engine.runRenderLoop(() => sceneToRender.render());
});

// Add an event listener that adapts to the user resizing the screen
window.addEventListener("resize", function() {
    engine.resize();
});

// Thanks to FireDragonGameStudio (https://www.youtube.com/watch?v=8tFUmc7LGqM) for the promise with createScene() that finally got the WebXR session to work
// Lesson adapted from "Getting Started - Chapter 2 - Build A Village" (https://doc.babylonjs.com/features/introductionToFeatures/chap2/)
