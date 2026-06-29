type ContactNotificationProps = {
	name: string;
	email: string;
	message: string;
};

export function ContactNotification({ name, email, message }: ContactNotificationProps) {
	return (
		<html lang="en">
			<body
				style={{ fontFamily: "sans-serif", color: "#111", maxWidth: "600px", margin: "0 auto" }}
			>
				<h1 style={{ fontSize: "18px" }}>New contact message</h1>
				<p>
					<strong>Name:</strong> {name}
				</p>
				<p>
					<strong>Email:</strong> {email}
				</p>
				<p>
					<strong>Message:</strong>
				</p>
				<p style={{ whiteSpace: "pre-wrap" }}>{message}</p>
			</body>
		</html>
	);
}
