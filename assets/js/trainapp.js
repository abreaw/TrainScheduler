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

// // calculate months worked
// function calculateMonthsWorked(start) {
// 	// initialize momentjs date with firebase utc timestamp
// 	var startDate = moment(start);
// 	// initialize momentjs now date
// 	var todaysDate = moment();
// 	return todaysDate.diff(startDate, 'months', true);
// }


// ---------------------------------------------------------------------------------------------------------------
// Populate Table on page load
// ---------------------------------------------------------------------------------------------------------------
database.ref('trains').orderByChild('dateAdded').once('value', function(data) {
	
	console.log('ran the once')

	let newRow = '';

	// get rows from firebase row entries
	var rows = Object.values(data.val())

	// iterate over row entries
	for (var row of rows) {

		// deconstruct row properties
		var name = row.name;
		var destination = row.destination;
		var firstTrain = row.firstTrain;
		var frequency = row.frequency;

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
		)
	}

	// add newRow to table
	$('#table').append(newRow)

});

// ---------------------------------------------------------------------------------------------------------------
// Populate new table rows on new train added
// ---------------------------------------------------------------------------------------------------------------
database.ref('trains').orderByChild('dateAdded').limitToLast(1).on('child_added', function(data) {
	
	// get table entry array
	var rows = Object.values(data.val())
	
	// get first and only entry in rows
	var row = rows[0]
	
	// deconstruct row properties
	var name = row.name;
	var destination = row.destination;
	var firstTrain = row.firstTrain;
	var frequency = row.frequency;

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
	)
	
	// push new row to table
	$('#table').append(newRow)
})
