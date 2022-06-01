import { meoWifiLogin, meoWifiLogoff, encryptPassword } from '../lib/meo-wifi-login'
import { address } from 'ip'
import 'dotenv/config'

const { MEO_USERNAME, MEO_PASSWORD } = process.env
const ip = address()
const cryptoPassword = encryptPassword(MEO_PASSWORD, ip)

console.log(`IP ADDRESS: ${ip}`)

jest.setTimeout(50000)

describe('Test Login INSIDE Meo Wifi Network', () => {
  test('Encrypt Password', () => {
    expect(encryptPassword('password 1 2 3 4 5 6 test jest', '10.11.12.13')).toBe('+44/3kiBKQnNOgIpP7ufjj6bcUgLaUI3ubDhxA0HX7w=')
  })

  test('Login - Invalid Credentials', async () => {
    expect(await meoWifiLogin('emailfake@gmail.com', 'fake password', ip)).toEqual({
      cryptoPassword: 'EFv31Af8mHak9xMeVQMgKg==',
      response: { RedirectUrlEN: '/en', RedirectUrlPT: '/pt', error: 'Os dados que introduziu não são válidos. Por favor confirme os seus dados na Área de Cliente em meo.pt e efetue novo login.', result: false },
      statusCode: 200,
      success: false,
      url: 'https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=emailfake%40gmail.com&password=EFv31Af8mHak9xMeVQMgKg%3D%3D&navigatorLang=pt&callback=foo'
    })
  })

  test('Login - Invalid IP', async () => {
    expect(await meoWifiLogin(MEO_USERNAME, MEO_PASSWORD, '1.10.100.1000')).toEqual({
      cryptoPassword: encryptPassword(MEO_PASSWORD, '1.10.100.1000'),
      response: { RedirectUrlEN: '/en', RedirectUrlPT: '/pt', error: `FrammedIP: ${ip}`, result: false },
      statusCode: 200,
      success: false,
      url: `https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=${encodeURIComponent(MEO_USERNAME)}&password=${encodeURIComponent(encryptPassword(MEO_PASSWORD, '1.10.100.1000'))}&navigatorLang=pt&callback=foo`
    })
  })

  test('Login - Success (need be logged off)', async () => {
    expect(await meoWifiLogin(MEO_USERNAME, MEO_PASSWORD, ip)).toEqual({
      cryptoPassword,
      response: { RedirectUrlEN: '/en/afterlogin', RedirectUrlPT: '/pt/poslogin', error: null, result: true },
      statusCode: 200,
      success: true,
      url: `https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=${encodeURIComponent(MEO_USERNAME)}&password=${encodeURIComponent(cryptoPassword)}&navigatorLang=pt&callback=foo`
    })
  })

  test('Already Logged', async () => {
    expect(await meoWifiLogin(MEO_USERNAME, MEO_PASSWORD, ip)).toEqual({
      cryptoPassword,
      response: { RedirectUrlEN: '/en', RedirectUrlPT: '/pt', error: 'Já se encontra logado', result: false },
      statusCode: 200,
      success: false,
      url: `https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=${encodeURIComponent(MEO_USERNAME)}&password=${encodeURIComponent(cryptoPassword)}&navigatorLang=pt&callback=foo`
    })
  })

  test('Success Logoff', async () => {
    expect(await meoWifiLogoff()).toEqual({
      statusCode: 200,
      success: true,
      url: 'https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Logoff?callback=foo'
    })
  })
})
