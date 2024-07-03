document.addEventListener('DOMContentLoaded', async () => {
    // Check for XR support
    if (!('xr' in navigator)) {
        console.error('WebXR not supported in this browser.');
        return;
    }

    // Check for inline session support
    let supported = false;
    try {
        supported = await navigator.xr.isSessionSupported('inline');
    } catch (e) {
        console.error('Error checking XR support:', e);
    }

    // If inline session is supported, request it
    if (supported) {
        try {
            const session = await navigator.xr.requestSession('inline');
            initializeARScene(session);
        } catch (e) {
            console.error('Error starting inline AR session:', e);
            alert('Failed to start AR session. Please check console for errors.');
        }
    } else {
        console.error('Inline AR session is not supported in this browser.');
        alert('Inline AR session is not supported in this browser.');
    }
});

function initializeARScene(session) {
    // Placeholder for AR scene initialization
    console.log('Inline AR session started:', session);

    // Example: Create a simple AR scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Example: Add a cube to the scene
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Example: Render loop
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();
}
