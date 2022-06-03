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
      success: false,
      message: 'Invalid Credentials',
      statusCode: 200,
      url: `https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=emailfake%40gmail.com&password=${encodeURIComponent(encryptPassword('fake password', ip))}&navigatorLang=pt&callback=foo`,
      returnedIP: ip,
      cryptoPassword: encryptPassword('fake password', ip)
    })
  })

  test('Login - Invalid IP', async () => {
    expect(await meoWifiLogin(MEO_USERNAME, MEO_PASSWORD, '1.10.100.1000')).toEqual({
      success: false,
      message: 'Invalid IP',
      statusCode: 200,
      url: `https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=${encodeURIComponent(MEO_USERNAME)}&password=${encodeURIComponent(encryptPassword(MEO_PASSWORD, '1.10.100.1000'))}&navigatorLang=pt&callback=foo`,
      returnedIP: ip,
      cryptoPassword: encryptPassword(MEO_PASSWORD, '1.10.100.1000')
    })
  })

  test('Login - Success (need be logged off)', async () => {
    expect(await meoWifiLogin(MEO_USERNAME, MEO_PASSWORD, ip)).toEqual({
      success: true,
      message: 'Success',
      statusCode: 200,
      url: `https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=${encodeURIComponent(MEO_USERNAME)}&password=${encodeURIComponent(cryptoPassword)}&navigatorLang=pt&callback=foo`,
      returnedIP: ip,
      cryptoPassword
    })
  })

  test('Already Logged', async () => {
    expect(await meoWifiLogin(MEO_USERNAME, MEO_PASSWORD, ip)).toEqual({
      success: false,
      message: 'Already Logged',
      statusCode: 200,
      url: `https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=${encodeURIComponent(MEO_USERNAME)}&password=${encodeURIComponent(cryptoPassword)}&navigatorLang=pt&callback=foo`,
      returnedIP: ip,
      cryptoPassword
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
