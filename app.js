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
            if (!enterARButton) {
                console.error('No element with ID "enter-ar" found.');
                return;
            }

            enterARButton.addEventListener('click', async () => {
                try {
                    const session = await navigator.xr.requestSession('immersive-ar', {
                        requiredFeatures: ['local-floor', 'hit-test'],
                        optionalFeatures: ['local']
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

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        document.body.appendChild(renderer.domElement);

        renderer.xr.setSession(session);

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        async function setReferenceSpace() {
            try {
                const referenceSpace = await session.requestReferenceSpace('local-floor');
                renderer.xr.setReferenceSpaceType('local-floor');
                console.log('Reference space set: local-floor', referenceSpace);
                setupHitTest(referenceSpace);
            } catch {
                try {
                    const referenceSpace = await session.requestReferenceSpace('local');
                    renderer.xr.setReferenceSpaceType('local');
                    console.log('Reference space set: local', referenceSpace);
                    setupHitTest(referenceSpace);
                } catch (e) {
                    console.error('Error setting reference space:', e);
                    alert('Failed to set reference space.');
                }
            }
        }

        async function setupHitTest(referenceSpace) {
            const viewerSpace = await session.requestReferenceSpace('viewer');
            const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

            session.addEventListener('select', (event) => {
                const frame = event.frame;
                const hitTestResults = frame.getHitTestResults(hitTestSource);

                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    const pose = hit.getPose(referenceSpace);

                    cube.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
                    scene.add(cube);
                }
            });

            animate();
        }

        function animate() {
            renderer.setAnimationLoop(() => {
                renderer.render(scene, camera);
            });
        }

        setReferenceSpace();
    }

    startAR();
});
