'use strict';
// libraries 
var path = require('path'),
    express = require('express'),
    request = require('request'),
    async = require('async'),
    select = require('soupselect').select,
    htmlparser = require('htmlparser'),
    parserToHtml = require('htmlparser-to-html');

//local deps 
var processingFunctions = require('./processing_functions');

var app = express();

// file server for everything in the publc directory 
app.get('/', function(req, resp) {
    resp.sendfile(path.resolve('./public/index.html'));
});
app.use(express.static(path.resolve('./public')));


app.get('/aggregated_query/:query', function(req, resp) {
    var query = req.param('query');

    //process all requests in parallel and then send response when all is processed
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
        },
    }, function(error, results) {
        if (error) {
            resp.status(200).send({
                error: 'Error Handling Request: ' + error
            });
        } else {
            var serviceResponse = {
                'searchProvider': results,
                'query': query
            }
            resp.status(200).send(serviceResponse);
        }

    });


});



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




var port = 9000;
app.listen(port);

console.log('Application running on Port: ' + port);