document.addEventListener('DOMContentLoaded', function () {
    async function checkXRSupport() {
        if ('xr' in navigator) {
            try {
                const supported = await navigator.xr.isSessionSupported('immersive-ar');
                console.log('XR support check result:', supported);
                return supported;
            } catch (e) {
                console.error('Error checking XR support:', e);
                return false;
            }
        }
        console.error('XR not available in navigator');
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
                        requiredFeatures: ['local-floor'], // Attempt to use 'local-floor'
                        optionalFeatures: ['local'] // Fallback to 'local'
                    });
                    console.log('AR session started:', session);
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

        cube.position.set(0, 0, -3); 

        scene.add(cube);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        document.body.appendChild(renderer.domElement);

        // Set the session to the renderer
        renderer.xr.setSession(session);

        function animate() {
            renderer.setAnimationLoop(() => {
                renderer.render(scene, camera);
            });
        }

        // Attempt to request 'local-floor' reference space, fallback to 'local' if not supported
        session.requestReferenceSpace('local-floor').then((referenceSpace) => {
            console.log('Reference space set: local-floor', referenceSpace);
            renderer.xr.setReferenceSpaceType('local-floor');
            animate();
        }).catch(() => {
            session.requestReferenceSpace('local').then((referenceSpace) => {
                console.log('Reference space set: local', referenceSpace);
                renderer.xr.setReferenceSpaceType('local');
                animate();
            }).catch((e) => {
                console.error('Error setting reference space:', e);
                alert('Failed to set reference space.');
            });
        });
    }

    startAR();
});
