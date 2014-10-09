'use strict';

var path = require('path'),
    express = require('express'),
    request = require('request'),
    async = require('async'),
    select = require('soupselect').select,
    htmlparser = require('htmlparser'),
    cheerio = require('cheerio'),
    parserToHtml = require('htmlparser-to-html');



// constants

var queryUrls = {
    'bing': 'http://www.bing.com/search?q=',
    'yahoo': 'https://search.yahoo.com/search?q='
};
//helper function 
function generateQueryURL(query, searchEngine) {
    return queryUrls[searchEngine] + query;
}



var app = express();

// file server for everything in the publc directory 
app.get('/', function(req, resp) {
    resp.sendfile(path.resolve('./public/index.html'));
});
app.use(express.static(path.resolve('./public')));


//Middle man API for search engines 
app.get('/query/:searchEngine', function(req, resp) {
    var searchQuery = req.query.query;
    var searchEngine = req.param('searchEngine');

    if ((searchEngine !== 'yahoo') &&
        (searchEngine !== 'google') &&
        (searchEngine !== 'bing')) {
        resp.status(400).send({
            error: 'Invalid Search Engine: Supports only google, yahoo and bing'
        });
    }
    if (searchQuery === undefined) {
        resp.status(400).send({
            error: 'Invalid Request: Must provide search query'
        });
    }

    var searchString;
    var searchSelector;
    if (searchEngine === 'yahoo') {
        searchString = 'https://search.yahoo.com/search?q=';
        searchSelector = '#main [start=1]';
    } else if (searchEngine === 'google') {
        searchString = 'https://www.google.com/search?q=';
        searchSelector = '.g';
    } else if (searchEngine === 'bing') {
        searchString = 'http://www.bing.com/search?q=';
        searchSelector = '#b_results';
    }

    request.get(searchString + searchQuery, function(error, response, body) {
        if (error) {
            resp.status(500).send({
                error: 'Something went wrong getting request from ' + searchEngine + ' ' + error
            });
        }
        var handler = new htmlparser.DefaultHandler(function(error, dom) {
            if (error) {
                resp.status(500).send({
                    error: 'something went wrong with parsing response from ' + searchEngine + ' ' + error
                });
            } else {

                var queries = parserToHtml(select(dom, searchSelector));

                resp.status(200).send({
                    resp: queries
                });
            }
        });

        var parser = new htmlparser.Parser(handler);
        parser.parseComplete(body);


    });

});

function processGoogleRequest(query, callback) {
    request.get('http://ajax.googleapis.com/ajax/services/search/web?v=1.0&rsz=8&q=' + query,
        function(error, response, body) {
            if (error) {
                callback(error, []);
                return;
            }
            var searchResults = body;
            if (typeof body !== 'object') {
                searchResults = JSON.parse(body);
            }

            var googleResults = [];
            searchResults.responseData.results.forEach(function(element) {
                var aResult = {
                    url: element.url,
                    title: element.title,
                    description: element.content
                };
                googleResults.push(aResult);
            });
            callback(null, googleResults);

        });
}





app.get('/aggregated_query/:query', function(req, resp) {
    var query = req.param('query');

    //process all requests in parallel and then send response when all is processed
    async.parallel({
        google: function(callback) {
            //use google's api's to generate results 
            processGoogleRequest(query, callback);
        },
        bing: function(callback) {
            processSearchRequest(generateQueryURL(query, 'bing'), bingProcessingFunction, callback);

        },
        yahoo: function(callback) {
            processSearchRequest(generateQueryURL(query, 'yahoo'), yahooProcessingFunction, callback);
        },
    }, function(error, results) {
        if (error) {
            resp.status(200).send({error: "Error Handling Request: " + error});
        }
        else {
            results.query = query;
            resp.status(200).send(results);    
        }
        
    });


});

//Keep things DRY by writing generic processes function
//specialized handling is needed on a case by case basis

function processSearchRequest(queryUrl, processingFunction, callback) {

    request.get(queryUrl,
        function(error, response, body) {
            if (error) {
                callback(error, []);
                return;
            }
            var $ = cheerio.load(body);
            var queryResults = processingFunction($);
            callback(null, queryResults);
        });
}

function yahooProcessingFunction($) {

    var yahooResults = [];
    $('.res').each(function() {
        var urlAndTitle = $(this).find('h3 a');
        var url = urlAndTitle.attr('href');
        var title = $(urlAndTitle).text();
        var $desc = $(this).find('.res .abstr');
        var description = $desc.first().text();

        var aResult = {
            'url': url,
            'title': title,
            'description': description
        };
        yahooResults.push(aResult);
    });
    return yahooResults;
}


function bingProcessingFunction($) {
    var bingResults = [];
    $('.b_algo').each(function() {
        var urlAndTitle = $(this).find('h2 a');
        var url = urlAndTitle.attr('href');
        var title = $(urlAndTitle).text();
        var $desc = $(this).find('.b_caption p');
        var description = $desc.first().text();

        var aResult = {
            'url': url,
            'title': title,
            'description': description
        };
        bingResults.push(aResult);
    });

    return bingResults;

}


var port = 9000;
app.listen(port);

console.log('Application running on Port: ' + port);