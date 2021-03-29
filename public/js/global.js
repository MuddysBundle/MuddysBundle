console.log(document.getElementById("site-logo"))

document.getElementById('site-logo').onclick = () => {
	const audio = new Audio('/honk.mp3')
	audio.play()
}
