const { AudioContext, AnalyserNode } = require("standardized-audio-context");

const SAMPLE_RATE = 48000; // Hz
const SAMPLE_SIZE = 16; // bits

const initializeMedia = () => {
	if (!("mediaDevices" in navigator)) {
		navigator.mediaDevices = {};
	}

	if (!("getUserMedia" in navigator.mediaDevices)) {
		navigator.mediaDevices.getUserMedia = (constraints) => {
			var getUserMedia =
				navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

			if (!getUserMedia) {
				return Promise.reject(
					new Error("getUserMedia is not implemented")
				);
			}

			return new Promise((resolve, reject) => {
				getUserMedia.call(navigator, constraints, resolve, reject);
			});
		};
	}
};

initializeMedia();

export const getAudioInputDevices = async () => {
	const audioDevices = await navigator.mediaDevices
		.enumerateDevices()
		.then((devices) => {
			devices = devices.filter((d) => d.kind === "audioinput");
			return devices;
		})
		.catch((err) => {
			console.error("asq::recorder:: get input devices error", err);
			return null;
		});
	const audioInputStream = await getAudioInputStream(audioDevices[0]);

	let analyserNode = null;
	audioInputStream && (analyserNode = await setupContext(audioInputStream));

	return { audioDevices, audioInputStream, analyserNode };
};

export const getAudioOutputDevices = async () => {
	const audioDevices = await navigator.mediaDevices
		.enumerateDevices()
		.then((devices) => {
			devices = devices.filter((d) => d.kind === "audiooutput");
			return devices;
		})
		.catch((err) => {
			console.error("asq::recorder:: get input devices error", err);
			return null;
		});
	return audioDevices;
};

export const getAudioInputStream = async (device) => {
	const audioStream = await navigator.mediaDevices
		.getUserMedia({
			audio: {
				autoGainControl: false, //(2) [true, false]
				channelCount: 1, // {max: 2, min: 1}
				deviceId: device?.deviceId || "default",
				// groupId: null,
				echoCancellation: false, //(2) [true, false]
				latency: 0, //{max: 0.01, min: 0.01}
				noiseSuppression: false, //(2) [true, false]
				sampleRate: SAMPLE_RATE, //{max: 48000, min: 8000}
				sampleSize: SAMPLE_SIZE, //{max: 16, min: 16}
			},
			video: false,
		})
		.then((stream) => {
			return stream;
		})
		.catch((err) => {
			console.error("asq::recorder:: get input devices error", err);
			alert("Microphone access denied or browser not supported");
			return null;
		});

	return audioStream;
};

export const audioRecord = (audioStream) => {
	return new Promise((resolveRecord, rejectRecord) => {
		if (!audioStream) {
			rejectRecord("Stream not defined!");
		}

		// const options = { mimeType: "audio/webm" };
		const mediaRecorder = new MediaRecorder(audioStream);
		console.log("media recorder", mediaRecorder);

		mediaRecorder.addEventListener("error", (e) => {
			console.log("recorder Error: ", e);
		});
		mediaRecorder.addEventListener("error", (w) => {
			console.log("recorder Warning: ", w);
		});

		let recordedChunks = [];

		mediaRecorder.addEventListener("dataavailable", function (e) {
			if (e.data.size > 0) {
				recordedChunks.push(e.data);
			}
		});

		const startRecord = () => {
			recordedChunks = [];
			return new Promise((resolveStart, rejectStart) => {
				try {
					mediaRecorder.start();
					resolveStart(true);
				} catch (err) {
					console.log("recorder start fail", err);
					try {
						mediaRecorder.stop();
					} catch (error) {
						console.log("stop failed rec.js", error);
						rejectStart(false);
					}
				}
			});
		};

		const stopRecord = () => {
			return new Promise((resolveStop, rejectStop) => {
				mediaRecorder.addEventListener("stop", () => {
					const audioBlob = new Blob(recordedChunks, {
						type: mediaRecorder.mimeType,
					});

					const audioUrl = URL.createObjectURL(audioBlob);

					// const audio = new Audio(audioUrl);

					// const playAudio = () => {
					// 	return new Promise((resolvePlay, rejectPlay) => {
					// 		audio.play().catch((err) => {
					// 			console.log("recorder:: audio play fail", err);
					// 			rejectPlay(false);
					// 		});

					// 		audio.addEventListener("ended", (e) => {
					// 			resolvePlay(true);
					// 		});
					// 	});
					// };

					// const pauseAudio = () => {
					// 	audio.pause().catch((err) => {
					// 		console.log("recorder:: audio play fail", err);
					// 	});
					// };

					resolveStop({
						audioUrl,
						// audioBlob,
						// playAudio,
						// pauseAudio,
					});
				});

				try {
					mediaRecorder.stop();
				} catch (error) {
					console.log("stop failed rec.js", error);
					rejectStop(false);
				}
			});
		};

		resolveRecord({ startRecord, stopRecord });
	});
};

export const createAudioBuffer = async (audioUrl) => {
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

export const audioBufferToWaveBlob = async (audioBuffer) => {
	return new Promise(function (resolve, reject) {
		var makeWav = new Worker("./workers/wavWorker.js");

		makeWav.addEventListener("message", function (e) {
			var blob = new Blob([e.data.buffer], { type: "audio/wav" });
			resolve(blob);
		});

		let pcmArrays = [];
		if (audioBuffer) {
			// for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
			//
			// }
			pcmArrays.push(audioBuffer.getChannelData(0)); // include only one channel
		} else {
			return reject({ error: "audio blob not defined" });
		}

		makeWav.postMessage({
			pcmArrays,
			config: { sampleRate: audioBuffer.sampleRate },
		});
	});
};

export const setupContext = async (stream) => {
	const audioContext = new AudioContext();
	const analyserNode = new AnalyserNode(audioContext, {
		fftSize: 1024,
		minDecibels: -100,
		maxDecibels: 0,
		smoothingTimeConstant: 0.8,
	});

	// const stream = await getAudioInputStream();
	console.log("recorder ::context state", audioContext.state);
	if (audioContext.state === "suspended") {
		await audioContext.resume();
	}
	console.log("recorder ::context state", audioContext.state);
	const source = audioContext.createMediaStreamSource(stream);
	source.connect(analyserNode);

	return analyserNode;
};

// setupContext();
