document.addEventListener('DOMContentLoaded', function () {
    async function checkXRSupport() {
        if ('xr' in navigator) {
            return navigator.xr.isSessionSupported('immersive-ar');
        }
        return false;
    }

    async function startAR() {
        try {
            const supported = await checkXRSupport();
            if (!supported) {
                console.error('WebXR AR is not supported in this browser.');
                alert('WebXR AR is not supported in this browser.');
                return;
            }

            const enterARButton = document.getElementById('enter-ar');

            enterARButton.addEventListener('click', async () => {
                try {
                    const session = await navigator.xr.requestSession('immersive-ar', {
                        requiredFeatures: ['local-floor']
                    });
                    initializeARScene(session);
                } catch (e) {
                    console.error('Error starting AR session:', e);
                    alert('Failed to start AR session. Please check console for errors.');
                }
            });
        } catch (e) {
            console.error('Error checking XR support:', e);
            alert('Failed to check XR support.');
        }
    }

    function initializeARScene(session) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);

        cube.position.set(0, 0, -3); // Position the cube in AR coordinates

        scene.add(cube);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        document.body.appendChild(renderer.domElement);

        // Set the session to the renderer
        renderer.xr.setSession(session);

        function animate() {
            renderer.setAnimationLoop(function () {
                renderer.render(scene, camera);
            });
        }

        // Create an XRReferenceSpace for local floor tracking
        session.requestReferenceSpace('local-floor').then((referenceSpace) => {
            renderer.xr.setReferenceSpace(referenceSpace);
            animate();
        }).catch((e) => {
            console.error('Error setting reference space:', e);
            alert('Failed to set reference space.');
        });
    }

    startAR();
});
