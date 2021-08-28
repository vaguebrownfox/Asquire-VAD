const {
	OfflineAudioContext,
	AudioContext,
} = require("standardized-audio-context");
var toWav = require("audiobuffer-to-wav");

export const filter = async (audioUrl) => {
	const audioBuffer = await createAudioBuffer(audioUrl);

	let ctx = new OfflineAudioContext(
		audioBuffer.numberOfChannels,
		audioBuffer.length,
		audioBuffer.sampleRate
	);

	// Source
	let source = ctx.createBufferSource();
	source.buffer = audioBuffer;

	// const gainNode = ctx.createGain();
	// gainNode.gain.value = 1.2; // setting it to 10%
	// source.connect(gainNode);
	// gainNode.connect(ctx.destination);

	let filterNode = ctx.createBiquadFilter();
	filterNode.type = "bandpass";
	filterNode.frequency.value = 555;
	filterNode.Q.value = 50;

	source.connect(filterNode);
	filterNode.connect(ctx.destination);

	source.start(0);
	let outputAudioBuffer = await ctx.startRendering();

	// count stims
	let channels = [];
	for (let i = 0; i < outputAudioBuffer.numberOfChannels; i++) {
		channels[i] = new Float32Array(audioBuffer.getChannelData(i));
	}
	const res = await countStims(channels, outputAudioBuffer.sampleRate);
	console.log("filter res count", res);

	let wavop = toWav(outputAudioBuffer);
	return wavop;
};

const createAudioBuffer = async (audioUrl) => {
	const arrayBuffer = await (await fetch(audioUrl)).arrayBuffer();

	let audioBuffer = null;

	try {
		audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer);
	} catch (e) {
		alert(
			`Sorry, your browser doesn't support a crucial feature needed to allow you to record using your device's microphone. You should use Chrome or Firefox if you want the best audio support, and ensure you're using the *latest version* your browser of choice.`
		);
	}

	return audioBuffer;
};

const countStims = (channels, fs) =>
	new Promise((resolve, reject) => {
		var changeSpeed = new Worker("./workers/countstims.js");

		changeSpeed.addEventListener("message", (e) => {
			resolve(e.data);
		});

		changeSpeed.postMessage({ channels, fs });
	});
