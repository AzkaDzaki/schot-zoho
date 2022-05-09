<template>
	<v-container class="about">
		<div>
			<h1>Upload Document</h1>
			<br />
			<v-file-input
				label="File input"
				outlined
				type="file"
				id="file"
				ref="file"
				dense
				v-on:change="onChangeFileUpload()"
			></v-file-input>
			<div class="d-block mx-auto">
				<v-btn color="indigo" class="d-block mx-auto" v-on:click="submitForm()"
					>Upload</v-btn
				>
			</div>
		</div>
	</v-container>
</template>

<script>
	import { createDocuments } from "@/firebase";
	import axios from "../plugins/axios";
	import moment from "moment";
	import router from "../router/index";

	export default {
		data: () => ({
			data: "",
			file: "",
			currentTime: moment(),
		}),
		methods: {
			async submitForm() {
				const form = new FormData();
				form.append("apikey", "775496a72e37908527d83f710d1abbcd");
				form.append(
					"callback_settings",
					'{"save_format": "zdoc","save_url": "https://domain.com/save.php",}'
				);
				form.append(
					"document_defaults",
					'{"font_size":"12","font_name":"Roboto","orientation":"portrait","paper_size":"A4","track_changes":"enabled","margin":{"left":"1.5in","right":"1.5in","top":"0.25in","bottom":"0.25in"}}'
				);
				form.append(
					"editor_settings",
					'{"unit":"in","language":"en","view":"webview"}'
				);
				form.append(
					"permissions",
					'{"document.export":true,"document.print":true,"document.edit":true,"review.changes.resolve":false,"review.comment":true,"collab.chat":true,"document.pausecollaboration":false,"document.fill":true }'
				);
				form.append("user_info", '{"user_id": "9173", "display_name": "Ken" }');
				form.append(
					"ui_options",
					'{"save_button": "show", "chat_panel": "show", "dark_mode": "hide", file_menu: "show" }'
				);
				form.append("document", this.file);

				await axios
					.post(`http://localhost:8080/writer/officeapi/v1/documents`, form, {
						"content-type":
							"multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
					})
					.then((response) => {
						console.log(response);
						this.data = response.data;
						this.openDocument(this.data);
						this.submitFirebase(this.data);
					})
					.catch((error) => console.log(error));
			},

			async submitFirebase(data) {
				const payload = {
					document_delete_url: data.document_delete_url,
					document_id: data.document_id,
					document_name: this.file.name,
					document_url: data.document_url,
					save_url: data.save_url,
					session_delete_url: data.session_delete_url,
					session_id: data.session_id,
					created_at: this.currentTime.format("MMMM Do YYYY, HH:mm"),
					available_until: this.currentTime
						.add(6, "hours")
						.format("MMMM Do YYYY, HH:mm"),
				};
				console.log(payload);
				await createDocuments({ ...payload });
				router.push("/");
			},

			openDocument(value) {
				console.log(value.document_url);
				window.open(`${value.document_url}`);
			},
			onChangeFileUpload() {
				this.file = this.$refs.file.files[0];
				console.log(this.file.name);
			},
		},
	};
</script>

<style lang="scss" scoped>
	.about {
		max-width: 500px;
	}
</style>
