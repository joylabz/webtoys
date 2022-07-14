console.log('File: content.js')

const packnames = [
  "Drawing",
  "Physics",
  "Rube-Goldberg",
  "Look-Inside",
  "Analyze",
  "Destroy",
  "Garden",
  "Animate",
  "Controller",
  "Collage",
  "Games",
  "Music",
  "Mash-Up",
  "Language",
  "Bling",
  "Math",
  "Fly",
  "Personalize",
  "Trippy"
]
const scale = [
  415.3, 466.2,
  554.4, 622.3, 740.0
]

// UI ELEMENTS
function mainView(state, emit) {
  let freezeClass = ''
  if (state.isInventoryOpen) freezeClass = 'freeze'

  let closeClass = ''
  if (state.isInventoryOpen) closeClass = 'close'

  let inventory = ''
  if (state.isInventoryOpen) {
    let packs = Object
      .keys(state.packs)
      .map((pack, i) => {
        return html`
          <div class="card column align-center expand" style="animation-delay: ${(i*0.01).toFixed(3)}s">
            <span>${pack}</span>
            <button class="button accent" onclick=${() => emit('load-pack', pack)}>LOAD</button>
          </div>
        `
      })
    inventory = html`<div id="inventory" class="row wrap">${packs}</div>`
  }

  let glitches = state.toolbar.map((glitch) => {
    if (state.selectedGlitch === glitch) {
      return html`
        <div class="card column align-center expand">
          <span>${glitch}</span>
          <button class="button accent" onclick=${() => state.glitches[glitch]()}>APPLY</button>
          <div class="controls row justify-center align-center">
            <button class="control" onclick=${() => emit('remove-glitch')}>x</button>
            <button class="control">?</button>
          </div>
        </div>
      `
    } else {
      return html`
        <div class="button" onclick=${() => emit('select-glitch', glitch)}>${glitch}</div>
      `
    }
  })

  return html`
    <div id="webbender" class="row ${freezeClass}">
      <div id="toolbar" class="column justify-center align-center">
        ${glitches}
        <div class="button-round ${closeClass}" onclick=${() => emit('toggle-inventory')}>+</div>
      </div>
      ${inventory}
    </div>
  `
}

// APP STATE
function store(state, emitter) {
  function genTest(n) {
    return () => alert(`This is the test ${n}!`)
  }
  state.glitches = {}
  state.packs = {}
  state.toolbar = []
  state.selectedGlitch = null
  state.isInventoryOpen = false

  for (let i = 0; i < 100; i++) {
    state.glitches[`test ${i}`] = genTest(i)
  }

  state.packs = packnames.reduce((acc, pack) => {
    acc[pack] = []
    let n = 1 + parseInt(Math.random() * 6)
    for (let j = 0; j < n; j++) {
      let m = parseInt(Math.random() * 100)
      acc[pack].push(`test ${m}`)
    }
    return acc
  }, {})

  emitter.on('select-glitch', (key) => {
    state.isInventoryOpen = false
    state.selectedGlitch = key
    emitter.emit('render')
    emitter.emit('sound-effect')
  })

  emitter.on('toggle-inventory', () => {
    state.isInventoryOpen = !state.isInventoryOpen
    if (state.isInventoryOpen) {
      state.selectedGlitch = null
      emitter.emit('sound-effect-inventory')
    } else {
      emitter.emit('sound-effect')
    }
    emitter.emit('render')

  })

  emitter.on('remove-glitch', () => {
    emitter.emit('sound-effect')
    let result = confirm("Are you sure you want to remove this glitch from the toolbar?")
    if (result) {
      state.toolbar = state.toolbar.filter(k => k !== state.selectedGlitch)
      state.selectedGlitch = null
      emitter.emit('render')
      emitter.emit('sound-effect')
    }
  })

  emitter.on('load-pack', (pack) => {
    state.toolbar = state.packs[pack]
    emitter.emit('render')
    emitter.emit('sound-effect')
  })
}

window.addEventListener('load', () => {
  if (!document.querySelector('#webbender')) {
    console.log('loaded')
    let app = Choo()
    app.use(store)
    app.route('*', mainView)
    let container = html`<div id="webbender"></div>`
    document.body.appendChild(container)
    app.mount('#webbender')
  }
})
