(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./view.js":2}],2:[function(require,module,exports){
let controls = {};

exports.init = function (events) {
    try {
        controls.bookmarkButton = document.getElementById("yt-bookmarks-bookmark-button");
        controls.manualBookmark = document.getElementById("yt-bookmarks-manual-bookmark");
        controls.previousAutoBookmarks = document.getElementById("yt-bookmarks-previous-auto-bookmarks");
        controls.videoId = document.getElementById("yt-bookmarks-video-id");

        controls.bookmarkButton.addEventListener('click', events.onBookmarkButton);
        controls.manualBookmark.addEventListener('click', events.onTimeField.bind(null, "manual"));

        let idx = 0;
        for(const node of controls.previousAutoBookmarks.childNodes) {
            if (node.className === 'yt-bookmarks-time') {
                node.addEventListener('click', events.onTimeField.bind(null, idx));
                idx++;
            }
        }
    }
    catch (error) {
        console.error('view::init error: ' + error);
    }
}

function setVideoId(videoId) {
    controls.videoId.innerText = videoId;
}

exports.update = function (data) {
    try {
        setVideoId(data.videoId);
        change(controls.manualBookmark, data.bookmarks.manualBookmark);
       
        let idx = 0;
        for(const node of controls.previousAutoBookmarks.childNodes) {
            if (node.className === 'yt-bookmarks-time') {
                change(node, data.bookmarks.previousAutoBookmarks[idx])
                idx++;
            }
        }
    }
    catch(error) {
        console.error("view::update error: " + error);
    }
}

function change(control, seconds) {
    control.innerText = secondsToString(seconds);
}

function secondsToString(seconds) {
    if (seconds === null) {
        return "--:--:--";
    }
    else {
        const time = new Date(null);
        time.setSeconds(seconds);
        return time.toUTCString().substr(17, 8);
    }
}

},{}]},{},[1]);
