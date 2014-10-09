'use strict';

var request = require('request'),
    async = require('async');

var processingFunctions = require('./processing_functions');
var searchEngines = {
    'Bing': {
        searchUrl: 'http://www.bing.com/search?q=',
        processingFunction: processingFunctions.bing
    },
    'Yahoo': {
        searchUrl: 'https://search.yahoo.com/search?q=',
        processingFunction: processingFunctions.yahoo
    },
    'Google':{
        searchUrl: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&rsz=8&q=',
        processingFunction: processingFunctions.google
    }
};

//helper function 
function generateQueryURL(query, searchEngine) {
    return searchEngines[searchEngine].searchUrl + query;
}

//Keep things DRY by writing generic processes function
//specialized handling is needed on a case by case basis

function processSearchRequest(queryUrl, processingFunction, callback) {
    request.get(queryUrl,
        function(error, response, body) {
            if (error) {
                callback(error, []);
                return;
            }
            var queryResults = processingFunction(body);
            callback(null, queryResults);
        });
}


// callback parameters are
// error, result 
//if any of the queries fail the rest of processing will stop
module.exports = function(query, callback) {
    var parallelRequests = {};
    for (var engine in searchEngines) {
        parallelRequests[engine] = function(callback) {
            processSearchRequest(generateQueryURL(query, engine), searchEngines[engine].processingFunction, callback);
        };
    }
    async.parallel(parallelRequests, callback);

};

