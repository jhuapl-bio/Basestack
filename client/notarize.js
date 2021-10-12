require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }
  const appName = context.packager.appInfo.productFilename;
  console.log(appName, appOutDir, electronPlatformName, process.env)
  
  return await notarize({
    appBundleId: 'com.yourcompany.yourAppId',
    appPath: `${appOutDir}/${appName}.app`,
    appleApiKey: process.env.API_KEY_ID,
    appleApiIssuer: process.env.API_KEY_ISSUER_ID  
  });
};