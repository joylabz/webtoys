// TIMEOUT GLOBALS
let keyTimeouts = {}
let highlightTimeouts =  {}
let stepNoteTimeouts =  {}
let samplerReady = false
let sampler
let currentStep = 0

window.addEventListener('load', function() {
  // Bind clicks to the step notes
  let steps = document.querySelectorAll('svg g[id^="STEP"]')
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i]
    let notes = step.querySelectorAll('circle')
    for (let j = 0; j < notes.length; j++) {
      let note = notes[j]
      note.addEventListener('click', function(e) {
        toggleSelected(e.target)
        activateKey(e.target.id)
        activateHightlight(e.target.id)
        playNote(e.target.id)
      })
    }
  }

  // Bind clicks to the piano keys
  let keys = document.querySelectorAll('svg g#KEYS > g')
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    key.addEventListener('click', function(e) {
      // <g> has the ID but only <path> triggers the event
      let keyElement = e.target.parentElement
      activateKey(keyElement.id)
      activateHightlight(keyElement.id)
      playNote(keyElement.id)
    })
  }

  sampler = new Tone.Sampler({
    urls: {
      C3: "C3.wav"
    },
    // baseUrl: "./",
    onload: () => {
      samplerReady = true
      Tone.Transport.scheduleRepeat((time) => {
        let step = ((currentStep) % 16) + 1
        // Get notes on current step
        let notes = document.querySelectorAll(`svg g#STEP${step} .selected`)
        for (let i = 0; i < notes.length; i++) {
          playNote(notes[i].id)
          activateStepNote(notes[i].id)
          activateKey(notes[i].id)
          activateHightlight(notes[i].id)
        }
        currentStep += 1
      }, "4n");
    }
  }).toDestination();


  // Bind controls
  let clear = document.querySelector('svg g#CONTROLS g#CLEAR')
  clear.addEventListener('click', function() {
    clearNotes()
  })
  let play = document.querySelector('svg g#CONTROLS g#PLAY')
  play.addEventListener('click', function() {
    playSong()
  })
  let stop = document.querySelector('svg g#CONTROLS g#STOP')
  stop.addEventListener('click', function() {
    stopSong()
  })

})

function toggleSelected(el) {
  el.classList.toggle('selected')
}

function activateKey(id) {
  // Get only first part of ID in case it's duplicated
  let keyId = id.split('_')[0]
  // NO BLACK KEYS
  if(keyId.indexOf('black') !== -1) return
  // Get key
  let key = document.querySelector(`svg g#KEYS > g[id^="${keyId}"]`)
  // Activate key
  key.classList.add('active')
  // Clear previous timeout
  if (!keyTimeouts[keyId]) keyTimeouts[keyId] = 0
  clearTimeout(keyTimeouts[keyId])
  // Add new timeout
  keyTimeouts[keyId] = setTimeout(function() {
    key.classList.remove('active')
  }, 200)
}

function activateHightlight(id) {
  // Get only first part of ID in case it's duplicated
  let keyId = id.split('_')[0]
  // NO BLACK KEYS
  if(keyId.indexOf('black') !== -1) return
  // Get hightlight element
  let highlight = document.querySelector(`svg g#NOTEHIGHLIGHT circle[id^="${keyId}"]`)
  // Activate highlight
  highlight.classList.add('active')
  // Clear previous timeout
  if (!highlightTimeouts[keyId]) highlightTimeouts[keyId] = 0
  clearTimeout(highlightTimeouts[keyId])
  // Add new timeout
  highlightTimeouts[keyId] = setTimeout(function() {
    highlight.classList.remove('active')
  }, 200)
}

function activateStepNote(id) {
  // Get only first part of ID in case it's duplicated
  let keyId = id.split('_')[0]
  let step = (currentStep % 16) + 1
  // Get hightlight element
  let highlight = document.querySelector(`svg g#STEP${step} circle[id^="${keyId}"].selected`)
  // Activate highlight
  highlight.classList.add('active')
  // Clear previous timeout
  if (!stepNoteTimeouts[keyId]) stepNoteTimeouts[keyId] = 0
  clearTimeout(stepNoteTimeouts[keyId])
  // Add new timeout
  stepNoteTimeouts[keyId] = setTimeout(function() {
    highlight.classList.remove('active')
  }, 200)
}

function playNote(id) {
  let keyId = id.split('_')[0]
  // NO BLACK KEYS
  if(keyId.indexOf('black') !== -1) return
  // Note name
  let note = keyId.substr(0, 1)
  // Apply octave modifier
  let octave = parseInt(keyId.substr(1)) + 2
  // Play note
  sampler.triggerAttackRelease(`${note}${octave}`, 1.0);
}


function clearNotes() {
  let selectedNotes = document.querySelectorAll(`svg g[id^="STEP"] .selected`)
  for (let i = 0; i < selectedNotes.length; i++) {
    selectedNotes[i].classList.remove('selected')
  }
}

function playSong() {
  Tone.Transport.start()

  let play = document.querySelector('svg g#CONTROLS g#PLAY')
  play.classList.add('active')
}

function stopSong() {
  Tone.Transport.stop()
  currentStep = 0

  let play = document.querySelector('svg g#CONTROLS g#PLAY')
  play.classList.remove('active')
}

function print() {
  console.log('soon')
}

function help() {
  console.log('soon')
}
