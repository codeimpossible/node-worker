var http = require('http');
var querystring = require('querystring');

function worker_http( base_url ) {
    var url = base_url || "http://proggr.apphb.com";

    function buildOptions( worker_id ){
        var post_data = querystring.stringify({ 'worker_id' : worker_id });
        var post_options = {
            host: url,
            port: '80',
            path: base_url + '/' + this.name,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }
        };
        return { data: post_data, options: post_options };
    }

    return {
        jobs: {
            base_url: "/jobs",
            next: function next( worker_id, callback ) {
                // Build the post string from an object
                var request_meta = buildOptions.call(this, worker_id);

                // Set up the request
                var scoped_callback = callback;
                var post_req = http.request(request_meta.options, function(res) {
                    res.setEncoding('utf8');
                    res.on('data', scoped_callback);
                });

                // post the data
                post_req.write(request_meta.data);
                post_req.end();
            }
        }
    };
}

module.exports = worker_http();
