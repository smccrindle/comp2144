// Get the canvas element as a const
const canvas = document.getElementById("renderCanvas");
// Create the BABYON 3D engine, and attach it to the canvas
const engine = new BABYLON.Engine(canvas, true);
// The createScene function
const createScene = async function() {
    // Create a new BABYLON scene, passing in the engine as an argument
    const scene = new BABYLON.Scene(engine);
    

    /* CAMERA
    ---------------------------------------------------------------------------------------------------- */
    // Add a camera and allow it to control the canvas
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);


    /* LIGHTING
    ---------------------------------------------------------------------------------------------------- */
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    /* GROUND
    ---------------------------------------------------------------------------------------------------- */
    // Note that in AR, we don't need to create a 'ground' mesh, as we are using the real world instead


    /* SKY
    ---------------------------------------------------------------------------------------------------- */
    // We also don't need to build a skybox for AR


    /* MESHES
    ---------------------------------------------------------------------------------------------------- */
    // Create a few mesh objects.
    const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", { height: 2, diameter: 1 }, scene);
    const cylinderMat = new BABYLON.StandardMaterial("cylinderMat", scene);
    cylinderMat.diffuseColor = new BABYLON.Color3(0, 1, 0); // Green
    cylinder.material = cylinderMat;
    cylinder.position.x = -2; // Position the cylinder to the left

    const pyramid = BABYLON.MeshBuilder.CreatePolyhedron("pyramid", { type: 1, size: 1, custom: { facets: [{ vertices: [0, 1, 2] }, { vertices: [0, 2, 3] }, { vertices: [0, 3, 1] }, { vertices: [1, 2, 3] }] } }, scene); //type:1 is a tetrahedron, which is then made into a pyramid via the custom facet creation.
    const pyramidMat = new BABYLON.StandardMaterial("pyramidMat", scene);
    pyramidMat.diffuseColor = new BABYLON.Color3(0, 0, 1); // Blue
    pyramid.material = pyramidMat;
    pyramid.position.x = 2; // Position the pyramid to the right

    const torus = BABYLON.MeshBuilder.CreateTorus("torus", { diameter: 1, thickness: 0.3, tessellation: 32 }, scene);
    const torusMat = new BABYLON.StandardMaterial("torusMat", scene);
    torusMat.diffuseColor = new BABYLON.Color3(1, 0, 1); // Magenta
    torus.material = torusMat;
    torus.position.y = 2; // position the Torus above the other meshes.
   

    /* SOUNDS
    ---------------------------------------------------------------------------------------------------- */
    

    /* ANIMATION
    ---------------------------------------------------------------------------------------------------- */


    /* ENABLE AR
    ---------------------------------------------------------------------------------------------------- */
    // Start a WebXR session (immersive-ar, specifically)
    const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar",
            // Set the referenceSpaceType to "unbounded" - since the headset is in passthrough mode with AR, let the vistor go anywhere they like within their physical space
            referenceSpaceType: "local" // viewer, local, local-floor, bounded-floor, or unbounded (https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace and https://gist.github.com/lempa/64b3a89a19cbec980ade709be35d7cbc#file-webxr-reference-space-types-csv)

        },
        // Enable optional features - either all of them with true (boolean), or as an array
        optionalFeatures: true
    });


    /* INTERACTION
    ---------------------------------------------------------------------------------------------------- */


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

// The grab and drag behaviour is thanks to the forum article at https://forum.babylonjs.com/t/near-dragging-a-mesh-in-immersive-vr-with-and-without-sixdofdragbehavior/48963 and the referenced playground at https://playground.babylonjs.com/#AZML8U#225