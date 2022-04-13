let colorPalette = [
  '#ff3155',
  '#ffed5e',
  '#2daefd',
  // '#ffaf42',
  '#49f770'
]

// LIBRARY

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
  let n = Math.floor(Math.random()*colorPalette.length)
  state.primaryColor = colorPalette[n]
  state.secondaryColor = colorPalette[(n + 1) % colorPalette.length]

  state.editToolbar = false
  state.editGlitch = null
  state.codeMirror = null

  state.glitches = {
    'stroke pulse': () => {
      clearInterval(window.pulseInterval || 0)
      window.pulseInterval = setInterval(() => {
      	let paths = document.querySelectorAll('svg path')
        Array.from(paths).forEach((p) => {
          if (p.attributes['stroke-width']) {
            p.attributes['stroke-width'].nodeValue = map(
              Math.sin(Date.now()/1000),
              -1, 1,
              3, 15
            )
          }
        })
      }, 20)
    },
    'stroke pulse 2': () => {
      clearInterval(window.pulseInterval || 0)
      window.pulseInterval = setInterval(() => {
      	let paths = document.querySelectorAll('svg path')
        Array.from(paths).forEach((p, i) => {
          p.attributes['stroke-width'].nodeValue = map(
            Math.sin((Date.now()/1000) + (i*0.2)),
            -1, 1,
            3, 15
          )
        })
      }, 20)
    },
    'stroke pulse 3': () => {
      clearInterval(window.pulseInterval || 0)
      window.pulseInterval = setInterval(() => {
      	let paths = document.querySelectorAll('svg path')
        Array.from(paths).forEach((p, i) => {
          p.attributes['stroke-width'].nodeValue = map(
            Math.sin((Date.now()/1000) + (i*0.1)),
            -1, 1,
            3, 15
          )
        })
      }, 20)
    },
    'stroke pulse 4': () => {
      clearInterval(window.pulseInterval || 0)
      window.pulseInterval = setInterval(() => {
      	let paths = document.querySelectorAll('svg path')
        Array.from(paths).forEach((p, i) => {
          p.attributes['stroke-width'].nodeValue = map(
            2*Math.sin((5*Date.now()/1000) + (i*0.2)),
            -2, 2,
            3, 15
          )
        })
      }, 20)
    },
    'stroke mouse': () => {
      window.addEventListener('mousemove', (e) => {
        mouseInterference = e.screenX * 0.01 + e.screenY * 0.01
      })
      clearInterval(window.pulseInterval || 0)
      window.pulseInterval = setInterval(() => {
      	let paths = document.querySelectorAll('svg path')
        Array.from(paths).forEach((p, i) => {
          p.attributes['stroke-width'].nodeValue = map(
            Math.sin(mouseInterference),
            -1, 1,
            3, 15
          )
        })
      }, 20)
    },
    'stroke react': () => {
      mousePosition = [0, 0]
      window.addEventListener('mousemove', (e) => {
        mousePosition = [e.screenX, e.screenY]
      })
      clearInterval(window.pulseInterval || 0)
      window.pulseInterval = setInterval(() => {
      	let paths = document.querySelectorAll('svg path')
        Array.from(paths).forEach((p, i) => {
          let bounds = p.getBoundingClientRect()
          let centerX = bounds.left + (bounds.width/2)
          let centerY = bounds.top + (bounds.height/2)
          let dx = Math.abs(centerX - mousePosition[0])
          let dy = Math.abs(centerY - mousePosition[1])
          let d = Math.hypot(dx, dy)
          p.attributes['stroke-width'].nodeValue = (1 / d) * window.innerWidth
        })
      }, 20)
    }
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
      chrome.storage.local.remove(glitchName, () => {
        emitter.emit('render')
      })
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

    try {
      let obj = {}
      obj[name] = content
      chrome.storage.local.set(obj)
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

try {
  start()
} catch (e) {
  window.addEventListener('load', () => start())
}


let empty = () => {
  // Write your glitch here!
  alert('Ploft!')
}
