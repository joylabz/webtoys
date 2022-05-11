let capture;
let slitSize = 0.01;
let step = 0;
let playing = true;
let speed = 1
let angle = 0

function setup() {
  createCanvas(
    min(800, windowWidth),
    min(600, windowHeight)
  );
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();
  imageMode(CENTER);
  angleMode(DEGREES);
}

function draw() {
  if (keyIsPressed) {
    switch (key) {
      case "ArrowRight":
        angle += speed
        break;
      case "ArrowLeft":
        angle -= speed
        break;
      case "ArrowUp":
        speed += 0.05;
        break;
      case "ArrowDown":
        speed -= 0.05;
        break;
      case "b":
        background(0);
        break;
    }
  }
  translate(width / 2, height / 2);
  if (playing) {
    step += 1;
    angle += speed
  }
  rotate(angle);
  image(
    capture,
    0,
    height / 2,
    width * slitSize,
    height,
    width / 2,
    0,
    width * slitSize,
    height
  );
}

function keyPressed() {
  if (key === "s") {
  }
  switch (key) {
    case " ":
      playing = !playing;
      break;
    case "s":
      uploadToService()
      break;
    case "b":
      background(0);
      break;
  }
}

function uploadToService() {
  playing = false

  canvas.toBlob(function(blob) {
    alert('Wait for it!')
    const formData = new FormData()
    formData.append('file_input',  new File([blob], `slit_${Date.now()}.jpg`))
    fetch(
      'https://joylabz-uploads.herokuapp.com/upload',
      { method: 'POST', body: formData }
    )
    .then(r => r.json())
    .then((data) => {
      alert('Yay!')
      window.location = 'feed.html'
    })
    .catch(() => {
      alert("Oh, no. Something went wrong...")
    })
  })

}
