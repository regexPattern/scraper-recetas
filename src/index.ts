const form = document.getElementsByTagName("form")[0];

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const formData = new FormData(form);
	const url = formData.get("url");

	const res = await fetch(`/api/json?url=${url}`);
	const json = await res.json();

	console.log(json);
});
