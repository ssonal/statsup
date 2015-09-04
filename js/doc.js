var preProcess = function(data) {
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
			var dateTime = line.match(/^.*[APM]? (?=-)/)[0].split(',').join('').trim().split(' ');

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
		var dateTime = line.match(/^.*? (?=-)/)[0].split(',').join('').trim().split(' ');

		// handles cases when the year is missing from messages by inserting present year
		if(dateTime.length == 4)
			dateTime.splice(2,0, new Date().getFullYear().toString());
		dateTime = moment(dateTime, dateFormat)

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
			document.getElementById("lytics").style.display = "block"

    	data = preProcess(data);
    	plot(data)
    };

    reader.readAsBinaryString(files[0]);
}

var openbtn = document.getElementById("openselect")
    // showout = document.getElementById("showresult");
openselect.addEventListener("change", doOpen, false)