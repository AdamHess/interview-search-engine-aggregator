'use strict';
// libraries 
var path = require('path'),
    express = require('express'),
    hbs = require('hbs');

//local deps 
var queryRunner = require('./query_runner');

var app = express();
//set up templating engine 
app.set('view engine', 'hbs');
app.engine('hbs', hbs.__express);

//www.url.com/ will send user the index.html file
app.get('/', function(req, resp) {
    resp.sendFile(path.resolve('./public/index.html'));
});

// file server for everything in the publc directory 
app.use(express.static(path.resolve('./public')));

//allows for async request for updating the page via query
app.get('/aggregated_query/:query', function(req, resp) {
    var query = req.param('query');
    //process all requests in parallel and then send response when all is processed
    queryRunner(query, function(error, results) {
        if (error) {
            resp.status(200).send({
                error: 'Error Handling Request: ' + error
            });
        } else {
            var serviceResponse = {
                'searchProvider': results,
                'query': query
            };
            resp.status(200).send(serviceResponse);
        }
    });
});

//runs a query and sends a templated page with the query results
app.get('/query/:query', function(req, resp) {
    var query = req.param('query');
    //process all requests in parallel and then send response when all is processed
    queryRunner(query, function(error, results) {
        if (error) {
            //if any one query fails, they all fail.
            resp.status(200).send({
                error: 'Error Handling Request: ' + error
            });
        } else {
            var serviceResponse = {
                'searchProvider': results,
                'query': query
            };
            resp.render(path.resolve('./public/index.template.hbs'), serviceResponse);
        }
    });
});

var port = 9000;
app.listen(port);

console.log('Application running on Port: ' + port);