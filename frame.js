;(function () {

  onmessage(function (e) {
    var id = e.data.id
    var req = e.data.data
    var xhr = new XMLHttpRequest

    xhr.onreadystatechange = function () {
      if (xhr.readyState != 4) return
      e.source.postMessage({
        id: id,
        data: new Response(xhr)
      }, '*')
    }

    xhr.open(req.method, req.url, true)

    for (var field in req.header) {
      xhr.setRequestHeader(field, req.header[field])
    }

    xhr.send(req.data)
  })

  window.parent.postMessage('ready', '*')

  function Response (xhr) {
    this.status = xhr.status || 0
    this.text = xhr.responseText
    this.header = xhr.getAllResponseHeaders()
  }

  function onmessage (cb) {
    var listen = window.addEventListener || window.attachEvent
    listen.call(window, 'message', cb)
  }
})()