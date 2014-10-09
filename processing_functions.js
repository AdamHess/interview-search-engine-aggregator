'use strict';
var cheerio = require('cheerio');


//Google has its own freely available API 
//its easier/better than scraping the webpage manually
//be aware that they have a limited number of requests you can send 
// in a given timeframe 
function googleProcessingFunction(body) {
    var searchResults = JSON.parse(body);
    var googleResults = [];
    if (searchResults.responseStatus !== 200) {
        var aResult = {
            url: '',
            title: searchResults.responseStatus + ' Error Making Request to Google; their apis allow for limited number of requests per second' ,
            description: searchResults.responseDetails
        }
        googleResults.push(aResult);
    } else {
        searchResults['responseData']['results'].forEach(function(element) {
            var aResult = {
                url: element.url,
                title: element.title,
                description: element.content
            };
            googleResults.push(aResult);
        });
    }
    return googleResults;
}

function yahooProcessingFunction(body) {
    var $ = cheerio.load(body);
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


function bingProcessingFunction(body) {
    var $ = cheerio.load(body);
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


module.exports = {
    'google': googleProcessingFunction,
    'bing': bingProcessingFunction,
    'yahoo': yahooProcessingFunction

};