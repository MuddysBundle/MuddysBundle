// SELECT OR UNSELECT A MODULE WHEN THE USER CLICKS THE SELECTOR
let selectedModules = []
function toggleSelected(id) {
	const theDiv = document.getElementById(id)
	var action = ""
	if (theDiv.classList.contains("unselected") && theDiv.classList.contains("selectable")) action = "adding"
	else if (theDiv.classList.contains("selected") && theDiv.classList.contains("selectable")) action = "removing"
	else if (theDiv.classList.contains("unselected") && theDiv.classList.contains("not-selectable")) action = "failToAdd"
	if (action == "adding") {
		// the box is currently unselected and selectable; select it
		theDiv.classList.remove("unselected")
		theDiv.classList.add("selected")
		selectedModules.push(id)
	} else if (action == "removing") {
		// the box is currently selected; unselect it
		theDiv.classList.remove("selected")
		theDiv.classList.add("unselected")
		selectedModules.pop(id)
	} else if (action == "failToAdd") {
		const tryData = modulesJSON[modulesJSON.map(i => i.id).indexOf(theDiv.getAttribute("id"))] // the data of the module that could not be selected
		for (i of tryData.incompatibilities) {
			if (selectedModules.includes(i)) {
				const failData = modulesJSON[modulesJSON.map(i => i.id).indexOf(i)] // the data of the module that was preventing it from being selected, from lic - leaving incase needed later
				// create the fail toast
				const toast = document.createElement("div")
				toast.setAttribute("class", "toast incompatible-toast")
				toast.setAttribute("id", "incompatible-toast")
				toast.appendChild(document.createTextNode("Incompatible pack selected"))
				document.body.appendChild(toast)
				
				setTimeout(removeIncompatibleToast, 2000)
				function removeIncompatibleToast() {
					document.getElementById("incompatible-toast").remove()
				}
			}
		}
	}
	const incompatibilities = modulesJSON[modulesJSON.map(x => x.id).indexOf(id)].incompatibilities
	if (incompatibilities != undefined) {
		if (action == "adding") for (i of incompatibilities) {
			document.getElementById(i).classList.remove("selectable") // remove the selectable class from the element
			document.getElementById(i).classList.add("not-selectable") // add the not-selectable class to the element
		} else if (action == "removing") for (i of incompatibilities) {
			const childIncompatibilities = modulesJSON[modulesJSON.map(x => x.id).indexOf(i)].incompatibilities
			for (j of childIncompatibilities) {
				if (!selectedModules.includes(j)) {
					document.getElementById(i).classList.add("selectable") // add the selectable class to the element
					document.getElementById(i).classList.remove("not-selectable") // remove the not-selectable class from the element
				}
			}
		}
	}
}

// HIDE THE IMAGE AND SHOW THE DESCRIPTION WHEN THE USER HOVERS OVER A SELECTOR
function mouseOver() {
	document.getElementById(this.id + "Img").classList.add("invisible")
	document.getElementById(this.id + "Desc").classList.remove("invisible")
	document.getElementById(this.id + "Preview").classList.remove("invisible")
	document.getElementById("emptyPreview").classList.add("invisible")
}
function mouseOut() {
	document.getElementById(this.id + "Img").classList.remove("invisible")
	document.getElementById(this.id + "Desc").classList.add("invisible")
	document.getElementById(this.id + "Preview").classList.add("invisible")
	document.getElementById("emptyPreview").classList.remove("invisible")
}

// HANDLE THE USER PRESSING THE DOWNLOAD BUTTON
function downloadPack() {

	// stop the user downloading a pack with nothing selected
	if (selectedModules.length == 0) {
		// let the user know they can't download a pack with no modules
		alert("You can't download a pack with nothing selected.")
		// return, so the post request is not sent
		return
	}

	// warn the user if they are downloading a pack on mobile
	if (platform == "mobile") {
		// let the user know Custom is only for Java Edition
		const x = confirm("We noticed you're on mobile. Muddy's Bundle is only available for the Java Edition of Minecraft, on PC.\nAre you sure you want to continue and download a pack on mobile?")
		// return, so the request is not sent, if the user cancelled
		if (!x) return
	}

	// create the download toast
	const toast = document.createElement("div")
	toast.setAttribute("class", "toast success-toast")
	toast.setAttribute("id", "download-toast")
	toast.appendChild(document.createTextNode("Your pack is beginning to download."))
	document.body.appendChild(toast)

	const readablePlatform = platform.charAt(0).toUpperCase() + platform.slice(1)

	// send post request for pack link
	const request = new XMLHttpRequest()
	request.open("POST", "/download", false)
	request.setRequestHeader("Content-Type", "application/json")
	request.send(JSON.stringify({ "modules": selectedModules, "platform": readablePlatform }))

	// show fail toast if the response was "error"
	if (request.response == "error") {

		// delete the success toast
		const downloadToast = document.getElementById("download-toast")
		downloadToast.parentNode.remove(downloadToast)

		// create the fail toast
		const toast = document.createElement("div")
		toast.setAttribute("class", "toast fail-toast")
		toast.appendChild(document.createTextNode("There was an error downloading your pack. Please reload the page and try again. If the issue persists, please <a href='https://discord.gg/bNcZjFe'>get in touch</a>."))
		document.body.appendChild(toast)

		return // return, so the user doesnt get redirected
	}

	// download pack
	window.location.replace(request.response)

}


// DYNAMICALLY ADD MODULE SELECTORS

