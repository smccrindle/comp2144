
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
    // Create a simple box, and apply a material and a colour to it.
    const box = BABYLON.MeshBuilder.CreateBox("box", {size: 0.5}, scene);
    const boxMat = new BABYLON.StandardMaterial("boxMat");
    boxMat.diffuseColor = new BABYLON.Color3(1, 0.6, 0);
    box.material = boxMat;
    // Move the box so it is not at your feet
    box.position.y = 1;
    box.position.z = 2;


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
            referenceSpaceType: "unbounded" // viewer, local, local-floor, bounded-floor, or unbounded (https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace and https://gist.github.com/lempa/64b3a89a19cbec980ade709be35d7cbc#file-webxr-reference-space-types-csv)

        },
        // Enable optional features - either all of them with true (boolean), or as an array
        optionalFeatures: true
    });


    /* INTERACTION
    ---------------------------------------------------------------------------------------------------- */
    // STEP 1: Add an action manager to the box mesh
    box.actionManager = new BABYLON.ActionManager(scene);

    // STEP 2: Secondly, you'd register an action associated with the BABYLON.ActionManager.OnPickTrigger trigger. This action will interpolate the mesh.visibility property to 0.2.
    // box.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPickTrigger, box, "visibility", 0.2, 1000)).then(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPickTrigger, box, "visibility", 1.0, 1000));

    // STEP XX: Scale the mesh slightly on hover (BABYLON.ActionManager.OnPointerOverTrigger)
    box.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOverTrigger, box, "scale", 1.2, 1000)).then(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOutTrigger, box, "scale", 1.0, 1000));

    // STEP XX: Change the color of the mesh on click (BABYLON.ActionManager.OnPickTrigger)
    // box.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPickTrigger, box, "material.diffuseColor", BABYLON.Color3.Random(), 1000));

    // box.material.diffuseColor = BABYLON.Color3.Random();

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

// Thanks to the great documentation at https://doc.babylonjs.com/, some excellent re-factoring of my code by Gemini, and some code writing assistance from CoPilot.