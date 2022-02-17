require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  console.log(process.env.offline,"<<<<Process env>>>>>>>>>")
  if (electronPlatformName !== 'darwin' || process.env.offline ) {
    console.log("offline not signing", appOutDir, electronPlatformName)
    return;
  } else {
    const appName = context.packager.appInfo.productFilename;
    // return;
    console.log("Signing", appName, appOutDir, electronPlatformName)
      return await notarize({
      appBundleId: 'com.yourcompany.yourAppId',
      appPath: `${appOutDir}/${appName}.app`,
      appleApiKey: process.env.API_KEY_ID,
      appleApiIssuer: process.env.API_KEY_ISSUER_ID
    });
  }
  
  
};