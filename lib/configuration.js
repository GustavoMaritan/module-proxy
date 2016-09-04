let resolve = require('./autoResolve.js');

module.exports = () => {

    let lastAlias,
        dependencies = {};

    function when(alias) {
        if (dependencies[alias])
            throw `alias ${alias} is already in use by ${dependencies[alias].modules.toString()}`;

        dependencies[alias] = { singleton: true };
        lastAlias = alias;
        return this;
    }

    function load(...modules) {
        if (!modules || !modules.length)
            throw `alias ${alias} has no modules especified`;

        dependencies[lastAlias].modules = modules;
        return this;
    }

    function singleton(isSingleton) {
        dependencies[lastAlias].singleton = isSingleton;
        return this;
    }

    function auto() {
        return {
            include: resolve.include,
            addRange: resolve.addRange,
            addSplit: resolve.addSplit,
            load: (callback) => {
                resolve.load((err, data) => {
                    data.map(x => {
                        dependencies[x.name] = {
                            singleton: true,
                            modules: [x.path]
                        }
                    })
                    callback();
                });
            }
        }
    }

    function autoResolve(names, callback) {
        resolve.addRange(names).load((err, data) => {
            data.map(x => {
                dependencies[x.name] = {
                    singleton: true,
                    modules: [x.path]
                }
            })
            callback();
        });
    }

    return {
        set: {
            when,
            load,
            singleton,
            auto: auto(),
            autoResolve
        },
        get: () => {
            return dependencies;
        }
    };
}
