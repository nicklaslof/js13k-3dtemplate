import Billboard from "./entity/billboard.js";
import Box from "./entity/box.js";
import Floor from "./entity/floor.js";
import Camera from "./gl/camera.js";
import GlTexture from "./gl/gltexture.js";
import ObjMeshBuilder from "./gl/objmeshbuilder.js";

import ShaderProgram from "./gl/shaderprogram.js";
import Input from "./input/input.js";
import MathUtil from "./mathutil.js";

const up = {x:0,y:1,z:0};
const down = {x:0,y:-1,z:0}

export default class Game{

    constructor(){
        this.canvas = document.getElementById("c");
        this.canvas.width = 1920;
        this.canvas.height = 1280;
        this.gl = this.canvas.getContext("webgl",{antialias: false});

        this.velocity = {x:0,z:0};
        this.tempVector = {x:0,y:0,z:0};
        this.strafe = {x:0,z:0};
        this.speed = 0.1;

        this.keys = [];
        
        onkeydown=onkeyup=e=> this.keys[e.keyCode] = e.type;
        this.input = new Input();
        this.canvas.addEventListener('click', (e) => { this.canvas.requestPointerLock(); this.mouseLocked = true;});

        //this.shaderProgram = new ShaderProgram(this.gl,`precision highp float; attribute vec4 p; attribute vec4 c; attribute vec4 l; attribute vec2 u; uniform float rX; uniform float rY; uniform float crX; uniform float crY; uniform vec3 cp; uniform vec3 mp; uniform vec3 ms; varying vec4 vc; varying vec2 uv; varying float d; varying vec4 li; mat4 rmX(float rX){ return mat4( 1,0,0,0, 0,cos(rX),-sin(rX),0, 0,sin(rX),cos(rX),0, 0,0,0,1); } mat4 rmY(float rY){ return mat4( cos(rY),0,sin(rY),0, 0,1,0,0, -sin(rY),0,cos(rY),0, 0,0,0,1 ); } mat4 cpm(float fov, float aspect, float near, float far) { float f = 1.0 / tan(fov / 2.0); return mat4( f / aspect, 0.0, 0.0, 0.0, 0.0, f, 0.0, 0.0, 0.0, 0.0, (far + near) / (near - far), -1.0, 0.0, 0.0, (2.0 * far * near) / (near - far), 0.0 ); } void main(){ vec4 rp = rmX(rX) * rmY(rY) * vec4(p.x*ms.x,p.y*ms.y,p.z*ms.z,p.w) + vec4(mp-cp,1.0); mat4 proj = cpm(1.2,2.0,0.1,20.0) * rmX(crX) * rmY(crY); gl_Position = proj * rp; vc=c; li=l; uv=u; d=gl_Position.z/47.0; }`,` precision highp float; varying vec4 vc; varying vec2 uv; varying float d; varying vec4 li; uniform sampler2D s; void main(){ vec4 col=texture2D(s,uv)*vc;vec4 c=vec4(col.rgb-d,col.a)*li; if (col.rgb == vec3(0.0,0.0,0.0)) discard; gl_FragColor=c; }`);

        // The shader program above expanded:
        this.shaderProgram = new ShaderProgram(this.gl,`
            precision highp float;
            attribute vec4 p;
            attribute vec4 c;
            attribute vec4 l;
            attribute vec2 u;
            uniform float rX;
            uniform float rY;
            uniform float crX;
            uniform float crY;
            uniform vec3 cp;
            uniform vec3 mp;
            uniform vec3 ms;
            
            varying vec4 vc;
            varying vec2 uv;
            varying float d;
            varying vec4 li;

            mat4 rmX(float rX){
                return mat4(
                1,0,0,0,
                0,cos(rX),-sin(rX),0,
                0,sin(rX),cos(rX),0,
                0,0,0,1);
            }

            mat4 rmY(float rY){
                return mat4(
                cos(rY),0,sin(rY),0,
                0,1,0,0,
                -sin(rY),0,cos(rY),0,
                0,0,0,1
              );
            }

            mat4 cpm(float fov, float aspect, float near, float far) {
                float f = 1.0 / tan(fov / 2.0);
                return mat4(
                    f / aspect, 0.0, 0.0, 0.0,
                    0.0, f, 0.0, 0.0,
                    0.0, 0.0, (far + near) / (near - far), -1.0,
                    0.0, 0.0, (2.0 * far * near) / (near - far), 0.0
                );
            }
            

            void main(){
              vec4 rp = rmX(rX) * rmY(rY) * vec4(p.x*ms.x,p.y*ms.y,p.z*ms.z,p.w) + vec4(mp-cp,1.0);
              mat4 proj = cpm(1.2,2.0,0.1,20.0) * rmX(crX) * rmY(crY);

              gl_Position = proj * rp;
              vc=c;
              li=l;
              uv=u;
              d=gl_Position.z/27.0;
            }`,`
            precision highp float;
            varying vec4 vc;
            varying vec2 uv;
            varying float d;
            varying vec4 li;
            uniform sampler2D s;
            void main(){
              /*vec4 col=texture2D(s,uv)*vc;
              vec4 c=vec4(col.rgb-d,col.a)*li;
              if (col.rgb == vec3(0.0,0.0,0.0))
                discard;
              gl_FragColor=c;*/
              vec4 col=texture2D(s,uv);
              gl_FragColor=col;
            }`);
        this.entities = [];
        this.glTexture = new GlTexture(this.gl, "t.png");
        
        this.gl.camera = new Camera(this.gl,0,1.2,0);

        
        //console.log(mesh);

        this.last = performance.now();
        this.counter = 0;
        this.fps = 0;
        this.tickRate = 1000/60;
        this.accumulator = 0;
        this.ticks = 0;
    }

