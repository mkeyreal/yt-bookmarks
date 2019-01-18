
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
