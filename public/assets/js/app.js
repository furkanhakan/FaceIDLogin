let loginButton = document.getElementById("loginButton");
let faceIdButton = document.getElementById("faceIdButton");
let loginContainer = document.getElementById("loginContainer");
let videoContainer = document.getElementById("videoContainer");
let appContainer = document.getElementById("appContainer");
let faceIDResult = document.getElementById("faceIDResult");
let usernameInput = document.getElementById("username");

let isFaceIDActive = false;
let isFaceExist = false;
faceIdButton.style.display = "none";

const video = document.getElementById("video");
let localStream = null;
let isModelsLoaded = false;
let LabeledFaceDescriptors = null;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(`/models`),
  faceapi.nets.faceLandmark68Net.loadFromUri(`/models`),
  faceapi.nets.faceRecognitionNet.loadFromUri(`/models`),
  faceapi.nets.ssdMobilenetv1.loadFromUri(`/models`)
]).then(initApp);

async function initApp() {
  LabeledFaceDescriptors = await loadImages()
  if (isFaceExist)
    faceIdButton.style.display = "block";
}

function loadImages() {
  const label = [usernameInput.value]
  let array = [];
  return Promise.all(
    label.map(async label => {
      $.ajax({
        url: '/getFace',
        type: 'post',
        dataType: 'json',
        async: false,
        data: {
          label: label
        },
        success: function (data) {
          isFaceExist = data.length > 0 ? true : false;

          Object.keys(data).forEach(function (k) {
            array[k] = new Float32Array(128);
            Object.keys(data[k]).forEach(function (i) {
              array[k][i] = data[k][i];
            });
          });
        }
      })
      if (isFaceExist) {
        return new faceapi.LabeledFaceDescriptors(label, array);
      }
    })
  );
}

function startCamera() {
  navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia

  if (navigator.getUserMedia) {
    navigator.getUserMedia(
      {
        video: {}
      },
      stream => {
        localStream = stream;
        video.srcObject = stream;
      },
      err => console.log(err)
    );
  }
}
function stopCamera() {
  video.pause();
  video.srcObject = null;
  localStream.getTracks().forEach(track => {
    track.stop();
  });
}

faceIdButton.addEventListener("click", () => {
  isFaceIDActive = !isFaceIDActive;

  if (isFaceIDActive) {
    videoContainer.classList.add("faceIDShow");
    loginContainer.classList.add("faceIDActive");
    faceIdButton.classList.add("active");
    appContainer.style.backgroundColor = "#666";
    faceIdButton.lastElementChild.textContent = "FaceID Kullanma";
    startCamera();
  } else {
    videoContainer.classList.remove("faceIDShow");
    loginContainer.classList.remove("faceIDActive");
    faceIdButton.classList.remove("active");
    appContainer.style.backgroundColor = "#f4f4f4";
    faceIdButton.lastElementChild.textContent = "FaceID Kullan";
    faceIDResult.textContent = "";
    faceIDResult.style.display = "none";
    stopCamera();
  }
});


video.addEventListener("play", async () => {
  const boxSize = {
    width: video.width,
    height: video.height
  };

  let cameraInterval = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, boxSize);

    const faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescriptors, 0.5);

    const results = resizedDetections.map(d =>
      faceMatcher.findBestMatch(d.descriptor)
    );
    if (
      results.length > 0 &&
      results[0].label === usernameInput.value
    ) {
      faceIDResult.textContent = "FaceID doğrulandı.. Yönlendiriliyorsunuz..";
      faceIDResult.classList = [];
      faceIDResult.classList.add("success");
      faceIDResult.style.display = "block";
      clearInterval(cameraInterval);
      setTimeout(() => {
        location.href = "success";
      }, 1000);
    } else {
      faceIDResult.textContent = "FaceID doğrulanamadı...";
      faceIDResult.classList = [];
      faceIDResult.classList.add("error");
      faceIDResult.style.display = "block";
    }
  }, 100);
});