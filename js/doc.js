
var preProcess = function(data) {
	//date format to begin with
	var dateFormat = "MMM DD YYYY hh:mm A"

	// var oneDay = 24*60*60*1000;
	// var months = {'Jan':1, 'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10, 'Nov':11, 'Dec':12}

	data = data.split(/\n(?=[\w]{3} [\d]+, [\d, ]*?[\d]+:[\d]+ [A|P]M)/);

	// Check to see if the above split function manages to do so successfully or not. If not, length of data will be 1
	if(data.length == 1) {
		// Handle 24 hour format for MMMDDYYYY hh:mm A
		data = data[0].split(/\n(?=[\w]{3} [\d]+, [\d, ]*?[\d]+:[\d]+)/);

		//implies the case has not been handled by the above regex. Try case where date is MM/DD/YYYY hh:mm A
		if(data.length == 1) {
			data = data[0].split(/\n(?=[\d]+\/[\d]+\/[\d]{4}, [\d]+:[\d]+ [A|P]M)/)

			if (data.length == 1) {
				data = data[0].split(/\n(?=[\d]+\/[\d]+\/[\d]{4}, [\d]+:[\d]+)/)

				dateFormat = "MM/DD/YYYY HH:mm"
			}else {
				dateFormat = "MM/DD/YYYY hh:mm A"
			}
		}else {
			dateFormat = "MMM DD YYYY HH:mm"
		}
	}


	// Handling the DD/MM/YYYY date format
	if (dateFormat == "MM/DD/YYYY HH:mm" || dateFormat == "MM/DD/YYYY hh:mm A") {
		console.log('here')
		_.map(data, function(line) {
			var dateTime = line.match(/^.*[APM]? (?=-)/)[0].split(',').join('').trim().split(' ');

			if (!moment(line.match(/^.*[APM]? (?=-)/)[0].split(',').join('').trim().split(' '), dateFormat).isValid())
				dateFormat = "DD/MM/"+dateFormat.split('/')[2];
		})
	}

	// if(data.length == 1)
	// 	data = data[0].split(/\n(?=[\d]+\/[\d]+\/[\d]{4}, [\d]+:[\d]+)/)

	// if (!(moment(data[0].match(/^.*M (?=-)/)[0].split(',').join('').trim().split(' '), dateFormat).isValid()))
	// 	dateFormat = "MM/DD/YYYY hh:mm A"


	var msgs = _.map(data, function(line) {
		var dateTime = line.match(/^.*? (?=-)/)[0].split(',').join('').trim().split(' ');

		// handles cases when the year is missing from messages by inserting present year
		if(dateTime.length == 4)
			dateTime.splice(2,0, new Date().getFullYear().toString());
		console.log(dateTime, dateFormat);
		dateTime = moment(dateTime, dateFormat)

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

  	function dateDiff(d1, d2) {
		var m = d1.dayOfYear() - d2.dayOfYear()
		if (m < 0)
			return Math.ceil(moment.duration(d1.diff(d2)).asDays())
		return m
	}

  	// function dateDiff(d1, d2) {
	// 	d1 = _.map(d1.split(' '), function(item) { return parseInt(item); })
	// 	d2 = _.map(d2.split(' '), function(item) { return parseInt(item); })

	// 	d1 = new Date(d1[2],d1[0],d1[1]);
	// 	d2 = new Date(d2[2],d2[0],d2[1]);

	// 	return Math.round(Math.abs((d1.getTime() - d2.getTime())/(oneDay)));
	// }
  	var jsonData = {};

  	_.each(people, function(person) { jsonData[person] = {'hourly': math.zeros(24).toArray(), 'daily': math.zeros(dateDiff(_.last(msgs)[0], msgs[0][0])+1).toArray()} });

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
			i += dateDiff(dateTime, currentDate);
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
