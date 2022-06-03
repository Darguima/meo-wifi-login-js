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
  message: string,
  statusCode: number,
  url: string,
  returnedIP: string,
  cryptoPassword: string
}

export const meoWifiLogoff = async (): Promise<logoffResponse> => {
  // https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Logoff?callback=foo
  const { meoResponse, status, request } = await axios.get(
    'https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Logoff', {
      params: {
        callback: 'foo'
      }
    }
  )
    .then(res => ({
      meoResponse: JSON.parse(res.data.substring(0, res.data.length - 2).replace('foo(', '')) as boolean,
      status: res.status,
      request: res.request
    }))
    .catch(e => ({
      meoResponse: false,
      status: 0,
      request: { responseURL: 'https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login/ ...' } as any
    }))

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
  const { meoResponse, status, request } = await axios.get(
    'https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login', {
      params: {
        username,
        password: cryptoPassword,
        navigatorLang: 'pt',
        callback: 'foo'
      }
    }
  )
    .then(res => ({
      meoResponse: JSON.parse(res.data.substring(0, res.data.length - 2).replace('foo(', '')) as meoLoginResponse,
      status: res.status,
      request: res.request
    }))
    .catch(e => {
      let message = ''

      if (e.message && e.message.startsWith('getaddrinfo EAI_AGAIN')) {
        message = 'Maybe no internet connection'
      } else if (e.message) {
        message = e.message
      } else {
        message = 'Axios Error'
      }

      return {
        meoResponse: { result: false, error: message } as meoLoginResponse,
        status: 0,
        request: { responseURL: 'https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login/ ...' } as any
      }
    })

  let message = ''
  let returnedIP = ip

  if (meoResponse.error === null) {
    message = 'Success'
  } else if (meoResponse.error === 'OUT OF REACH') {
    message = 'Not Connected on Meo Wifi'
  } else if (meoResponse.error.startsWith('FrammedIP: ')) {
    message = 'Invalid IP'
    returnedIP = meoResponse.error.substring(11)
  } else if (meoResponse.error === 'Os dados que introduziu não são válidos. Por favor confirme os seus dados na Área de Cliente em meo.pt e efetue novo login.') {
    message = 'Invalid Credentials'
  } else if (meoResponse.error === 'Já se encontra logado') {
    message = 'Already Logged'
  } else if (meoResponse.error === 'De momento não é possível concretizar o seu pedido. Por favor, tente mais tarde.') {
    message = 'Try again later'
  } else {
    message = 'Unknown Error - ' + meoResponse.error
  }

  return {
    success: meoResponse.result,
    message,
    statusCode: status,
    url: request.res?.responseUrl || request.responseURL || '',
    returnedIP,
    cryptoPassword
  }
}
