let submitButton = document.getElementById('submit')
let img = document.createElement('img')
let buttonIcon = document.getElementById('buttonIcon');
let username = document.getElementById('username')
const descriptions = [];

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(`/models`),
    faceapi.nets.faceLandmark68Net.loadFromUri(`/models`),
    faceapi.nets.faceRecognitionNet.loadFromUri(`/models`),
    faceapi.nets.ssdMobilenetv1.loadFromUri(`/models`)
]).then(initApp);

function initApp() {
    submitButton.addEventListener("click", async () => {
        buttonIcon.className = "fa fa-spinner fa-spin";
        submitButton.setAttribute("disabled", "")
        await faceDetector();
        writeImageToRedis();
        alert("Yüzünüz Kayıt Edildi");
        location.href = "/";
    });
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

async function faceDetector() {
    const file = document.querySelector('#image').files;
    for (i = 0; i < file.length; i++) {
        const imageBase64 = await toBase64(file[i]);
        img.src = imageBase64;

        const detections = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
        descriptions.push(detections.descriptor);
    }
    console.log(descriptions)
}

function writeImageToRedis() {
    $.ajax({
        url: '/addFace',
        type: 'post',
        dataType: 'json',
        data: {
            label: username.value,
            data: JSON.stringify(descriptions)
        },
        success: function (data) {
            //console.log(data);
        },
        error: function (error) {
            //console.log(error);
        }

    })
}