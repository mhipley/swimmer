
////
// TONE JS SETUP
////

var startBpm = 60;
let waveVol = -20;
let harmonicVol = -25;
let synthVol = -5;
let chordVol = -20;
let drumVol = -10;

var bassLine = [
	'D#2','D#2','D#2','D#2','D#2','D#2','D2','D2',
	'C2','C2','C2','C2','C2','C2','A#2','C3',
	'F2','F2','F2','F2','F2','F2','C2','C2',
	'E2','E2','E2','E2','E2','E2','E2','E2',
	];

var chordA = [
	'C5', 'D#5', 'G5'
]
var chordB = [
	'C5', 'F5', 'A5'
]
var chordC = [
	'C5', 'E5', 'G5'
]
var chordProgression = [
	chordA, chordA, chordB, chordC
]
var highLine = ['F#5', 'G5', 'D5'];
var lowLine = ['D4', 'D4', 'D4', null,'D4', 'D4', 'D4', null];

const waveSample = new Tone.Player({
	"url" : "samples/tremendously-thick-layer.wav",
	"autostart" : true,
	"loop" : true
}).toDestination();
waveSample.volume.value = waveVol;

const harmonicSample = new Tone.Player({
	"url" : "samples/harmonic-loop-low.wav",
	"autostart" : true,
	"loop" : true
}).toDestination();
harmonicSample.volume.value = harmonicVol;

Tone.Transport.bpm.value = startBpm;
Tone.Transport.timeSignature = 4;

const bassSynth = new Tone.Synth().toDestination();
bassSynth.volume.value = synthVol;

const bassSeq = new Tone.Sequence((time, note) => {
	bassSynth.triggerAttackRelease(note, "8n", time);
}, bassLine).start(0);

const chordSynth = new Tone.PolySynth().toDestination();
chordSynth.volume.value = chordVol;

const chordSeq = new Tone.Sequence(
	(time, note) => {
	  const chordLookup = {
		chordA: {
		  notes: ['C5', 'D#5', 'G5'],
		  time: '2m',
		},
		chordB: {
		  notes: ['C5', 'F5', 'A5'],
		  time: '1m',
		},
		chordC: {
		  notes: ['C5', 'E5', 'G5'],
		  time: '1m',
		},
	  }
   
	  chordSynth.triggerAttackRelease(
		chordLookup[note].notes,
		chordLookup[note].time,
		time
	  )
	},
	['chordA', null, 'chordB', 'chordC'],
	'1m'
  ).start(0)


function startSwim() {
	Tone.start();
	Tone.Transport.start();
}



////
//A FRAME
////



AFRAME.registerComponent('env-controls', {
	schema: {

	},

	scaleValue: function(inputZ, xMin, xMax) {
		percent = (inputZ - 100) / (-50 - 100);
		outputX = percent * (xMax - xMin) + xMin;
		return outputX;
	},


	init: function () {
		// this.el.children.waves.setAttribute('color', '#ff9900');
		// this.el.children.waves.setAttribute('density', 400);
	},


	tick: function (time, timeDelta) {
		let swimmer = this.el.children.camera;
		let swimPos = swimmer.getAttribute('position');
		let waveDens, waveColor, skyColor, sunPosY;
		let waves = this.el.children.waves;
		let sky = this.el.children.sky;
		let sun = this.el.children.sun;
		let ambient = this.el.children.ambient;
		let sunLight = sun.children.sunLight;
		// let aStart = 30; 
		// let aEnd = 10;
		// let wStart = 184;
		// let wEnd = 220;


		// let sunStart = 0;
		// let sunEnd = 10;
		// let skyStart = 170;
		// let skyEnd = 0;


		//min = 100
		//max = -30

		//wave min = 50
		//wave max = 400


		
		skyColorChange = this.scaleValue(swimPos.z, 170, 0);
		skyColor = 'hsl(' + Math.round(skyColorChange) + ',45%,87%)';
		sky.setAttribute('color', skyColor);

		sunColorChange = this.scaleValue(swimPos.z, 0, 10);
		sunColor = 'hsl(' + Math.round(sunColorChange) + ',100%,100%)';
		sunLight.setAttribute('color', sunColor);

		ambientColorChange = this.scaleValue(swimPos.z, 30, 10);
		ambientColor = 'hsl(' + Math.round(ambientColorChange) + ',100%,82%)';
		ambient.setAttribute('color', ambientColor);

		sunPosY = this.scaleValue(swimPos.z, 220, 40);
		sun.object3D.position.y = sunPosY;
			

		// waveDens = Math.round(this.scaleValue(swimPos.z, 100, -30, 400, 50));
		// waves.setAttribute('density', waveDens);


	}
});

