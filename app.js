document.addEventListener('DOMContentLoaded', function () {
    // Function to check if WebXR is supported by the browser
    function checkXRSupport() {
        if ('xr' in navigator) {
            return navigator.xr.isSessionSupported('immersive-ar');
        }
        return Promise.resolve(false);
    }

    // Function to start the AR experience
    async function startAR() {
        try {
            // Check if WebXR AR session is supported
            const supported = await checkXRSupport();
            if (!supported) {
                // Handle unsupported scenario
                alert('WebXR AR is not supported in this browser.');
                return;
            }

            // Get reference to the button
            const enterARButton = document.getElementById('enter-ar');

            // Add click event listener to start AR session
            enterARButton.addEventListener('click', async () => {
                try {
                    // Request an immersive AR session
                    const session = await navigator.xr.requestSession('immersive-ar');

                    // Initialize your AR scene with Three.js here
                    initializeARScene(session);
                } catch (e) {
                    console.error('Error starting AR session:', e);
                    alert('Failed to start AR session.');
                }
            });
        } catch (e) {
            console.error('Error checking XR support:', e);
            alert('Failed to check XR support.');
        }
    }

    // Initialize AR when DOM content is loaded
    startAR();

    // Function to initialize your AR scene with Three.js
    function initializeARScene(session) {
        // Your AR scene setup code using Three.js goes here
        // Example: Loading 3D models, setting up lighting, etc.
        // Use session.renderState to update your scene per frame
    }
});
