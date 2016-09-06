const Promise = require('promise'),
    fs = require('fs');
let call = null;

let object = {
    include: (name) => {
        object.listResolve.push(name);
        return object;
    },
    addRange: (listNames) => {
        object.listResolve = object.listResolve.concat(listNames);
        return object;
    },
    addSplit: (stringNames) => {
        object.listResolve = object.listResolve.concat(stringNames.split(','));
        return object;
    },
    listResolve: [],
    listController: [],
    load: (callback) => {
        call = callback;
        rootDirectory();
    }
};

module.exports = object;

function rootDirectory(path) {
    path = './';
    let list = [];
    fs.readdir(path, function (err, filenames) {
        if (err)
            return call(err);
        filenames.forEach(function (filename) {
            if (fs.lstatSync(path + filename).isDirectory() && !filename.includes('node_modules')) {
                list.push(path + filename);
            } else {
                if (resolveName(filename))
                    object.listController.push(returnObject(path, filename));
            }
        });
        if (list.length > 0) {
            recursiveFunction(list);
        } else {
            onSuccess();
        }
    });
}

function recursiveFunction(list) {
    let promises = list.map(x => new Promise(getDirectoryFiles(x)));

    Promise.all(promises).then((data) => {
        let zList2 = [];
        data.filter(x => x != undefined).map(x => {
            zList2 = zList2.concat(...x);
        })
        if (zList2.length > 0 && zList2.filter(x => x != undefined).length > 0)
            recursiveFunction(zList2.filter(x => x != undefined));
        else
            onSuccess();
    }, (err) => {
        call(err);
    })
}

function getDirectoryFiles(path) {
    return function (resolve, reject) {
        if (!path)
            return resolve();
        path += '/';
        let newList = [];
        fs.readdir(path, function (err, filenames) {
            if (err)
                return reject(err);

            filenames.forEach(function (filename) {
                if (fs.lstatSync(path + filename).isDirectory() && !filename.includes('node_modules')) {
                    newList = newList.concat([path + filename]);
                } else {
                    if (resolveName(filename))
                        object.listController.push(returnObject(path, filename));
                }
            });
            newList.length > 0
                ? resolve(newList)
                : resolve();
        });
    }
}

function onSuccess() {
    let newList = [];
    object.listResolve.map(x => {
        newList = newList.concat(object.listController
            .filter(y => y.name.includes(x))
        )
    });
    object.listController = newList;
    call(null, object.listController);
}

function returnObject(path, name) {
    return {
        name: name.split('.')[0],
        path: "../../." + path + name
    };
}

function resolveName(name) {
    return object.listResolve.filter(x => name.includes(x)).length > 0;
}