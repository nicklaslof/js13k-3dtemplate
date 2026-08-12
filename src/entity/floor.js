import MeshBuilder from "../gl/meshbuilder.js";
import Texture from "../gl/texture.js";
export default class Floor{

    constructor(x,y,z, gl, shaderProgram, glTexture){
        this.shaderProgram = shaderProgram;
        this.glTexture = glTexture;

        this.pos = {x:x, y:y, z:z};
        
        var meshBuild = MeshBuilder.start(gl,x,y,z,0.5);

        this.boxTexture2 = new Texture(this.glTexture,0,16,16,16);

        for (let x = 0; x < 32; x++) {
            for(let z = 0; z < 32; z++){
                MeshBuilder.top(this.boxTexture2.getUVs(),meshBuild,x,-1,z,5.0,[Math.random(),Math.random(),Math.random(),1.0],null);
            }
            
        }
        this.mesh = MeshBuilder.build(meshBuild);
    }

    tick(){
        
    }

    render(gl){
        this.mesh.render(gl,this.shaderProgram, this.glTexture);
    }
}