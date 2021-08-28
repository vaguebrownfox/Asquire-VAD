import { makeStyles } from "@material-ui/core";
import React from "react";
import Button from "../units/buttons/Button";
import Card from "../units/surfaces/Card";
import { filter } from "../functions/filter";

const useStyles = makeStyles((th) => ({
	root: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		minWidth: th.spacing(8),
	},
}));

export const Body = () => {
	const classes = useStyles();

	const ipRef = React.useRef();

	const [src, setSrc] = React.useState("");

	function handleFiles(event) {
		console.log("input", ipRef.current);
		let file = event.target.files[0];
		file && setSrc(URL.createObjectURL(file));
	}

	const handleProcess = async (url) => {
		const buff = await filter(url);
		console.log("buff", [new Uint8Array(buff, 0, buff.byteLength)]);
		buff &&
			setSrc(
				URL.createObjectURL(
					new Blob([new Uint8Array(buff, 0, buff.byteLength)], {
						type: "audio/wav",
					})
				)
			);
	};

	return (
		<Card className={classes.root}>
			<input
				type="file"
				accept=".wav"
				onInput={handleFiles}
				name="Select audio file"
			/>
			<audio ref={ipRef} id="audio1" controls src={src} />
			<Button onClick={() => handleProcess(src)}>Process</Button>
		</Card>
	);
};
