describe('Xdm Request', function () {
  var request

  before(function () {
    request = require('xdm-request')('frame.html')
  })

  it('simple GET', function (done) {
    request.get('/echo', function (res) {
      assert(res.status)
      done()
    })
  })

  it('GET json', function (done) {
    request.get('/json', function (res) {
      assert(res.body[0] == 'foo')
      assert(res.body[1] == 'bar')
      assert(res.type == 'application/json')
      done()
    })
  })

  it('simple POST', function (done) {
    request.post('/echo', function (res) {
      assert(res.body.method == 'POST')
      done()
    })
  })

  describe('.send()', function () {
    it('Should send json by default', function (done) {
      request
        .post('/echo')
        .send({foo: 'bar'})
        .end(function (res) {
          assert(res.body.header['content-type'] == 'application/json')
          assert(res.body.body.foo == 'bar')
          done()
        })
    })

    it('Should send x-www-form-urlencoded for corresponding Content-Type', function (done) {
      request
        .post('/echo')
        .send({foo: 'bar'})
        .type('application/x-www-form-urlencoded')
        .end(function (res) {
          assert(res.body.header['content-type'] == 'application/x-www-form-urlencoded')
          assert(res.body.body.foo == 'bar')
          done()
        })
    })

    it('Should merge', function (done) {
      request
        .post('/echo')
        .send({foo: 'bar'})
        .send({bar: 'baz'})
        .end(function (res) {
          assert(res.body.body.foo == 'bar')
          assert(res.body.body.bar == 'baz')
          done()
        })
    })
  })

  describe('query string', function () {
    it('append to original', function (done) {
      request
        .get('/echo?hello=world')
        .query({foo: 'bar'})
        .end(function (res) {
          assert(res.body.query.hello == 'world')
          assert(res.body.query.foo == 'bar')
          done()
        })
    })
    it('append', function (done) {
      request
        .get('/echo')
        .query({foo: 'bar'})
        .end(function (res) {
          assert(res.body.query.foo == 'bar')
          done()
        })
    })
  })
})