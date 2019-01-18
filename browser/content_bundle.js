(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const bookmarks = {
    manualBookmark: null,
    autoBookmark: null,
    previousAutoBookmarks: [null, null, null, null, null]
};

const onDataChangeEvent = [];

exports.allData = bookmarks;

exports.restoreAllData = function (data) {
    resetData();

    if (data === null) return;

    bookmarks.manualBookmark = data.manualBookmark;
    bookmarks.autoBookmark = data.autoBookmark;
    bookmarks.previousAutoBookmarks = data.previousAutoBookmarks;
    shiftAutoBookmarks();
    invoke();
}

function resetData() {
    bookmarks.manualBookmark = null;
    bookmarks.autoBookmark = null;
    bookmarks.previousAutoBookmarks = [null, null, null, null, null];

    invoke();
}

exports.subscribe = function (onDataChange) {
    onDataChangeEvent.push(onDataChange);
}

exports.setManualBookmark = function (videoTime) {
    bookmarks.manualBookmark = videoTime;
    invoke();
}

exports.setAutoBookmark = function (videoTime) {
    if (shouldSave(bookmarks.autoBookmark, videoTime)) {
        bookmarks.autoBookmark = videoTime;
        invoke();
    }
}

exports.getBookmark = function (idx) {
    if (idx === 'manual') {
        return bookmarks.manualBookmark;
    }
    else if (idx === 'auto') {
        return bookmarks.autoBookmark;
    }
    else {
        return bookmarks.previousAutoBookmarks[parseInt(idx)];
    }
}

shiftAutoBookmarks = function() {
    bookmarks.previousAutoBookmarks.unshift(bookmarks.autoBookmark);
    bookmarks.previousAutoBookmarks.pop();
    bookmarks.autoBookmark = 0;
}

function invoke() {
    for(let action of onDataChangeEvent) {
        action(bookmarks);
    }
}

function shouldSave(currentValue, nextValue) {
    if (currentValue === null) return true;
    return Math.abs(currentValue - nextValue) >= saveThreshold;
}

const saveThreshold = 5;

},{}],2:[function(require,module,exports){
const bookmarks = require('./bookmarks.js');
const storage   = require('./storage.js');

setTimeout(onEverySecond, 1000);
bookmarks.subscribe(data => storage.writeData(videoId, data));
browser.runtime.onMessage.addListener(onMessage);

function onMessage(request, sender, sendResponse) {
    switch(request.action) {
        case "getAllData":
            sendResponse(MakeDataForResponse());
            break;
        case "onBookmarkButton":
            onBookmarkButton();
            sendResponse(MakeDataForResponse());
            break;
        case "onTimeField":
            onTimeField(request.params.fieldIdx);
            break;
    }
}

function MakeDataForResponse() {
    return {'bookmarks' : bookmarks.allData, videoId};
}

function onBookmarkButton() {
    const youtubePlayer = getYoutubePlayer();
    const videoId = getVideoId();

    if (youtubePlayer != null && videoId !== '') {
        bookmarks.setManualBookmark(youtubePlayer.currentTime);
    }
}

function onTimeField(fieldIdx) {
    const youtubePlayer = getYoutubePlayer();
    if (youtubePlayer == null) return;

    const time = bookmarks.getBookmark(fieldIdx);
    if (time != null) {
        youtubePlayer.currentTime = time;
    }
}

function onDataRestore(data) {
    try {
        bookmarks.restoreAllData(data);
        setTimeout(onEverySecond, 1000);
    }
    catch(error) {
        console.error("onDataRestore error: " + error);
    }
}

function onEverySecond() {
    try {
        const youtubePlayer = getYoutubePlayer();

        if (youtubePlayer == null) {
            setTimeout(onEverySecond, 1000);
            return;
        }

        const nextVideoId = getVideoId();

        if (videoId !== nextVideoId) {
            videoId = nextVideoId;
            storage.restoreData(videoId, onDataRestore);
        }
        else {
            bookmarks.setAutoBookmark(youtubePlayer.currentTime);
            setTimeout(onEverySecond, 1000);
        }
    } catch (error) {
        console.error("onEverySecond error: " + error);
    }
}

function getYoutubePlayer() {
    return document.getElementsByClassName("video-stream")[0];
}

function getVideoId() {
    try {
        if (location.hostname.search(/.*youtube.com$/i) >= 0) {
            const params = location.search.substr(1)
                                          .split('&')
                                          .filter(str => str.search(/^v=.*/i) >= 0)
                                          .map(str => str.split('='));
            if (params.length > 0) {
                return params[0][1];
            }
        }
    } catch(error) {
        console.error("getVideoId error: " + error);
        return "";
    }

    return "";
}

let videoId = '';

},{"./bookmarks.js":1,"./storage.js":3}],3:[function(require,module,exports){

exports.restoreData = function (key, onDataRestore) {
    browser.storage.local.get(key)
        .then(processData.bind(null, key, onDataRestore),
              error => console.error("restoreData error: " + error));
}

function processData(key, onDataRestore, data) {
    try {
        if (key in data) {
            onDataRestore(JSON.parse(data[key]));
        }
        else {
            onDataRestore(null);
        }
    }
    catch (error) {
        console.error("storage::processData error: " + error);
    }
}

exports.writeData = function (key, data) {
    if (key === '') return;
    //console.log("Write data: " + key + ' : ' + JSON.stringify(data));
    browser.storage.local.set({[key] : JSON.stringify(data)});
}

},{}]},{},[2]);
