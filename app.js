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
                    requiredFeatures: ['local-floor', 'dom-overlay'],
                    optionalFeatures: ['local'],
                    domOverlay : {root : document.body}
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
        cube.position.set(0, 0, -1);
        scene.add(cube);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        document.body.appendChild(renderer.domElement);

        renderer.xr.setSession(session);

        let xrReferenceSpace;

        session.requestReferenceSpace('local-floor').then((refSpace) => {
            xrReferenceSpace = refSpace;
        }).catch(() => {
            session.requestReferenceSpace('local').then((refSpace) => {
                xrReferenceSpace = refSpace;
            }).catch((e) => {
                console.error('Error setting reference space:', e);
                alert('Failed to set reference space');
            });
        });

        function animate() {
            renderer.setAnimationLoop((timestamp, frame) => {
                if (frame) {
                    const viewerPose = frame.getViewerPose(xrReferenceSpace);
                    if (viewerPose) {
                        const userPos = new THREE.Vector3(
                            viewerPose.transform.position.x,
                            viewerPose.transform.position.y,
                            viewerPose.transform.position.z
                        );

                        // Update UI with user's position
                        const userPosElement = document.getElementById('userPos');
                        userPosElement.textContent = `User Position: (${userPos.x.toFixed(2)}, ${userPos.y.toFixed(2)}, ${userPos.z.toFixed(2)})`;
                    }
                }
                renderer.render(scene, camera);
            });
        }

        animate();
    }

    startAR();
});
