this.addEventListener("message", (e) => {
	let inputChannel = e.data.channels[0];
	let fs = e.data.fs;

	let N = Math.round(0.9 * fs);
	let n_frames = Math.floor(inputChannel.length / N);
	let energy = new Float32Array(Math.floor(n_frames));
	for (let i = 0; i < n_frames; i++) {
		let slice = inputChannel.slice(i * N, i * N + N);
		let sum = slice.reduce((a, b) => a + Math.abs(b) * 2);
		let mean = sum / N;
		energy[i] = mean;
	}
	let max = Math.max(...energy.map((e) => e));
	let thr = 0.2 * max;
	let temp = energy.map((e) => (e - thr > 0 ? 1 : -1));
	let temp1 = temp.slice(1);
	let temp2 = temp1.map((s, i) => temp[i] * s);
	let count = temp2.filter((s) => s < 0).length / 2;
	count = Math.ceil(count);
	console.log("count stims", count);

	postMessage({ count });

	this.close();
});
