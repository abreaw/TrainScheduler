// ---------------------------------------------------------------------------------------------------------------
// trainapp.js -- logic to display & calculate train arrivals from firebase as inputed from the user
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

	} else if (!isFirstTrainInputValid(firstTrainInfo)) {

		alert("Please enter valid time for 'First Train' field.");
		$("#first-train-input").select();

	} else if (isFrequencyANum(frequencyInfo)) {

		alert("Please enter a valid number for the frequency of the new train.");
		$("#frequency-input").select();

	} else {

		// console.log(nameInfo + ", " + destInfo + ", " + firstTrainInfo + ", " + frequencyInfo);

		// adding a new train entry to the firebase database
		database.ref('trains').push({
	        name: nameInfo,
	        destination: destInfo,
	        firstTrain: firstTrainInfo,
	        frequency: frequencyInfo,
	        dateAdded: firebase.database.ServerValue.TIMESTAMP
	    });

	    // clear all input fields after new train details added to Firebase
	    $("#name-input").val("");
	    $("#destination-input").val("");
	    $("#first-train-input").val("");
	    $("#frequency-input").val("");

	}


});


// ---------------------------------------------------------------------------------------------------------------
// On "Delete" button click process
// ---------------------------------------------------------------------------------------------------------------
$(".table").on("click", ".button-delete", function() {

	// get the ID for the Row the Button click is in
	var btnParentRowID = $(this).parent().parent().attr("id");
	
	// remove the entry from Firebase w/ the key from the table row's ID attr
	database.ref('trains').child(btnParentRowID).remove();

});


// ---------------------------------------------------------------------------------------------------------------
// Create & Format table row data
// arguments: train name, train destination, how often the train comes, when the next train is due, how many
//		minutes away the train is from now
// returns: html setup of the new table row with the table data passed in the arugments section
// ---------------------------------------------------------------------------------------------------------------
function createTableRow(id, name, dest, frequency, nextTrain, minsAway) {

	// use ` instead of ' or " to be able to add the variable names into the string and it interpret them for the values passed in
	return `
		<tr id='${id}'>
			<td>${name}</td>
			<td>${dest}</td>
			<td>${frequency}</td>
			<td>${nextTrain}</td>
			<td>${minsAway}</td>
			<td><button type="button" class="btn button-delete">X</button>
		</tr>
	`;
}


// ---------------------------------------------------------------------------------------------------------------
// Check the input from the user for the first train time to see if it is valid, should be in military time
// arguments: input from user for the first train run time
// returns: true if valid or false if invalid
// ---------------------------------------------------------------------------------------------------------------
function isFirstTrainInputValid(timeStart) {

	var checkTime = moment(timeStart, "HH:mm").isValid();

	return checkTime;
}

// ---------------------------------------------------------------------------------------------------------------
// Check the input from the user for the frequency of the new trail to see if it is valid, should be a number
// arguments: input from user for the time between trains
// returns: true if not a number OR false if it is a number
// ---------------------------------------------------------------------------------------------------------------
function isFrequencyANum(freq) {

	var checkFreq = isNaN(parseInt(freq));

	return checkFreq;
}

// ---------------------------------------------------------------------------------------------------------------
// Calculate Minutes Away from next train time
// arguments: when first train starts, frequency train runs
// returns: # of minutes until the next train
// ---------------------------------------------------------------------------------------------------------------
function calculateMinsAway(start, freq) {

	var currentTime = moment();
	var firstTime = moment(start, "HH:mm");
	
	console.log("current time = ", currentTime);
	console.log("start time = ", firstTime);
	
	// check to see if first train time before the current time
	if (firstTime.isBefore(currentTime)) {

		// calculates how many mins between now and the start time for the train
		var minsDiff = currentTime.diff(firstTime, 'minutes');
		
		// if less than a min then the train is here
		if (minsDiff < 1) {

			return 0;
		}

		// calculates how many mins until the next train??
		var currTrainMinsAway = freq - (minsDiff % freq);  // returns the remainder after mins difference is divided by the frequency

	
	} else if (firstTime.isAfter(currentTime)) {

		// calculates how many mins between start time and now for the train
		var currTrainMinsAway = firstTime.diff(currentTime, 'minutes');

	} else if (firstTime.isSame(currentTime)) {

		return 0;
	}

	return currTrainMinsAway;
}


// ---------------------------------------------------------------------------------------------------------------
// Calculate Time the next train will arrive
// arguments: mins away from next train time, 
// returns: next train time (time format HH:mm a)
// ---------------------------------------------------------------------------------------------------------------
function calculateNextTrainTime(mins) {

	// adds the mins away to the current time to show when the next train arrives
	var timeArrives = moment().add(mins, 'minutes');
	
	var timeArrivesFormatted = moment(timeArrives).format("hh:mm A");

	return timeArrivesFormatted;
}


// ---------------------------------------------------------------------------------------------------------------
// Populate Table on page load and when a new train is added to the firebase database
// ---------------------------------------------------------------------------------------------------------------
database.ref('trains').orderByChild('dateAdded').on('child_added', function(data) {

	// get new train data from firebase database
	var dbKey = data.key;
	var name = data.val().name;
	var destination = data.val().destination;
	var firstTrain = data.val().firstTrain;
	var frequency = data.val().frequency;

	// console.log("on child_added function call", name, destination, firstTrain, frequency);

	// calculate minsAway
	var minsAway = calculateMinsAway(firstTrain, frequency); // monthsWorked * monthlyRate;

	// calculate next arrival
	var nextTrain = calculateNextTrainTime(minsAway);
	
	// create row and append to newRow var
	var newRow = createTableRow(
		dbKey,
		name,
		destination,
		frequency,
		nextTrain,
		minsAway
	);

	// add new row to train list table
	$('#train-list').append(newRow);

});


// ---------------------------------------------------------------------------------------------------------------
// Delete row from table when a train is deleted from the firebase database
// ---------------------------------------------------------------------------------------------------------------
database.ref('trains').orderByChild('dateAdded').on('child_removed', function(data) {
	
	// get new train data from firebase database
	var dbKey = data.key;
	
	// delete the row from the web page table (user's view)
	$("#"+dbKey).remove();
	
});