// function to add html pack selectors
function createModuleSelector(data) {

	if (data.hidden) return // stop if the module should be hidden

	const div = document.createElement("div")
	div.setAttribute("class", "grid-item selection-box selectable unselected pack-height")
	div.setAttribute("onclick", `javascript: toggleSelected('${data.id}')`)
	div.setAttribute("id", data.id)
	document.getElementById(data.category).appendChild(div)

	const label = document.createElement("p")
	label.setAttribute("class", "pack-label")
	label.setAttribute("id", data.id + "Label")
	label.appendChild(document.createTextNode(data.label))
	div.appendChild(label)

	let iconType = data.iconType
	if (iconType == undefined) iconType = "png"
	const icon = document.createElement("img")
	icon.setAttribute("class", "pack-icon")
	icon.setAttribute("src", `icons/${data.id}.${iconType}`)
	icon.setAttribute("id", data.id + "Img")
	icon.setAttribute("alt", data.label)
	div.appendChild(icon)

	const desc = document.createElement("p")
	if (platform == "desktop") desc.setAttribute("class", "pack-desc invisible")
	else desc.setAttribute("class", "pack-desc")
	desc.setAttribute("id", data.id + "Desc")
	desc.appendChild(document.createTextNode(data.description))
	div.appendChild(desc)

	let previewType = data.previewType
	if (previewType == undefined) previewType = "png"
	const preview = document.createElement("img")
	preview.setAttribute("class", "pack-preview invisible")
	preview.setAttribute("src", `preview/${data.id}.${previewType}`)
	preview.setAttribute("id", data.id + "Preview")
	preview.setAttribute("alt", data.label)
	div.appendChild(preview)
	document.getElementById("preview-section").appendChild(preview)

	if (platform == "desktop") {
		div.addEventListener("mouseover", mouseOver)
		div.addEventListener("mouseout", mouseOut)
	}

}

const createCategory = (data) => {

	const div = document.createElement("div")
	div.setAttribute("id", data.id)
	div.setAttribute("class", "grid-container")
	document.getElementById("pack-selector-container").appendChild(div)

	const header = document.createElement("div")
	header.setAttribute("class", "grid-item selection-box section-header unselected")
	div.appendChild(header)

	const name = document.createElement("p")
	name.appendChild(document.createTextNode(data.name))
	header.appendChild(name)

	if (data.description != undefined) {
		const description = document.createElement("p")
		description.appendChild(document.createTextNode(data.description))
		description.setAttribute("class", "section-description")
		header.appendChild(description)
		name.setAttribute("class", "section-name section-name-with-description")
	}
	else name.setAttribute("class", "section-name")

}

//  read JSON files containing data
const modulesxobj = new XMLHttpRequest()
modulesxobj.overrideMimeType("application/json")
modulesxobj.open("GET", "/api/modules", true)
modulesxobj.onreadystatechange = function () {
	if (modulesxobj.readyState == 4 && modulesxobj.status == "200") {

		const categoriesxobj = new XMLHttpRequest()
		categoriesxobj.overrideMimeType("application/json")
		categoriesxobj.open("GET", "/api/categories", true)
		categoriesxobj.onreadystatechange = function () {
			if (categoriesxobj.readyState == 4 && categoriesxobj.status == "200") {

				modulesJSON = JSON.parse(modulesxobj.responseText) // Parse JSON string into object
				categoryData = JSON.parse(categoriesxobj.responseText)

				modulesJSON.sort((a, b) => (a.label > b.label) ? 1 : -1) // alphabetically sort modules

				const categoryList = categoryData.map(i => i.id)
				let categories = {}

				for (category of categoryList) categories[category] = []

				for (index in modulesJSON) if (!modulesJSON[index].hidden) {

					if (!categoryList.includes(modulesJSON[index].category)) {
						modulesJSON[index].category = "aesthetic" // make category aesthetic if no valid category is provided
					}

					categories[modulesJSON[index].category].push(modulesJSON[index]) // add category to 
				}

				for (category of categoryData) {

					// create category
					createCategory(category)

					// add modules to category
					for (data of categories[category.id]) createModuleSelector(data)

				}

				// remove any categories that have no modules
				const filledCategories = Array.from(document.getElementById("pack-selector-container").children)
				for (category of filledCategories) if (Object.keys(category.children).length <= 1) category.remove()

			}
		}
		categoriesxobj.send(null)
	}
}
modulesxobj.send(null)

// SYSTEM TO DEAL WITH SENDING AN UPLOADED PACK
function send() {
	const form = document.getElementById("uploadForm")
	const formData = new FormData(form)
	xhr = new XMLHttpRequest()

	xhr.open("POST", "/uploadpack")
	// xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded")
	xhr.send(formData)

	xhr.onreadystatechange = () => {
		if (xhr.readyState == 4 && xhr.status == "200") {
			const response = JSON.parse(xhr.response)
			if (response.found) { // the selected modules were found successfully

				// clear modules that were manually selected by the user before pack was uploaded
				for (id of selectedModules) {
					const moduleDiv = document.getElementById(id)
					moduleDiv.classList.remove("selected")
					moduleDiv.classList.add("unselected")
				}
				selectedModules = []

				// select modules from the pack that was uploaded
				const availableModules = modulesJSON.map(x => x.id)
				for (id of response.modulesToSelect) {
					if (availableModules.includes(id)) toggleSelected(id)
				}

				// show alert saying that the pack was uploaded with success
				alert(`Your pack was uploaded with success. You can now edit your selection before downloading.\nYour previous selection has been cleared, and replaced with the following:\n\n${selectedModules.map(x => modulesJSON[availableModules.indexOf(x)].label).join("\n")}`)

			} else {
				// alert the user that the selected modules was not found
				alert("Your pack could not be read correctly.\nThis may be because it is an old download, before packs were made readable by the website.\nAre you sure you uploaded the pack properly?\nIf you have any questions, do not hesistate to get in touch.")
			}
		}
	}
}
