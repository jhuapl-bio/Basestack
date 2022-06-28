# Basestack

## 1 Running Basestack Developer Mode

- Window 1: `npm run dev:server`
- Window 2: `npm run dev:app`

OR 

- Window 1: `npm run dev`

## Building the app

`npm run build`

## You can also build the app for different OS types than your own. Ensure you have the necessary dependencies to do so:

<code>
npm run build:win; 
npm run build:mac; 
npm run build:linux
</code>


### Signing Windows NSIS

<code>

wget --no-check-certificate https://github.com/ebourg/jsign/releases/download/4.1/jsign-4.1.jar
java -jar jsign-4.1.jar --keystore build/hardwareToken.cfg --storepass "your password here" --storetype PKCS11 --tsaurl http://timestamp.digicert.com --alias /link/to/cert.pem

</code>

**note: target extensions will be based on your operating system (.dmg for OSX, .exe NSIS for Win, .AppImage for Linux)

## Our Official Documentation has moved to https://basestackwebsite.readthedocs.io/en/latest