AFRAME.registerComponent('swim-controls', {
	schema: {

		pKey:  {type: 'string', default: "P"},
		kKey: {type: 'string', default: "K"},
		qKey:     {type: 'string', default: "Q"},
		dKey:    {type: 'string', default: "D"},
		moveSpeed: {type: 'number', default: .5},  // A-Frame units/second
		turnSpeed: {type: 'number', default: 30}, // degrees/second
		lookSpeed: {type: 'number', default: 30},  // degrees/second

		// use keyboard or other (e.g. joystick) to activate these controls
		inputType: {type: 'string', default: "keyboard"}
	},
	convertKeyName: function(keyName)
	{
		if (keyName == " ")
			return "Space";
		else if (keyName.length == 1)
			return keyName.toUpperCase();
		else
			return keyName;
	},

	registerKeyDown: function(keyName)
	{
		
		// avoid adding duplicates of keys
		if ( !this.keyPressedSet.has(keyName) )
			this.keyPressedSet.add(keyName);
			
	},

	registerKeyUp: function(keyName)
	{
       	this.keyPressedSet.delete(keyName);
	},

	isKeyPressed: function(keyName)
	{
       	return this.keyPressedSet.has(keyName);
	},

	addBeat: function(time) {
		if (!this.isDone)
			this.countBeat(time);
		return true;
	},
	countBeat: function(time) {
		if (this.last10beats.length >= 10) {
			this.last10beats.shift();
			
			
		}
		
		// var x = this.last10beats.length;
		// var y = time - this.last10beats[0];
		this.last10beats.push(time);

		var arr = this.last10beats;
		console.log(arr);

		var result = arr.reduce(function(acc, element, index, array) {
			acc.sum += element - acc.prev;
			index && acc.array.push((element - acc.prev).toFixed(3));
			acc.prev = element;
			return acc;
		}, {array:[], sum: 0, prev: arr[0]});
		
		console.log(result);
	
		var avgMs = (result.sum / result.array.length).toFixed(0);
		console.log("Average ms: " + avgMs);
		var swimBpm = 120000/avgMs;
		console.log("Current bpm: " + swimBpm);

		if (swimBpm <= this.minBpm || isNaN(swimBpm)) {
			this.swimBpm = this.minBpm;
		}
		else if (swimBpm >= this.maxBpm) {
			this.swimBpm = this.maxBpm;
		}
		else {
			this.swimBpm = swimBpm;
		}

		Tone.Transport.bpm.rampTo(this.swimBpm, '1m');
		   

	},
	beatDone: function() {
		this.isDone = true;
	},


	init: function () {


		this.keyPressedSet = new Set();
		this.last10beats = [0];
		this.isDone = false;
		this.hasStarted = false;
		this.lastKeypress = null;
		this.swimBpm = 60;
		this.minBpm = 40;
		this.maxBpm = 200;


		let self = this;

		document.addEventListener( "keydown", 
			function(eventData) 
			{ 
				self.registerKeyDown( self.convertKeyName(eventData.key) );
				self.lastKeypress = eventData.timeStamp;
	
				
			}
		);
		
		document.addEventListener( "keyup", 
			function(eventData) 
			{ 
				self.registerKeyUp( self.convertKeyName(eventData.key) );
			} 
		);		

		self.moveVector  = new THREE.Vector3(0,0,0);
		self.movePercent = new THREE.Vector3(0,0,0);
		// z = forward/backward
		// x = left/right
		// y = up/down

		self.rotateVector  = new THREE.Vector2(0,0);
		self.rotatePercent = new THREE.Vector2(0,0);
		// y = turn angle
		// x = look angle

		// used as reference vector when turning
		self.upVector = new THREE.Vector3(0,1,0);

		// current rotation amounts
		self.turnAngle = 0; // around global Y axis

		document.addEventListener( "keydown", 
		function(eventData) 
			{ 
				//toggle tutorial
				if (eventData.keyCode === 84 ) {
					if (self.el.children.guide.getAttribute('visible') === true) {
						self.el.children.guide.setAttribute('visible', false);
					}
					else {
						self.el.children.guide.setAttribute('visible', true);
					}
					
				}

				if (eventData.code === "Space") {
					
					if(self.hasStarted === false)
					{
						startSwim();
						self.el.children.guide.setAttribute('visible', true);
						self.el.children.titleCard.setAttribute('visible', false);		
						self.hasStarted = true;				
					}
					else {
						return;
					}

				}

				

			
			});

		document.addEventListener( "keyup", 
			function(eventData) 
			{ 
				
				// self.rotatePercent.set(0,0);

				self.movePercent.set(0,0,0);
				let currentPos = self.el.object3D.position;

				if (self.hasStarted === true)
				{

					if (currentPos.z >= -55) {
								
						if (eventData.keyCode === 75 | eventData.keyCode === 68) {
							self.moveVector.z -= 2;
							let vectorSum = new THREE.Vector3(0,1.6,0);
							vectorSum.addVectors(self.moveVector, self.el.object3D.position);
							var vectorString = vectorSum.toArray().join(" ");
							var animeString = 'property: position; to: [' + vectorString + ']';
						}
	
					}
					else {
						self.moveVector.z = 0;
					}
	
					//75 = k
					if (eventData.keyCode === 75) {
						self.el.children.guide.children.rightControls.children.kKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color: #4F3266;');
	
						self.el.children.guide.children.rightControls.children.kKey.children.kGuide.setAttribute('text', 'opacity:0');
						self.addBeat(eventData.timeStamp);
					}
					//68 = d
					if (eventData.keyCode === 68) {
	
						self.el.children.guide.children.leftControls.children.dKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color: #4F3266;');
						self.el.children.guide.children.leftControls.children.dKey.children.dGuide.setAttribute('text', 'opacity:0');
						self.addBeat(eventData.timeStamp);
					
					}				
	
					//81 = q
					if (eventData.keyCode === 81) {
						self.el.children.guide.children.leftControls.children.qKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color: #4F3266;');
						self.el.children.guide.children.leftControls.
						children.qKey.children.qGuide.setAttribute('text', 'opacity:0');
						var animeString = 'property: rotation; to: 0 15 -5; dur: 400; easing: linear; loop: 2; dir: alternate';
						self.addBeat(eventData.timeStamp);
						
					}
	
					//80 = p
					if (eventData.keyCode === 80) {
						self.el.children.guide.children.rightControls.children.pKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color: #4F3266;');
	
						self.el.children.guide.children.rightControls.children.pKey.children.pGuide.setAttribute('text', 'opacity:0');
						var animeString = 'property: rotation; to: 0 -15 5; dur: 400; easing: linear; loop: 2; dir: alternate';
						self.addBeat(eventData.timeStamp);
					}
	
	
					self.el.removeAttribute('animation');
					self.el.setAttribute('animation', animeString);


				}




			} 
		);

	},

	tick: function (time, timeDelta) 
	{

		let moveAmount = (timeDelta/1000) * this.data.moveSpeed;
		// need to convert angle measures from degrees to radians
		let turnAmount = (timeDelta/1000) * THREE.Math.degToRad(this.data.turnSpeed);
		let lookAmount = (timeDelta/1000) * THREE.Math.degToRad(this.data.lookSpeed);
		let maxLookAngle = THREE.Math.degToRad(this.data.maxLookAngle);


		// rotations
		this.movePercent.set(0,0,0);
		this.rotatePercent.set(0,0);
		
		// reset values
		let totalTurnAngle = 0;
		let totalLookAngle = 0;

		// translations

		this.turnAngle += this.rotatePercent.y * turnAmount;
		this.el.object3D.rotation.y = this.turnAngle;

		// this only works when rotation order = "YXZ"
		let finalTurnAngle = this.el.object3D.rotation.y;
		
		let c = Math.cos(finalTurnAngle);
		let s = Math.sin(finalTurnAngle);	
		
		// forward(z) direction: [ -s,  0, -c ]
		//   right(x) direction: [  c,  0, -s ]
		//      up(y) direction: [  0,  1,  0 ]
		// multiply each by (maximum) movement amount and percentages (how much to move in that direction)
		let currentPos = this.el.object3D.position;


		if (currentPos.z <= 98 && currentPos.z >= -40) {
			if ((time - this.lastKeypress) >= 500){
				this.movePercent.z -= 2;
			}
			else {
				this.movePercent.z += 0;
			}
			
		}
		else if(currentPos.z <= -30)
		{
			if ((time - this.lastKeypress) >= 2000){
				this.movePercent.z -= 2;
			}
			else {
				this.movePercent.z += 0;
			}
		}
		else {

			this.movePercent.z += 0;
		}
		




		this.moveVector.set( -s * this.movePercent.z + c * this.movePercent.x,
			1 * this.movePercent.y,
		   -c * this.movePercent.z - s * this.movePercent.x ).multiplyScalar( moveAmount );

		this.el.object3D.position.add( this.moveVector );	
		
		// make active key yellow 

		if (this.isKeyPressed(this.data.pKey)) {
			this.el.children.guide.children.rightControls.children.pKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color:#F2FD00;');

			this.el.children.guide.children.rightControls.children.pKey.children.pGuide.setAttribute('text', 'opacity: 1');

		}
			
		if (this.isKeyPressed(this.data.qKey)) {
			this.el.children.guide.children.leftControls.children.qKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color:#F2FD00;');

			this.el.children.guide.children.leftControls.children.qKey.children.qGuide.setAttribute('text', 'opacity: 1');
		}

		if (this.isKeyPressed(this.data.dKey)) {
			this.el.children.guide.children.leftControls.children.dKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color:#F2FD00;');

			this.el.children.guide.children.leftControls.children.dKey.children.dGuide.setAttribute('text', 'opacity: 1');
		}

		if (this.isKeyPressed(this.data.kKey)) {
			this.el.children.guide.children.rightControls.children.kKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color:#F2FD00;');

			this.el.children.guide.children.rightControls.children.kKey.children.kGuide.setAttribute('text', 'opacity: 1');
		}		

	}
});