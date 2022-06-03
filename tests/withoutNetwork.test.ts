import { meoWifiLogin, meoWifiLogoff, encryptPassword } from '../lib/meo-wifi-login'
import { address } from 'ip'
import 'dotenv/config'

const { MEO_USERNAME, MEO_PASSWORD } = process.env
const ip = address()
const cryptoPassword = encryptPassword(MEO_PASSWORD, ip)

console.log(`IP ADDRESS: ${ip}`)

jest.setTimeout(50000)

describe('Test Login WITHOUT Network', () => {
  test('Login', async () => {
    expect(await meoWifiLogin(MEO_USERNAME, MEO_PASSWORD, ip)).toEqual({
      success: false,
      message: 'Unknown Error - Maybe no internet connection',
      statusCode: 0,
      url: 'https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login/ ...',
      returnedIP: ip,
      cryptoPassword
    })
  })

  test('Logoff', async () => {
    expect(await meoWifiLogoff()).toEqual({
      statusCode: 0,
      success: false,
      url: 'https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login/ ...'
    })
  })
})
