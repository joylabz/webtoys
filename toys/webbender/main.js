window.colorPalette = [
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

function copyToClipboard(el) {
      var range = document.createRange()
      range.selectNode(el)
      window.getSelection().removeAllRanges() // clear current selection
      window.getSelection().addRange(range) // to select text
      document.execCommand("copy")
      window.getSelection().removeAllRanges()// to deselect
  }

function run(el) {
  eval(`(${el.parentElement.querySelector('pre').innerText})()`)
}
