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
