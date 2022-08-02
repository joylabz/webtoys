// TIMEOUT GLOBALS
let pressTimeouts =  {}
let samplerReady = false
let sampler = null
let currentStep = -1
let recording = false

/*
 * Play events
 */
window.addEventListener('keydown', function(e) {
  switch(e.key.toLowerCase()) {
    case 'arrowup':
      playNote('C3')
      break
    case 'arrowright':
      playNote('D3')
      break
    case 'arrowdown':
      playNote('E3')
      break
    case 'arrowleft':
      playNote('F3')
      break
    case ' ':
      playNote('G3')
      break
    case 'w':
      playNote('A3')
      break
    case 'a':
      playNote('B3')
      break
    case 's':
      playNote('C4')
      break
    case 'd':
      playNote('D4')
      break
    case 'f':
      playNote('E4')
      break
    case 'g':
      playNote('F4')
      break
    case 'p':
      stepForward()
      break
  }
})

/*
 * Record events
 */
window.addEventListener('keydown', function(e) {
  if (recording) {
    switch(e.key.toLowerCase()) {
      case 'arrowup':
      recordNote('C3')
      break
      case 'arrowright':
      recordNote('D3')
      break
      case 'arrowdown':
      recordNote('E3')
      break
      case 'arrowleft':
      recordNote('F3')
      break
      case ' ':
      recordNote('G3')
      break
      case 'w':
      recordNote('A3')
      break
      case 'a':
      recordNote('B3')
      break
      case 's':
      recordNote('C4')
      break
      case 'd':
      recordNote('D4')
      break
      case 'f':
      recordNote('E4')
      break
      case 'g':
      recordNote('F4')
      break
    }
  }
})

window.addEventListener('load', function() {
  loadSong()
  bindPianoKeys()
  bindMusicScoreNotes()
  bindControls()

  sampler = new Tone.Sampler({
    urls: {
      C3: "C3.wav"
    },
    // baseUrl: "./",
    onload: () => {
      samplerReady = true
      Tone.Transport.scheduleRepeat((time) => {
        stepForward()
      }, "4n");
    }
  }).toDestination();



})

window.addEventListener('hashchange', function() {
  loadSong()
})

/*
 * Gets current step padded with 0 for the css selector
 */
function getCurrentStep() {
  return String( ((currentStep) % 16) ).padStart(2, '0')
}

/*
 * Shows playhead at current step
 */
function showPlayHead() {
  // All the playhead elements
  let playHeads = Array.from(document.querySelectorAll('svg #PLAYHEAD > path')).reverse()
  // Toggle playhead active class
  for (let i = 0; i < playHeads.length; i++) {
    let playHead = playHeads[i]
    if (i == (currentStep % 16)) {
      playHead.classList.add('active')
    } else {
      playHead.classList.remove('active')
    }
  }
}

/*
 * Bind piano keys
 */
function bindPianoKeys() {
  // Bind clicks to the piano keys
  let keys = document.querySelectorAll('svg g[id="KEYS"] > g > path')
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    key.addEventListener('mousedown', function(e) {
      // <g> has the ID but only <path> triggers the event
      let keyElement = e.target.parentElement
      let id = keyElement.id.substr(0, 2)
      playNote(id)
      if (recording) {
        recordNote(id)
      }
    })
  }
}

/*
 * Bind music score notes
 */
function bindMusicScoreNotes() {
  // Bind clicks to the step notes
  let steps = document.querySelectorAll('svg #STEPS > g[id^="STEP"]')
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i]
    let notes = step.querySelectorAll('ellipse')
    for (let j = 0; j < notes.length; j++) {
      let note = notes[j]
      note.addEventListener('mousedown', function(e) {
        e.target.classList.toggle('selected')
        playNote(e.target.id.substr(0, 2))
      })
    }
  }
}

/*
 * Bind app controls
 */
function bindControls() {
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
  let print = document.querySelector('svg g#PRINT')
  print.addEventListener('click', function() {
    window.open('interactive_sheet_music.pdf', '_blank');
  })
  let save = document.querySelector('svg g#SAVE')
  save.addEventListener('click', function() {
    saveSong()
  })

  let record = document.querySelector('svg g#RECORD')
  record.addEventListener('click', function() {
    stopSong()
    recording = !recording
    if (recording) {
      currentStep = 0
      showPlayHead()
      record.classList.add('active')
    } else {
      hidePlayHead()
      record.classList.remove('active')
    }
  })
}

/*
 * Hides playead
 */
function hidePlayHead() {
  // Update play head
  let playHead = document.querySelector('svg #PLAYHEAD .active')
  if (playHead) playHead.classList.remove('active')
}

