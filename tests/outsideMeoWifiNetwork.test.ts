import { meoWifiLogin, meoWifiLogoff, encryptPassword } from '../lib/meo-wifi-login'
import { address } from 'ip'
import 'dotenv/config'

const { MEO_USERNAME, MEO_PASSWORD } = process.env
const ip = address()
const cryptoPassword = encryptPassword(MEO_PASSWORD, ip)

console.log(`IP ADDRESS: ${ip}`)

jest.setTimeout(50000)

describe('Test Login OUTSIDE Meo Wifi Network', () => {
  test('Login', async () => {
    expect(await meoWifiLogin(MEO_USERNAME, MEO_PASSWORD, ip)).toEqual({
      success: false,
      message: 'Not Connected on Meo Wifi',
      statusCode: 200,
      url: `https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=${encodeURIComponent(MEO_USERNAME)}&password=${encodeURIComponent(cryptoPassword)}&navigatorLang=pt&callback=foo`,
      returnedIP: ip,
      cryptoPassword
    })
  })

  test('Logoff', async () => {
    expect(await meoWifiLogoff()).toEqual({
      statusCode: 200,
      success: false,
      url: 'https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Logoff?callback=foo'
    })
  })
})
