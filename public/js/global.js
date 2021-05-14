document.getElementById('nose-map').onclick = () => {
	const audio = new Audio('/honk.mp3')
	audio.play()
}

document.getElementById('site-logo').onclick = () => {
	window.location.href = '/'
}
