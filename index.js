var Emitter = require('emitter')
var Request = require('./http')

module.exports = function (url) {
  var frame = request.frame = new Frame(url)

  function request (method, url, data, cb) {
    if (typeof data == 'function') {
      cb = data
      data = null
    }
    var req = new Request(frame, method, url)
    data && req.send(data)
    cb && req.end(cb)
    return req
  }

  request.get = function (url, cb) {
    return request('GET', url, cb)
  }

  request.post = function (url, data, cb) {
    return request('POST', url, data, cb)
  }

  return request
}


var _uid = 0

function uid () {
  return ++_uid
}


function Frame (url) {
  this.url = url
  Emitter.call(this)
  this.init()
}

Frame.prototype = Object.create(Emitter.prototype)

Frame.prototype.send = function (data, cb) {
  var id = 'msg' + uid()
  var msg = {
    id: id,
    data: data
  }
  this.window(function (w) {
    w.postMessage(msg, '*')
    cb && this.on(id, cb)
  })
  return id
}

Frame.prototype.window = function (cb) {
  if (this._window) return cb.call(this, this._window)
  this.on('connect', function () {
    cb.call(this, this._window)
  })
  if (this.iframe) return
  var iframe = this.iframe = document.createElement('iframe')
  iframe.src = this.url
  iframe.style.display = 'none'
  document.body.appendChild(iframe)
}

Frame.prototype.init = function () {
  this._dispatch = function (e) {
    if (this.url.indexOf(e.origin) != 0) return // TODO: this is lame
    if (!e.data) return
    if (e.data == 'ready') {
      this._window = e.source
      this.emit('connect')
      this.off('connect')
      return
    }
    var id = e.data.id
    id && this.emit(id, e.data.data)
  }.bind(this)
  window.addEventListener('message', this._dispatch)
}

Frame.prototype.destroy = function () {
  this.iframe && document.body.removeChild(this.iframe)
  this._dispatch && window.removeEventListener('message', this._dispatch)
}