/*
 * Handles requests to play note. Triggers audio, adds visual cue
 */
function playNote(id) {
  if (!samplerReady) return false
  soundNote(id)
  pressKey(id)
}

/*
 * Triggers the sound engine to play note given an ID
 */
function soundNote(id) {
  let keyId = id.split('_')[0]
  // NO BLACK KEYS
  if(keyId.indexOf('black') !== -1) return
  // Note name
  let note = keyId.substr(0, 1)
  // Apply octave modifier
  let octave = parseInt(keyId.substr(1))
  // Play note
  if (note) {
    sampler.triggerAttackRelease(`${note}${octave}`, 1.0);
  }
}

/*
 * Adds visual cue that the keyboard key is beeing pressed
 */
function pressKey(id) {
  let keyId = id.split('_')[0]
  // Get key group element
  let key = document.querySelector(`svg g[id="KEYS"] > g#${keyId}`)
  key.classList.add('pressing')
  if (pressTimeouts[id]) clearTimeout(pressTimeouts[id])
  pressTimeouts[id] = setTimeout(() => {
    key.classList.remove('pressing')
  }, 100)
}

/**
 * Add note to sheet on current step
 */
function recordNote(id) {
  showPlayHead()
  let step = getCurrentStep()
  let stepEl = document.querySelector(`svg g#STEP${step} ellipse[id^=${id}]`)
  if (stepEl) {
    stepEl.classList.toggle('selected')
    currentStep += 1
  }
}

/*
 * Remove all selected notes from music sheet
 */
function clearNotes() {
  let selectedNotes = document.querySelectorAll(`svg g[id^="STEP"] .selected`)
  for (let i = 0; i < selectedNotes.length; i++) {
    selectedNotes[i].classList.remove('selected')
  }
  window.location.hash = ''
}

/*
 * Start playing the song
 */
function playSong() {
  if (recording) {
    recording = false
    let record = document.querySelector('svg g#RECORD')
    record.classList.remove('active')
  }

  currentStep = -1
  Tone.Transport.start()
  let play = document.querySelector('svg g#CONTROLS g#PLAY')
  play.classList.add('active')
}

/*
 * Stop playing the song
 */
function stopSong() {
  Tone.Transport.stop()
  currentStep = 0
  // Update play button
  let play = document.querySelector('svg g#CONTROLS g#PLAY')
  play.classList.remove('active')
  hidePlayHead()
}

/*
 * Load song from url's hash
 */
function loadSong() {
  let hash = window.location.hash.toUpperCase().substring(1)
  if (hash === '') return false
  let encodedSteps = hash.split(',')
  for (let i = 0; i < encodedSteps.length; i++) {
    let stepNumber = String(i).padStart(2, '0')
    let encodedStepNotes = encodedSteps[i].split('-')
    let domStepNotes = document.querySelectorAll(`svg g#STEP${stepNumber} ellipse`)
    for (let j = 0; j < domStepNotes.length; j++) {
      let domStepNote = domStepNotes[j]
      for (let k = 0; k < encodedStepNotes.length; k++) {
        let n = encodedStepNotes[k]
        if (n && domStepNote.id.indexOf(n) !== -1) {
          domStepNote.classList.add('selected')
        }
      }
    }
  }
}

/*
 * Create an url hash from the placed notes
 */
function saveSong() {
  let song = []
  let steps = document.querySelectorAll('svg #STEPS g[id^="STEP"]')
  for (let i = 0; i < steps.length; i++) {
    let stepNumber = String(i).padStart(2, '0')
    song[i] = []
    let stepNotes = document.querySelectorAll(`svg #STEPS g#STEP${stepNumber} ellipse`)
    for( let j = 0; j < stepNotes.length; j++) {
      let note = stepNotes[j]
      if(note.classList.contains('selected')) {
        let id = note.id.substring(0, 2)
        song[i].push(id)
      }
    }
  }
  song = song.map((step) => {
    return step.join('-')
  })
  window.location.hash = song.join(',')
}

/*
 * Moves to the next music step and plays all the notes there
 */
function stepForward() {
  currentStep += 1
  // Get the step number pedded with 0
  let step = getCurrentStep()
  showPlayHead()
  // Get notes on current step
  let notes = document.querySelectorAll(`svg g#STEP${step} .selected`)
  for (let i = 0; i < notes.length; i++) {
    playNote(notes[i].id)
  }
  // Update play button
  let playHead = document.querySelectorAll('svg g#PLAY_HEAD > rect[id^="PLAY"]')
  for (let i = 0; i < playHead.length; i++) {
    if (i === step) {
      playHead[i].classList.add('active')
    } else {
      playHead[i].classList.remove('active')
    }
  }
}
