import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { Card as MuiCard } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

// We can inject some CSS into the DOM.
const styles = {
	root: {
		borderRadius: 3,
		border: 0,
		color: "white",
		boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
	},
};

const Card = (props) => {
	const { classes, children, className, ...other } = props;

	return (
		<MuiCard className={clsx(classes.root, className)} {...other}>
			{children || "Card"}
		</MuiCard>
	);
};

Card.propTypes = {
	children: PropTypes.node,
	classes: PropTypes.object.isRequired,
	className: PropTypes.string,
};

export default withStyles(styles)(Card);
