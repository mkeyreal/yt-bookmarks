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
