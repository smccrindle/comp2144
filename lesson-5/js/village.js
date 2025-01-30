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
    
    // Add a ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {
        width: 10,
        height: 10
    });
    const groundMat = new BABYLON.StandardMaterial("groundMat");
    groundMat.diffuseColor = new BABYLON.Color3(0.33, 0.42, 0.18);
    ground.material = groundMat;

    // Add an array to position an image properly on each of the four visible sides of the box below (notice we will not set 4 and 5)
    const faceUV = [];
    faceUV[0] = new BABYLON.Vector4(0.4, 0.0, 0.6, 1.0); // rear face
    faceUV[1] = new BABYLON.Vector4(0.3, 0.0, 0.5, 1.0); // front face
    faceUV[2] = new BABYLON.Vector4(0.6, 0.0, 1.0, 1.0); // right side
    faceUV[3] = new BABYLON.Vector4(0.0, 0.0, 0.4, 1.0); // left side

    // Add a box to serve as a house
    const box = BABYLON.MeshBuilder.CreateBox("box", {faceUV: faceUV, wrap: true}); // note options parameter to set different images on each side
    box.scaling = new BABYLON.Vector3(2, 1.5, 3);
    box.position = new BABYLON.Vector3(1, 0.75, 2)
    box.rotation.y = BABYLON.Tools.ToRadians(45);
    const boxMat = new BABYLON.StandardMaterial("boxMat");
    boxMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/semihouse.png");
    box.material = boxMat;

    // Build a roof - using a cylinder mesh
    const roof = BABYLON.MeshBuilder.CreateCylinder("roof", {
        diameter: 2.8,
        height: 3.5,
        tessellation: 3
    });
    roof.scaling.x = 0.75;
    roof.rotation.z = BABYLON.Tools.ToRadians(90);
    roof.rotation.y = BABYLON.Tools.ToRadians(-45);
    roof.position = new BABYLON.Vector3(1, 2, 2);
    const roofMat = new BABYLON.StandardMaterial("roofMat");
    roofMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/roof.jpg");
    roof.material = roofMat;

    // Combine the box and the roof meshes into one mesh called 'house'
    // Note that the MergeMeshes method below includes arguments to allow multiple materials within the same mesh
    const house = BABYLON.Mesh.MergeMeshes([box, roof], true, false, null, false, true);

    // Create another instance of the house object and place it elsewhere on the ground
    let house2 = house.createInstance("house2");
    house2.position = new BABYLON.Vector3(0, 0, -4);
    house2.rotation.y = BABYLON.Tools.ToRadians(45);
    // How about a third house?
    let house3 = house.createInstance("house3");
    house3.position = new BABYLON.Vector3(-3, 0, 1.0);
    house3.rotation.y = BABYLON.Tools.ToRadians(-45);

    // Add some ambient sounds ("Chirping Birds Ambience" by Alex from Pixabay - https://pixabay.com/sound-effects/search/birds%20chirping/)
    const sound = new BABYLON.Sound("birds", "./media/chirping-birds-ambience-217410.mp3", scene, null, {
        loop: true,
        autoplay: true
    });
    
    // Include a 3D model of a tree (https://free3d.com/3d-model/low_poly_tree-816203.html by kipris, from which the .dae file is converted to .glb format using https://convert3d.org/)
    // Drop the tree into the scene using the ImportMeshAsync method (note that the tree is very, very tiny)
    const tree = BABYLON.SceneLoader.ImportMeshAsync("", "./meshes/", "Lowpoly_tree_sample.glb").then((result) => {
        result.meshes[0].position = new BABYLON.Vector3(-2.5, 0, -2.5);
        // Scale up the tree - it is way too small
        result.meshes[0].scaling = new BABYLON.Vector3(150, 150, 150);
    });

    // Check to see if WebXR (immersive-vr, specifically) is supported on this device
    if (BABYLON.WebXRSessionManager.IsSessionSupportedAsync("immersive-vr")) {
        const xr = await scene.createDefaultXRExperienceAsync({
            floorMeshes: [ground],
            optionalFeatures: true
        });
    } else {
        console.log("WebXR is not supported on this device.");
    }

    // Return the scene
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
