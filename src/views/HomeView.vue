<template>
	<v-container>
		<div>
			<v-btn color="indigo" class="mr-4" @click="dialog = true"
				>Create Document</v-btn
			>
			<v-btn color="warning" @click="uploadDocument">Upload Document</v-btn>
		</div>
		<div class="mt-10">
			<v-row>
				<v-col cols="12" md="4" v-for="item in documentList" :key="item">
					<v-card class="pa-4" elevation="3">
						<div @click="openDocument(item)">
							<v-img
								:src="require('../assets/docs.png')"
								class="my-3"
								contain
								height="80"
							/>
							<h4 class="mt-2">
								{{ item.document_name }}
							</h4>
							<p>
								Due: {{ item.available_until ? item.available_until : "-" }} WIB
							</p>
						</div>
						<v-card-actions>
							<v-btn depressed color="indigo" @click="openDocument(item)">
								OPEN
							</v-btn>
							<v-spacer></v-spacer>
							<v-btn @click="onDelete(item.id, item.document_id)"
								><v-icon color="red"> mdi-delete</v-icon>
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-col>
			</v-row>
		</div>
		<!-- DIALOG -->
		<v-dialog v-model="dialog" width="500">
			<v-card width="500" class="px-4 py-4">
				<p>Document Name</p>
				<v-text-field
					label="Document Name"
					placeholder="Document Name"
					v-model="documentName"
					outlined
				></v-text-field>

				<v-divider></v-divider>

				<v-card-actions>
					<v-btn color="danger" text @click="dialog = false"> Close </v-btn>

					<v-spacer></v-spacer>
					<v-btn color="primary" text @click="createDocument"> Submit </v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
</template>

<script>
	import {
		useLoadDocuments,
		createDocuments,
		deleteDocument,
	} from "@/firebase";
	import { computed, ref, onMounted } from "vue";
	import router from "../router/index";
	import axios from "../plugins/axios";
	import moment from "moment";

	export default {
		setup() {
			const documents = useLoadDocuments();
			const data = ref();
			const dialog = ref(false);
			const documentName = ref("");
			const documentList = computed(() => {
				return JSON.parse(JSON.stringify(documents.value));
			});
			const currentTime = ref(moment());

			onMounted(() => {
				console.log(currentTime.value.format("MMMM Do YYYY, HH:mm"));
			});

			async function createDocument() {
				// const payload = {
				// 	apikey: "775496a72e37908527d83f710d1abbcd",
				// 	callback_settings: [
				// 		{
				// 			save_format: "zdoc",
				// 			save_url: "https://domain.com/save.php",
				// 		},
				// 	],
				// 	document_defaults: {
				// 		font_size: "12",
				// 		font_name: "Roboto",
				// 		orientation: "portrait",
				// 		paper_size: "A4",
				// 		track_changes: "disabled",
				// 		margin: {
				// 			left: "1.5in",
				// 			right: "1.5in",
				// 			top: "0.25in",
				// 			bottom: "0.25in",
				// 		},
				// 	},
				// 	editor_settings: { unit: "in", language: "en", view: "webview" },
				// 	document_info: { document_name: "New Docs", document_id: 1 },
				// 	user_info: { user_id: "9173", display_name: "Ken" },
				// 	ui_options: {
				// 		save_button: "show",
				// 		chat_panel: "show",
				// 		dark_mode: "hide",
				// 		file_menu: "show",
				// 	},
				// };
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
					"document_info",
					`{"document_name":"${documentName.value}"}`
				);
				form.append(
					"permissions",
					'{"document.export":true,"document.print":true,"document.edit":true,"review.changes.resolve":true,"review.comment":true,"collab.chat":true,"document.pausecollaboration":true,"document.fill":true }'
				);
				form.append("user_info", '{"user_id": "9173", "display_name": "Ken" }');
				form.append(
					"ui_options",
					'{"save_button": "show", "chat_panel": "show", "dark_mode": "hide", file_menu: "show" }'
				);

				await axios
					.post(
						`https://api.office-integrator.com/writer/officeapi/v1/documents`,
						form,
						{
							"content-type":
								"multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
						}
					)
					.then((response) => {
						console.log(response);
						data.value = response.data;
						openDocument(data.value);
						submitFirebase(data.value);
					})
					.catch((error) => console.log(error));
			}

			const submitFirebase = async (data) => {
				const payload = {
					document_delete_url: data.document_delete_url,
					document_id: data.document_id,
					document_name: documentName.value,
					document_url: data.document_url,
					save_url: data.save_url,
					session_delete_url: data.session_delete_url,
					session_id: data.session_id,
					created_at: currentTime.value.format("MMMM Do YYYY, HH:mm"),
					available_until: currentTime.value
						.add(6, "hours")
						.format("MMMM Do YYYY, HH:mm"),
				};
				console.log(payload);
				await createDocuments({ ...payload });
				documentName.value = "";
				dialog.value = false;
				router.push("/");
			};

			function openDocument(value) {
				console.log(value.document_url);
				window.open(`${value.document_url}`);
			}

			async function onDelete(value, doc_id) {
				console.log(value);
				await axios
					.delete(
						`https://api.office-integrator.com/writer/officeapi/v1/documents/${doc_id}?apikey=775496a72e37908527d83f710d1abbcd`,
						{
							"content-type":
								"multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
						}
					)
					.then((response) => {
						console.log(response);
					})
					.catch((error) => console.log(error));
				await deleteDocument(value);
			}

			function uploadDocument() {
				router.push("/about");
			}

			return {
				dialog,
				documentName,
				documentList,
				openDocument,
				createDocument,
				onDelete,
				submitFirebase,
				uploadDocument,
			};
		},
	};
</script>

<style lang="scss" scoped>
	p {
		font-size: 14px;
		color: gray;
	}
</style>
