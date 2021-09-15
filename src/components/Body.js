import { CircularProgress, makeStyles, Typography } from "@material-ui/core";
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
		padding: th.spacing(4, 0, 0, 0),
	},
	input: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		padding: th.spacing(2, 1),
		margin: th.spacing(0, 0, 2, 0),
		border: "1px solid red",
		borderRadius: 8,
		borderColor: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
	},
}));

function createData(idx, name, type, trueCount, vadCount, result) {
	return { idx, name, type, trueCount, vadCount, result };
}

export const Body = () => {
	const classes = useStyles();

	const ipRef = React.useRef();

	const [src, setSrc] = React.useState("");
	const [files, setFiles] = React.useState([]);
	const [result, setResult] = React.useState([]);
	const [loading, setLoading] = React.useState(false);

	function handleFiles(event) {
		setFiles(event.target.files);
		console.log("files", event.target.files);
	}

	const handleProcess = async () => {
		setLoading(true);
		let resT = [];
		let correctCount = 0;
		for (let i = 0; i < files.length; i++) {
			let file = files[i];

			if (file) {
				let audioUrl = URL.createObjectURL(file);
				let fileName = file.name;
				let stim = file.name.split("_")[1];
				let cnt = parseInt(file.name.split("_")[3].split(".")[0]);
				let fileProps = { name: fileName, stim, cnt };

				if (audioUrl) {
					const op = await detectStims(audioUrl);

					if (!op) {
						break;
					}
					const { res } = op;

					// buff &&
					// 	setSrc(
					// 		URL.createObjectURL(
					// 			new Blob(
					// 				[new Uint8Array(buff, 0, buff.byteLength)],
					// 				{
					// 					type: "audio/wav",
					// 				}
					// 			)
					// 		)
					// 	);
					correctCount =
						correctCount +
						(Math.abs(res.count - fileProps.cnt) < 2 ? 1 : 0);

					let r = createData(
						i + 1,
						fileProps.name,
						fileProps.stim,
						fileProps.cnt,
						res.count,
						(correctCount / (i + 1)).toFixed(2) * 100
					);

					console.log(
						"File Count:",
						`${i} of ${files.length}`,
						"RESULT",
						r
					);
					resT = [...resT, r];
				}
			} else {
				console.log("select file first");
				alert("select file first");
				return;
			}
		}
		setResult(resT);
		setLoading(false);
	};

	return (
		<Card className={classes.root}>
			<div className={classes.input}>
				<input
					id="inputFile"
					type="file"
					accept=".wav"
					onInput={handleFiles}
					name="Select audio file"
					multiple="multiple"
				/>
			</div>
			{/* <audio ref={ipRef} id="audio1" controls src={src} /> */}
			<Button onClick={() => handleProcess(src)}>Process</Button>
			{loading && <CircularProgress color="secondary" />}
			<Typography
				variant="caption"
				color="textPrimary"
			>{`Processing ${files.length} files!`}</Typography>
			<ResTable rows={result} />
		</Card>
	);
};
