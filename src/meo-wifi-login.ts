import axios from 'axios'
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

export const meoWifiLogoff = async (): Promise<logoffResponse> => {
  // https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Logoff?callback=foo
  const { data, status, request } = await axios.get<string>(
    'https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Logoff', {
      params: {
        callback: 'foo'
      }
    }
  )

  const meoResponse: boolean = JSON.parse(data.substring(0, data.length - 2).replace('foo(', ''))

  return {
    success: meoResponse,
    statusCode: status,
    url: request.res?.responseUrl || request.responseURL || ''
  }
}

export const encryptPassword = (password: string, ip: string) => {
  const iv = CryptoJS.enc.Hex.parse('72c4721ae01ae0e8e84bd64ad66060c4')
  const salt = CryptoJS.enc.Hex.parse('77232469666931323429396D656F3938574946')

  const key = CryptoJS.PBKDF2(ip, salt, { keySize: 8, iterations: 100 })

  const crypto = CryptoJS.AES.encrypt(password, key, { iv })

  return crypto.ciphertext.toString(CryptoJS.enc.Base64)
}

export const meoWifiLogin = async (username: string, password: string, ip: string): Promise<loginResponse> => {
  const cryptoPassword = encryptPassword(password, ip)

  // https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=${username}&password=${cryptoPassword}&navigatorLang=pt&callback=foo
  const { data, status, request } = await axios.get<string>(
    'https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login', {
      params: {
        username,
        password: cryptoPassword,
        navigatorLang: 'pt',
        callback: 'foo'
      }
    }
  )

  const meoResponse: meoLoginResponse = JSON.parse(data.substring(0, data.length - 2).replace('foo(', ''))

  return {
    success: meoResponse.result,
    response: meoResponse,
    statusCode: status,
    url: request.res?.responseUrl || request.responseURL || '',
    cryptoPassword
  }
}
