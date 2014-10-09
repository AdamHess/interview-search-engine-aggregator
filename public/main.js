'use strict';
$(function() {
    //this is loaded manually (until this is switched over to requirejs)
    //this is to prevent the backend templating engine from rendering this template 
    //so that we can reuse the same code for both the index.html and the /query/ 
    //services/urls
    $('footer').load('/search_result_template.html');

    $('#submit_button').click(function() {
        var query = $('#query').val();
        if (query) {
            getAggregatedResults(query);
        }
    });

    $('#query').keyup(function() {
        if ($(this).val()) {
            $('#submit_button').prop('disabled', false);
        }
        else {
            $('#submit_button').prop('disabled', true);   
        }
    })

    function getAggregatedResults(query) {
            $('#query_results').empty();
            $('#loading_wheel').show();
            $.ajax({
                type: 'GET',
                url: '/aggregated_query/' + query,
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