this.addEventListener("message", (e) => {
	let inputChannel = e.data.channel;
	let fs = e.data.fs; // sampling frequency

	const engwp = 0.7;
	const thrp = 0.2;
	const minsec = 12;
	const mincnt = 4;
	const scrdp = 0.5;

	// Calculate energy
	let N = Math.round(engwp * fs);
	let n_frames = Math.floor(inputChannel.length / N);
	let max = 0;
	let energy = new Float32Array(n_frames);
	let T = new Float32Array(n_frames);

	for (let i = 0; i < n_frames; i++) {
		let slice = inputChannel.slice(i * N, (i + 1) * N);
		// let sum = slice.reduce((a, b) => a + Math.abs(b) * 2);
		let sum = slice.reduce((a, b) => a + Math.pow(b, 2));
		let mean = sum / N;
		max = mean > max ? mean : max;
		energy[i] = mean;
		T[i] = (i * N) / fs;
	}

	// Calculate threshold
	let thr = thrp * max;
	let temp = energy.map((e) => (e - thr > 0 ? 1 : -1)); // signed array
	let temp1 = temp.slice(1); // shifted array
	let temp2 = temp1.map((s, i) => temp[i] * s); // signed points

	let tint = temp2.reduce((a, s, i) => (s < 0 ? [...a, T[i]] : a), []);

	let count = Math.ceil(tint.length / 2);

	let time = (tint.length % 2 ? tint.slice(0, -1) : tint).reduce(
		(a, t, i, p) => (i % 2 ? a : [...a, p[i + 1] - t]),
		[]
	);

	let avg = time.reduce((s, t) => s + t, 0) / time.length;
	avg = isNaN(avg) ? 0 : avg.toFixed(1);

	let scoreDur = avg / minsec;
	scoreDur = scoreDur > 1 ? 1 : scoreDur;

	let scoreCnt = count / mincnt;
	scoreCnt = scoreCnt > 1 ? 1 : scoreCnt;

	let score = ((scoreDur * scrdp + scoreCnt * (1 - scrdp)) * 10).toFixed(1);

	console.log("count stims worker", count, time);

	postMessage({ count, avg, score });

	this.close();
});
