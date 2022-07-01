console.log('content.js')

// LIBRARY
function random(min, max) {
  if (max) {
    return min + ((max-min) * Math.random())
  } else {
    return min * Math.random()
  }
}

function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

function selectStuff() {
  let tags = [
    'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'img', 'hr', 'br', 'span', 'li',
    'svg', 'audio', 'video', 'iframe', 'embed', 'path', 'td', 'th', 'tl',
    'input', 'select', 'textarea', 'radio', 'button', 'canvas', 'i', 'img'
  ]
  return document.querySelectorAll(tags.join(', '))
}

function selectOne(query) {
  return document.querySelector(query)
}

function selectAll(query) {
  return Array.from(document.querySelectorAll(query))
}

function runForever(fn, t) {
  return setInterval(fn, t || 100)
}

function whenKeyIsPressed(key, fn) {
  window.addEventListener(
    'keydown',
    (e) => (e.key === key) ? fn() : null
  )
}

function whenKeyIsPressedOnce(key, fn) {
  window.addEventListener(
    'keydown',
    (e) => (e.key === key) ? fn() : null,
    { once: true }
  )
}

function whenMouseMoves(fn) {
  window.addEventListener('mousemove', fn)
}

function whenMouseClicks(fn) {
  window.addEventListener('mousedown', fn)
}

function whenMouseClicksOnce(fn) {
  window.addEventListener('mousedown', fn, { once: true })
}

function getElementAt(x, y) {
  return document.elementFromPoint(x, y)
}

function getAllElementsAt(x, y) {
  let els = document.elementsFromPoint(x, y)
  let arr = Array.from(els)
  return arr.filter(el => {
    return el.id !== 'appxxx'
    && el.id !== 'toolbar'
    // && el.tagName.toLowerCase() !== 'body'
    && el.tagName.toLowerCase() !== 'html'
  })
}

function setStyle(el, key, value) {
  el.style[key] = value
}

function createElement(tagName, properties, content) {
  let el = document.createElement(tagName)
  Object.keys(properties).forEach((id) => {
    let value = properties[id]
    if (typeof value == "function") {
      el.addEventListener(id, value)
    } else {
      el.setAttribute(id, value)
    }
  })
  return el
}

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
      .map((pack) => {
        return html`
          <div class="card column align-center">
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
        <div class="card column align-center">
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
  for (let i = 0; i < 100; i++) {
    state.glitches[`test ${i}`] = genTest(i)
  }

  state.packs = {}
  for (let i = 0; i < 32; i++) {
    state.packs[`pack ${i}`] = []
    let n = 1 + parseInt(Math.random() * 6)
    for (let j = 0; j < n; j++) {
      let m = parseInt(Math.random() * 100)
      state.packs[`pack ${i}`].push(`test ${m}`)
    }
  }

  state.toolbar = []
  state.selectedGlitch = null
  state.isInventoryOpen = false

  emitter.on('select-glitch', (key) => {
    state.isInventoryOpen = false
    state.selectedGlitch = key
    emitter.emit('render')
  })

  emitter.on('toggle-inventory', () => {
    state.isInventoryOpen = !state.isInventoryOpen
    if (state.isInventoryOpen) state.selectedGlitch = null
    emitter.emit('render')
  })

  emitter.on('remove-glitch', () => {
    let result = confirm("Are you sure you want to remove this glitch from the toolbar?")
    if (result) {
      state.toolbar = state.toolbar.filter(k => k !== state.selectedGlitch)
      state.selectedGlitch = null
      emitter.emit('render')
    }
  })

  emitter.on('load-pack', (pack) => {
    state.toolbar = state.packs[pack]
    emitter.emit('render')
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
