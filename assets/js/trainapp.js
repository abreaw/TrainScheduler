// ---------------------------------------------------------------------------------------------------------------
// 
// ---------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------
// Firebase Config, Initialization & Instance Creation
// ---------------------------------------------------------------------------------------------------------------
var config = {
    apiKey: "AIzaSyDzxrOV2oSWFY0V5_VXoSiLURVszhSmX1g",
    authDomain: "unc-ral-trainscheduler.firebaseapp.com",
    databaseURL: "https://unc-ral-trainscheduler.firebaseio.com",
    projectId: "unc-ral-trainscheduler",
    storageBucket: "",
    messagingSenderId: "213472072362"
};

// Initialize the firebase app w/ the config settings defined above
firebase.initializeApp(config);

// Create a firebase database instance to work with in this app
var database = firebase.database();

// var to hold page load true or false
// var initialized = false;

// dont need these ... using the first train time to calculate instead
// Train Stations start & end times
// var startTime = moment("04:00", "HH:mm");
// var endTime = moment("00:30", "HH:mm");


// ---------------------------------------------------------------------------------------------------------------
// On "Add" button click process
// ---------------------------------------------------------------------------------------------------------------
$("#form").submit(function(e) {

	// prevents the page from reloading when the submit button is clicked (default is to reload page)
	// another way would be to use type="button" in the html page instead of type="submit"
	e.preventDefault();

	// grabs the input field text value from the page
	var nameInfo = $("#name-input").val().trim();
	var destInfo = $("#destination-input").val().trim();
	var firstTrainInfo = $("#first-train-input").val().trim();
	var frequencyInfo = $("#frequency-input").val().trim();

	if (nameInfo === "" || destInfo === "" || firstTrainInfo === "" || frequencyInfo === "") {

		alert("Please enter information for all the fields in the Train Details form.");
	} else {

		console.log(nameInfo + ", " + destInfo + ", " + firstTrainInfo + ", " + frequencyInfo);

		// adding a new train entry to the firebase database
		database.ref('trains').push({
	        name: nameInfo,
	        destination: destInfo,
	        firstTrain: firstTrainInfo,
	        frequency: frequencyInfo,
	        dateAdded: firebase.database.ServerValue.TIMESTAMP
	    });

	    $("#name-input").val("");
	    $("#destination-input").val("");
	    $("#first-train-input").val("");
	    $("#frequency-input").val("");

	}


});

// ---------------------------------------------------------------------------------------------------------------
// Create & Format table row data
// arguments: train name, train destination, how often the train comes, when the next train is due, how many
//		minutes away the train is from now
// returns: html setup of the new table row with the table data passed in the arugments section
// ---------------------------------------------------------------------------------------------------------------
function createTableRow(name, dest, frequency, nextTrain, minsAway) {

	// use ` instead of ' or " to be able to add the variable names into the string and it interpret them for the values passed in
	return `
		<tr>
			<td>${name}</td>
			<td>${dest}</td>
			<td>${frequency}</td>
			<td>${nextTrain}</td>
			<td>${minsAway}</td>
		</tr>
	`;
}

// ---------------------------------------------------------------------------------------------------------------
// Calculate Minutes Away from next train time
// arguments: when first train starts, frequency train runs
// returns: # of minutes until the next train
// ---------------------------------------------------------------------------------------------------------------
function calculateMinsAway(start, freq) {

	var currentTime = moment(); // .format("HH:mm"); // military time for calculations
	var firstTime = moment(start, "HH:mm");
	// var nextTime;
	// var trainTimes = [];
	// var iterations = parseInt(moment(currentTime).diff(start)) / parseInt(freq);

	console.log("current time = ", currentTime);
	console.log("start time = ", firstTime);
	// console.log(nextTime);
	// console.log(iterations);

	// while ()

	// console.log(moment(currentTime).diff(start, mins));

	if (firstTime.isBefore(currentTime)) {

		// calculates how many mins between now and the start time for the train
		var minsDiff = currentTime.diff(firstTime, 'minutes');
		console.log("mins diff = ", minsDiff);
		// var minsDiff = Math.abs(firstTime.diff(currentTime, 'minutes'));

	} else if (firstTime.isAfter(currentTime)) {

		// calculates how many mins between start time and now for the train
		var minsDiff = firstTime.diff(currentTime, 'minutes');
		// var minsDiff = Math.abs(currentTime.diff(firstTime, 'minutes'));
		console.log("mins diff = ", minsDiff);

	} else if (firstTime.isSame(currentTime)) {

		return 0;
	}
	
	// calculates how many trains will run between now and start time
	var numTrains = minsDiff / freq;
	
	// calculates how many mins until the next train??
	var currTrainMinsAway = freq - (minsDiff % freq);  // returns the remainder after mins difference is divided by the frequency

	// console.log(minsDiff);
	// console.log(freq);
	// console.log(numTrains);
	// console.log("mins away", currTrainMinsAway);

	return currTrainMinsAway;
}


