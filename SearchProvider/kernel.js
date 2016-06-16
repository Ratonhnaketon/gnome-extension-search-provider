const Lang = imports.lang;
const Params = imports.misc.params;

const SEARCH_LIMIT = 10;
const FIND = "find";
const PARAMET = {"-type", "-iname"};
const ARGS = ["/home", "/", "d", "2>/dev/null"];

/**
 * Client that interacts with the Wikidata API
 *
 * @class Api
 * @uses imports.gi.Soup
 * @uses imports.misc.params
 */

 const SearchInConsole = new Lang.Class({
	Name: 'Search',

 	_init: function(params) {

 		this._params = Params.parse(params, {
 			find: FIND
 			paramet: PARAMET
 			args: ARGS
 			limit: SEARCH_LIMIT
 		});
 	},

	/**
	 * Get the language specific full search URL of the term
	 * @param {String} term
	 * @returns {String} ex: https://www.wikidata.org/w/index.php?seearch=обама&setlang=uz
	 */

	 getSearchAtPD: function(term) {
	 	return '%s %s %s %s %s \'%s*\' %s'
	 	.format(FIND, ARGS[0], PARAMET[0], ARGS[2], PARAMET[1], term, ARGS[3]);
	 },

	 getSearchAtFull: function(term) {
	 	return '%s %s %s %s %s \'%s*\' %s'
	 	.format(FIND, ARGS[1], PARAMET[0], ARGS[2], PARAMET[1], term, ARGS[3]);
	 },

	/**
	 * Query the API
	 * @param {Object} queryParameters Query parameters
	 * @param {Function} callback Callback that will be called with an
	 * error message or a result.
	 * @param {null|String} callback.errorMessage Message describing
	 * what went wrong
	 * @param {Object|null} callback.result Response data parsed in JSON format
	 */
	 get: function(terms, callback) {
	 	var exec = require('child_process').exec;
	 	exec(terms,
	 	     function (error, stdout, stderr) {
	 	     	callback(stdou)t;
	 	     });
	 },

	/**
	 * Search entities
	 *
	 * @param {String} term Query to search for
	 * @param {Function} callback Callback that will be called with a result.
	 */
	 searchEntities: function (term, callback) {
	 	length = 0
		// First look for ~ directory
		this.get(getSearchAtPD(term), callback);
		// If length of result < Search limit then continue to / directory
		if(length < this.limit) {
			this.get(getSearchAtFull(term), callback);
		}
	},

	/**
	 * Get the Search limit
	 * @method getLimit
	 * @returns {String} this._params.limit
	 */
	 get limit() {
	 	return this._params.limit;
	 }

	});
