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
let swimBpm = 80;
var minBpm = 50;
var maxBpm = 220;
var scaledBpm;
let bg;
let waveVol = -20;
let swimDistance = 0;
let swimHeight = 0;

function setup() {

	// var bgColor = color(255, 255, 255);
	// background(bgColor);

	bg = loadImage('img/waves.png');
	
	createCanvas(w, h);

}

function draw() {
	background(bg);


	// breath overlay gradient
	from = color(255, 140, 140, 0.5 * 255);
	to = color(89, 242, 255, 0.5 * 255);
	scaledBpm = ((swimBpm - minBpm) / (maxBpm - minBpm));
	
	overlayC = lerpColor(from, to, scaledBpm.toFixed(2));

	fill(overlayC);
	noStroke();
	rect(0, 0, w, h);

	
}

// wave synth

const waveSample = new Tone.Player({
	"url" : "samples/tremendously-thick-layer.wav",
	"autostart" : true,
	"loop" : true
}).toDestination();
waveSample.volume.value = waveVol;


////

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
			
			var now = Tone.now();

			
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
			rightSeq.stop();
			rightSeq.start();
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
	if (swimBpm >= 60) {
		swimBpm -= 10;
	}
	else {
		swimBpm = 50;
	}
	Tone.Transport.bpm.rampTo(swimBpm, 1);
	
}
////

//automatically reduce distance & height over time if no stroke
function decayDistance() {
	if (swimDistance >= 0) {
		swimDistance -= 1;
	}
	else {
		swimDistance = 0;
	}	
}

function decayHeight() {
	if (swimHeight >= -10) {
		swimHeight -= 1;

	}
	else {
		swimHeight = 0;
	}
}

// heartbeat synth setup & related functions

initTempo();

// const drumSample = new Tone.Player("samples/lotabla.wav").toDestination();
// drumSample.volume.value = -10;
// // drumSample.autostart = true;
// Tone.Transport.bpm.value = swimBpm;
// Tone.Transport.scheduleRepeat(time => {
// 	drumSample.start(time).stop(time + 2);
// }, "1n");

const drumSampler = new Tone.Sampler(
	{
	  A1: "samples/lotabla.wav"
	},
	{
	  onload: () => {
		document.querySelector("button").removeAttribute("disabled");
	  }
	}
  ).toDestination();
drumSampler.volume.value = -10;
Tone.Transport.bpm.value = swimBpm;
Tone.Transport.scheduleRepeat(time => {
	drumSampler.triggerAttack("A1").triggerRelease(time + 2);
}, "2n");


function startSwim() {
	console.log("clicked");
	Tone.Transport.start();
}

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




