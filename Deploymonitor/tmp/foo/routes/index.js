
exports.index = function(req, res){
	res.render('index', { title: "title" })
};


exports.build = function(req, res){
	job = req.param('name', 'Adserver-master');
	build = req.param('number', '162');
	console.log('Build: ' + job +  " and build number " + build);
	renderBuildStatus(res, job, build);
};


exports.server = function(req, res){
	server = req.param('name', 'test-feature');
	var http = require('http');
	serverUrl = server + '.videoplaza.org';
	var site = http.createClient('8080', serverUrl);
	var request = site.request("GET", '/proxy/version.txt', {'host' : serverUrl})
    request.end();
    request.on('response', function(response) {
            response.setEncoding('utf8');
            console.log('STATUS: ' + response.statusCode);
            response.on('data', function(chunk) {
                    console.log("DATA: " + chunk);
                	var lines = job.split('\n');
                	var jobName = lines[0];
                	var buildNumber = lines[1];
                    renderBuildStatus(res, jobName, buildNumber);     
            });
    });
};


function renderBuildStatus(res, jobName, buildNumber){	
	
	console.log('Getting status for job: ' + jobName +  " and build number " + buildNumber);
	
	var https = require('https');

	var options = {
	  host: 'hudson.videoplaza.org',
	  port: 443,
	  path: '/jenkins/job/' + jobName + "/" + buildNumber + "/api/json/",
	  method: 'GET'
	};

	var req = https.request(options, function(hudsonResponse) {
	  console.log("statusCode: ", res.statusCode);
	  console.log("headers: ", res.headers);
	  var hudsonResponseData = "";
	  hudsonResponse.on('data', function(d) {
		  console.log('response from hudson: ' + d);
		  hudsonResponseData = hudsonResponseData + d;
	  });
	  
	  hudsonResponse.on('end', function() {
		  console.log('Entire response from hudson: ' + hudsonResponseData);
		  testReport = JSON.parse(hudsonResponseData);
		  res.render('server', { title: 'Server status', result: testReport.result, failCount: testReport.actions[5].failCount, skipCount: testReport.actions[5].skipCount, totalCount: testReport.actions[5].totalCount, job: jobName, build: buildNumber} );
	  });
	  
	});
	req.end();
	
	req.on('error', function(e) {
		console.error(e);
	});

}