'use strict';

var server = require('./server/server');


server.listen(server.get('port'), function() {
    console.log('Application running on Port: ' + server.get('port'));
});