// ---------------------------------------------------------------------------------------------------------------
// Calculate Time the next train will arrive
// arguments: mins away from next train time, 
// returns: next train time (time format HH:mm a)
// ---------------------------------------------------------------------------------------------------------------
function calculateNextTrainTime(mins) {

	var timeArrives = moment().add(mins, 'minutes');
	console.log("next train time", timeArrives);

	// console.log(moment(timeArrives).format("hh:mm A"));

	var timeArrivesFormatted = moment(timeArrives).format("hh:mm A");

	return timeArrivesFormatted;
}


// ---------------------------------------------------------------------------------------------------------------
// Populate Table on page load and when a new train is added to the firebase database
// ---------------------------------------------------------------------------------------------------------------
// database.ref('trains').orderByChild('dateAdded').once('value', function(data) {
	
// 	console.log('ran the once')

// 	// let newRow = '';
// 	var newRow = '';

// 	// console.log(data.val());
// 	// get rows from firebase row entries
// 	var rows = Object.values(data.val());

// 	// console.log(rows);

	
// 	if (!initialized) {
// 		// iterate over row entries
// 		for (var row of rows) {

// 			console.log("for loop - ", row);

// 			// deconstruct row properties
// 			var name = row.name;
// 			var destination = row.destination;
// 			var firstTrain = row.firstTrain;
// 			var frequency = row.frequency;

// 			console.log(name + ", " + destination + ", " + firstTrain + ", " + frequency);

// 			// calculate minsAway
// 			var minsAway = calculateMinsAway(firstTrain, frequency); // monthsWorked * monthlyRate;

// 			console.log("minsAway = ", minsAway);
			
// 			// calculate next arrival
// 			var nextTrain = calculateNextTrainTime(minsAway);
						
// 			// create row and append to newRow var
// 			newRow += createTableRow(
// 				name,
// 				destination,
// 				frequency,
// 				nextTrain,
// 				minsAway
// 			);

// 			// console.log(newRow);

// 		}

// 		// add newRow to train list table
// 		$('#train-list').append(newRow);

// 	} else {


// 	}

// 	initialized = true;

// });

// ---------------------------------------------------------------------------------------------------------------
// Populate Table on page load and when a new train is added to the firebase database
// ---------------------------------------------------------------------------------------------------------------
database.ref('trains').orderByChild('dateAdded').on('child_added', function(data) {
	
	console.log("ran the child_added function");

	// add new row if page has been initialezed already
	// if (initialized) {

		// get new train data from firebase database
		var name = data.val().name;
		var destination = data.val().destination;
		var firstTrain = data.val().firstTrain;
		var frequency = data.val().frequency;

		console.log("on child_added function call", name, destination, firstTrain, frequency);

		// calculate minsAway
		var minsAway = calculateMinsAway(firstTrain, frequency); // monthsWorked * monthlyRate;

		console.log("minsAway = ", minsAway);
		
// 			// calculate next arrival
		var nextTrain = calculateNextTrainTime(minsAway);
		
		// create row and append to newRow var
		var newRow = createTableRow(
			name,
			destination,
			frequency,
			nextTrain,
			minsAway
		)

		// push new row to train list table
		$('#train-list').append(newRow)

	// } else {

		// do not reload info already on page
		// return;
	// }
})
