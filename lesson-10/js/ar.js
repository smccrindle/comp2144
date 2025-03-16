/* LESSON TODO
 * 1. Hover action
 * 2. Click action
 * 3. Native GUI controls
 * 4. Plane detection (maybe leave this in Lesson 9?)

*/
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
    box.position.y = 0.5;
    box.position.z = 1;


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
            // STEP 1: Set the referenceSpaceType to "unbounded" - since the headset is in passthrough mode with AR, let the vistor go anywhere they like within their physical space
            referenceSpaceType: "unbounded" // viewer, local, local-floor, bounded-floor, or unbounded (https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace and https://gist.github.com/lempa/64b3a89a19cbec980ade709be35d7cbc#file-webxr-reference-space-types-csv)

        },
        // Enable optional features - either all of them with true (boolean), or as an array
        optionalFeatures: true
    });


    /* INTERACTION
    ---------------------------------------------------------------------------------------------------- */
    // STEP 2: Add an action manager to the box mesh
    box.actionManager = new BABYLON.ActionManager(scene);


    // STEP 3a: Set up a "mouseover" effect - register a new action with the registerAction() method
    box.actionManager.registerAction(
        // STEP 3b: Set up the action to animate the effect with InterpolateValueAction
        new BABYLON.InterpolateValueAction(
            // STEP 3c: Add a hover action with OnPointerOverTrigger, to scale the box 1.2 times its size over a quarter of a second
            BABYLON.ActionManager.OnPointerOverTrigger,
            box,
            "scaling",
            new BABYLON.Vector3(1.2, 1.2, 1.2),
            250
        )
    );
    
    // STEP 4a: Set up a "mouseout" effect - register another action with the registerAction() method
    box.actionManager.registerAction(
        // STEP 4b: Set up the action to animate the effect once again with InterpolateValueAction
        new BABYLON.InterpolateValueAction(
            // STEP 4c: Add a hover-out action with OnPointerOutTrigger, to scale the box back to its original size over a quarter of a second
            BABYLON.ActionManager.OnPointerOutTrigger,
            box,
            "scaling",
            new BABYLON.Vector3(1, 1, 1), // Use Vector3 for scaling
            250
        )
    );

    // STEP 5a: Set up a "click" effect - register a third actionChange the color of the mesh on click (BABYLON.ActionManager.OnPickTrigger)
    function changeBoxColor() {
        box.material.diffuseColor = BABYLON.Color3.Random();
    }
    
    box.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            changeBoxColor
        )
    );

    // box.actionManager.registerAction(
    //     new BABYLON.SetValueAction(
    //         BABYLON.ActionManager.OnPickTrigger, box, "material.diffuseColor", BABYLON.Color3.Random()
    //     )
    // );

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