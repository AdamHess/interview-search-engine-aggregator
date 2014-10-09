'use strict';

var request = require('request'),
    async = require('async');

var processingFunctions = require('./processing_functions');



// callback parameters are
// error, result 
//if any of the queries fail the rest of processing will stop
module.exports = function (query, callback) {
    async.parallel({
        Google: function(callback) {
            //use google's api's to generate results 
            processSearchRequest(generateQueryURL(query, 'google'), processingFunctions.google, callback);
        },
        Bing: function(callback) {
            processSearchRequest(generateQueryURL(query, 'bing'), processingFunctions.bing, callback);

        },
        Yahoo: function(callback) {
            processSearchRequest(generateQueryURL(query, 'yahoo'), processingFunctions.yahoo, callback);
        }
    }, callback);
};


var queryUrls = {
    'bing': 'http://www.bing.com/search?q=',
    'yahoo': 'https://search.yahoo.com/search?q=',
    'google': 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&rsz=8&q='
};
//helper function 
function generateQueryURL(query, searchEngine) {
    return queryUrls[searchEngine] + query;
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