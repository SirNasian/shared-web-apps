import React from "react";
import { Button, Divider } from "@mantine/core";

export const LandingPage = ({
	onRegister,
	onSignIn,
}: {
	onRegister?: () => void;
	onSignIn?: () => void;
}): React.ReactElement => (
	<>
		<Button color="blue" fullWidth onClick={onSignIn}>
			Sign In
		</Button>
		<Divider mb="sm" mt="sm" />
		<Button color="dark" fullWidth variant="sutle" onClick={onRegister}>
			Register
		</Button>
	</>
);
