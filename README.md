# meo-wifi-login-js

Allows for an automated login through a `Meo Wifi` hotspot.

Based on [meo-wifi-login](https://github.com/ravemir/meo-wifi-login) for Python.


## Why this project? (and what's `Meo Wifi`) 🤔

Firstly, `Meo Wifi` is a set of thousands of hotspots, that `Meo` (a portuguese telephone provider) clients have access.

Unfortunately, their `Captive Portal` is a little bad, so this package wants to skip that step.

My main motivation with this is another (yet private) project.

---

## Table of Contents 🗃️

- [Installation](#installation)
- [Usage](#usage)
- [Quick Example](#quick-example-)
- [API](#api-)
- [Tests](#tests-)
- [To Do](#to-do-)
- [License](#license-)
- [Thanks](#thanks-)

## Installation

You can download the package from this repository. Not available on `npm`.

``` console
$ npm i https://github.com/ravemir/meo-wifi-login

or

$ yarn add https://github.com/Darguima/meo-wifi-login-js
```

## Usage

### Quick Example 🚀

``` javascript
const meo = require("meo-wifi-login")
// or
import * as meo from "meo-wifi-login"


meo.meoWifiLogin("email@email.com", "password", "ip")
	.then(response => console.log(response))

meo.meoWifiLogoff()
	.then(response => console.log(response))
```

---

## API 📖

#### meoWifiLogin

The main function, used to login on the `Meo Wifi Captive Portal` and get access to the Internet.


```javascript
function meoWifiLogin: (username: string, password: string, ip: string) => Promise<loginResponse>;
```

|Parameter|                                                |
|---------|------------------------------------------------|
|username | the `Meo`'s account e-mail                     |
|password | the `Meo`'s account password                   |
|ip       | the current device IP inside `Meo Wifi` network|

##### Response

```typescript
interface loginResponse {
	success: boolean;
	// true  = connect
	// false = error on connection

	message: string;
	// Success
	// Not Connected on Meo Wifi
	// Invalid IP
	// Invalid Credentials
	// Already Logged
	// Try again later
	// Unknown Error - Maybe no internet connection
	// Unknown Error - ...

	statusCode: number; // HTTPS response status code
	url: string; // Url requested to login

	returnedIP: string; 
	// If message == "Invalid IP", `returnIp` is changed to the correct IP
	// Else, is the IP passed on function params

	cryptoPassword: string; // encrypted password to login
}
```

#### meoWifiLogoff

If you want to close the access to the Internet and logout from the `Meo Wifi Captive Portal`.


```javascript
function meoWifiLogoff: () => Promise<logoffResponse>
```

##### Response

```typescript
interface logoffResponse {
	success: boolean;
	// true  = connect
	// false = error on connection

	statusCode: number; // HTTPS response status code
	url: string; // Url requested to login
}
```

#### encryptPassword

This is the core of all this project, this function "emulate" the `Meo Wifi Captive Portal`, encrypting the IP and the user password.

```javascript
function encryptPassword: (password: string, ip: string) => string;
```

|Parameter|                                                |
|---------|------------------------------------------------|
|password | the `Meo`'s account password                   |
|ip       | the current device IP inside `Meo Wifi` network|

##### Response

The function return a Base64 string that can be used on the login Url.

##### How it works

For this function, I extracted the `iv` (Initialization Vector) and the `salt` from `Meo Wifi Captive Portal` javascript.

Next we create a `key`, with `PBKDF2`:

```javascript
const key = CryptoJS.PBKDF2(
	ip, /*Message to cryptograph*/
	salt,
	{ keySize: 8, iterations: 100 }
)
```

And finally create the encrypted password with AES:

```javascript
const crypto = CryptoJS.AES.encrypt(password, key, { iv })
crypto.ciphertext.toString(CryptoJS.enc.Base64) // Encrypted Password
```

---

## Tests 🧪

Firstly, to run tests, you need a valid `Meo Wifi` account. If you have, save your credentials in `./.env`:

```
MEO_USERNAME="email@email.com"
MEO_PASSWORD="password"
```

You have 2 types of tests:

#### Tests for when you are connected on `MEO WIFI Network`

You can run these tests to check the login, logout and invalid logins when you are on the `MEO WIFI Network`, to know if the package really does what it is supposed to do

Just Run:

```bash
$ npm run test-insideNet
```

#### Tests for when you are NOT connected on `MEO WIFI Network`

You can run these tests to check the login and logout when you are NOT on the `MEO WIFI Network`, to know if you receive the correct message (`OUT OF REACH`) for the situation.

Just Run:

```bash
$ npm run test-outsideNet
```

---

## To Do 📝

If you want to contribute, or if you want to know for where is this project going on, this are the next steps:

- [x] Basic Javascript Package to login an logout from `Meo Wifi`
- [ ] Remove axios as a dependency
- [x] Verify if user is really connected to `Meo Wifi`
- [ ] Detect user IP (and not receive it as a parameter)
- [x] Handle with `Meo Wifi` connect errors
- [x] Create tests files

---

## License 📝

<img alt="License" src="https://img.shields.io/badge/license-MIT-%2304D361">

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Thanks 🙏🙏

If this project is working is thanks to [@ravemir](https://github.com/ravemir) that writes [meo-wifi-login](https://github.com/ravemir/meo-wifi-login) for Python. If I understood how `Meo Wifi Captive Portal` cryptographs passwords was reading his project.
