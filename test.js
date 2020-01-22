let count = 0;

class cam
{
	constructor()
  {
  	this._obj = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  }
}

class rend
{
	constructor()
  {
  	this._renderer = new THREE.WebGLRenderer({antialias:true});
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._renderer.domElement);
  }
}

class grp
{
	constructor()
  {
  	this._obj = new THREE.Group();
  }
  add(ob)
  {
  	this._obj.add(ob);
  }
}

class scn
{
	constructor(col = new THREE.Color( 0x888888 ))
  {
  	if(!scn._instance)
    {
  		this._obj = new THREE.Scene();
      this._obj.background=col;
      scn._instance = this;
    }
    return scn._instance;
  }
  add(ob)
  {
  	this._obj.add(ob);
  }
}

class scnSystem
{
	constructor(){this._scnEntitys={};}
	execute()
  {
  	for(let cur in this._scnEntitys)
  		this._scnEntitys[cur]._components.scn.add(this._scnEntitys[cur]._components[Object.keys(this._scnEntitys[cur]._components)[0]]._obj);
  }
}

class eventHandler
{
	constructor()
  {
  	if(!eventHandler._instance)
    {
      this._kStack={};
      window.addEventListener("keydown",(e)=>{this._kStack[e.key]=e;});
      window.addEventListener("keyup",(e)=>{delete this._kStack[e.key];});
      eventHandler._instance= this;
    }
    return eventHandler._instance;
  }
  actions(mesh,playr = m._entityList.id1._components.player._obj)
  {
  	for(let cur in this._kStack)
    	switch(this._kStack[cur].key)
      {
        case "ArrowUp" : mesh._obj.translateX(0.02); break;
        case "ArrowDown" : mesh._obj.translateX(-0.02); break;
        case "ArrowRight" : mesh._obj.rotateOnAxis(new THREE.Vector3(0,1,0),-0.02); break;
        case "ArrowLeft" : mesh._obj.rotateOnAxis(new THREE.Vector3(0,1,0),0.02); break;
      }
      
      if(mesh.constructor.name=="cam")
      {
        let relativeCameraOffset = new THREE.Vector3(-10,2,0);
        let cameraOffset = relativeCameraOffset.applyMatrix4( playr.matrixWorld );
        mesh._obj.position.x = cameraOffset.x;
        mesh._obj.position.y = cameraOffset.y;
        mesh._obj.position.z = cameraOffset.z;
        mesh._obj.lookAt(playr.position);
    	}
  }
}

class eventHandlerSystem
{
	constructor(){this._eventHandlerEntitys={};}
  execute()
  {
  	for(let cur in this._eventHandlerEntitys)
    	this._eventHandlerEntitys[cur]._components.eventHandler.actions(this._eventHandlerEntitys[cur]._components[Object.keys(this._eventHandlerEntitys[cur]._components)[0]]);
  }
}

class entity
{
	constructor()
  {
    	this._components={};
      this._id = "id"+(count++);
  }
  addComponent(comp)
  {
  	this._components[comp.constructor.name]=comp;
    this.addToSystem(comp);
  }
  addToSystem(cm)
  {
  	if(m._systemsList[cm.constructor.name+"System"])
  		m._systemsList[cm.constructor.name+"System"]["_"+cm.constructor.name+"Entitys"][this._id]=this;
  }
}

class colidable
{
  twoDimCollision(obja,objb=m._entityList.id1._components.player._obj)
  {
  	return obja.position.x-obja.geometry.vertices.x/2<=objb.position.x+objb.geometry.vertices.x/2 && 
    obja.position.x+obja.geometry.vertices.x/2>=objb.position.x-objb.geometry.vertices.x/2 &&
    obja.position.z-obja.geometry.vertices.z/2<=objb.position.z+objb.geometry.vertices.z/2 && 
    obja.position.z+obja.geometry.vertices.z/2>=objb.position.z-objb.geometry.vertices.z/2
  }
}

class colidableSystem
{
	constructor(){this._colidableEntitys={};}
	execute()
  {
  	for(let cur in this._colidableEntitys)
  		if(this._colidableEntitys[cur]._components.colidable.twoDimCollision(this._colidableEntitys[cur]._components.trigger._obj)) console.log("you won !");
  }
}

class trigger
{
	constructor()
  {
  	this._obj = new THREE.Mesh(new THREE.CubeGeometry(1,1,1),new THREE.MeshPhongMaterial());
    this._obj.position.z=this._obj.position.x=-4;
  }
}

class player
{
	constructor()
  {
  	this._obj = new THREE.Mesh(new THREE.CubeGeometry(1,1,1),new THREE.MeshPhongMaterial());
  }
}

class terrain
{
	constructor()
  {
  	this._obj = new THREE.Mesh(new THREE.PlaneGeometry(10,10,1),new THREE.MeshPhongMaterial());
    this._obj.rotation.x=-Math.PI/2;
    this._obj.position.y=-0.5;
  }
}

class main
{
	constructor()
  {
  	this._entityList={};
    this._systemsList={};
  }
  addToEntityList(ent)
  {
  	this._entityList[ent._id]=ent;
  }
  addToSystemsList(sys)
  {
  	this._systemsList[sys.constructor.name]=sys;
  }
  init()
  {
  
  	this.addToSystemsList(new colidableSystem());
    this.addToSystemsList(new scnSystem());
    this.addToSystemsList(new eventHandlerSystem());
  
  	this.addToEntityList(new entity());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new trigger());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new colidable());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new scn());
    
    this.addToEntityList(new entity());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new player());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new scn());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new eventHandler());
    
    this.addToEntityList(new entity());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new cam());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new scn());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new eventHandler());
    
    this.addToEntityList(new entity());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new rend());
    
    this.addToEntityList(new entity());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new terrain());
    this._entityList[Object.keys(this._entityList)[Object.keys(this._entityList).length-1]].addComponent(new scn());
    
    this._systemsList["scnSystem"].execute();
    delete this._systemsList["scnSystem"];
  }
  animate()
  {
  	requestAnimationFrame(()=>{this.animate();});
    for(let en in this._systemsList) this._systemsList[en].execute();
    this._entityList.id3._components.rend._renderer.render(this._entityList.id2._components.scn._obj, this._entityList.id2._components.cam._obj);
  }
}

let m = new main();
m.init();
m.animate();