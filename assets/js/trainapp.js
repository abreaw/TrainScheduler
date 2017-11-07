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
var initialized = false;


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

	console.log(nameInfo + ", " + destInfo + ", " + firstTrainInfo + ", " + frequencyInfo);

	// adding a new train entry to the firebase database
	database.ref('trains').push({
        name: nameInfo,
        destination: destInfo,
        firstTrain: firstTrainInfo,
        frequency: frequencyInfo,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });



});

// ---------------------------------------------------------------------------------------------------------------
// Create & Format table row data
// ---------------------------------------------------------------------------------------------------------------
function createTableRow(name, dest, frequency, nextTrain, minsAway) {
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
// Calculate Next Train Time
// arguments: frequency
// ---------------------------------------------------------------------------------------------------------------
function calculateNextTrainTime() {

	

}

// // calculate months worked
// function calculateMonthsWorked(start) {
// 	// initialize momentjs date with firebase utc timestamp
// 	var startDate = moment(start);
// 	// initialize momentjs now date
// 	var todaysDate = moment();
// 	return todaysDate.diff(startDate, 'months', true);
// }


// ---------------------------------------------------------------------------------------------------------------
// Populate Table on page load and when a new train is added to the firebase database
// ---------------------------------------------------------------------------------------------------------------
database.ref('trains').orderByChild('dateAdded').once('value', function(data) {
	
	console.log('ran the once')

	// let newRow = '';
	var newRow = '';

	console.log(data.val());
	// get rows from firebase row entries
	var rows = Object.values(data.val());

	console.log(rows);

	
	if (!initialized) {
		// iterate over row entries
		for (var row of rows) {

			console.log("for loop - ", row);

			// deconstruct row properties
			var name = row.name;
			var destination = row.destination;
			var firstTrain = row.firstTrain;
			var frequency = row.frequency;

			console.log(name + ", " + destination + ", " + firstTrain + ", " + frequency);

			// calculate next arrival
			var nextTrain = '3:45 PM'; //new Date();
			// var todayDate = today.getDate();
			// var monthsWorked = 10;

			// calculate minsAway
			var minsAway = '30'; // monthsWorked * monthlyRate;
			
			// create row and append to newRow var
			newRow += createTableRow(
				name,
				destination,
				frequency,
				nextTrain,
				minsAway
			);

			console.log(newRow);

		}

		// add newRow to train list table
		$('#train-list').append(newRow);
	} else {


	}

	initialized = true;

});

// ---------------------------------------------------------------------------------------------------------------
// Populate new table rows on new train added
// ---------------------------------------------------------------------------------------------------------------
database.ref('trains').orderByChild('dateAdded').on('child_added', function(data) {
	
	console.log("ran the child_added function");

	// add new row if page has been initialezed already
	if (initialized) {

		// get new train data from firebase database
		var name = data.val().name;
		var destination = data.val().destination;
		var firstTrain = data.val().firstTrain;
		var frequency = data.val().frequency;

		console.log("on child_added function call", name, destination, firstTrain, frequency);

		// calculate next arrival
		var nextTrain = '3:45 PM'; //new Date();
		// var todayDate = today.getDate();
		// var monthsWorked = 10;

		// calculate minsAway
		var minsAway = '30'; // monthsWorked * monthlyRate;
		
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
	} else {

		// do not reload info already on page
		return;
	}
})
