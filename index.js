var Emitter = require('emitter')
var inherit = require('inherit')
var bind = require('bind')
var parseUrl = require('url').parse
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


function origin (url) {
  url = parseUrl(url)
  return url.protocol + '//' + url.host
}


function Frame (url) {
  this.url = url
  this.origin = origin(this.url)
  Emitter.call(this)
  this.init()
}

inherit(Frame, Emitter)

Frame.prototype.send = function (req, cb) {
  var id = 'msg' + uid()
  var msg = {
    id: id,
    req: req
  }
  this.window(function (w) {
    w.postMessage(JSON.stringify(msg), this.origin)
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
  this._dispatch = bind(this, function (e) {
    if (this.origin != e.origin) return
    var data = e.data
    if (data == 'xdm-request-ready') {
      this._window = e.source
      this.emit('connect')
      this.off('connect')
      return
    }
    if ('string' != typeof data) return
    if (!~data.indexOf('xdm-response')) return
    data = JSON.parse(data)
    this.emit(data.id, data.res)
  })
  onmessage(this._dispatch)
}

Frame.prototype.destroy = function () {
  this.iframe && document.body.removeChild(this.iframe)
  this._dispatch && window.removeEventListener('message', this._dispatch)
}

function onmessage (cb) {
  var listen = window.addEventListener || window.attachEvent
  listen.call(window, 'message', cb)
}