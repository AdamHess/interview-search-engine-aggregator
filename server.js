'use strict';

var path = require('path'),
	express = require('express'),
	hbs = require('hbs'),
	request = require('request'),
	select = require('soupselect').select,
	htmlparser = require('htmlparser'),
	parserToHtml = require('htmlparser-to-html');

	var app = express();
	//use handlebars as rendering engine 
	app.set('view engine', 'html');
	app.engine('html', require('hbs').__express);


	app.get('/', function(req, resp) {
	    resp.sendfile(path.resolve('./public/index.html'));
	});



	app.use(express.static(path.resolve('./public')));



//Steps
//need to get all requests from various sources 


 app.get('/query/:searchEngine', function(req, resp) {
    var searchQuery = req.query.query;
    var searchEngine = req.param('searchEngine');

    if ((searchEngine !== 'yahoo') && 
    	(searchEngine !== 'google') && 
    	(searchEngine !== 'bing')) {
    	resp.status(400).send({error: "Invalid Search Engine: Supports only google, yahoo and bing"});
    	return;
    }
    if (searchQuery=== undefined) {
    	resp.status(400).send({error: "Invalid Request: Must provide search query"});
    }

    var searchString;
    var searchSelector
    if (searchEngine === 'yahoo') {
    	searchString = 'https://search.yahoo.com/search?q=';
    	searchSelector = '#main [start=1]';
    }
 	else if (searchEngine === 'google') {
    	searchString = 'https://www.google.com/search?q=';
    	searchSelector = '.g';
    }
     else if (searchEngine === 'bing') {
    	searchString = 'http://www.bing.com/search?q=';
    	searchSelector = '#b_results';
    }

    request.get(searchString + searchQuery, function(error, response, body) {
    	if (error) {
    		resp.status(500).send({error:"Something went wrong getting request from " + searchEngine + ' ' + error});
    	}
    	var handler = new htmlparser.DefaultHandler(function(error, dom) {
    		if (error) {
		   		resp.status(500).send({error:"something went wrong with parsing response from " + searchEngine + ' ' + error});
    		}
    		else {
				var queries = parserToHtml(select(dom, searchSelector));
				resp.status(200).send({resp: queries});
    		}
    	});

    	var parser = new htmlparser.Parser(handler);
    	parser.parseComplete(body);


    });


});
var port = 80;
 app.listen(port);

 console.log("Application running on Port: " + port);

