const KEYS = [
  'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
  '1', '2', '3', '4',
  'w', 'a', 's', 'd',
  'f', 'g', ' '
]

function isAllFalse(dict) {
  return Object.keys(dict).reduce((acc, key) => {
    if (dict[key]) acc = false
    return acc
  }, true)
}

function store(state, emitter) {
  state.selectedKey = null
  state.display = ''
  state.images = KEYS.reduce((acc, key) => {
    acc[key] = null
    return acc
  }, {})
  state.sounds = KEYS.reduce((acc, key) => {
    acc[key] = null
    return acc
  }, {})
  state.keyPressed = KEYS.reduce((acc, key) => {
    acc[key] = false
    return acc
  }, {})

  state.tutorialSteps = [
    {
      text: html`
        <p>
          With this app you can make an interactive poster that shows an image
          and plays a sound on key press.
        </p>
      `,
      element: '#logo'
    },
    {
      text: html`
        <p>
          You can use up to 15 keys to create your poster.
        </p>
      `,
      element: '#keys'
    },
    {
      text: html`
        <p>
          Keys without sound or image are slightly transparent.
        </p>
      `,
      element: '#keys'
    },
    {
      text: html`
        <p>
          To add an image or sound to a key, select it by pressing the
          corresponding button or pressing the key.
        </p>
      `,
      element: '#keys'
    },
    {
      text: html`
        <p>
          When the key is selected, the button will be highlighted in yellow.
        </p>
      `,
      element: '#keys'
    },
    {
      text: html`
        <p>
          Once a key is selected you can upload images and sounds by clicking
          on the icon buttons.
        </p>
      `,
      element: '#uploader'
    },
    {
      text: html`
        <p>
          Once an image or sound is uploaded, an “X” will appear on the icon.
          Click on this X to remove the file.
        </p>
      `,
      element: '#uploader'
    },
    {
      text: html`
        <p>
          Keys with a sound or image will become white when they are not selected.
        </p>
      `,
      element: '#keys'
    },
    {
      text: html`
        <p>
          Click on the big red button to clean everyting. This will reset the
          app to the initial configuration.
        </p>
      `,
      element: '#keys'
    },
    {
      text: html`
        <p>
          That is it! Watch <a href="https://www.makeymakey.com" target="_blank">our videos</a>
          to learn tips and trick on how to make cool posters!
        </p>
      `,
      element: null
    }
  ]
  state.tutorialProgress = null

  emitter.on('key-up', (key) => {
    if (KEYS.indexOf(key) !== -1) {
      state.keyPressed[key] = false
      if (state.sounds[key]) {
        state.sounds[key].pause()
        state.sounds[key].currentTime = 0
      }
      if (isAllFalse(state.keyPressed)) {
        state.display = ''
      }
      emitter.emit('render')
    }
  })
  emitter.on('key-down', (key) => {
    if (KEYS.indexOf(key) !== -1) {
      emitter.emit('select-key', key)
      if (!state.keyPressed[key]) {
        if (state.images[key]) {
          state.display = state.images[key]
        }
        if (state.sounds[key]) {
          state.sounds[key].play()
        }
      }
      state.keyPressed[key] = true
      emitter.emit('render')
    }
  })
  emitter.on('select-key', (key) => {
    state.selectedKey = key
    emitter.emit('render')
  })
  emitter.on('clear', () => {
    state.selectedKey = null
    state.images = KEYS.reduce((acc, key) => {
      acc[key] = null
      return acc
    }, {})
    state.sounds = KEYS.reduce((acc, key) => {
      acc[key] = null
      return acc
    }, {})
    state.keyPressed = KEYS.reduce((acc, key) => {
      acc[key] = false
      return acc
    }, {})
    emitter.emit('render')
  })

  emitter.on('select-image', () => {
    let input = html`<input type="file" accept=".png,.jpg,.jpeg,.gif,.webp" />`
    input.addEventListener('change', (e) => {
      if (!e.target.files || !e.target.files[0]) return false
      let file = e.target.files[0]
      let reader = new FileReader()
      reader.onload = function(e) {
        state.images[state.selectedKey] = e.target.result
        e.target.value = ''
        emitter.emit('render')
      }
      reader.readAsDataURL(file)
    })
    input.click()
  })
  emitter.on('remove-image', () => {
    state.images[state.selectedKey] = null
    emitter.emit('render')

  })

  emitter.on('select-sound', () => {
    let input = html`<input type="file" accept=".mp3,.wav,.ogg,.webm" />`
    input.addEventListener('change', (e) => {
      if (!e.target.files || !e.target.files[0]) return false
      let file = e.target.files[0]
      const urlObj = URL.createObjectURL(file)
      const audio = html`<audio />`
      audio.addEventListener("load", () => {
        URL.revokeObjectURL(urlObj)
      })
      audio.src = urlObj
      state.sounds[state.selectedKey] = audio
      e.target.value = ''
      emitter.emit('render')
    })
    input.click()
  })
  emitter.on('remove-sound', () => {
    state.sounds[state.selectedKey] = null
    emitter.emit('render')
  })


  emitter.on('start-tutorial', () => {
    state.tutorialProgress = 0
    emitter.emit('render')
  })

  emitter.on('close-tutorial', () => {
    state.tutorialProgress = null
    emitter.emit('render')
  })

  emitter.on('next-tutorial', () => {
    state.tutorialProgress += 1
    if (state.tutorialProgress >= state.tutorialSteps.length) {
      state.tutorialProgress = null
    }
    emitter.emit('render')
  })

  window.addEventListener('keydown', (e) => {
    let key = e.key.toLowerCase()
    if (KEYS.indexOf(key) !== -1) e.preventDefault()
    emitter.emit('key-down', key)
  })
  window.addEventListener('keyup', (e) => {
    let key = e.key.toLowerCase()
    if (KEYS.indexOf(key) !== -1) e.preventDefault()
    emitter.emit('key-up', key)
  })
  window.addEventListener('resize', () => {
    emitter.emit('render')
  })
}

