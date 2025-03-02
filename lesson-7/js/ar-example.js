/* GAME PLAN
---------------------------------------------------------------------------------------------------- */
// 1. Create a simple primitive shape (like a box) in the scene
// 2. Show how to enable a WebXR session for AR
// 3. Upload the scene and try it using an AR-capable headset (or mobile with Android)
// 4. Add a hit-test
// 5. Anchors? These allow you to place object in the real world space and have them stay there, even if the observer moves around
// 6. Planes? This feature helps the app to detect flat surfaces, like tables, floors, or walls and place objects on them
// 7. Make box 'clickable' and change color on touch?
// 8. DOM element (range slider) to control box rotation?







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
    // STEP 1: Create a simple box, and apply a material and a colour to it.
    const box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, scene);
    const boxMat = new BABYLON.StandardMaterial("boxMat");
    boxMat.diffuseColor = new BABYLON.Color3(1, 0.647, 0)
    box.material = boxMat;
    // STEP 4: Move the box so it is not at your feet
    box.position.y = 1;
    box.position.z = 1;


    /* SOUNDS
    ---------------------------------------------------------------------------------------------------- */
    

    /* ANIMATION
    ---------------------------------------------------------------------------------------------------- */


    /* ENABLE AR
    ---------------------------------------------------------------------------------------------------- */
    // STEP 2a: Start a WebXR session (immersive-ar, specifically)
    const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar",
        },
        // STEP 2b: Enable optional features - either all of them with true, or as an array
        optionalFeatures: ["hit-test", "anchors"]
    });

    // STEP 3: Commit your code and push it to a server, then try it out with a headset - notice how the orange box is right at your feet - 0, 0, 0 is located on the floor at your feet


    /* HIT-TEST
    ---------------------------------------------------------------------------------------------------- */
    // STEP 5: A hit-test is a standard feature in AR that permits a ray to be cast from the device (headset or phone) into the real world, and detect where it intersects with a real-world object. This enables AR apps to place objects on surfaces or walls of the real world (https://immersive-web.github.io/hit-test/). To enable hit-testing, use the enableFeature() method of the featuresManager from the base WebXR experience helper.
    const hitTest = xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRHitTest, "latest");

    // STEP 6a: Create a dot to show where a hit-test has registered a surface
    const dot = BABYLON.SphereBuilder.CreateSphere("dot", {diameter: 0.05}, scene);
    dot.isVisible = false;

    // STEP 6b: Register to get updates using the onHitTestResultObservable
    hitTest.onHitTestResultObservable.add((results) => {
        if (results.length) {
            // The hit-test ray returned a length value, so it hit something
            dot.isVisible = true;
            // Scale dot appropriately
            results[0].transformationMatrix.decompose(dot.scaling, dot.rotationQuaternion, dot.position);
        } else {
            // The hit-test ray returned a length value of 0, so it didn't hit anything
            dot.isVisible = false;
        };
    });


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

// Thanks to the great documentation at https://doc.babylonjs.com/