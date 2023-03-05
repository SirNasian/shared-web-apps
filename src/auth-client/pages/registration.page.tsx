import React from "react";
import { Button, Flex, PasswordInput, TextInput } from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";

import config from "../config";

interface FormData {
	email: string;
	name: string;
	password: string;
}

export const RegistrationPage = ({
	onCancel,
	onError,
	onSuccess,
}: {
	onCancel?: () => void;
	onError?: (error: Error) => void;
	onSuccess?: () => void;
}): React.ReactElement => {
	const form: UseFormReturnType<FormData> = useForm({
		initialValues: {
			email: "",
			name: "",
			password: "",
		},
		validate: {
			email: (email) => (/^\S+@\S+$/.test(email) ? null : "Invalid email"),
			name: (name) => (/^\w([\w ]+\w)?$/.test(name) ? null : "Invalid display name"),
			password: (password) => (password ? null : "Password cannot be blank"),
		},
	});

	const handleSubmit = async (data: FormData) => {
		const throwError = (message?: string) => {
			throw new Error(message);
		};
		const count = Number(
			await window
				.fetch(new URL(`/api/user/count?email=${encodeURIComponent(data.email)}`, config.API_URL).toString())
				.then((response) => response.text().then((message) => ({ status: response.status, message: message })))
				.then(({ status, message }) => (status === 200 ? message : throwError(message)))
				.catch(onError)
		);
		if (count > 0) {
			form.setErrors({ email: "This email is already taken by another user" });
			return;
		}

		await window
			.fetch(new URL("/api/user/register", config.API_URL).toString(), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			})
			.then((response) => response.status === 200 || response.text().then((message) => throwError(message)))
			.catch(onError);

		onSuccess && onSuccess();
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<TextInput label="Email" variant="filled" withAsterisk {...form.getInputProps("email")} />
			<TextInput label="Display Name" mt="xs" variant="filled" withAsterisk {...form.getInputProps("name")} />
			<PasswordInput label="Password" mt="xs" variant="filled" withAsterisk {...form.getInputProps("password")} />
			<Flex justify="space-between" mt="md">
				<Button color="dark" variant="subtle" onClick={onCancel}>
					Back
				</Button>
				<Button type="submit">Register</Button>
			</Flex>
		</form>
	);
};
