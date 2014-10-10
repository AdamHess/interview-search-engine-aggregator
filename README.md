Create a full stack application that will send a request to a server
and the server will return the search results from three search engines. (In this case google bing and yahoo) 


You can see a deployment of this app on heroku here:

http://desolate-mesa-3831.herokuapp.com/

You can run queries directly from your browser by

http://desolate-mesa-3831.herokuapp.com/query/::SearchTermHere::

if the deployment is inaccessable you can synch it down and deploy it to your own dynamo: 

    git clone https://github.com/TheSpiderPig/interview-search-engine-aggregator.git
    heroku create 
    git push heroku master 
