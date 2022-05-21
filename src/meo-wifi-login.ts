import CryptoJS from 'crypto-js'
// https://cryptojs.gitbook.io/docs/#ciphers

const encryptPassword = (password: string, ip: string) => {
  const iv = CryptoJS.enc.Hex.parse('72c4721ae01ae0e8e84bd64ad66060c4')
  const salt = CryptoJS.enc.Hex.parse('77232469666931323429396D656F3938574946')

  const key = CryptoJS.PBKDF2(ip, salt, { keySize: 8, iterations: 100 })

  const crypto = CryptoJS.AES.encrypt(password, key, { iv })

  return crypto.ciphertext.toString(CryptoJS.enc.Base64)
}

const password = encryptPassword(
  'password',
  '10.23.24.25'
)

console.log(password)
