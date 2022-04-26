// TIMEOUT GLOBALS
let keyTimeouts = {}
let highlightTimeouts =  {}
let stepNoteTimeouts =  {}
let samplerReady = false
let sampler
let currentStep = 0

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
  }
})

window.addEventListener('load', function() {
  loadSong()
  // Bind clicks to the step notes
  let steps = document.querySelectorAll('svg g[id^="STEP"]')
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i]
    let notes = step.querySelectorAll('circle')
    for (let j = 0; j < notes.length; j++) {
      let note = notes[j]
      note.addEventListener('click', function(e) {
        toggleSelected(e.target)
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
        stepForward()
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
  let print = document.querySelector('svg g#PRINT')
  print.addEventListener('click', function() {
    window.open('interactive_sheet_music.pdf', '_blank');
  })
  let save = document.querySelector('svg g#SAVE')
  save.addEventListener('click', function() {
    saveSong()
  })
  let step = document.querySelector('svg g#STEP_FORWARD')
  step.addEventListener('click', function() {
    stepForward()
  })
})

window.addEventListener('hashchange', function() {
  loadSong()
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

function soundNote(id) {
  let keyId = id.split('_')[0]
  // NO BLACK KEYS
  if(keyId.indexOf('black') !== -1) return
  // Note name
  let note = keyId.substr(0, 1)
  // Apply octave modifier
  let octave = parseInt(keyId.substr(1))
  // Play note
  sampler.triggerAttackRelease(`${note}${octave}`, 1.0);
}

function playNote(id) {
  if (!samplerReady) return false
  activateKey(id)
  activateHightlight(id)
  soundNote(id)
}

function clearNotes() {
  let selectedNotes = document.querySelectorAll(`svg g[id^="STEP"] .selected`)
  for (let i = 0; i < selectedNotes.length; i++) {
    selectedNotes[i].classList.remove('selected')
  }
  window.location.hash = ''
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

  let playHead = document.querySelector('svg g#PLAY_HEAD > rect[id^="PLAY"].active')
  playHead.classList.remove('active')

}

function printPage() {
  window.print()
}

function loadSong() {
  let hash = window.location.hash.toUpperCase().substring(1)
  if (hash === '') return false
  let encodedSteps = hash.split(',')
  for (let i = 0; i < encodedSteps.length; i++) {
    let stepNumber = i + 1
    let encodedStepNotes = encodedSteps[i].split('-')
    let domStepNotes = document.querySelectorAll(`svg g#STEP${stepNumber} circle`)
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

function saveSong() {
  let song = []
  let steps = document.querySelectorAll('svg g[id^="STEP"]')
  for (let i = 0; i < steps.length; i++) {
    let stepNumber = i + 1
    song[i] = []
    let stepNotes = document.querySelectorAll(`svg g#STEP${stepNumber} circle`)
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

function stepForward() {
  let step = ((currentStep) % 16) + 1
  // Get notes on current step
  let notes = document.querySelectorAll(`svg g#STEP${step} .selected`)
  for (let i = 0; i < notes.length; i++) {
    activateStepNote(notes[i].id)
    playNote(notes[i].id)
  }
  // Update play head
  let playHead = document.querySelectorAll('svg g#PLAY_HEAD > rect[id^="PLAY"]')
  for (let i = 0; i < playHead.length; i++) {
    if ((i+1) === step) {
      playHead[i].classList.add('active')
    } else {
      playHead[i].classList.remove('active')
    }
  }
  currentStep += 1
}
