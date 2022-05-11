window.addEventListener('load', async function() {
  let response = await fetch('https://joylabz-uploads.herokuapp.com/')
  let entries = await response.json()
  entries = entries.filter(e => e.filename.indexOf('_slit_') !== -1)
  entries.reverse()
  document.body.appendChild(Feed(entries))
})

function isPlainObject(value) {
	if (Object.prototype.toString.call(value) !== '[object Object]') {
		return false;
	}
	const prototype = Object.getPrototypeOf(value);
	return prototype === null || prototype === Object.prototype;
}
function h (tag, attrs, ...children) {
	const el = document.createElement(tag)
	if (isPlainObject(attrs)) {
		for (let k in attrs) {
			if (typeof attrs[k] === 'function') el.addEventListener(k, attrs[k])
			else el.setAttribute(k, attrs[k])
		}
	} else if (attrs) {
		children = [attrs].concat(children)
	}
	for (let child of children) el.append(child)
	return el
}

function Feed(entries) {
  return h('div', { id: 'feed' },
    h('h1', 'Radi(c)al Slit Experiment'),
    h('a', { href: 'index.html' }, 'Go to experiment!'),
    h('ol', ...entries.map(e => h('li', Thumbnail(e))))
  )
}

function Thumbnail(entry) {
  return h('img', { src: `http://joylabzuploadservice.s3-website-us-east-1.amazonaws.com/${entry.filename}` })
}
