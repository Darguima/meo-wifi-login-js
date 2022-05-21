import * as https from 'https'
import * as CryptoJS from 'crypto-js'
// https://cryptojs.gitbook.io/docs/#ciphers

interface meoLoginResponse {
  result: boolean,
  error: string | null,
  RedirectUrlEN: string,
  RedirectUrlPT: string
}

interface logoffResponse {
  success: boolean,
  statusCode: number,
  url: string
}

interface loginResponse {
  success: boolean,
  response: meoLoginResponse,
  statusCode: number,
  url: string,
  cryptoPassword: string
}

export const meoWifiLogoff = (): Promise<logoffResponse> => {
  // https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Logoff?callback=foo
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: 'servicoswifi.apps.meo.pt',
        path: '/HotspotConnection.svc/Logoff?callback=foo',
        port: 443,
        method: 'GET',
        headers: { 'user-agent': 'node.js' }
      },

      res => {
        res.setEncoding('utf8')

        res.on('data', (body: string) => {
          const response: boolean = JSON.parse(
            body.substring(0, body.length - 2).replace('foo(', '')
          )

          resolve({
            success: response,
            statusCode: res.statusCode || 0,
            url: `https://${req.host}${req.path}`
          })
        })
      }
    )

    req.on('error', e => reject(e))

    req.end()
  })
}

export const encryptPassword = (password: string, ip: string) => {
  const iv = CryptoJS.enc.Hex.parse('72c4721ae01ae0e8e84bd64ad66060c4')
  const salt = CryptoJS.enc.Hex.parse('77232469666931323429396D656F3938574946')

  const key = CryptoJS.PBKDF2(ip, salt, { keySize: 8, iterations: 100 })

  const crypto = CryptoJS.AES.encrypt(password, key, { iv })

  return crypto.ciphertext.toString(CryptoJS.enc.Base64)
}

export const meoWifiLogin = (username: string, password: string, ip: string): Promise<loginResponse> => {
  const cryptoPassword = encryptPassword(password, ip)

  // https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=${username}&password=${cryptoPassword}&navigatorLang=pt&callback=foo
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: 'servicoswifi.apps.meo.pt',
        path: `/HotspotConnection.svc/Login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(cryptoPassword)}&navigatorLang=pt&callback=foo`,
        port: 443,
        method: 'GET',
        headers: { 'user-agent': 'node.js' }
      },

      res => {
        res.setEncoding('utf8')

        res.on('data', (body: string) => {
          const response: meoLoginResponse = JSON.parse(
            body.substring(0, body.length - 2).replace('foo(', '')
          )

          resolve({
            success: response.result,
            response,
            statusCode: res.statusCode || 0,
            url: `https://${req.host}${req.path}`,
            cryptoPassword
          })
        })
      }
    )

    req.on('error', e => reject(e))

    req.end()
  })
}
