var request = require('request');
var express = require('express');
var RSVP = require('rsvp');
var app = express();
var allTitles = "";
//getTitles from Address
var getTitlesfromAddress = function getTitlesfromAdress(addresses, callback) {

    //geting titles using request
    request(addresses, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            //regular expression to get the title from response
            var title = body.match(/<title[^>]*>([^<]+)<\/title>/)[1];

            return callback(null, title, addresses);
        } else
            return callback(error, addresses, addresses);


    });

};

//this will process only /i/want/title url.
app.get('/I/want/title', function (request, response, next) {
    allTitles = "";
    customIndex = 0;
    //check if parameter is added or not
    if (!request.param('address'))
        response.send('<h4>No parameter is given</h4>');
    else {
        var my_addresses = request.param('address');
        //if only one parameter is passed then convert parameters into array
        if (typeof (my_addresses) === 'string')
            my_addresses = [my_addresses]


        RSVP.all(my_addresses).then(function(posts) {
              posts.forEach(function(address){
             
                 getTitlesfromAddress(address, function (error, title, addresses) {
                        customIndex ++;
                        if (error) // incase of error
                            allTitles += "<li>" + addresses + " -- NO RESPONSE</li>";
                        else
                            allTitles += "<li>" + addresses + " -- " + title + "</li>";
                        if (customIndex >= my_addresses.length) {
                            var result = "<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>" + allTitles + "</ul></body></html>";
                           response.send(result);
                       }
                    });
              });  
            //response.send(allTitles);
        }).catch(function(reason){
          // if any of the promises fails.
           response.send(reason);
        });

        

    }
});
//return 404 not found for all other urls
app.get('*', function (request, response) {
    response.status(404);
    response.send('<h4>Url not matched with /I/want/title</h4>');
})
app.listen(8081);