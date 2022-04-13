
let theShader
let capture
let gl
let ball
let synth
let synthReady = false
let path = []
let pathIndex = 0
let selectedColor

function preload(){
  theShader = loadShader('shader.vert', 'shader.frag');
}

function setup() {
  capture = createCapture(VIDEO)
  capture.size(320, 240)
  capture.hide()
  let canvas = createCanvas(windowWidth, windowHeight*0.9, WEBGL)
  canvas.parent('canvas')
  gl = canvas.elt.getContext('webgl')
  gl.disable(gl.DEPTH_TEST)

  ball = createVector(width/2, height/2)
  path.push(createVector(width/2, height/2))
  selectedColor = color(0)
  frameRate(12)

  synth = new Tone.Sampler({
    urls: {
      C3: "C3.wav"
    },
    onload: function() {
      synthReady = true
    }
    // baseUrl: "./",
  }).toDestination();
}

function draw() {
  background(0)
  push()
    theShader.setUniform('u_time', millis()/1000.0);
    theShader.setUniform('width', width*pixelDensity());
    theShader.setUniform('height', height*pixelDensity());
    theShader.setUniform('mouseX', mouseX*pixelDensity());
    theShader.setUniform('mouseY', height*pixelDensity()-mouseY*pixelDensity());
    theShader.setUniform('cam', capture);
    shader(theShader)
    quad(-1, -1, 1, -1, 1, 1, -1, 1)
  pop()

  let ballColor = getColor(gl, width-ball.x, ball.y)
  if (path.length > pathIndex) {
    ball = path[pathIndex]
    pathIndex += 1
    pathIndex %= path.length
  }

  push()
    translate(-width/2, -height/2)
    fill(0)
    stroke(0)
    circle(ball.x, ball.y, 20)

    for (let i = 0; i < path.length-1; i++) {
      let p = path[i]
      let q = path[i+1]
      let d = p5.Vector.sub(q, p)
      let angle = d.heading()
      if (i % 2 == 0) {
        push()
        translate(p.x, p.y - 4)
        rotate(angle)
        rect(0, 0, d.mag(), 8)
        pop()
      }
    }
  pop()

   if (
     !equalColors(selectedColor, ballColor)
     && frameCount % 2 == 0 // Avoid quick fire
   ) {
    playSynth(ballColor)
    selectedColor = ballColor
  }
}

function mousePressed() {
  pathIndex = 0
  path = []
  path.push(createVector(mouseX, mouseY))
}

function mouseDragged() {
  let newVector = createVector(mouseX, mouseY)
  if (path.lenght < 1) {
    path.push(newVector)
  } else {
    let lastVector = path[path.length-1]
    let d = p5.Vector.sub(newVector, lastVector)
    if (d.mag() > 10) {
      path.push(newVector)
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight*0.9, WEBGL)
}

function getColor(gl, x, y) {
  let pixel = new Uint8Array(4);
  gl.readPixels(
    width*pixelDensity()-x*pixelDensity(),
    height*pixelDensity()-y*pixelDensity(),
    1, 1,
    gl.RGBA, gl.UNSIGNED_BYTE,
    pixel
  )
  return color(pixel.toString().split(','))
}

function playSynth(selectedColor) {
  if (!synthReady) {
    return
  }

  let colors = [
    color(255, 0, 0),
    color(255, 255, 0),
    color(0, 255, 0),
    color(0, 255, 255),
    color(0, 0, 255),
    color(255, 0, 255),
    color(255, 255, 255)
  ]
  let colorIndex = colors.findIndex((c) => {
    return equalColors(c, selectedColor)
  })
  let notes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'];
  let velocity = 0.8;
  let time = 0;
  let dur = 1/16;

  if (colorIndex != -1) {
    // synth.play(notes[colorIndex], velocity, time, dur);
    synth.triggerAttackRelease(notes[colorIndex], 1.0);
  }
}

function equalColors(c1, c2) {
    return red(c1) == red(c2)
        && green(c1) == green(c2)
        && blue(c1) == blue(c2)
  }
