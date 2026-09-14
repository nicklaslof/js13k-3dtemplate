import BoxMeshBuilder from "../gl/boxmeshbuilder.js";
import Texture from "../gl/texture.js";
export default class Billboard{
    constructor(x,y,z, gl, shaderProgram, glTexture){
        this.shaderProgram = shaderProgram;
        this.gl = gl;
        this.glTexture = glTexture;

        this.pos = {x:x, y:y, z:z};

        var meshBuild = BoxMeshBuilder.start(gl,x,y,z,0.5);

        this.texture = new Texture(this.glTexture,0,32,16,16);

        BoxMeshBuilder.billboard(this.texture.getUVs(),meshBuild,0,0,0,2,1,[1.0,1.0,1.0,1.0],null);
        this.mesh = BoxMeshBuilder.build(meshBuild);
        
    }

    tick(){
       this.mesh.setRotationY(-this.gl.camera.currentRot);
    }

    render(gl){
        this.mesh.render(gl,this.shaderProgram, this.glTexture);
    }
}