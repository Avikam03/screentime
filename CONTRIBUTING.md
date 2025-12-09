## To contribute
1. Fork the repo
2. Create a new branch
3. Commit and push the code
4. Submit a pull request

## To test (on Firefox)
1. Run `npm i` to install necessary dependencies.
2. Run `npm run build && npm run export` if on Linux, or `npm run build; npm run export` if on Windows.
3. Enter `about:debugging` on the address bar, select `This Firefox` on the left, then choose `Load temporary add-on` and then provide the manifest.json file.  

## To test (on Chromium)
1. Run `npm i` to install necessary dependencies.
2. Run `npm run build && npm run export` if on Linux, or `npm run build; npm run export` if on Windows.
3. Navigate to `edge://extensions/`, turn on developer mode, and click `load unpacked`, and then provide the manifest.json file.