    async initMeshes(){

        this.meshDirty = true;

        /*this.entities.push(new Box(-3,0,-4.0,this.gl, this.shaderProgram,this.glTexture,0));
        this.entities.push(new Box(-1,0,-4.0,this.gl, this.shaderProgram,this.glTexture,0));
        this.entities.push(new Box(1,0,-4.0,this.gl, this.shaderProgram,this.glTexture,0));
        this.entities.push(new Box(3,0,-4.0,this.gl, this.shaderProgram,this.glTexture,0));
        this.entities.push(new Box(-1,0,-8.0,this.gl, this.shaderProgram,this.glTexture,0));
        this.entities.push(new Box(-1,0,-10.0,this.gl, this.shaderProgram,this.glTexture,0));
        this.entities.push(new Box(-1,0,-12.0,this.gl, this.shaderProgram,this.glTexture,0));*/
        //this.entities.push(new Box(-1,0,-15.0,this.gl, this.shaderProgram,this.glTexture,0));

        //this.entities.push(new Floor(-16,0,-16,this.gl, this.shaderProgram,this.glTexture));


        //for (let i = 0; i < 1000; i++) {
        //    this.entities.push(new Billboard(Math.floor(-10+Math.random()*100),0,-10+Math.floor(Math.random()*100),this.gl,this.shaderProgram,this.glTexture));
            //this.entities.push(new Billboard(Math.floor(-10+Math.random()*100),0,-10+Math.floor(Math.random()*100),this.gl,this.shaderProgram,this.glTexture));
        //}

        var builder = new ObjMeshBuilder();

        await builder.processFile(this.gl,0,0,0,"resources/3d/primitives/cube.obj").then(mesh =>{
           // this.meshDirty = false;
            this.mesh = mesh;
        });

        await builder.processFile(this.gl,0,0,0,"resources/3d/primitives/cylinder.obj").then(mesh =>{
            //this.meshDirty = false;
            this.mesh2 = mesh;
        });

        await builder.processFile(this.gl,0,0,0,"resources/3d/primitives/sphere.obj").then(mesh =>{
            //this.meshDirty = false;
            this.mesh3 = mesh;
        });

        await builder.processFile(this.gl,0,0,0,"resources/3d/model/thing.obj").then(mesh =>{
            this.meshDirty = false;
            this.mesh4 = mesh;
        });
    }

    update(){
        if (this.glTexture.dirty) return;
        var now = performance.now();
        var deltaTime = now - this.last;
        if (deltaTime>500) deltaTime = 16; // Dont allow too big jump in time.
        this.last = now;
        this.accumulator += deltaTime;
        var ticked = false;
        this.counter += deltaTime;

        while(this.accumulator >= this.tickRate) {
            this.tick(deltaTime);
            this.accumulator -= this.tickRate;
            this.ticks++;
            ticked = true;

        }

        if (ticked){
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.clearColor(0.0,0.0,0.0,1.0);

            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.depthFunc(this.gl.LESS);
            this.gl.enable(this.gl.CULL_FACE);
            this.gl.disable(this.gl.BLEND);

            this.render();

            this.fps++;
            //this.gl.flush();
        }

        // FPS and tick counter
        if (this.counter > 1000){
            console.log("Ticks: " + this.ticks + " FPS: "+this.fps);
            this.counter = this.fps = this.ticks = 0;
        }
    }

    tick(deltaTime){
        this.input.tick(this);
        this.gl.camera.rotate((-this.input.pointer.x/6) * (deltaTime/1000));
        this.gl.camera.rotateX((-this.input.pointer.y/6) * (deltaTime/1000));
        this.velocity.z = this.input.axes.y;

        this.strafe.x = 0;
        this.strafe.z = 0;

        let cameraDirection = this.gl.camera.getDirection();

        if (this.input.axes.x < 0) MathUtil.crossProduct(this.strafe,cameraDirection,up);
        if (this.input.axes.x > 0) MathUtil.crossProduct(this.strafe,cameraDirection,down);

        if (this.velocity.x !=0 || this.velocity.z != 0 || this.strafe.x != 0 || this.strafe.z !=0){
            //combine forward/backward movement with strafe movement and multiply that with the direction the camera is facing
            this.tempVector.x = cameraDirection.x * this.velocity.z + this.strafe.x;
            this.tempVector.z = cameraDirection.z * this.velocity.z + this.strafe.z;
            this.tempVector.y = 0;
            //normalize it to prevent moving faster when strafing and moving forward/backward at the same time
            MathUtil.normalize(this.tempVector);

            //multiply the final normalized movement with the speed the player will move
            this.tempVector.x *= this.speed;
            this.tempVector.z *= this.speed;

            //finally add the current position of the player to the calculated movement vector
            this.tempVector.x += this.gl.camera.position.x;
            this.tempVector.z += this.gl.camera.position.z;

            //here would be the check if the player can move in X or Z direction separetly to allow sliding on the walls. Otherwise the player would get stuck when close to a wall
            //which would be very annoying. If the player can move to the new position then transform the current position to that position.
            this.gl.camera.position.x += this.tempVector.x-this.gl.camera.position.x;
            this.gl.camera.position.z += this.tempVector.z-this.gl.camera.position.z;
        }

        this.entities.forEach(e => {
            e.tick();
        });
    }

    render(){
        if (this.meshDirty) return;
        /*this.entities.forEach(e => {
            e.render(this.gl);
        });*/
        this.mesh.render(this.gl,this.shaderProgram,this.glTexture);
        //this.mesh2.render(this.gl,this.shaderProgram,this.glTexture);
        //this.mesh3.render(this.gl,this.shaderProgram,this.glTexture);
        //this.mesh4.render(this.gl,this.shaderProgram,this.glTexture);
    }
}