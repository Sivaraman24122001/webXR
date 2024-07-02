import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/webxr/ARButton.js';

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
                    const session = await navigator.xr.requestSession('immersive-ar');
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

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const arButton = ARButton.createButton(renderer);
          document.body.appendChild(arButton);

        function animate() {
            renderer.render(scene, camera);
            session.requestAnimationFrame(animate);
        }

        animate();
    }

    startAR();
});
