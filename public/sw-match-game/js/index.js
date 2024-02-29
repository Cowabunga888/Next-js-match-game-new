import { confettiSoundPlay, shootConfetties } from './confetti.js'
import { losingModalCotent, winningModalCotent } from './modal.js'

const winningContent = winningModalCotent()
const losingContent = losingModalCotent()

let initImageListData = null
let selectCardElSound = null
const confettiSound = './assets/sound/confetties_sound.mp3'
const selectCardSound = './assets/sound/select_sound.mp3'
// You can use the data returned by these functions as needed.

///=========================
///Next js - index.js comunicator
document.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded')
	initSound()

	const onMessageListener = (event) => {
		if (event?.data?.messageType === 'NEXT_JS_MESSAGE') {
			console.log('index js log: ', event?.data)
			initImageListData = event?.data?.data?.imageList?.map((item) => item?.img)
			initGame()
		}
	}

	window.addEventListener('message', onMessageListener, false)
})

function sendMessage(message) {
	return window.parent.postMessage(message)
}
///==========================
let timerInterval
let playTime = 2 // => 0.5 = 30s
let endGame = false
const gameElement = document.querySelector('#flip-card-game')

const emojis = [
	'🍕',
	'🍕',
	'🍔',
	'🍔',
	// '🍖',
	// '🍖',
	// '🍧',
	// '🍧',
	// '🍩',
	// '🍩',
	// '🎄',
	// '🎄',
	// '🎃',
	// '🎃',
	// '💎',
	// '💎',
	// '⏰',
	// '⏰',
	// '🚀',
	// '🚀',
]

const initGame = () => {
	let ImageListData = initImageListData?.length > 0 ? initImageListData : emojis
	gameElement.innerHTML = ''
	document.querySelector('#reset-btn').addEventListener('click', restartGame)

	let shuf_images = ImageListData.toSorted(() => {
		//create a random number from 0 to 1.
		//if number more than 0.5, this func return 2, else -1
		return Math.random() > 0.5 ? 2 : -1
	})

	return ImageListData.map((_, i) => {
		let card = document.createElement('div')
		let cardInner = document.createElement('div')
		let cardFront = document.createElement('div')
		let cardBack = document.createElement('div')

		card.className = 'card'
		card.classList.add('card--foo')
		cardInner.className = 'card--inner'
		cardFront.className = 'card--front'
		cardBack.className = 'card--back'

		card.appendChild(cardInner)
		cardInner.appendChild(cardFront)
		cardInner.appendChild(cardBack)

		cardFront.innerHTML = '🎈'
		cardBack.innerHTML = shuf_images[i]

		card.setAttribute('id', 'card_no.' + i)

		card.onclick = () => {
			if (endGame) return

			if (selectCardElSound) {
				selectCardElSound?.play()
			}

			// close card if double clicked
			if (card.classList.value.includes('card--opened')) {
				card.classList.remove('card--opened')
				return
			}

			// open card if first time clicked
			card.classList.add('card--opened')

			// get list card opened
			let opendItems = document.querySelectorAll('.card--opened')

			// compair 2 opened items in list
			if (opendItems?.length >= 2) {
				setTimeout(() => {
					if (opendItems[0].innerHTML === opendItems[1].innerHTML) {
						opendItems[0].classList.add('card--match')
						opendItems[1].classList.add('card--match')
						opendItems[0].classList.remove('card--opened')
						opendItems[1].classList.remove('card--opened')

						if (document.querySelectorAll('.card--match')?.length === ImageListData.length) {
							onWinning()
						}
					} else {
						opendItems[0].classList.remove('card--opened')
						opendItems[1].classList.remove('card--opened')
					}
				}, 500)
			}
		}

		gameElement.appendChild(card)
		if (i === ImageListData.length - 1) {
			setTimeout(() => {
				initTimer(playTime)
			}, 2000)
		}
		return null
	})
}
const onWinning = () => {
	endGame = true
	setTimeout(shootConfetties, 100)
	confettiSoundPlay()
	setTimeout(() => {
		// alert('You Win')
		console.log(winningContent)
		sendMessage(winningContent)
	}, 500)
}
const onLosing = () => {
	endGame = true
	setTimeout(() => {
		// alert('You Lose')
		sendMessage(losingContent)
	}, 500)
}
const restartGame = () => {
	clearInterval(timerInterval)
	endGame = false
	initGame()
}

const initTimer = (defaultMinutes) => {
	if (defaultMinutes > 60) return

	let minuteElement = document.getElementById('minute')
	let secondElement = document.getElementById('second')

	let minutes = Math.floor(defaultMinutes)
	let seconds = (defaultMinutes - minutes) * 60
	let totalSeconds = minutes * 60 + seconds

	const handleSetInnerTimer = (min, sec) => {
		minuteElement.innerHTML = min < 10 ? '0' + min : min
		secondElement.innerHTML = sec < 10 ? '0' + sec : sec
	}

	handleSetInnerTimer(minutes, seconds)

	const updateTimer = () => {
		if (endGame) {
			clearInterval(timerInterval)
			return
		}
		if (totalSeconds > 0) {
			const min = Math.floor(totalSeconds / 60)
			const sec = totalSeconds % 60
			handleSetInnerTimer(min, sec)
			totalSeconds--
		} else {
			endGame = true
			handleSetInnerTimer(0, 0)
			clearInterval(timerInterval)
			onLosing()
		}
	}

	// Update the timer every second
	clearInterval(timerInterval)
	timerInterval = setInterval(updateTimer, 1000)
}

const initSound = () => {
	document.getElementById('sound-container').innerHTML = `
	<audio src="${confettiSound}" id="confetti-sound" type="audio/mpeg" ></audio>
	<audio src="${selectCardSound}" id="select-card-sound" type="audio/mpeg" ></audio>
	`

	selectCardElSound = document.getElementById('select-card-sound')
}

// initGame()
