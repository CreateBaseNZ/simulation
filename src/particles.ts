import * as BABYLON from '@babylonjs/core';

// -----------------------------------------------------------------------------------------------------------------------
var randomNumber = function (min, max) {
    if (min == max) {
        return (min);
    }

    var random = Math.random();

    return ((random * (max - min)) + min);
};
// -----------------------------------------------------------------------------------------------------------------------
var doubleColor4 = function () {
    return new BABYLON.Color4(Math.random() * 2, Math.random() * 2, Math.random() * 2, Math.random());
}
// -----------------------------------------------------------------------------------------------------------------------

var myParticleUpdater = function (newParticles) {
    // Update current
    this._alive = this.particles.length > 0;
    for (var index = 0; index < this.particles.length; index++) {
        var particle = this.particles[index];
        particle.age += this._scaledUpdateSpeed;

        if (particle.age >= particle.lifeTime) {
            this._stockParticles.push(this.particles.splice(index, 1)[0]);
            index--;
            continue;
        } else {

            // custom stuff
            particle.color = doubleColor4();
            particle.size = randomNumber(this.minSize, this.maxSize);

            // dflt stuff
            particle.direction.scaleToRef(this._scaledUpdateSpeed, this._scaledDirection);
            particle.position.addInPlace(this._scaledDirection);

            this.gravity.scaleToRef(this._scaledUpdateSpeed, this._scaledGravity);
            particle.direction.addInPlace(this._scaledGravity);
        }
    }

    // Add new ones
    var worldMatrix;

    if (this.emitter.position) {
        worldMatrix = this.emitter.getWorldMatrix();
    } else {
        worldMatrix = BABYLON.Matrix.Translation(this.emitter.x, this.emitter.y, this.emitter.z);
    }

    for (index = 0; index < newParticles; index++) {
        if (this.particles.length == this._capacity) {
            break;
        }

        if (this._stockParticles.length !== 0) {
            particle = this._stockParticles.pop();
            particle.age = 0;
        } else {
            particle = new BABYLON.Particle(this.particles)
            this.particles.push(particle);

            var emitPower = randomNumber(this.minEmitPower, this.maxEmitPower);

            this.startDirectionFunction(emitPower, worldMatrix, particle.direction);

            particle.lifeTime = randomNumber(this.minLifeTime, this.maxLifeTime);

            this.startPositionFunction(worldMatrix, particle.position);

        }
    };
}

// -----------------------------------------------------------------------------------------------------------------------

export let createPs = (emitter, scene) => {
    var ps = new BABYLON.ParticleSystem("particles", 2000, scene);
    ps.updateFunction = myParticleUpdater;

    //Texture of each particle - set far below
    // ps.particleTexture = new BABYLON.Texture("http://upload.wikimedia.org/wikipedia/commons/0/00/Grey_Triangle.gif", scene);
    // ps.particleTexture = rad1.material.diffuseTexture;

    // Where the particles come from
    ps.emitter = emitter; // the starting object, the emitter
    // ps.minEmitBox = new BABYLON.Vector3(-15, 0, -15); // Starting all from
    // ps.maxEmitBox = new BABYLON.Vector3(15, 0, 15); // To...

    ps.minEmitBox = new BABYLON.Vector3(-0.2, -0.2, -0.2); // Starting all from
    ps.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.2); // To...

    // the localized _update does the coloring.
    ps.color1 = ps.color2 = ps.colorDead = new BABYLON.Color4(0.3, 0.3, 0.3, 1);

    // the localized _update does the sizing.
    ps.minSize = 0.01;
    ps.maxSize = 0.1;

    // Life time of each particle (random between...
    ps.minLifeTime = 0.2;
    ps.maxLifeTime = 0.6;

    // Emission rate
    ps.emitRate = 200;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    // Set the gravity of all particles
    ps.gravity = new BABYLON.Vector3(0, -3, 0);

    // Direction of each particle after it has been emitted
    ps.direction1 = new BABYLON.Vector3(-5, -5, 1);
    ps.direction2 = new BABYLON.Vector3(5, 5, 1);

    // Angular speed, in radians
    ps.minAngularSpeed = 0;
    // ps.maxAngularSpeed = Math.PI*2;
    ps.maxAngularSpeed = 0;

    // Speed
    ps.minEmitPower = 0;
    ps.maxEmitPower = 0;
    ps.updateSpeed = 0.005;

    ps.particleTexture = new BABYLON.Texture('http://i166.photobucket.com/albums/u83/j1m68/star.jpg', scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);

    // Start the particle system
    ps.start();
}
