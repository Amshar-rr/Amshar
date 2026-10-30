# B4Thinkin' app: setup (one time, about 15 minutes)

## 1. Upload to GitHub
Upload everything in this folder to the ROOT of your website repo (replace old files).
Make sure `.github/workflows/build-apk.yml` and the `app` folder are included.
GitHub Pages must be ON (Settings > Pages) so the site has an https address.

## 2. Create your signing key (once, keep it forever)
Install Java, then run:
    keytool -genkeypair -v -storetype PKCS12 -keystore b4.jks -alias b4key -keyalg RSA -keysize 2048 -validity 10000
Pick ONE password (use it for both prompts). Then encode the file:
    Windows (PowerShell): [Convert]::ToBase64String([IO.File]::ReadAllBytes("b4.jks"))
    Mac/Linux: base64 -w0 b4.jks
Repo > Settings > Secrets and variables > Actions > New repository secret:
    KEYSTORE_BASE64   = the long text from above
    KEYSTORE_PASSWORD = your password
    KEY_ALIAS         = b4key
Never upload b4.jks to GitHub. Back it up: without it, future updates cannot install over the old app.

## 3. Build
Repo > Actions > "Build Android app (APK)" > Run workflow. In ~6-10 minutes a Release appears with B4Thinkin.apk.
Your website's "Get app" button points to that file automatically.

## Custom domain?
If your site is not on github.io, set the repo variable SITE_URL (Settings > Secrets and variables > Actions > Variables) to your full site address,
and put the APK link in `APK_URL` inside index.html.

## How updates work
The app opens your live website inside a native Android shell. Edit your site on GitHub and the app shows the change on next open, no new APK needed.
Rebuild the APK only to change the app icon, name, or other native settings.
