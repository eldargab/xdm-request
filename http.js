// Adapted version of https://github.com/visionmedia/superagent

var Emitter = require('emitter')
var trim = require('trim')
var inherit = require('inherit')

module.exports = Request

function isObject (obj) {
  return obj === Object(obj)
}


function serializeObject (obj) {
  if (!isObject(obj)) return obj
  var pairs = []
  for (var key in obj) {
    pairs.push(encodeURIComponent(key)
      + '=' + encodeURIComponent(obj[key]))
  }
  return pairs.join('&')
}


// parse x-www-form-urlencoded
function parseString(str) {
  var obj = {};
  var pairs = str.split('&')
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i]
    parts = pair.split('=')
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1])
  }

  return obj
}


function parseHeader(str) {
  var lines = str.split(/\r?\n/)
  var fields = {}
  var index
  var line
  var field
  var val

  lines.pop() // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i]
    index = line.indexOf(':')
    field = line.slice(0, index).toLowerCase()
    val = trim(line.slice(index + 1))
    fields[field] = val
  }

  return fields
}


var serializers = {
   'application/x-www-form-urlencoded': serializeObject,
   'application/json': JSON.stringify
}

var parsers = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
}



function Request (frame, method, url) {
  this.frame = frame
  this.method = method
  this.url = url
  this.header = {}
  Emitter.call(this)
}

inherit(Request, Emitter)

Request.prototype.set = function (field, val) {
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key])
    }
    return this
  }
  this.header[field.toLowerCase()] = val
  return this
}

Request.prototype.type = function(type){
  this.set('Content-Type', type)
  return this
}

Request.prototype.query = function(obj){
  this._query = this._query || {}
  for (var key in obj) {
    this._query[key] = obj[key]
  }
  return this
}

Request.prototype.send = function(data){
  var obj = isObject(data)
  var type = this.header['content-type']

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key]
    }
  } else if ('string' == typeof data) {
    if (!type) this.set('content-type', 'application/x-www-form-urlencoded')
    type = this.header['content-type']
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data
    }
  } else {
    this._data = data
  }

  if (!obj) return this
  if (!type) this.set('content-type', 'application/json')
  return this
}

Request.prototype.end = function (cb) {
  var self = this
  var query = this._query
  var data = this._data

  // querystring
  if (query) {
    query = serializeObject(query)
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query
  }

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data) {
    var serialize = serializers[this.header['content-type']]
    if (serialize) data = serialize(data)
  }

  this.frame.send({
    url: this.url,
    method: this.method,
    data: data,
    header: this.header
  }, function (res) {
    self.emit('end', new Response(res))
  })

  cb && this.on('end', cb)

  return this
}


function Response (res) {
  this.raw = res
  this.status = res.status
  this.text = res.text
  this.header = parseHeader(res.header)
  this.type = this.header['content-type'].split(/ *; */).shift()

  // parse body
  var parse = parsers[this.type]
  this.body = parse ? parse(this.text) : null
}
