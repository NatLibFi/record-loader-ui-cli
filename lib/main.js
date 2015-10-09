/**
 *
 * @licstart  The following is the entire license notice for the JavaScript code in this file. 
 *
 * Command-line interface for recordLoader
 *
 * Copyright (c) 2015 University Of Helsinki (The National Library Of Finland)
 *
 * This file is part of record-loader-ui-cli
 *
 * record-loader-ui-cli is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *  
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this file.
 *
 **/

(function() {

    'use strict';

    module.exports = function()
    {

	function getRequirePath(file_path)
	{
	    return file_path.match(new RegExp('^/'))
		? file_path
		: path.join(process.cwd(), file_path);
	}

	var path = require('path');
	var recordLoader = require('record-loader');
	var commander = require('commander');

	var modules, config;
	var args_parser = commander
	    .usage('<OPTIONS> <INPUT_DATA>')
	    .option('-m, --modules <MODULES_FILE>', 'Modules file')
	    .option('-c, --config [CONFIG_FILE]', 'Configuration file')
	    .option('-l, --log-level [LOG_LEVEL]', 'Logging level. Can be one of the following: debug, trace, info, warn, error. Default: warn')
	    .option('-t, --processing-target [PROCESSING_TARGET]', 'Target processing step. Can be one of the following: filter, preprocess, match, merge, load. Default: load')
	    .option('-r, --results-level [RESULTS_LEVEL]', 'Level of results to be returned. Can be one of the following: total, record, debug. Default: total');
	var program_args = args_parser.parse(process.argv);

	if (program_args.options.some(function(option) {

	    var prop, match;

	    if (option.required !== 0) {
		
		prop = option.long.replace(/^--/, '');
		match = prop.match(/-/);

		if (match) {
		    
		    prop = prop.substr(0, match.index)
			+ prop[match.index+1].toUpperCase()
			+ prop.substr(match.index+2);

		    return !program_args.hasOwnProperty(prop);

		}

	    }

	}) || program_args.args.length === 0) {
	    args_parser.outputHelp();
	    process.exit(1);
	} else {

	    modules = require(getRequirePath(program_args.modules));
	    config = program_args.hasOwnProperty('config')
		? require(getRequirePath(program_args.config))
		: {};

	    if (program_args.hasOwnProperty('logLevel')) {

		if (!config.hasOwnProperty('logging')) {
		    config.logging = {};
		}

		config.logging.level = program_args.logLevel;

	    }

	    if (program_args.hasOwnProperty('processingTarget')) {

		if (!config.hasOwnProperty('processing')) {
		    config.processing = {};
		}

		config.processing.target = program_args.processingTarget;

	    }

	    if (program_args.hasOwnProperty('resultsLevel')) {

		if (!config.hasOwnProperty('processing')) {
		    config.processing = {};
		}

		config.processing.resultsLevel = program_args.resultsLevel;

	    }

	    config = Object.keys(config).length === 0 ? undefined : config;

	    recordLoader(program_args.args[0], modules, config).then(
		function(result) {
		    console.log(JSON.stringify(result, undefined, 4));
		    process.exit(0);
		},
		function(reason) {
		    console.error(reason.stack);
		    process.exit(-1);
		}
	    );

	}

    };
    
}());