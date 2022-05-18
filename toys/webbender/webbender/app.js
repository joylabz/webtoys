let colorPalette = [
  '#ff3155',
  '#ffed5e',
  '#2daefd',
  '#49f770'
]

// LIBRARY

function random(min, max) {
  if (max) {
    return min + ((max-min) * Math.random())
  } else {
    return min * Math.random()
  }
}

function oscillate(phase, frequency, amplitute) {
  return amplitute * Math.sin(frequency * phase)
}

function int(n) {
  return parseInt(n)
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
    () => (e.key === key) ? fn() : null
  )
}

function whenKeyIsPressedOnce(key, fn) {
  window.addEventListener(
    'keydown',
    () => (e.key === key) ? fn() : null,
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

// END OF LIBRARY

// HTML ELEMENTS
function Button(args) {
  let { onClick, content, style = '', className } = args
  return html`
    <button onclick=${onClick} style=${style} class=${className}>
      ${content}
    </button>
  `
}

function Input(args) {
  let { type = 'text', value, onChange, style = '', className } = args
  return html`<input type=${type} value=${value} onchange=${onChange} class=${className} style=${style} />`
}

function Textarea(args) {
  let { value, style, id } = args
  return html`<textarea id=${id} style=${style}>${value}</textarea>`
}

// LAYOUT COMPONENTS
function EditGlitch(args) {
  let { name, style = '', emit = () => false } = args
  return [
    Button({ style, className: 'editButton', content: 'X', onClick: () => emit('remove-glitch', name) }),
    Button({ style, className: 'editButton', content: 'E', onClick: () => emit('edit-glitch', name) }),
  ]
}

function Toolbar(state, emit) {
  let glitchButtonStyle = `
    color: ${state.secondaryColor};
    background-color: ${state.primaryColor};
    box-shadow: 2px 2px 0 ${state.secondaryColor};
  `
  let editButtonStyle = `
    color: ${state.primaryColor};
    background-color: ${state.secondaryColor};
    box-shadow: 0.25vh 0.25vh 0 ${state.primaryColor};
  `

  function ListItem(glitchName) {
    return html`
      <li>
        ${
          state.editToolbar
            ? EditGlitch({ emit, name: glitchName, style: editButtonStyle })
            : null
        }
        ${Button({
          style: glitchButtonStyle,
          className: 'glitchButton',
          content: glitchName,
          onClick: () => emit('run-glitch', glitchName)
        })}
      </li>
    `
  }

  return html`
    <ul id="toolbar">
      ${Object.keys(state.glitches).map(ListItem)}
      ${Button({
        style: editButtonStyle,
        className: 'editButton',
        content: '*',
        onClick: () => emit('toggle-edit-toolbar')
      })}
    </ul>
  `
}

function CodeEditor(state, emit) {
  let codeEditorStyle = `background: ${state.secondaryColor};`
  let buttonStyle = `
    color: ${state.secondaryColor};
    background-color: ${state.primaryColor};
    box-shadow: 2px 2px 0 ${state.secondaryColor};
  `
  let inputStyle = `
    width: 100%;
    cursor: text;
    color: ${state.primaryColor};
    background-color: white;
    box-shadow: 2px 2px 0 ${state.secondaryColor};
  `

  let input = Input({ className: 'button', style: inputStyle, value: state.editGlitch })
  let editor = Textarea({ id: 'editor', value: state.glitches[state.editGlitch] })

  setTimeout(() => emit('start-codemirror'), 1)

  function saveGlitch() {
    try {
      emit('save-glitch', input.value, state.codeMirror.getValue())
    } catch (e) {
      console.log(e)
    }
  }

  return html`
    <div id="code-editor" style=${codeEditorStyle}>
      <div style="display: flex; width: 100%; height: 8.5vh;">
        ${input}
        ${Button({ style: buttonStyle, content: 'Save', onClick: saveGlitch })}
      </div>
      <div style="display: flex; width: 100%; height: 57.5vh;">
        ${editor}
      </div>
    </div>
  `
  return html`
    <div id="code-editor">
      <div style="display: flex; width: 100%; height: 10%;">
        ${input}
        ${Button({ content: 'Save', onClick: saveGlitch })}
      </div>
      ${editor}
    </div>
  `
}

function mainView (state, emit) {
  return html`
    <div id="appxxx">
      ${Toolbar(state, emit)}
      ${state.editGlitch ? CodeEditor(state, emit) : null}
    </div>
  `
}

// STATE MACHINERY
function store (state, emitter) {
  let n = 0
  state.primaryColor = colorPalette[n]
  state.secondaryColor = colorPalette[(n + 1) % colorPalette.length]

  state.editToolbar = false
  state.editGlitch = null
  state.codeMirror = null

  state.glitches = {
    'empty': empty,
    'create rectangles': createRectangles,
    'change background on click': changeBackgroundOnClick,
    'remove on click': removeElementOnClick,
    'displace on click': displaceElementOnClick,
    'displace on mouse enter': displaceElementOnMouseEnter
  }

  emitter.on('run-glitch', (glitchName) => {
    console.log('log', 'run-glitch', glitchName)
    try {
      state.glitches[glitchName]()
    } catch (e) {
      console.log(e)
    }
  })

  emitter.on('mouse-move', (x, y) => {
    console.log('log', 'mouse-move', x, y)
    state.mouseX = x
    state.mouseY = y
    emitter.emit('render')
  })

  emitter.on('toggle-edit-toolbar', () => {
    console.log('log', 'toggle-edit-toolbar')
    state.editToolbar = !state.editToolbar
    state.editGlitch = null
    emitter.emit('render')
  })

  emitter.on('remove-glitch', (glitchName) => {
    console.log('log', 'remove-glitch', glitchName)
    try {
      delete state.glitches[glitchName]
    } catch (e) {
      console.log(e)
    }
    emitter.emit('render')
  })

  emitter.on('edit-glitch', (glitchName) => {
    console.log('log', 'edit-glitch', glitchName)
    state.editGlitch = glitchName
    emitter.emit('render')
  })

  emitter.on('save-glitch', (name, content) => {
    console.log('log', 'save-glitch', name, content)
    try {
      state.glitches[name] = eval(content)
      state.editGlitch = null
      state.editToolbar = false
    } catch (e) {
      console.log(e)
    }
    emitter.emit('render')
  })

  emitter.on('start-codemirror', () => {
    let el = document.querySelector('#code-editor textarea')
    state.codeMirror = CodeMirror.fromTextArea(el, { lineNumbers: true })
  })

}

// START!
function start() {
  let wrapper = document.querySelector('#appxxx')
  if (!wrapper) {
    const wrapper = document.createElement('div')
    wrapper.id = 'appxxx'
    document.body.appendChild(wrapper)
  }

  const app = choo()
  app.use(store)
  app.route('*', mainView)
  app.mount('#appxxx')
}

window.addEventListener('load', () => start())

let empty = () => {
  /*
  Write your glitch here!
  Here are some functions you can use:

  runForever(fn, t)
  selectOne(query)
  selectAll(query)
  setStyle(el, key, value)
  isInViewport(element)
  oscillate(phase, frequency, amplitute)
  random(min, max)
  map(x, in_min, in_max, out_min, out_max)
  createElement(tagName, properties, content)
  whenKeyIsPressed(key, fn)
  whenKeyIsPressedOnce(key, fn)
  whenMouseMoves(fn)
  whenMouseClicks(fn)
  whenMouseClicksOnce(fn)
  getElementAt(x, y)
  getAllElementsAt(x, y)
  */
  alert('This is not an alert!')
}

let createRectangles = () => {
  let rect = createElement(
    'div',
    {
      style: `
        position: absolute;
        top: ${random(20, 80)}%;
        left: ${random(20, 80)}%;
        width: 10%;
        height: 10%;
        background: black;
        transition: all 0.2s;
      `
    }
  )
  document.body.appendChild(rect)
}

let changeBackgroundOnClick = () => {
  // let colors = [ 'red', 'green', 'blue', 'yellow', 'cyan', 'purple', 'grey' ]
  let colors = colorPalette
  whenMouseClicks(function(e) {
    let els = getAllElementsAt(e.pageX, e.pageY)
    els.forEach((el) => {
      setStyle(el, 'background', colors[int(random(0, colors.length))])
    })
  })
}

let removeElementOnClick = () => {
  whenMouseClicks(function(e) {
    let els = getAllElementsAt(e.pageX, e.pageY)
    els = els.filter(el => el.tagName.toLowerCase() != 'body')
    els.forEach((el) => el.remove())
  })
}

let displaceElementOnClick = () => {
  whenMouseClicks(function(e) {
    let els = getAllElementsAt(e.pageX, e.pageY)
    els.forEach((el) => {
      setStyle(el, 'top', `${random(20, 80)}%`)
      setStyle(el, 'left', `${random(20, 80)}%`)
    })
  })
}

let displaceElementOnMouseEnter = () => {
  let squares = selectAll('body > div')
  squares.forEach(square => {
    square.addEventListener('mouseenter', () => {
      setStyle(square, 'top', `${random(20, 80)}%`)
      setStyle(square, 'left', `${random(20, 80)}%`)
    })
  })
}