function mainView(state, emit) {
  return html`
    <div id="app">
      ${Display(state, emit)}
      <div id="toolbar">
        <img id="logo" src="logo.png" alt="Makey Makey Interactive Poster" />
        ${Uploader(state, emit)}
        ${Keys(state, emit)}
        ${HelpButton(state, emit)}
      </div>
      ${Help(state, emit)}
    </div>
  `
}

function Display(state, emit) {
  return html`<div id="display" style="background-image: url('${state.display}')"></div>`
}

function Uploader(state, emit) {
  let hasImage = state.images[state.selectedKey]
  let hasSound = state.sounds[state.selectedKey]
  let imageAppendix = html`
    <button class="appendix" onclick=${() => emit('remove-image')}>
      <img src="icons/close.png" alt="x">
    </button>
  `
  let soundAppendix = html`
    <button class="appendix" onclick=${() => emit('remove-sound')}>
      <img src="icons/close.png" alt="x">
    </button>
  `
  let disabled = state.selectedKey === null ? 'disabled' : false
  return html`
    <div id="uploader">
      <div class="wrapper">
        <button
          class="primary"
          disabled=${disabled}
          onclick=${() => emit('select-image')}
          >
          <img src="icons/image.png" alt="📷">
        </button>
        ${hasImage ? imageAppendix : null}
      </div>
      <div class="wrapper">
        <button
          class="primary"
          disabled="${disabled}"
          onclick=${() => emit('select-sound')}
          >
          <img src="icons/sound.png" alt="🔊">
        </button>
        ${hasSound ? soundAppendix : null}
      </div>
    </div>
  `
}

function Keys(state, emit) {
  let buttons = KEYS.map((key) => {
    let imageName = key === ' ' ? 'space' : key
    let image = html`<img src="icons/${imageName}.png" alt="${key}" />`
    let classList = []

    if (state.selectedKey === key) {
      classList.push('primary')
    } else if (state.sounds[key] === null && state.images[key] === null) {
      classList.push('empty')
    }

    classList = classList.join(' ')

    return html`
      <button class="${classList}" onclick=${() => emit('select-key', key)}>
        ${image}
      </button>
    `
  })
  return html`
    <div id="keys">
      ${buttons}
      <button class="secundary" onclick=${() => emit('clear')}>
        <img src="icons/close.png" alt="x">
      </button>
    </div>
  `
}

function HelpButton(state, emit) {
  return html`
    <div id="help-button">
      <button class="appendix" onclick=${() => emit('start-tutorial')}>
        <img src="icons/help.png" alt="help">
      </button>
    </div>
  `
}

function Help(state, emit) {
  if (state.tutorialProgress === null) {
    return null
  }
  const step = state.tutorialSteps[state.tutorialProgress]
  const targetEl = document.querySelector(step.element)
  let bounds, highlightStyle, dialogStyle
  if (targetEl) {
    bounds = targetEl.getBoundingClientRect()
    highlightStyle = `
      top: calc(${bounds.top}px - 0.2rem);
      left: calc(${bounds.left}px - 0.2rem);
      width: calc(${bounds.width}px + 0.4rem);
      height: calc(${bounds.height}px + 0.4rem);
    `
    dialogStyle = `
      top: ${bounds.top}px;
      left: calc(${bounds.left}px - 10rem);
    `
  } else {
    highlightStyle = `
      top: 50%;
      left: 50%;
      width: 0;
      height: 1px;
    `
    dialogStyle = `
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `
  }

  step.text.id = `step-${state.tutorialProgress}`

  return html`
    <div id="help">
      <div id="highligh" style=${highlightStyle}></div>
      <div id="dialog" style=${dialogStyle}>
        ${step.text}
        <div id="controls">
          <button class="close" onclick=${() => emit('close-tutorial')}>Close</button>
          <button class="next" onclick=${() => emit('next-tutorial')}>Next</button>
        </div>
      </div>
    </div>
  `
}

window.addEventListener('load', () => {
  let app = Choo()
  app.use(store)
  app.route('*', mainView)
  app.mount('#app')
})
