document.addEventListener('DOMContentLoaded', function () {
    async function checkXRSupport() {
        if ('xr' in navigator) {
            try {
                console.log('Checking XR support...');
                return await navigator.xr.isSessionSupported('inline');
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
            alert('No element with ID "enter-ar" found.');
            return;
        }

        enterARButton.addEventListener('click', async () => {
            try {
                console.log('Requesting XR session...');
                const session = await navigator.xr.requestSession('inline', {
                    requiredFeatures: ['local-floor'],
                    optionalFeatures: ['local']
                });
                console.log('XR session started successfully.');
                initializeARScene(session);
            } catch (e) {
                console.error('Error starting AR session:', e);
                alert('Failed to start AR session. Please check console for errors.');
            }
        });
    }

    function initializeARScene(session) {
        console.log('Initializing AR scene...');

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
        document.body.appendChild(renderer.domElement);

        renderer.xr.setSession(session);

        window.addEventListener('resize', () => {
            console.log('Window resized.');
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        async function setReferenceSpace() {
            try {
                console.log('Requesting reference space...');
                await session.requestReferenceSpace('local-floor');
                renderer.xr.setReferenceSpaceType('local-floor');
                console.log('Reference space set to local-floor.');
            } catch {
                try {
                    console.log('Requesting alternative reference space...');
                    await session.requestReferenceSpace('local');
                    renderer.xr.setReferenceSpaceType('local');
                    console.log('Reference space set to local.');
                } catch (e) {
                    console.error('Error setting reference space:', e);
                    alert('Failed to set reference space');
                }
            }
        }

        function animate() {
            console.log('Animating scene...');
            renderer.setAnimationLoop(() => renderer.render(scene, camera));
        }

        setReferenceSpace();
        animate();
    }

    startAR();
});
