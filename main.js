console.log("Started");
import p5 from 'https://cdn.skypack.dev/p5';
console.log("Imported P5");

let scaleFactor;
let hedgehog, balloon;
let score = 0;
let NEWROUND = true;
let hedgehogImg;

const sketch = p => {
	let hhimg = p.preload = () => {
		hedgehogImg = p.loadImage('hedgehog.png');  // Load the image
	}

	p.setup = () => {
		p.createCanvas(500, 500);
		let sketchCanvas = document.querySelector('canvas');
		adjustScale(sketchCanvas); // Adjust scale based on the current window size
		window.addEventListener('resize', () => adjustScale(sketchCanvas)); // Adjust scale when window is resized
		p.rect(0, 0, p.width, 20); // TODO draw the ground
		hedgehog = new Hedgehog(hedgehogImg);
		balloon = new Balloon();
		NEWROUND = true;
	}
	function adjustScale(canvas) {
		scaleFactor = Math.min(window.innerWidth / 500, window.innerHeight / 500);
		console.log(scaleFactor);
		document.body.style.setProperty('--scale-factor', scaleFactor);
	}

	p.draw = () => {
		p.background(220);
		drawGround();
		hedgehog.update();
		hedgehog.show();

		balloon.update();
		balloon.show();

		showScore();

		checkCollision();
	}
	function drawGround() {
		p.strokeWeight(1);
		p.fill(100, 60, 20); // Brown color for the ground
		p.rect(0, p.height - 20, p.width, 20); // Draw the rectangle
	}

	function showScore() {
		p.fill(50, 0, 0);
		p.textSize(24);  // Size of the text
		p.text(`Score: ${score}`, 20, 30);  // Displaying the score at the top-left corner
		p.textSize(12);
		p.text('Controls: WAD / positional click or tap', 20, 50);
	}

	function checkCollision() {
		// Simple distance check for collision
		if (p.dist(hedgehog.x, hedgehog.y, balloon.x, balloon.y) < (balloon.width + hedgehog.width) / 2 - 3) {
			p.noLoop(); // Stop the drawing loop
			alert(`Game Over: Balloon Burst! Score ${score}`);
			location.reload();
		}

		// Check if inside the hoop
		if (p.dist(hedgehog.x, hedgehog.y, balloon.hoopX, balloon.hoopY) < balloon.hoopSize / 2) {
			if (NEWROUND) {
				score++;
				NEWROUND = false;
			}
		}
	}

	p.keyPressed = () => {
		if (p.key === ' ' || p.key === 'w') {
			hedgehog.jump();
		}
		if (p.key === 'd') {
			hedgehog.right();
		}
		if (p.key === 'a') {
			hedgehog.left();
		}

	}

	p.touchStarted = () => {
		if (p.touches.length > 0) {  // Check if at least one touch is registered
			// console.log(touches);
			let touchX = p.touches[0].x;  // Get the x-coordinate of the first touch
			if (touchX / scaleFactor < hedgehog.x) {
				hedgehog.left();  // Move left if touch is on the left half
			} else {
				hedgehog.right();  // Move right if touch is on the right half
			}
		}
		hedgehog.jump();  // Also make the hedgehog jump with any touch
		return false; // Prevents default behavior such as scrolling
	}

	class Hedgehog {
		constructor(img) {
			this.x = 100;
			this.y = p.height - 30;
			this.vy = 0;
			this.vx = 0;
			this.gravity = 1;
			this.friction = 1.1;
			this.width = 50;
			self.img = img;
		}

		jump() {
			this.vy = -15;
		}
		right() {
			this.vx += 10;
		}
		left() {
			this.vx -= 10;
		}

		update() {
			this.y += this.vy;
			this.x += this.vx;
			this.vy += this.gravity;
			this.vx = this.vx / this.friction;
			this.y = p.constrain(this.y, 0, p.height - 30);
		}

		show() {
			// fill(200, 100, 110);
			// ellipse(this.x, this.y, this.width, this.width);
			p.image(self.img, this.x - this.width / 2, this.y - this.width / 2, this.width, this.width);
		}
	}

	class Balloon {
		constructor() {
			this.x = p.width;
			this.y = 40;
			this.hoopSize = 100;
			this.stringLen = 100;
			this.width = 50;
			this.height = 55;
			this.speed = 1;
			this.helium = 0.1;
		}

		update() {
			this.x -= this.speed;
			this.y -= (this.helium) * this.speed;
			this.speed = score + 1;
			if (this.x < 0) {
				this.x = p.width;
				this.hoopSize = p.random(40, 100 - score);
				this.stringLen = p.random(10, 150 - score);
				this.y = p.random(this.height / 2, 150);
				NEWROUND = true;
			}
			this.hoopY = this.y + this.height / 2 + this.stringLen + this.hoopSize / 2;
			this.hoopX = this.x;
		}

		show() {
			// balloon
			p.fill(0, 0, 200);
			p.strokeWeight(1);
			p.ellipse(this.x, this.y, this.width, this.height);

			// string
			p.strokeWeight(1);
			p.line(this.x, this.y + this.height / 2, this.x + 10, this.y + this.height / 2 + this.stringLen); // Adjust these values to position the string correctly

			// hoop
			{
				p.noFill();
				p.stroke(0, 0, 0);
				if (!NEWROUND) {
					p.stroke(0, 200, 0);
				}
				p.strokeWeight(4);
				p.ellipse(this.x + 15, this.hoopY, this.hoopSize, this.hoopSize); // Adjust vertical position to connect with string
				p.stroke(0, 0, 0);
				p.strokeWeight(1);
			}

		}
	}
}

const mySketch = new p5(sketch);
