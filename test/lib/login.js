const nock = require('nock')
const url = require('url')
require('chai')
  .use(require('chai-as-promised'))
  .should()

const login = require('../../lib/login')

describe('login', () => {
  describe('#do', () => {
    const apiUrl = 'https://localhost:3100'
    const parsedApiUrl = url.parse(apiUrl)
    const email = 'content'
    const password = 'password'
    const auth = { email, password }
    const loginPath = '/v1/auth/login'
    const jsonTokens = { refreshToken: 'refresh', accessToken: 'access' }

    it('should return refresh and access tokens', async () => {
      nock(apiUrl)
        .post(loginPath, auth)
        .reply(200, jsonTokens)

      await login.do(email, password, parsedApiUrl).should.eventually.deep.equal(jsonTokens)
    })

    it('should reject on api server connection failure', async () => {
      const invalidApiHostname = 'http://not-a-valid-hostname'
      const parsedInvalidApiUrl = url.parse(invalidApiHostname)

      await login.do(email, password, parsedInvalidApiUrl).should.be.rejectedWith(Error)
    })

    it('should reject on api server status code != 200', async () => {
      nock(apiUrl)
        .post(loginPath, auth)
        .reply(500)

      await login.do(email, password, parsedApiUrl).should.be.rejectedWith(Error, 'Invalid status code')
    })

    it('should reject on non-JSON data', async () => {
      nock(apiUrl)
        .post(loginPath, auth)
        .reply(200, 'jsonTextTokens')

      await login.do(email, password, parsedApiUrl).should.be.rejectedWith(Error, 'JSON parse error')
    })

    it('should reject if refreshToken is not present', async () => {
      nock(apiUrl)
        .post(loginPath, auth)
        .reply(200, {accessToken: 'access'})

      await login.do(email, password, parsedApiUrl).should.be.rejectedWith(Error, 'Refresh Token missing')
    })

    it('should reject if accessToken is not present', async () => {
      nock(apiUrl)
        .post(loginPath, auth)
        .reply(200, {refreshToken: 'refresh'})

      await login.do(email, password, parsedApiUrl).should.be.rejectedWith(Error, 'Access Token missing')
    })
  })
})