var express = require('express')
var app = express()

app.use(express.bodyParser())
app.use(app.router)
app.use(express.static(__dirname))

app.all('/echo', function (req, res) {
  res.send({
    method: req.method,
    query: req.query,
    header: req.headers,
    body: req.body
  })
})

app.get('/json', function (req, res) {
  res.send(['foo', 'bar'])
})

app.listen(3000)
console.log('Test server listening...')