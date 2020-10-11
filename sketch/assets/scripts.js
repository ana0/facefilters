let img;
let centre_x = 50;
let centre_y = 50;
let radius = 200;
let r = 255;
let g = 255;
let b = 255;
let a = 255;
let colour = { r, b, g, a};

function preload() {
  img = loadImage('assets/headref1.jpg');
}

function isOnCircle(x, y, radius) {
  const dist = Math.sqrt(((centre_x - x) ** 2) + ((centre_y - y) ** 2))
  return dist + 1 >= radius && dist -1 <= radius
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

function getAtXY(x, y) {
  const colours = [];
  let d = pixelDensity();
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      index = 4 * ((y * d + j) * width * d + (x * d + i));
      const colour = {}
      colour.r = pixels[index];
      colour.g = pixels[index+1];
      colour.b = pixels[index+2];
      colour.a = pixels[index+3];
      colours.push(colour);
    }
  }
  return colours;
}

function drawCircle(radius) {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const isIn = isOnCircle(x, y, radius)
      if (isIn) { 
        setAtXY(x, y, colour) 
      }
    }
  }
  updatePixels();
}

function drawCircle(radius) {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const isIn = isOnCircle(x, y, radius)
      if (isIn) {
        const pixel = getInsideOfXY(x, y)
        const colour = getAtXY(pixel.x, pixel.y)[0] 
        setAtXY(x, y, colour) 
      }
    }
  }
  updatePixels();
}

// function getInsideOfXY(x, y) {
//   const pixel = {};
//   if (x > centre_x) {
//     pixel.x = x - 1
//   } else {
//     pixel.x = x + 1
//   }
//   if (y > centre_y) { 
//     pixel.y = y - 1
//   } else {
//     pixel.y = y + 1
//   }
//   return pixel;
// }

function getInsideOfXY(x, y) {
  const deltay = y - centre_y;
  const deltax = x - centre_x;
  const slope = deltax/deltay;
  let travel;
  const pixel = {};
  if (deltax > deltay) {
    travel = {
      x: deltax > 0 ? 1 : (deltax == 0 ? 0 : -1),
      y: deltay == 0 ? 0 : Math.floor(1/(deltax/deltay)),
    }  
  } else if (deltay > deltax) {
    travel = {
      x: deltax == 0 ? 0 : Math.floor(1/(deltay/deltax)),
      y: deltay > 0 ? 1 : (deltay == 0 ? 0 : -1),
    }
  } else {
    travel = {
      x: deltax > 0 ? 1 : (deltax == 0 ? 0 : -1),
      y: deltay > 0 ? 1 : (deltay == 0 ? 0 : -1),
    }
  }
  //console.log(travel)
  return {
    x: x - travel.x,
    y: y - travel.y,
  }
}

function iterativeDrawCircle() {
  for (let i = radius; i >= 0; i--) {
    drawCircle(i)
  }
}

function mouseClicked() {
  centre_x = mouseX
  centre_y = mouseY
  iterativeDrawCircle()
  const xy = getAtXY(centre_x, centre_y)
  
  console.log(xy)
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  image(img, 0, 0);
  loadPixels();
  let d = pixelDensity();
}

// function draw() {
//   // for (let x = 0; x < width; x++) {
//   //   for (let y = 0; y < height; x++) {
//   //     console.log(isInCircle(x, y, radius))
//   //     // if (isInCircle(x, y, radius)) { setAtXY(x, y, colour) }
//   //   }
//   // }
// }