'use strict';
$(function() {
    $('#submit_button').click(function() {
        var query = $('#query').val();
        if (query) {
            getAggregatedResults(query);
        }


    });

    function getAggregatedResults(query) {
            $('#query_results').empty();
            $('#loading_wheel').show();
            $.ajax({
                type: 'GET',
                url: '/aggregated_query/' + query + '/',
                contentType: 'application/json',
                success: function(data) {
                    var googleResults = Handlebars.compile($('#query_template').html())(data);                    
                    $('#query_results').html(googleResults);
                },
                failure: function(errorMsg) {
                    $('#query_results').html(JSON.stringify(errorMsg));
                }
            }).always(function() {
                $('#loading_wheel').hide();
            });
        
    }

    
   
});