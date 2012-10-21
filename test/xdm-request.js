describe('Xdm Request', function () {
  var request

  before(function () {
    request = require('xdm-request')('http://localhost:3000/test/frame.html')
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
      done()
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