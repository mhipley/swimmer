// Test code for swimmer experience
var w = window.innerWidth;
var h = window.innerHeight;
var decayTimeout;

// tap time starters
var startTime;
var beatTimes;
var xsum, xxsum, ysum, yysum, xysum;
var periodprev, aprev, bprev;
var isDone;
var tempo;
let swimBpm = 50;

function setup() {

	createCanvas(w, h);
	console.log("setup");

}

function draw() {

    var bgColor = color(201, 244, 255);
	background(bgColor);
	
}

// get the user input via key, and set values for the move object

function keyPressed() {
	
	let keyIndex = -1;
	let move = [];
	if (key >= 'a' && key <= 'z') {
		keyIndex = key.charCodeAt(0) - 'a'.charCodeAt(0);
	}
    if (keyIndex === -1) {
		// not a letter
    } else {
        if (key === 'd') {
			move = {
				"side":"left",
				"type":"stroke"
			};
        }
        else if (key === 'q') {
			doBeat();
			move = {
					"side":"left",
					"type":"breath"
				};
        }
        else if (key === 'k') {
			move = {
				"side":"right",
				"type":"stroke"
			};
        }
        else if (key === 'p') {
			doBeat();
			move = {
					"side":"right",
					"type":"breath"
				};
			
		}
		else {
			// not a control letter
		}
	}

	if(decayTimeout) {
		clearTimeout(decayTimeout);
		decayTimeout = null;
	}
	decayTimeout = setInterval(decayTempo, 2000);
	
}

////

// automatically reduce tempo over time if no breath 
function decayTempo() {
	console.log(swimBpm);
	if (swimBpm >= 60) {
		swimBpm -= 10;
	}
	else {
		swimBpm = 50;
	}
	Tone.Transport.bpm.rampTo(swimBpm, 1);
	
}
////

// heartbeat synth setup & related functions

initTempo();

const osc = new Tone.Oscillator().toDestination();
Tone.Transport.bpm.value = swimBpm;
Tone.Transport.scheduleRepeat(time => {
	osc.start(time).stop(time + 0.1);
}, "4n");
Tone.Transport.start();

function initTempo() {

	startTime = null;
	beatTimes = [];
	xsum  = 0;
	xxsum = 0;
	ysum  = 0;
	yysum = 0;
	xysum = 0;
	isDone = false;
	
}

function doBeat() {
	
	if (!isDone)
		countBeat(Date.now());
	return true;
	
}

function countBeat(currTime) {
	// Coordinates for linear regression
	if (startTime === null)
		startTime = currTime;
	var x = beatTimes.length;
	var y = currTime - startTime;
	
	// Add beat
	beatTimes.push(y);
	var beatCount = beatTimes.length;
	
	// Regression cumulative variables
	xsum  += x;
	xxsum += x * x;
	ysum  += y;
	yysum += y * y;
	xysum += x * y;
	
	tempo = 60000 * x / y;

	if (tempo <= 50 || isNaN(tempo)) {
		tempo = 50;
		swimBpm = 50;
	}
	else if (tempo >= 220) {
		tempo = 220;
		swimBpm = 220;
	}
	else {
		swimBpm = tempo;
	}

	Tone.Transport.bpm.rampTo(swimBpm, 1);

}


function doneBeat() {
	isDone = true;

}
////




