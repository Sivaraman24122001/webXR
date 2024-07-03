document.addEventListener('DOMContentLoaded', function () {
    async function checkXRSupport() {
        if ('xr' in navigator) {
            try {
                return await navigator.xr.isSessionSupported('immersive-ar');
            } catch (e) {
                console.error('Error checking XR support:', e);
                return false;
            }
        }
        console.error('XR not available in navigator');
        return false;
    }

    async function startAR() {
        const supported = await checkXRSupport();
        if (!supported) {
            console.error('WebXR AR is not supported in this browser.');
            alert('WebXR AR is not supported in this browser.');
            return;
        }

        const enterARButton = document.getElementById('enter-ar');
        if (!enterARButton) {
            console.error('No element with ID "enter-ar" found.');
            return;
        }

        enterARButton.addEventListener('click', async () => {
            try {
                const session = await navigator.xr.requestSession('immersive-ar', {
                    requiredFeatures: ['local-floor'],
                    optionalFeatures: ['local']
                });
                initializeARScene(session);
            } catch (e) {
                console.error('Error starting AR session:', e);
                alert('Failed to start AR session. Please check console for errors.');
            }
        });
    }

    function initializeARScene(session) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.scale.set(0.5, 0.5, 0.5);
        cube.position.set(0, 1, -3);
        scene.add(cube);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;

        // Create a separate overlay div for UI elements
        const overlayDiv = document.createElement('div');
        overlayDiv.style.position = 'absolute';
        overlayDiv.style.top = '0';
        overlayDiv.style.left = '0';
        overlayDiv.style.width = '100%';
        overlayDiv.style.height = '100%';
        overlayDiv.style.pointerEvents = 'none'; // Allow clicks to go through to WebGL

        // Append renderer and overlay to the body
        document.body.appendChild(renderer.domElement);
        document.body.appendChild(overlayDiv);

        renderer.xr.setSession(session);

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        async function setReferenceSpace() {
            try {
                await session.requestReferenceSpace('local-floor');
                renderer.xr.setReferenceSpaceType('local-floor');
            } catch {
                try {
                    await session.requestReferenceSpace('local');
                    renderer.xr.setReferenceSpaceType('local');
                } catch (e) {
                    console.error('Error setting reference space:', e);
                    alert('Failed to set reference space');
                }
            }
        }

        function animate() {
            renderer.setAnimationLoop(() => renderer.render(scene, camera));
        }

        // Function to change cube color to red
        function changeCubeColor() {
            cube.material.color.set(0xff0000); // Red color
        }

        // Adding a button to change cube color
        const changeColorButton = document.createElement('button');
        changeColorButton.textContent = 'Change Color to Red';
        changeColorButton.style.position = 'absolute';
        changeColorButton.style.top = '20px';
        changeColorButton.style.left = '20px';
        changeColorButton.style.zIndex = '9999'; // Ensure button is on top
        changeColorButton.addEventListener('click', changeCubeColor);
        overlayDiv.appendChild(changeColorButton);

        setReferenceSpace();
        animate();
    }

    startAR();
});
