describe('Xdm Request', function () {
  var request, expect = chai.expect

  before(function () {
    request = require('xdm-request')('http://localhost:3000/test/frame.html')
  })

  it('simple GET', function (done) {
    request.get('/echo', function (res) {
      expect(res.status).to.equal(200)
      done()
    })
  })

  it('GET json', function (done) {
    request.get('/json', function (res) {
      expect(res.body).to.eql(['foo', 'bar'])
      done()
    })
  })

  describe('query string', function () {
    it('append to original', function (done) {
      request
        .get('/echo?hello=world')
        .query({foo: 'bar'})
        .end(function (res) {
          expect(res.body).to.have.property('query').deep.equal({
            hello: 'world',
            foo: 'bar'
          })
          done()
        })
    })
    it('append', function (done) {
      request
        .get('/echo')
        .query({foo: 'bar'})
        .end(function (res) {
          expect(res.body).to.have.property('query').deep.equal({
            foo: 'bar'
          })
          done()
        })
    })
  })
})