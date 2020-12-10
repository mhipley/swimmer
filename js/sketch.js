
//component to control environment
AFRAME.registerComponent('env-controls', {
	schema: {

	},

	scaleValue: function(inputZ, xMin, xMax) {
		percent = (inputZ - 100) / (0 - 100);
		outputX = percent * (xMax - xMin) + xMin;
		if (outputX >= 0) {
			return outputX;
		}
		else {
			return 0;
		}
		
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

		// ambient start intensity : 1
		// sky start : hsl(186, 100%, 80%)

		// ambient end : .75
		// sky end: hsl(360, 100%, 80%)
		
		skyColorChange = this.scaleValue(swimPos.z, 186, 360);
		skyColor = 'hsl(' + Math.round(skyColorChange) + ',100%,80%)';
		sky.setAttribute('color', skyColor);

		// sunColorChange = this.scaleValue(swimPos.z, 0, 10);
		// sunColor = 'hsl(' + Math.round(sunColorChange) + ',100%,100%)';
		// sunLight.setAttribute('color', sunColor);

		sunPosY = this.scaleValue(swimPos.z, 220, 0);
		sun.object3D.position.y = sunPosY;

		ambientIntensity = this.scaleValue(swimPos.z, 1, .75);
		ambient.setAttribute('intensity', ambientIntensity);


			

		// waveDens = Math.round(this.scaleValue(swimPos.z, 100, -30, 400, 50));
		// waves.setAttribute('density', waveDens);


	}
});

