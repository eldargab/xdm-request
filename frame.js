;(function () {

  onmessage(function (e) {
    var source = e.source // ie crap, e.source will not be available in closure
    var data = JSON.parse(e.data)
    var id = data.id
    var req = data.req
    var xhr = new XMLHttpRequest

    xhr.onreadystatechange = function () {
      if (xhr.readyState != 4) return
      source.postMessage(JSON.stringify({
        id: id,
        type: 'xdm-response',
        res: new Response(xhr)
      }), '*')
    }

    xhr.open(req.method, req.url, true)

    for (var field in req.header) {
      xhr.setRequestHeader(field, req.header[field])
    }

    xhr.send(req.data)
  })

  window.parent.postMessage('xdm-request-ready', '*')

  function Response (xhr) {
    this.status = xhr.status || 0
    this.text = xhr.responseText
    this.header = xhr.getAllResponseHeaders()
  }

  function onmessage (cb) {
    window.addEventListener
      ? window.addEventListener('message', cb)
      : window.attachEvent('onmessage', cb)
  }
})()