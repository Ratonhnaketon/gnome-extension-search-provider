
// To debug: log('blah');
// And run: journalctl /usr/bin/gnome-session -f -o cat | grep LOG

const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Util = imports.misc.util;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Api = Me.imports.api; // Mudar para kernel

const SearchProvider = new Lang.Class(
{
    Name: 'SearchProvider',

    _init: function() 
    {
        var self = this;
    // Use the default app for opening https links as the app for
    // launching full search.
    // xdg-mime query default inode/directory
    this.appInfo = Gio.AppInfo.get_default_for_type('inode/directory', false);

        // Custom messages that will be shown as search results
    this._messages = {      // Mudar
        '__loading__': {
            id: '__loading__',
            name: 'Folder Search',
            description : 'Search for...',
        // TODO: do these kinds of icon creations better
        createIcon: Lang.bind(this, this.createIcon, {})
    },
        '__error__': {      // Mudar
            id: '__error__',
            name: 'Folder Search',
            description : 'Oops, an error occurred while searching.',
            createIcon: Lang.bind(this, this.createIcon, {})
        }
    };
        // API results will be stored here
        this.resultsMap = new Map();
        // this._api = new Api.Api();
        // Wait before making an API request
        this._timeoutId = 0;
    },
    /**
     * Launch the search in the default app (i.e. browser)
     * @param {String[]} terms
     */
     launchSearch: function (terms) 
     {
        Util.trySpawnCommandLine(
                                 "xdg-open " + "/"
                                 );
    },

    /**
     * Open the url in default app
     * @param {String} identifier
     * @param {Array} terms
     * @param timestamp
     */
     activateResult: function(identifier, terms, timestamp) 
     {
        let result = this.resultsMap.get(identifier);
        Util.trySpawnCommandLine(
                                 "xdg-open " + "/"
                                 );
    },

    /**
     * Run callback with results
     * @param {Array} identifiers
     * @param {Function} callback
     */
     getResultMetas: function(identifiers, callback) {
        let metas = [];
        metas.push(this._getResultMeta(['__loading__']));
        for (let i = 0; i < identifiers.length - 1; i++) {
            metas.push(this._getResultMeta(identifiers[i]));
        }
        callback(metas);
    },

    /**
     * Search API if the query is a Wikidata query.
     * @param {Array} terms
     * @param {Function} callback
     * @param {Gio.Cancellable} cancellable
     */
     getInitialResultSet: function(terms, callback, cancellable) {
        let meta;
        // terms holds array of search items
        // show the loading message
        // remove previous timeout
        if (this._timeoutId > 0) {
            Mainloop.source_remove(this._timeoutId);
            this._timeoutId = 0;
        }
        // // wait 0.2 seconds before making an API request
        this._timeoutId = Mainloop.timeout_add(200, Lang.bind(this, function() 
        {
            this.showMessage('__loading__', callback);
            // now search
            // this._api.searchEntities(
         //    terms,
         //    Lang.bind(this, this._getResultSet, callback, this._timeoutId));
     }));
    },

    /**
     * Show any message as a search item
     * @param {String} identifier Message identifier
     * @param {Function} callback Callback that pushes the result to search
     * overview
     */
     showMessage: function (identifier, callback) {
        callback([identifier]);
    },

    /**
     * TODO: implement
     * @param {Array} previousResults
     * @param {Array} terms
     * @returns {Array}
     */
     getSubsetResultSearch: function (previousResults, terms, callback, cancellable) {
     },

    /**
     * Return subset of results
     * @param {Array} results
     * @param {number} max
     * @returns {Array}
     */
     filterResults: function(results, max) {
        // override max for now
        max = 3 /*this._api.limit*/;
        return results.slice(0, max);
    },

    /**
     * Return query string from terms array
     * @param {String[]} terms
     * @returns {String}
     */
     _getQuery: function(terms) {
        return terms;
    },

    /**
     * Return meta from result
     * @param {String} identifier
     * @returns {{id: String, name: String, description: String, createIcon: Function}}
     * @private
     */
     _getResultMeta: function(identifier) {
        let result,
        meta;
        // return predefined message if it exists
        if (identifier in this._messages) {
            result = this._messages[identifier];
        } 
        else {
            // TODO: check for messages that don't exist, show generic error message
            meta = this.resultsMap.get(identifier);
            result = {
                id: meta.id,
                name: meta.label,
                description: meta.description,
                createIcon: Lang.bind(this, this.createIcon, meta)
            };
        }
        return result;
    },

    /**
     * Parse results that we get from the API and save them in this.resultsMap.
     * Inform the user if no results are found.
     * @param {null|String} error
     * @param {Object|null} result
     * @param {Function} callback
     * @private
     */
     _getResultSet: function (error, result, callback, timeoutId) {
        let self = this,
        results = [];
        // log(error, JSON.stringify(result), timeoutId, this._timeoutId);
        if (timeoutId === this._timeoutId && result.search && result.search.length > 0) {
            result.search.forEach(function (result) {
                self.resultsMap.set(result.id, result);
                results.push(result.id);
            });
            callback(results);
        } else if (error) {
            // Let the user know that an error has occurred.
            log(error);
            this.showMessage('__error__', callback);
        } else {
            callback(results);
        }
    },

    /**
     * Create meta icon
     * @param size
     * @param {Object} meta
     */
     createIcon: function (size, meta) {
        // TODO: implement meta icon?
    }
});

let searchProvider = null;

function init() {
    /** noop */
}

function enable() {
    if (!searchProvider) {
        searchProvider = new SearchProvider();
        Main.overview.viewSelector._searchResults._registerProvider(
                                                                    searchProvider
                                                                    );
    }
}

function disable() {
    if (searchProvider){
        Main.overview.viewSelector._searchResults._unregisterProvider(
                                                                      searchProvider
                                                                      );
        searchProvider = null;
    }
}
