'use strict';
// libraries 
var path = require('path'),
    express = require('express'),
    hbs = require('hbs');



//local deps 
var queryRunner = require('./query_runner');
var app = express();

app.set('view engine', 'hbs');
app.engine('hbs', hbs.__express);

// file server for everything in the publc directory 
app.get('/', function(req, resp) {
    resp.sendfile(path.resolve('./public/index.html'));
});
app.use(express.static(path.resolve('./public')));


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

//will return a page with the query processed as a template 
app.get('/query/:query', function(req, resp) {
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

            resp.render(path.resolve('./public/index.template.hbs'), serviceResponse);
        
        }

    });

});







var port = 9000;
app.listen(port);

console.log('Application running on Port: ' + port);