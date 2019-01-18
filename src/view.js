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
