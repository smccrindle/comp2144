
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
    const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar",
            referenceSpaceType: "local-floor" // viewer, local, local-floor, bounded-floor, or unbounded (https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace)

        },
        // Enable optional features - either all of them with true (boolean), or as an array
        optionalFeatures: true
    });


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
    
    /* PLANE DETECTION
    ---------------------------------------------------------------------------------------------------- */
    // STEP 1a: Plane detection is a hardware capability whereby the AR device is able to detect flat surfaces in the real-world environment. To enable plane detection, use the enableFeature() method of the featuresManager from the base WebXR experience helper.
    const planeDetector = xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRPlaneDetector, "latest", { doNotRemovePlanesOnSessionEnded: true });
    // STEP 1b: If you'd like, you can retain planes between AR sessions, with doNotRemovePlanesOnSessionEnded - add this above as the 3rd parameter.

    // STEP 2: Add the plane detection and rendering code from https://playground.babylonjs.com/#98TM63
    const planes = [];

    planeDetector.onPlaneAddedObservable.add(plane => {
        plane.polygonDefinition.push(plane.polygonDefinition[0]);
        var polygon_triangulation = new BABYLON.PolygonMeshBuilder("name", plane.polygonDefinition.map((p) => new BABYLON.Vector2(p.x, p.z)), scene);
        var polygon = polygon_triangulation.build(false, 0.01);
        plane.mesh = polygon; 
        planes[plane.id] = (plane.mesh);
        const mat = new BABYLON.StandardMaterial("mat", scene);
        mat.alpha = 0.5;
        // pick a random color
        mat.diffuseColor = BABYLON.Color3.Random();
        polygon.createNormals();
        plane.mesh.material = mat;

        plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
        plane.transformationMatrix.decompose(plane.mesh.scaling, plane.mesh.rotationQuaternion, plane.mesh.position);
    });

    planeDetector.onPlaneUpdatedObservable.add(plane => {
        let mat;
        if (plane.mesh) {
            // keep the material, dispose the old polygon
            mat = plane.mesh.material;
            plane.mesh.dispose(false, false);
        }
        const some = plane.polygonDefinition.some(p => !p);
        if (some) {
            return;
        }
        plane.polygonDefinition.push(plane.polygonDefinition[0]);
        var polygon_triangulation = new BABYLON.PolygonMeshBuilder("name", plane.polygonDefinition.map((p) => new BABYLON.Vector2(p.x, p.z)), scene);
        var polygon = polygon_triangulation.build(false, 0.01);
        polygon.createNormals();
        plane.mesh = polygon;
        planes[plane.id] = (plane.mesh);
        plane.mesh.material = mat;
        plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
        plane.transformationMatrix.decompose(plane.mesh.scaling, plane.mesh.rotationQuaternion, plane.mesh.position);
    })

    planeDetector.onPlaneRemovedObservable.add(plane => {
        if (plane && planes[plane.id]) {
            planes[plane.id].dispose()
        }
    })

    xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
        planes.forEach(plane => plane.dispose());
        while (planes.pop()) { };
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

// Thanks to the great documentation at https://doc.babylonjs.com/, some excellent re-factoring of my code by Gemini, and some code writing assistance from CoPilot.