// app.js
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
        if (predictions.length > 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            predictions.forEach((prediction) => {
                const start = prediction.topLeft;
                const end = prediction.bottomRight;
                const eyeDotX = canvas.width - (start[0] + (end[0] - start[0]) / 2) * (canvas.width / video.width);
                const eyeDotY = (start[1] + (end[1] - start[1]) / 2) * (canvas.height / video.height);

                ctx.beginPath();
                ctx.arc(eyeDotX, eyeDotY, 10, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.shadowColor = 'red';
                ctx.shadowBlur = 20;
                ctx.fill();
            });
        } else {
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
