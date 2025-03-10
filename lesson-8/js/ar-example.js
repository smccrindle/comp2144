
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
    // box.position.y = 1;
    // box.position.z = 2;


    /* SOUNDS
    ---------------------------------------------------------------------------------------------------- */
    

    /* ANIMATION
    ---------------------------------------------------------------------------------------------------- */


    /* ENABLE AR
    ---------------------------------------------------------------------------------------------------- */
    // Start a WebXR session (immersive-ar, specifically)
    console.log("Overlay element:", document.getElementById("overlay")); // Add this line

    const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar",
            referenceSpaceType: "unbounded", // viewer, local, local-floor, bounded-floor, or unbounded (https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace and https://gist.github.com/lempa/64b3a89a19cbec980ade709be35d7cbc#file-webxr-reference-space-types-csv)
            overlay: {
                element: document.getElementById("rangeOverlay")
            }
        },
        // Enable optional features - either all of them with true (boolean), or as an array
        optionalFeatures: true
    });
    // STEP 1: Add a DOM overlay to the uiOptions object, then proceed to index.html for STEP 2

    /* HIT-TEST
    ---------------------------------------------------------------------------------------------------- */
    // A hit-test is a standard feature in AR that permits a ray to be cast from the device (headset or phone) into the real world, and detect where it intersects with a real-world object. This enables AR apps to place objects on surfaces or walls of the real world (https://immersive-web.github.io/hit-test/). To enable hit-testing, use the enableFeature() method of the featuresManager from the base WebXR experience helper.
    const hitTest = xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRHitTest, "latest");
    // Create a marker to show where a hit-test has registered a surface
    const marker = BABYLON.MeshBuilder.CreateTorus("marker", {diameter: 0.15, thickness: 0.05}, scene);
    marker.isVisible = false;
    marker.rotationQuaternion = new BABYLON.Quaternion();
    // Create a variable to store the latest hit-test results
    let latestHitTestResults = null;
    // Add an event listener for the hit-test results
    hitTest.onHitTestResultObservable.add((results) => {
        // If there is a hit-test result, turn on the marker, and extract the position, rotation, and scaling from the hit-test result
        if (results.length) {
            marker.isVisible = true;
            results[0].transformationMatrix.decompose(marker.scaling, marker.rotationQuaternion, marker.position);
            latestHitTestResults = results;
        } else {
            // If there is no hit-test result, turn off the marker and clear the stored results
            marker.isVisible = false;
            latestHitTestResults = null;
        };
    });

    /* ANCHORS
    ---------------------------------------------------------------------------------------------------- */
    // Anchors are a feature that allow you to place objects in the real world space and have them stay there, even if the observer moves around. To enable anchors, use the enableFeature() method of the featuresManager from the base WebXR experience helper (https://immersive-web.github.io/anchors/).
    const anchors = xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRAnchorSystem, "latest");
    // Add event listener for click (and simulate this in the Immersive Web Emulator)
    canvas.addEventListener("click", () => {
        if(latestHitTestResults && latestHitTestResults.length > 0) {
            // Create an anchor where the hit test has registered a surface
            anchors.addAnchorPointUsingHitTestResultAsync(latestHitTestResults[0]).then((anchor) => {
                // Attach the box to the anchor
                anchor.attachedNode = box;
            }).catch((error) => {
                console.log(error);
            });
        };
    });
    

    // Return the scene
    return scene;
};

/* DOM OVERLAY
---------------------------------------------------------------------------------------------------- */
// Add an event listener to the range input
// document.getElementById("myRange").addEventListener("change", (event) => {
//     document.getElementById("rangeLabel").textContent = event.target.value;
//     // Use the range value in your AR scene...
// });

// Continually render the scene in an endless loop
createScene().then((sceneToRender) => {
    engine.runRenderLoop(() => sceneToRender.render());
});

// Add an event listener that adapts to the user resizing the screen
window.addEventListener("resize", function() {
    engine.resize();
});

// Thanks to the great documentation at https://doc.babylonjs.com/, some excellent re-factoring of my code by Gemini, and some code writing assistance from CoPilot.

/*
Reference Space Type: When working with XR, you need to define how the virtual world's coordinate system relates to the real world. This is handled by the "reference space." There are different types of reference spaces:

- Local: The origin (0, 0, 0) is at the user's starting position. Movement is tracked relative to this initial point. This space is great for static AR, where the user does not move.
- Local-Floor: Similar to "local," but the y-axis (vertical) is adjusted to be at floor level. Good for AR apps where the user is standing on a floor.
- Bounded-Floor: Used to specify an area for the experience, like a room or defined area. Good for static environments that fit within a given space.
- Unbounded: This is the crucial one here. It means there are no limits to the tracking area. The origin of the virtual world can move as the user moves. This is essential for walking-around AR experiences where you want objects to stay anchored to real-world positions, even if the user roams around.

Recommendation: When you choose to create an immersive-ar session, you typically want objects placed in your AR world to be anchored to the real world as the user walks around in it. The user could walk around the room, or even around a large field. The unbounded reference space is the only one capable of that behavior. It allows the user to move anywhere and still have your AR objects stay in their correct place relative to real world objects.

(Gemini - from Chrome DevTools)
*/