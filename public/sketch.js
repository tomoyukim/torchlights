var ps = [];
var socket = io();

/// socket
socket.on('connected', function(data) {
    var users = data.existedUsers;
    for( var i=0; i < users.length; i++){
    ps.push(new ParticleSystem(users[i].userid, color(users[i].r, users[i].g, users[i].b), users[i].size, true));
    }

    //add myself
    var r = random(100, 255);
    var g = random(100, 255);
    var b = random(100, 255);
    var size = random(20, 50);
    ps.push(new ParticleSystem(data.userid, color(r, g, b), size, false));
    socket.emit('login', {userid:data.userid, r:r, g:g, b:b, size:size});
});

socket.on('login', function(data) {
    ps.push(new ParticleSystem(data.userid, color(data.r, data.g, data.b), data.size));
});

socket.on('position', function(data) {
    ps.forEach(function(element, index, array){
    if(element.getId() == data.userid){
        element.posX = map(data.position.x, 0, 100, 0, width);
        element.posY = map(data.position.y, 0, 100, 0, height);
    }
    });
});

socket.on('clicked', function(data) {
    ps.forEach(function(element, index, array){
    if(element.getId() == data.userid){
        element.size += 20;
    }
    });
});

socket.on('logout', function(data) {
    ps.forEach(function(element, index, array){
    if(element.getId() == data.userid){
        array.splice(index, 1);
    }
    });
});

/// particle sketch
function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(120);
}

function draw() {
    background(0);

    socket.emit('position', {x:map(mouseX, 0, width, 0, 100), y:map(mouseY, 0, height, 0, 100)});

    if(ps.length > 0){
    for( var i=0; i < ps.length; i++){
        ps[i].run();
    }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
    socket.emit('clicked', {});
}

/// Particle system class
ParticleSystem = function(_id, _color, _size, _activated) {
    this.particles = [];
    this.posX = -100;
    this.posY = -100;
    this.baseSize = _size;
    this.size = _activated ? _size : 1;
    this.userid = _id;
    this.psColor = _color;
}

ParticleSystem.prototype.run = function() {
    this.particles.push(new Particle(this.posX + random(5), this.posY + random(5), this.psColor, this.size, this.size));

    for( var i=0; i < this.particles.length; i++){
    this.particles[i].update();
    this.particles[i].draw();
    }

    this.particles.forEach(function(element, index, array){
    if(element.isDead()){
        array.splice(index, 1);
    }
    });

    if(this.size > this.baseSize){
    this.size -= 5;
    }

    if((this.size < this.baseSize)){
    this.size += 1;
    }
}

ParticleSystem.prototype.getId = function() {
    return this.userid;
}

/// Particle class
Particle = function(_x, _y, _color, _sizeX, _sizeY) {
    this.x = _x;
    this.y = _y;
    this.itsColor = _color;
    this.life = 200;
    this.sizeX = _sizeX;
    this.sizeY = _sizeY;
    this.delta = Math.ceil(200 / _sizeX) + 1;
}

Particle.prototype.draw = function() {
    noStroke();
    fill(this.itsColor, this.life);
    ellipse(this.x, this.y, this.sizeX, this.sizeY);
}

Particle.prototype.update = function() {
    this.sizeX -= 1;
    this.sizeY -= 1;
    this.life -= this.delta;
}

Particle.prototype.isDead = function() {
    return this.life < 0 ? true : false;
}
