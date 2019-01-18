const view = require('./view.js');

const events = {onBookmarkButton, onTimeField};

view.init(events);

sendRequestToContentScript('getAllData', null, view.update);

function sendRequestToContentScript(action, params, onResponse) {
    browser.tabs
        .query({active: true, currentWindow: true})
        .then(tabs => browser.tabs.sendMessage(tabs[0].id, {action, params}))
        .then(onResponse)
        .catch(error => console.error("Browser tabs query error: " + error));
}

function onBookmarkButton() {
    sendRequestToContentScript('onBookmarkButton', null, view.update);
}

function onTimeField(fieldIdx) {
    sendRequestToContentScript('onTimeField', {fieldIdx});
}
