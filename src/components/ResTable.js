import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles({
	table: {
		minWidth: 650,
	},
	audio: {
		transform: `scale(0.7)`,
	},
});

export default function ResTable({ rows }) {
	const classes = useStyles();

	return (
		<TableContainer component={Paper}>
			<Table className={classes.table} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Sl.no</TableCell>
						<TableCell>Filename</TableCell>
						<TableCell align="right">Audio Url</TableCell>
						<TableCell align="right">Stim Type</TableCell>
						<TableCell align="right">True count</TableCell>
						<TableCell align="right">VAD count</TableCell>
						<TableCell align="right">Accumulated Result</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{rows.map((row, i) => (
						<TableRow key={row.name}>
							<TableCell scope="row">{row.idx}</TableCell>
							<TableCell scope="row">{row.name}</TableCell>
							<TableCell align="right">
								<audio
									className={classes.audio}
									id={`${i}_${row.name}`}
									src={row.audioUrl}
									controls
								/>
							</TableCell>
							<TableCell align="right">{row.type}</TableCell>
							<TableCell align="right">{row.trueCount}</TableCell>
							<TableCell align="right">{row.vadCount}</TableCell>
							<TableCell align="right">{row.result}%</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
