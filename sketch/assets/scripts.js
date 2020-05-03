let img;
let centre_x = 50;
let centre_y = 50;
let radius = 20;
let r = 255;
let g = 255;
let b = 255;
let a = 255;
let colour = { r, b, g, a}

function isInCircle(x, y, radius) {
  // let dx = x-centre_x
  // let dy = y-centre_y
  // if (dx>r) return false
  // if (dy>r) return false
  // if (dx + dy <= r) return false
  // const x2 = dx^2
  // const y2 = dy^2
  // const r2 = radius^2
  // dx^2 + dy^2 <= R^2
  const dist = Math.sqrt(((centre_x - x) ** 2) + ((centre_y - y) ** 2))
  //if (dx^2 + dy^2 <= radius^2) return true
  return dist <= radius
}

function preload() {
  img = loadImage('assets/102599.jpg');
}

function setAtXY(x, y, colour) {
  let d = pixelDensity();
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      index = 4 * ((y * d + j) * width * d + (x * d + i));
      pixels[index] = colour.r;
      pixels[index+1] = colour.g;
      pixels[index+2] = colour.b;
      pixels[index+3] = colour.a;
    }
  }
}

function setup() {
  console.log('setup')
  image(img, 0, 0, width, height);
  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const isIn = isInCircle(x, y, radius)
      if (isIn) { 
        setAtXY(x, y, colour) 
      }
    }
  }
  updatePixels();
}

// function draw() {
//   // for (let x = 0; x < width; x++) {
//   //   for (let y = 0; y < height; x++) {
//   //     console.log(isInCircle(x, y, radius))
//   //     // if (isInCircle(x, y, radius)) { setAtXY(x, y, colour) }
//   //   }
//   // }
// }