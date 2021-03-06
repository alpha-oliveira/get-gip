"use strict"

const request = require('request')
    , cheerio = require("cheerio")
    , fs = require("fs");
const initial = 'http://gip.aaum.pt/'
    , now = new Date();

// depth of days extracted inserted as an argument
const difference = process.argv[2];;
//get the last offer
let path = 'index.php/gip/show/id/'
    , id = '';
request(initial, (err, response, body) => {
    if (err) { console.log(err); }
    let $ = cheerio.load(body)
        , suffix = '';
    suffix = $('#destaque_homepage a').attr('href');
    let pattern = /\/index.php\/gip\/show\/id\/(\d+)/
    let matches = suffix.match(pattern);
    id = matches[1];

    // variable to control the loop
    let delta = 100

    function get(url, output) {
        return new Promise(function (resolve, reject) {
            scrape(url, {

                date: "#gip_show_text h3",

                content: "#gip_show_text"
            }, (err, data) => {
                output.date = new Date(data.date);

                output.content = data.content.replace(/(\\n|\\t|\\r)/g, ' ');

                fs.appendFile('results.html', output.content, function (err) {
                    if (err) reject(err);
                    resolve(output.date);
                });

            });

        });
    }


    let url = initial + path + id;
    let output = {
        date: ''
        , content: ''
    };
( function recursive () { //iife works like a do-while loop
    get(url, output).then(function (response) {
        // distance in days
        delta = (now - response) / (1000 * 3600 * 24);
        id--;

        if ((delta < difference)) {
            url = initial + path + id;
            recursive();
        }
  
  }
        , function (error) {
            console.log(error);
        });

})(); // recursive iife

});






function scrape(url, data, cb) {
    
    // 1. Create the request
    request(url, (err, response, body) => {
        if (err) { return cb(err); }

        // 2. Parse the HTML
        let $ = cheerio.load(body)
            , pageData = {}
            ;

        // 3. Extract the data
        Object.keys(data).forEach(k => {
            pageData[k] = $(data[k]).html();

        });

        // Send the data in the callback
        cb(null, pageData);

    });
}




