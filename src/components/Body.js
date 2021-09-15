import { makeStyles, Typography } from "@material-ui/core";
import React from "react";
import Button from "../units/buttons/Button";
import Card from "../units/surfaces/Card";
import { filter } from "../functions/filter";
import { detectStims } from "../functions/detect";
import ResTable from "./ResTable";

const useStyles = makeStyles((th) => ({
	root: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		minWidth: th.spacing(8),
	},
}));

function createData(name, type, trueCount, vadCount, result) {
	return { name, type, trueCount, vadCount, result };
}

const rows = [
	createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
	createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
	createData("Eclair", 262, 16.0, 24, 6.0),
	createData("Cupcake", 305, 3.7, 67, 4.3),
	createData("Gingerbread", 356, 16.0, 49, 3.9),
];

export const Body = () => {
	const classes = useStyles();

	const ipRef = React.useRef();

	const [src, setSrc] = React.useState("");
	const [files, setFiles] = React.useState([]);
	const [result, setResult] = React.useState([]);
	const [fileName, setFileName] = React.useState({});

	function handleFiles(event) {
		let file = event.target.files[0];
		console.log("files", event.target.files);

		file && setSrc(URL.createObjectURL(file));
		let fileName = file.name;
		let stim = file.name.split("_")[1];
		let cnt = file.name.split("_")[3].split(".")[0];
		setFileName({ name: fileName, stim, cnt });
	}

	const handleProcess = async (url) => {
		// for (let i = 0; i < )

		if (url) {
			const { wavop: buff, res } = await detectStims(url);

			console.log("buff", [new Uint8Array(buff, 0, buff.byteLength)]);
			buff &&
				setSrc(
					URL.createObjectURL(
						new Blob([new Uint8Array(buff, 0, buff.byteLength)], {
							type: "audio/wav",
						})
					)
				);
			let r = createData(
				fileName.name,
				fileName.stim,
				fileName.cnt,
				res.count,
				res.count === fileName.cnt ? "Correct" : "Wrong"
			);
			setResult([...result, r]);
		} else {
			console.log("select file first");
			alert("select file first");
		}
	};

	return (
		<Card className={classes.root}>
			<input
				id="inputFile"
				type="file"
				accept=".wav"
				onInput={handleFiles}
				name="Select audio file"
				multiple="multiple"
			/>
			<audio ref={ipRef} id="audio1" controls src={src} />
			<Button onClick={() => handleProcess(src)}>Process</Button>

			<ResTable rows={result} />
		</Card>
	);
};
