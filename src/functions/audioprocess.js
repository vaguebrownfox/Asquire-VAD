// instigate our audio context ~~~~~~~~~~~~~~~ 1
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// fetch the audio file and decode the data
async function getFile(audioContext, filepath) {
	const response = await fetch(filepath);
	const arrayBuffer = await response.arrayBuffer();
	const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
	return audioBuffer;
}
// create a buffer, plop in data, connect and play -> modify graph here if required
function playSourceNode(audioContext, audioBuffer) {
	const soundSource = audioContext.createBufferSource();
	soundSource.buffer = audioBuffer;
	soundSource.connect(audioContext.destination);
	soundSource.start();
	return soundSource;
}

async function setupSample() {
	const filePath = "outfoxing.mp3";
	// Here we're `await`ing the async/promise that is `getFile`.
	// To be able to use this keyword we need to be within an `async` function
	let sample = await getFile(audioCtx, filePath);
	return sample;
}
