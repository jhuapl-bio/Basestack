require('dotenv').config();
const { notarize }  =  require('@electron/notarize')

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin' || process.env.offline ) {
    console.log("offline not signing", appOutDir, electronPlatformName)
    return;
  } else {
    const appName = context.packager.appInfo.productFilename;
    console.log("Signing", appName, appOutDir, electronPlatformName)
    // return;
    if (process.env.offline) {
      return 
    } else {
      return await notarize({
        appBundleId: 'com.yourcompany.yourAppId',
        teamId: process.env.APPLE_TEAM_ID,
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APP_PASSW,
        // appleApiKey: process.env.API_KEY_ID,
        // appleApiIssuer: process.env.API_KEY_ISSUER_ID
      });

    }
  }
  
  
};