const KEYS = [
  'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
  ' ', 'a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h'
]

function isAllFalse(dict) {
  return Object.keys(dict).reduce((acc, key) => {
    if (dict[key]) acc = false
    return acc
  }, true)
}

function store(state, emitter) {
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

  window.addEventListener('keydown', (e) => {
    let key = e.key.toLowerCase()
    emitter.emit('key-down', key)
  })
  window.addEventListener('keyup', (e) => {
    let key = e.key.toLowerCase()
    emitter.emit('key-up', key)
  })
}

function mainView(state, emit) {
  return html`
    <div id="app">
      ${Display(state, emit)}
      <div id="toolbar">
        <img src="logo.png" width="70%" style="align-self: center;" alt="Makey Makey Interactive Poster" />
        ${Uploader(state, emit)}
        ${Keys(state, emit)}
      </div>
    </div>
  `
}

function Display(state, emit) {
  return html`
    <div id="display" style="background-image: url('${state.display}')">
    </div>
  `
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
      <div>
        <button
          class="primary"
          disabled=${disabled}
          onclick=${() => emit('select-image')}
          >
          <img src="icons/image.png" alt="📷">
        </button>
        ${hasImage ? imageAppendix : null}
      </div>
      <div>
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
    let imageName = key === ' ' ? '_' : key
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

window.addEventListener('load', () => {
  let app = Choo()
  app.use(store)
  app.route('*', mainView)
  app.mount('#app')
})
