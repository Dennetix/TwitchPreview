// Script has to be injected into the page to be able to load hls streams
const script = document.createElement('script');
script.src = browser.runtime.getURL('bundle.js');
document.body.append(script);