//component for camera control
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

	loopCallback: function(bpm) {
	},

	addBeat: function(time) {
		if (!this.isDone)
			this.countBeat(time);
		return true;
	},
	countBeat: function(time) {
		if (this.lastXBeats.length >= 8) {
			this.lastXBeats.shift();
			
			
		}
		
		// var x = this.last10beats.length;
		// var y = time - this.last10beats[0];
		this.lastXBeats.push(time);

		var arr = this.lastXBeats;

		var result = arr.reduce(function(acc, element, index, array) {
			acc.sum += element - acc.prev;
			index && acc.array.push((element - acc.prev).toFixed(3));
			acc.prev = element;
			return acc;
		}, {array:[], sum: 0, prev: arr[0]});
		
	
		var avgMs = (result.sum / result.array.length).toFixed(0);
		var swimBpm = Math.round(120000/avgMs);

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
		this.lastXBeats = [0];
		this.isDone = false;
		this.hasStarted = false;
		this.lastKeypress = null;
		this.swimBpm = 60;
		this.minBpm = 60;
		this.maxBpm = 300;

		////
		// TONE JS SETUP
		////

		var startBpm = 80;
		let waveVol = -15;
		let chordVol = -12;
		let drumVol = -10;
		let bassVol = -15;
		let melVol = -20;
		let leadVol = -15;

		// sequence notation

		var melody = [
			'A#4',  'F5', null, null,  
			 null, ['G#5', 'F#5'], 'F5', 'C#5', 
			'D#5', 'G#4', null,  null, 
			null, 'C5',  ['C#5', 'C5'], 'A#4'
		]

		var bass = [
			'C#4', 'A#3', 'A#3', 'A#3', 'A#3', 'C#4', ['C#4', 'D#4'], 'A#3',
			'C4', 'G#3', 'G#3', 'G#3', 'G#3', 'C4', ['C4', 'D#4'], 'G#3'
		]

		var kicks = [
			"C1", null, null, "C1", "C1", null, null, null
		]

		var overlay = [
			'D#3', 'G#4', 'A#4'
		]

		// options and effects

		const drumSynthOptions = {
			pitchDecay: 0.05,
			octaves: 10,
			oscillator: {
				type: "sine"
			},
			envelope: {
				attack: 0.001,
				decay: 0.4,
				sustain: 0.1,
				release: 2.4,
				attackCurve: "exponential"
			}
		}

		var melodyFil = new Tone.Filter(200, "lowpass");

		// background waves
		const waveSample = new Tone.Player({
			"url" : "samples/waves.wav",
			"autostart" : true,
			"loop" : true
		}).toDestination();
		waveSample.volume.value = waveVol;

		// spooky synth for melody
		const melodySynth = new Tone.MonoSynth({
			oscillator: {
				type: "square"
			},
			envelope: {
				attack: 0.1
			},
			filter: {
				type: "lowpass"
			}
		}).toDestination();
		melodySynth.volume.value = melVol;

		// marimba
		const marimbaSynth = new Tone.Sampler({
			urls: {
				C4: "samples/marimba-C.wav"
			}
		}).toDestination();
		marimbaSynth.volume.value = bassVol;
		marimbaSynth.connect(melodyFil);

		const buzzySynth = new Tone.Synth({
			oscillator: {
			  type: 'sawtooth',
		  
			},
			envelope: {
			  attack: 0.1,
			  decay: 0.5,
			  sustain: 1,
			  release: 0.1
			},
			filter: {
				type: "lowpass"
			}
		  }).toDestination();
		buzzySynth.volume.value = -18;

		// tambourine
		const tamboSample = new Tone.Sampler({
			urls: {
				C4: "samples/tambourine4.wav"
			}
		}).toDestination();
		tamboSample.volume.value = -5;

		// wave drum
		const waveDrumSample = new Tone.Sampler({
			urls: {
				C4: "samples/wavedrum1.wav"
			}
		}).toDestination();
		waveDrumSample.volume.value = -10;

		// polysynth for chords
		const chordSynth = new Tone.PolySynth().toDestination();
		chordSynth.volume.value = chordVol;

		// kick drum
		const kickSynth = new Tone.MembraneSynth(drumSynthOptions).toDestination();
		kickSynth.volume.value = drumVol;

		const melodySeq = new Tone.Sequence((time, note) => {
			melodySynth.triggerAttackRelease(note, "8n", time);
		}, melody);		

		const bassSeq = new Tone.Sequence((time, note) => {
			marimbaSynth.triggerAttackRelease(note, "8n", time);
		}, bass);

		const buzzySeq = new Tone.Sequence((time, note) => {
			buzzySynth.triggerAttackRelease(note, "16n", time);
		}, overlay);

		const kickDrumSeq = new Tone.Sequence((time, note) => {
			kickSynth.triggerAttackRelease(note, '10hz', time);
		}, kicks, "8n");

		const chordSeq = new Tone.Sequence(
			(time, note) => {
			  const chordLookup = {
				chordA: {
				  notes: ['C#4', 'F4', 'A#4'],
				  time: '2n',
				},
				
				chordB: {
					notes: ['A#3','C#4', 'F4', 'A#4'],
					time: '2n',
					
				},
				chordC: {
				  notes: ['G#4', 'C4', 'D#4'],
				  time: '1m',
				},
			  }
		
			  chordSynth.triggerAttackRelease(
				chordLookup[note].notes,
				chordLookup[note].time,
				time
			  )
			},
			['chordA', 'chordB', 'chordC', null],
			'2n'
		  );


		// initial Tone.Transport settings
		Tone.Transport.bpm.value = startBpm;
		Tone.Transport.timeSignature = 4;

		// trigger swim 
		function startSwim() {
			if (Tone.context.state !== 'running') {
				Tone.context.resume();
			}
			Tone.Transport.start();
			kickDrumSeq.start(0);
			melodySeq.start("10m");
			chordSeq.start("4m");
			bassSeq.start("6m");
			buzzySeq.start("2m");
		}

		let self = this;

		self.moveVector  = new THREE.Vector3(0,0,0);
		self.movePercent = new THREE.Vector3(0,0,0);

		self.rotateVector  = new THREE.Vector2(0,0);
		self.rotatePercent = new THREE.Vector2(0,0);

		// used as reference vector when turning
		self.upVector = new THREE.Vector3(0,1,0);

		// current rotation amounts
		self.turnAngle = 0; // around global Y axis

		document.addEventListener( "keydown", 
		function(eventData) 
			{ 


				// register key down for highlight UI
				self.registerKeyDown( self.convertKeyName(eventData.key) );
				// register time of last keypress for decay
				self.lastKeypress = eventData.timeStamp;


				var tPos = Tone.Transport.position;
				var tArr = tPos.split(":");
				var numArr = tArr.map(Number);
				var nextMeasure = numArr[0] + 1;
				var nextStr = "" + nextMeasure + "m";
				var stopStr = "" + nextMeasure + 1 + "m";

				//toggle tutorial
				if (eventData.keyCode === 84 ) {
					if (self.el.children.guide.getAttribute('visible') === true) {
						self.el.children.guide.setAttribute('visible', false);
					}
					else {
						self.el.children.guide.setAttribute('visible', true);
					}
					
				}

				if (eventData.keyCode === 82) {
					location.reload();
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

				if (self.hasStarted === true ){
					if (eventData.keyCode === 80) {

						tamboSample.triggerAttackRelease(["C4"]);
	
					}
					if (eventData.keyCode === 81) {
	
						waveDrumSample.triggerAttackRelease(["C4"]);
	
					}	
				}
		
			
			});

		document.addEventListener( "keyup", 
			function(eventData) 
			{ 
				
				// self.rotatePercent.set(0,0);

				// register keyup for removing UI highlight?
				self.registerKeyUp( self.convertKeyName(eventData.key) );

			

				self.movePercent.set(0,0,0);
				let currentPos = self.el.object3D.position;

				if (self.hasStarted === true)
				{

					if (currentPos.z >= 0) {
								
						if (eventData.keyCode === 68 | eventData.keyCode === 75) {
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
						var animeString1 = 'dir: alternate; property: rotation; to: 0 5 0; dur: 600; easing: linear; loop: 2; '; 

					}
					//68 = d
					if (eventData.keyCode === 68) {
	
						self.el.children.guide.children.leftControls.children.dKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color: #4F3266;');
						self.el.children.guide.children.leftControls.children.dKey.children.dGuide.setAttribute('text', 'opacity:0');
						self.addBeat(eventData.timeStamp);
						var animeString1 = 'dir: alternate; property: rotation; to: 0 -5 0; dur: 600; easing: linear; loop: 2; '; 

					}				
	
					//81 = q
					if (eventData.keyCode === 81) {
						self.el.children.guide.children.leftControls.children.qKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color: #4F3266;');
						self.el.children.guide.children.leftControls.
						children.qKey.children.qGuide.setAttribute('text', 'opacity:0');
						var animeString = 'property: rotation; to: 0 15 -5; dur: 400; easing: linear; loop: 2; dir: alternate';
						var animeString1 = '';
						// self.addBeat(eventData.timeStamp);

					}
	
					//80 = p
					if (eventData.keyCode === 80) {
						self.el.children.guide.children.rightControls.children.pKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color: #4F3266;');
						self.el.children.guide.children.rightControls.children.pKey.children.pGuide.setAttribute('text', 'opacity:0');
						var animeString = 'property: rotation; to: 0 -15 5; dur: 400; easing: linear; loop: 2; dir: alternate';
						var animeString1 = '';
						// self.addBeat(eventData.timeStamp);

					}
	
					self.el.removeAttribute('animation');
					self.el.removeAttribute('animation__1');
					self.el.setAttribute('animation', animeString);
					self.el.setAttribute('animation__1', animeString1);

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


		// decay position if idle over a threshold
		if (currentPos.z < 98 && currentPos.z > 0) {
			if ((time - this.lastKeypress) >= 500){
				this.movePercent.z -= 2;
			}
			else {
				this.movePercent.z += 0;
			}		
		}
		else if(currentPos.z <= 0)
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
			this.el.object3D.position.z = 98;
		}

		//ramp down tempo if idle over a threshold
		if ((time - this.lastKeypress) >= 500){

			if (this.swimBpm <= this.minBpm) {
				this.swimBpm = this.minBpm;
			}
			else if (this.swimBpm >= this.minBpm) {
			
				this.swimBpm -= 1;
			}

			Tone.Transport.bpm.rampTo(this.swimBpm, '1n');
		}

		// gallery mode: reset game if idle for more than 10 seconds
		if ((time - this.lastKeypress) >= 20000 && this.hasStarted === true) {
			location.reload();
		}
		
		// scale the motion
		this.moveVector.set( -s * this.movePercent.z + c * this.movePercent.x,
			1 * this.movePercent.y,
		   -c * this.movePercent.z - s * this.movePercent.x ).multiplyScalar( moveAmount );

		// add the new movement to the current position
		this.el.object3D.position.add( this.moveVector );	

		if (this.hasStarted === true ){
		// highlight the active key
		if (this.isKeyPressed(this.data.pKey)) {
			this.el.children.guide.children.rightControls.children.pKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color:#FFF;');

			this.el.children.guide.children.rightControls.children.pKey.children.pGuide.setAttribute('text', 'opacity: 1');

		}
			
		if (this.isKeyPressed(this.data.qKey)) {
			this.el.children.guide.children.leftControls.children.qKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color:#FFF;');

			this.el.children.guide.children.leftControls.children.qKey.children.qGuide.setAttribute('text', 'opacity: 1');
		}

		if (this.isKeyPressed(this.data.dKey)) {
			this.el.children.guide.children.leftControls.children.dKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color:#FFF;');

			this.el.children.guide.children.leftControls.children.dKey.children.dGuide.setAttribute('text', 'opacity: 1');
		}

		if (this.isKeyPressed(this.data.kKey)) {
			this.el.children.guide.children.rightControls.children.kKey.setAttribute('material', 'src: #key; transparent: false; alphaTest: .5; color:#FFF;');

			this.el.children.guide.children.rightControls.children.kKey.children.kGuide.setAttribute('text', 'opacity: 1');
		}	
		}
		
	

	}
});
