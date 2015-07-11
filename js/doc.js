
var preProcess = function(data) {
	data = data.split(/\n(?=[\w]{3} [\d]+, [\d, ]*?[\d]+:[\d]+ [A|P]M)/);

	if(data.length == 1)
		data = data[0].split(/\n(?=[\d]+\/[\d]+\/[\d]{4}, [\d]+:[\d]+ [A|P]M)/)
	// var oneDay = 24*60*60*1000;
	// var months = {'Jan':1, 'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10, 'Nov':11, 'Dec':12}

	var msgs = _.map(data, function(line) {
		var dateTime = line.match(/^.*M (?=-)/)[0].split(',').join('').trim().split(' ');

		if(dateTime.length == 4)
			dateTime.splice(2,0, new Date().getFullYear());

		dateTime = moment(dateTime, ["MMM DD YYYY hh:mm A", "MM/DD/YYYY hh:mm A"])

		// var date = dateTime.slice(0,3);
		// date[0] = months[date[0]].toString();
		// dateTime = [date.join(' ').trim(), dateTime.slice(3,dateTime.length).join(' ').trim()]
		try {
			var person = line.match(/- ([\w ]+(?=:))/)[1].trim();
		}
		catch(e) {
			return null;
		}
		var message = line.match( /: (.*)/)[1].trim();
		return [dateTime, person, message];
	});
	msgs = _.filter(msgs, function(msg){return msg != null})
	var people = _.chain(msgs)
				  .map(function(msg) { return msg[1]; })
				  .uniq()
				  .value();

  	// function dateDiff(d1, d2) {
	// 	d1 = _.map(d1.split(' '), function(item) { return parseInt(item); })
	// 	d2 = _.map(d2.split(' '), function(item) { return parseInt(item); })

	// 	d1 = new Date(d1[2],d1[0],d1[1]);
	// 	d2 = new Date(d2[2],d2[0],d2[1]);

	// 	return Math.round(Math.abs((d1.getTime() - d2.getTime())/(oneDay)));
	// }
  	var jsonData = {};

  	_.each(people, function(person) { jsonData[person] = {'hourly': math.zeros(24).toArray(), 'daily': math.zeros(Math.floor(moment.duration(_.last(msgs)[0].diff(msgs[0][0])).asDays())+1).toArray()} });
  	// _.each(people, function(person) { jsonData[person] = {'hourly': math.zeros(24).toArray(), 'daily': math.zeros(dateDiff(msgs[0][0][0], _.last(msgs)[0][0])+1).toArray()} });

	var messageCorpus = _.map(people, function(p) { return [] }),
		i = 0,
		currentDate = msgs[0][0]
		// currentDate = msgs[0][0][0],
		// currentTime = msgs[0][0][1]


	_.each(msgs, function(msg) {
		var dateTime = msg[0]
		// var date = msg[0][0]
		// var ap = _.last(msg[0][1], 2).join('')
		// var hour = parseInt(msg[0][1].match(/\d+(?=\:)/))
		var sender = msg[1]

		// if (ap === "AM"){
		// 	if (hour == 12)
		// 		hour = 0
		// }else {
		// 	if (hour != 12)
		// 		hour += 12
		// }

		// if(JSON.stringify(currentDate) != JSON.stringify(date)) {
		// 	i += dateDiff(date, currentDate);
		// 	currentDate = date.slice();
		// }

		if(currentDate.dayOfYear() != dateTime.dayOfYear()) {
			i += Math.floor(moment.duration(dateTime.diff(currentDate)).asDays());
			currentDate = dateTime.clone();
		}

		jsonData[sender]['hourly'][dateTime.hour()] += 1
		// jsonData[sender]['hourly'][hour%24] += 1
		jsonData[sender]['daily'][i] += 1
	});

	return jsonData
}

var data;
function doOpen(evt) {
	var files = evt.target.files,
		reader = new FileReader();

	reader.onload = function() {
		var data = this.result;

    	// showout.value = data;
			d3.selectAll("svg").remove();
			document.getElementById("lytics").style.display = "block";
			
    	data = preProcess(data);
    	plot(data)
    };

    reader.readAsBinaryString(files[0]);
}

var openbtn = document.getElementById("openselect")
    // showout = document.getElementById("showresult");
openselect.addEventListener("change", doOpen, false);