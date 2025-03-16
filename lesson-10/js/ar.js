/* LESSON TODO
 * 1. Hover action DONE
 * 2. Click action DONE
 * 3. Grab and drag behaviour DONE
 * 4. Native GUI controls
 * 5. Plane detection (maybe leave this in Lesson 9?)

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
    // The initial position of the box is 0, 0, 0 so with the referenceSpaceType: "unbounded" it will be located on the viewer's head, which is the origin point of the scene - reposition the box as you'd like
    // box.position.y = 0.5;
    box.position.z = 0.5;

    // STEP 7: Let's create another native mesh object for interactive purposes
    const can = BABYLON.MeshBuilder.CreateCylinder("can", {diameter: 0.1, height: 0.3, tessellation: 10});
    const canMat = new BABYLON.StandardMaterial("canMat");
    canMat.diffuseColor = new BABYLON.Color3(1, 0, 0.6);
    can.material = canMat;
    can.position.x = 0.5;

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
            new BABYLON.Vector3(1, 1, 1),
            250
        )
    );

    // STEP 5a: Set up a "click" effect - register a third action
    // box.actionManager.registerAction(
    //     //STEP 5b: Set up the action to change the color value
    //     new BABYLON.SetValueAction(
    //         // STEP 5c: Add a click action, and use a random color
    //         BABYLON.ActionManager.OnPickTrigger, box, "material.diffuseColor", BABYLON.Color3.Random()
    //     )
    // );
    // STEP 5d: Notice how you can only change the color of the box once - if we'd like to do it every time we click on the box, we'd have to re-register the action again and again - comment out the above STEP 5 code

    // STEP 6a: Instead, let's register one action to run some code on each click - this will side-step the issue
    box.actionManager.registerAction(
        // STEP 6b: Add a new BABYLON.ExecuteCodeAction
        new BABYLON.ExecuteCodeAction(
            // STEP 6c: Add a OnPickTrigger that references a function called changeBoxColor
            BABYLON.ActionManager.OnPickTrigger,
            changeBoxColor
        )
    );

    // STEP 6d: Build a simple function to change the material.diffuseColor of the box to a random color
    function changeBoxColor() {
        box.material.diffuseColor = BABYLON.Color3.Random();
    };

    // STEP 8: Make the can grabbable and moveable (awesome)! 
    can.bakeCurrentTransformIntoVertices().addBehavior(new BABYLON.SixDofDragBehavior());


/* PLANE DETECTION
    ---------------------------------------------------------------------------------------------------- */
    // STEP 1a: Plane detection is a hardware capability whereby the AR device is able to detect flat surfaces in the real-world environment. To enable plane detection, use the enableFeature() method of the featuresManager from the base WebXR experience helper.
    const planeDetector = xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRPlaneDetector, "latest", { doNotRemovePlanesOnSessionEnded: false });
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

// The grab and drag behaviour is thanks to the forum article at https://forum.babylonjs.com/t/near-dragging-a-mesh-in-immersive-vr-with-and-without-sixdofdragbehavior/48963 and the referenced playground at https://playground.babylonjs.com/#AZML8U#225