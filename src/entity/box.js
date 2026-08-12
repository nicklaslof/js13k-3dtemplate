import MeshBuilder from "../gl/meshbuilder.js";
import Texture from "../gl/texture.js";

export default class Box{

    constructor(x,y,z, gl, shaderProgram, glTexture, offset){
        this.shaderProgram = shaderProgram;
        this.glTexture = glTexture;

        this.pos = {x:x, y:y, z:z};

        var meshBuild = MeshBuilder.start(gl,x,y,z,0.5);
        this.counter = offset;

        this.boxTexture = new Texture(this.glTexture,0,0,16,16);

        MeshBuilder.left(this.boxTexture.getUVs(),meshBuild,0,0,0,2,8,[0.2,0.9,0.9,1.0],null);
        MeshBuilder.right(this.boxTexture.getUVs(),meshBuild,0,0,0,2,8,[0.2,0.5,0.8,1.0],null);
        MeshBuilder.front(this.boxTexture.getUVs(),meshBuild,0,0,0,2,8,[0.8,0.3,0.8,1.0],null);
        MeshBuilder.back(this.boxTexture.getUVs(),meshBuild,0,0,0,2,8,[0.8,0.2,0.8,1.0],null);

        this.mesh = MeshBuilder.build(meshBuild);
        this.mesh.setRotationY(offset);
        this.mesh.setS(1.0);
    }

    tick(){
        this.counter++;
        this.mesh.setRotationY((this.counter)/180);
        
        
    }

    render(gl){
        this.mesh.render(gl,this.shaderProgram, this.glTexture);
    }
}