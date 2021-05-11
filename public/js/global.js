console.log(document.getElementById("nose-map"))

document.getElementById('nose-map').onclick = () => {
	const audio = new Audio('/honk.mp3')
	audio.play()
}

console.log(document.getElementById('nose-map').onclick)
