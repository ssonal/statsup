var preProcess = function(data, early) {
	//empty date format to begin with
	var dateFormat = ""
	// isolate the first date
	var dateCheck = data.match(/^.*[APM]? (?=-)/)[0].split(',').join('').trim().split(' ')[0].split('/')

	//if length isn't one, it indicates the non MMM DD YYYY format
	if (dateCheck.length != 1){
		if (dateCheck[2].length == 4) {
			data = data.split(/\n(?=[\d]+\/[\d]+\/[\d]{4}, [\d]+:[\d]+ [A|P]M)/)

			if (data.length == 1) {
				data = data[0].split(/\n(?=[\d]+\/[\d]+\/[\d]{4}, [\d]+:[\d]+)/)
				dateFormat = "MM/DD/YYYY HH:mm"
			}else {
				dateFormat = "MM/DD/YYYY hh:mm A"
			}
		}else {
			data = data.split(/\n(?=[\d]+\/[\d]+\/[\d]{2}, [\d]+:[\d]+ [A|P]M)/)

			if (data.length == 1) {
				data = data[0].split(/\n(?=[\d]+\/[\d]+\/[\d]{2}, [\d]+:[\d]+)/)
				dateFormat = "MM/DD/YY HH:mm"
			}else {
				dateFormat = "MM/DD/YY hh:mm A"
			}
		}

		//Handles cases where DD & MM are interchanged
		_.map(data, function(line) {
			// var newDateTime = line.match(/^.*[APM]? (?=-)/)[0].split(',').join('').trim().split(' ');

			if (!moment(line.match(/^.*[APM]? (?=-)/)[0].split(',').join('').trim().split(' '), dateFormat).isValid())
				dateFormat = "DD/MM/"+dateFormat.split('/')[2];
		})
	}else {
		data = data.split(/\n(?=[\w]{3} [\d]+, [\d, ]*?[\d]+:[\d]+ [A|P]M)/);

		if (data.length == 1) {
			data = data[0].split(/\n(?=[\w]{3} [\d]+, [\d, ]*?[\d]+:[\d]+)/);
			dateFormat = "MMM DD YYYY HH:mm"
		}else {
			dateFormat = "MMM DD YYYY hh:mm A"
		}
	}

	var msgs = _.map(data, function(line) {
		var newDateTime = line.match(/^.*? (?=-)/)[0].split(',').join('').trim().split(' ');

		// handles cases when the year is missing from messages by inserting present year
		if(newDateTime.length == 4)
			newDateTime.splice(2,0, new Date().getFullYear().toString());
		newDateTime = moment(newDateTime, dateFormat)

		try {
			var person = line.match(/- ([\w ]+(?=:))/)[1].trim();
		}
		catch(e) {
			return null;
		}
		var message = line.match( /: (.*)/)[1].trim();
		if(early == true) {
			return {'time' : newDateTime['_d'], 'name' : person, 'message' : message};
		}
		return [newDateTime, person, message];
	});

	msgs = _.filter(msgs, function(msg){return msg != null});
	var people = _.chain(msgs)
				  .map(function(msg) { return msg['name'] || msg[1]; })
				  .uniq()
				  .value();

	if(early == true) {
		return [msgs, people];
	}

  	function dateDiff(d1, d2) {
		var m = d1.dayOfYear() - d2.dayOfYear()
		if (m < 0)
			return Math.ceil(moment.duration(d1.diff(d2)).asDays())
		return m
	}

  	var jsonData = {};

  	_.each(people, function(person) { jsonData[person] = {'hourly': math.zeros(24).toArray(), 'daily': math.zeros(dateDiff(_.last(msgs)[0], msgs[0][0])+1).toArray(), 'initiated_per_day': math.zeros(dateDiff(_.last(msgs)[0], msgs[0][0])+1).toArray(), 'avg_message_length': 0 } });
		console.log(people);
	var messageCorpus = _.map(people, function(p) {
		return []
	});
	var i = 0;
	var currentDateTime = msgs[0][0];
	var currentTime = msgs[0][0];

	_.each(msgs, function(msg) {
		var newDateTime = msg[0]
		var sender = msg[1]

		if(currentDateTime.dayOfYear() != newDateTime.dayOfYear()) {
			i += dateDiff(newDateTime, currentDateTime);
			currentDateTime = newDateTime.clone();
		}

		if(moment.duration(newDateTime.diff(currentTime)).asHours() > 2){
			console.log(msg[2]);
			console.log(moment.duration(newDateTime.diff(currentTime)).asHours())
			jsonData[sender]['initiated_per_day'][i] += 1
			currentTime = newDateTime.clone();
		}
		console.log(jsonData);
		jsonData[sender]['hourly'][newDateTime.hour()] += 1
		jsonData[sender]['daily'][i] += 1
	});
	// console.log(jsonData);
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
		document.getElementById("lytics").style.display = "block"
		document.getElementById("chat").style.display = "block";
			var data1 = preProcess(data, false);
			plot(data1)
    	var data2 = preProcess(data, true);
			makeMessage(data2[0], data2[1])


  };

    reader.readAsBinaryString(files[0]);
}

var openbtn = document.getElementById("openselect")
    // showout = document.getElementById("showresult");
openselect.addEventListener("change", doOpen, false)
