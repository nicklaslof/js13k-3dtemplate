import Mesh from "./mesh.js";
import Texture from "./texture.js";

export default class ObjMeshBuilder{
    //static start(gl,x,y,z){    
        //return {mesh:new Mesh(gl,x,y,z),verticies:[],colors:[],uvs:[],lights:[]};
   //
    constructor(){

    }
    

    async processFile(gl,x,y,z,objFile){
        var text = await fetch(objFile).then(r => r.text());
        var verticies = [], indicies = [];

        for (var line of text.split("\n")) {
            var parameter = line.split(" ");

            if (parameter[0] == "v")
                verticies.push(+parameter[1], +parameter[2], +parameter[3]);
            else if (parameter[0] == "f")
                indicies.push(+parameter[1]-1, +parameter[2]-1, +parameter[3]-1);
        }

        var texture = new Texture(this.glTexture,0,16,16,16);

        var mesh = new Mesh(gl,x,y,z);
        mesh.addVerticies(verticies,[[1.0,1.0,0.0],[1.0,1.0,0.0]]);
        mesh.addIndicies(indicies);
        mesh.updateMesh();
    
        mesh.setS(0.3);

        return mesh;
    }
}
