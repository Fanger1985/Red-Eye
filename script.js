const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function detectFaces() {
    const model = await blazeface.load();
    const returnTensors = false;

    while (true) {
        const predictions = await model.estimateFaces(video, returnTensors);

        // Only clear and redraw if there are predictions to avoid unnecessary redraws
        if (predictions.length > 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            predictions.forEach((prediction) => {
                const start = prediction.topLeft;
                const end = prediction.bottomRight;
                const size = [end[0] - start[0], end[1] - start[1]];

                // Adjust for full-screen scaling, ensuring no overflows or underflows
                const eyeDotX = canvas.width - (start[0] + size[0] / 2) * (canvas.width / video.width);
                const eyeDotY = (start[1] + size[1] / 2) * (canvas.height / video.height);
                
                // Ensure the dot stays within the bounds of the canvas
                const safeEyeDotX = Math.max(0, Math.min(canvas.width, eyeDotX));
                const safeEyeDotY = Math.max(0, Math.min(canvas.height, eyeDotY));

                // Style the dot to be a red glowing eye
                ctx.beginPath();
                ctx.arc(safeEyeDotX, safeEyeDotY, 10, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.shadowColor = 'red';
                ctx.shadowBlur = 20;
                ctx.fill();
            });
        } else {
            // Clear the canvas if no faces are detected to avoid ghosting
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        await tf.nextFrame();
    }
}



async function main() {
    await setupCamera();
    video.play();
    detectFaces();
}

main();