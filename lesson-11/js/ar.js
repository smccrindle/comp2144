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
    cylinderMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
    cylinder.material = cylinderMat;
    cylinder.position.x = -2;

    const pyramid = BABYLON.MeshBuilder.CreateCylinder("pyramid", { height: 2, diameterTop: 0, diameterBottom: 1, tessellation: 4 }, scene);
    const pyramidMat = new BABYLON.StandardMaterial("pyramidMat", scene);
    pyramidMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
    pyramid.material = pyramidMat;
    pyramid.position.x = 2;

    const torus = BABYLON.MeshBuilder.CreateTorus("torus", { diameter: 1, thickness: 0.3, tessellation: 32 }, scene);
    const torusMat = new BABYLON.StandardMaterial("torusMat", scene);
    torusMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
    torus.material = torusMat;
    torus.position.y = 0.5;
   

    /* GUI
    ---------------------------------------------------------------------------------------------------- */
    
    // STEP X: Create a simple rectangle label
    const plane1 = BABYLON.Mesh.CreatePlane("plane1", 2);
    plane1.parent = pyramid;
    plane1.position.y = 2;
    plane1.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;

    const advancedTexture1 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane1);
    
    const rectangle = new BABYLON.GUI.Rectangle();
    rectangle.width = 0.2;
    rectangle.height = "40px";
    rectangle.cornerRadius = 20;
    rectangle.color = "Orange";
    rectangle.thickness = 4;
    rectangle.background = "green";
    advancedTexture1.addControl(rectangle);
    
    const label = new BABYLON.GUI.TextBlock();
    label.text = "Pyramid";
    rectangle.addControl(label);



    // STEP X: Create a simple button label
    const plane2 = BABYLON.Mesh.CreatePlane("plane2", 2);
    plane2.parent = cylinder;
    plane2.position.y = 2;
    plane2.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    const advancedTexture2 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane2);

    const button = BABYLON.GUI.Button.CreateSimpleButton("button", "Click Me");
    button.width = 1;
    button.height = 0.4;
    button.color = "white";
    button.fontSize = 50;
    button.background = "grey";
    button.onPointerUpObservable.add(function() {
        changeMeshColor();
    });
    advancedTexture2.addControl(button);

    // STEP X: Create a slider to control a mesh rotation
    const plane3 = BABYLON.Mesh.CreatePlane("plane3", 2);
    plane3.parent = torus;
    plane3.position.z = -1.5;
    plane3.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;

    const advancedTexture3 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane3);

    const header = new BABYLON.GUI.TextBlock();
    header.text = "Y-rotation: 0 deg";
    header.height = "30px";
    header.color = "white";
    header.top = "-50px";
    advancedTexture3.addControl(header); 

    const slider = new BABYLON.GUI.Slider();
    slider.minimum = 0;
    slider.maximum = 2 * Math.PI;
    slider.value = 0;
    slider.height = "20px";
    slider.width = "200px";
    slider.top = "20px";
    slider.onValueChangedObservable.add(function(value) {
        header.text = "Z-rotation: " + (BABYLON.Tools.ToDegrees(value) | 0) + " deg";
        torus.rotation.z = value;
    });
    advancedTexture3.addControl(slider);


    /* BEHAVIOURS
    ---------------------------------------------------------------------------------------------------- */
    // pyramid.bakeCurrentTransformIntoVertices().addBehavior(new BABYLON.SixDofDragBehavior());

    /* OTHER FUNCTIONS
    ---------------------------------------------------------------------------------------------------- */
    function changeMeshColor() {
        cylinder.material.diffuseColor = BABYLON.Color3.Random();
    };

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