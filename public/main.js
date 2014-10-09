$(function() {
    $('#submit_button').click(function() {
        var useAsync = $('#use_async').val();
        var query = $('#query').val();
        if (useAsync) {
            makeAsynchronousRequest(query);
        } else {
            makeSynchronousRequest(query);
        }


    });

    function makeSynchronousRequest(query) {

        if (query) {
            cleanAllSearchResults();
            showAllLoadingWheels();
            $.ajax({
                type: 'GET',
                url: '/aggregated_query/' + query + '/',
                contentType: 'application/json',
                success: function(data) {
                    var googleResults = Handlebars.compile($('#google_template').html())(data);
                    var yahooResults = Handlebars.compile($('#bing_template').html())(data);
                    var bingResults = Handlebars.compile($('#yahoo_template').html())(data);
                    
                    $('#result_google').html(googleResults);
                    $('#result_bing').html(bingResults);
                    $('#result_yahoo').html(yahooResults);
                    
                },
                failure: function(errorMsg) {
                    displayResult(JSON.stringify(errorMsg));

                }

            }).always(function() {
                hideAllLoadingWheels();
            });
        }
    }

    function hideAllLoadingWheels() {
        hideLoadingWheel('google');
        hideLoadingWheel('yahoo');
        hideLoadingWheel('bing');
    }

    function showAllLoadingWheels() {
        showLoadingWheel('google');
        showLoadingWheel('yahoo');
        showLoadingWheel('bing');
    }

    function cleanAllSearchResults() {
        cleanPreviousSearchResult('google');
        cleanPreviousSearchResult('yahoo');
        cleanPreviousSearchResult('bing');
    }

    //sends 3 asyncrhnous requests to the server they dont all need to execute correctly
    //in order to display data on the screen
    function makeAsynchronousRequest(query) {
        //they run Asynchronously so our user gets some information back
        runSearch('google', query);
        runSearch('bing', query);
        runSearch('yahoo', query);
    }

    function runSearch(searchEngine, query) {
        if (query) {
            cleanPreviousSearchResult(searchEngine);
            showLoadingWheel(searchEngine);
            $.ajax({
                type: 'GET',
                url: '/query/' + searchEngine + '/',
                contentType: 'application/json',
                dataType: 'json',
                data: {
                    'query': query
                },
                success: function(data) {
                    displayResult(searchEngine, data.resp);
                    //EACH Page needs special formatting
                    if (window['format_data_' + searchEngine]) {
                        window['format_data_' + searchEngine]();
                    }
                },
                failure: function(errorMsg) {
                    displayResult(JSON.stringify(errorMsg));

                }

            }).always(function() {
                hideLoadingWheel(searchEngine);
            });
        }
    }
    //helper functions    
    function hideLoadingWheel(searchEngine) {
        $('#loading_wheel_' + searchEngine).hide();

    }

    function showLoadingWheel(searchEngine) {
        $('#loading_wheel_' + searchEngine).show();

    }

    function cleanPreviousSearchResult(searchEngine) {
        hideLoadingWheel(searchEngine);
        $('#result_' + searchEngine).empty();

    }

    function displayResult(searchEngine, message) {
        $('#result_' + searchEngine).html(message);
    }

    //format the data from the specific provider to clean 
    // up the HTML that it sends back

    window.format_data_bing = function() {
        //convert from using ordered lists to unordered list (gets rid of the numbers)
        $('#result_bing ol').replaceWith(function() {
            return $('<ul />', {
                html: $(this).html()
            });
        });

        //remove pagination at bottom 
        $('.b_pag').remove();

    };

    window.format_data_yahoo = function() {
        //need to move the data-src attr to src for images on yahoo
        //this is so that we can display the image results from yahoo
        $('#result_yahoo').each(function() {
            $(this).find('img').each(function() {
                var datasource = $(this).attr('data-src');
                if (datasource) {
                    $(this).attr('src', datasource);
                }
            })
        });

        //convert from using ordered lists to uniform list
        $('#result_yahoo ol').replaceWith(function() {
            return $('<ul />', {
                html: $(this).html()
            });
        });
        //makes the images display inline 
        //rather than horizontally
        //also added a little padding to look clearner
        $('#dd_image ol').replaceWith(function() {
            return $('<ul />', {
                html: $(this).html()
            });
        });
        $('#dd_image li').replaceWith(function() {
            return $('<span />', {
                html: $(this).html(),
                style: "padding:5px;"
            });
        });

    };
});