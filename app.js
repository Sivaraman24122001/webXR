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
        console.log('done');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.scale.set(0.5, 0.5, 0.5);
        cube.position.set(0, 1, -3);
        scene.add(cube);

        
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('https://github.com/Sivaraman24122001/webXR/blob/main/assets/conferanceroom.png', (texture) => {
            const planeWidth = 0.3  
            const planeHeight = 0.6;  
            const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
            const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.position.set(-1, 1.5, -2);
            scene.add(plane);
        });

       
        const loader = new THREE.GLTFLoader();
        try{
        loader.load('model/direction_arrows.glb', (gltf) => {
            const model = gltf.scene;
            model.position.set(1, 0, -3); 
            model.scale.set(0.5, 0.5, 0.5); 
            scene.add(model);
        }, undefined, (error) => {
            console.error('An error occurred while loading the model:', error);
        });}catch(e){
            console.log('Model:',error);
        }

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

        setReferenceSpace();
        animate();
    }

    startAR();
});
