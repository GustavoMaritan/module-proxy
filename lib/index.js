const container = require('./dependencyContainer.js'),
    configuration = require('./configuration.js')();

module.exports = {
    resolve: configuration.set,
    auto: configuration.set.auto,
    autoLoad: (...params) => {
        configuration.set.auto.load(() => {
            container.resolve(configuration.get(), params.length > 1 ? params[0] : null);
            params[params.length > 1 ? 1 : 0]();
        })
    },
    done: () => {
        container.resolve(configuration.get());
    },
    load: container.load,
    autoResolve: (names, ...params) => {
        configuration.set.autoResolve(names, () => {
            container.resolve(configuration.get(), params.length > 1 ? params[0] : null);
            params[params.length > 1 ? 1 : 0]();
        });
    }
} 