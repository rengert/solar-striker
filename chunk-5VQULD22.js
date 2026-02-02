import{$ as ye,B as We,C as T,F as Ne,G as p,H as S,I as ve,J as ge,K as _e,L as be,M as _,O as Te,Q as E,S as Ve,T as H,U as je,X as m,_ as z,a as o,b as C,c as L,ca as $e,d as g,da as ke,e as Le,ea as qe,f as v,h as b,i as ae,k as oe,l as P,m as le,n as R,na as de,p as ue,pa as U,q as w,r as B,ra as Ce,ta as Ke,u as He,ua as Ye,va as ce,w as xe,x as ze,za as Xe}from"./chunk-HMBSXDUE.js";import{a as c,b as M,c as Fe,g as k}from"./chunk-RA2WU32H.js";var we=[];C.handleByNamedList(o.Environment,we);function Je(n){return k(this,null,function*(){if(!n)for(let e=0;e<we.length;e++){let t=we[e];if(t.value.test()){yield t.value.load();return}}})}var W;function he(){if(typeof W=="boolean")return W;try{W=new Function("param1","param2","param3","return param1[param2] === param3;")({a:"b"},"a","b")===!0}catch{W=!1}return W}var y=(n=>(n[n.NONE=0]="NONE",n[n.COLOR=16384]="COLOR",n[n.STENCIL=1024]="STENCIL",n[n.DEPTH=256]="DEPTH",n[n.COLOR_DEPTH=16640]="COLOR_DEPTH",n[n.COLOR_STENCIL=17408]="COLOR_STENCIL",n[n.DEPTH_STENCIL=1280]="DEPTH_STENCIL",n[n.ALL=17664]="ALL",n))(y||{});var I=class{constructor(e){this.items=[],this._name=e}emit(e,t,r,s,i,a,l,u){let{name:d,items:h}=this;for(let f=0,x=h.length;f<x;f++)h[f][d](e,t,r,s,i,a,l,u);return this}add(e){return e[this._name]&&(this.remove(e),this.items.push(e)),this}remove(e){let t=this.items.indexOf(e);return t!==-1&&this.items.splice(t,1),this}contains(e){return this.items.indexOf(e)!==-1}removeAll(){return this.items.length=0,this}destroy(){this.removeAll(),this.items=null,this._name=null}get empty(){return this.items.length===0}get name(){return this._name}};var St=["init","destroy","contextChange","resolutionChange","resetState","renderEnd","renderStart","render","update","postrender","prerender"],Mt=(()=>{let n=class Qe extends L{constructor(t){super(),this.uid=b("renderer"),this.runners=Object.create(null),this.renderPipes=Object.create(null),this._initOptions={},this._systemsHash=Object.create(null),this.type=t.type,this.name=t.name,this.config=t;let r=[...St,...this.config.runners??[]];this._addRunners(...r),this._unsafeEvalCheck()}init(){return k(this,arguments,function*(t={}){let r=t.skipExtensionImports===!0?!0:t.manageImports===!1;yield Je(r),this._addSystems(this.config.systems),this._addPipes(this.config.renderPipes,this.config.renderPipeAdaptors);for(let s in this._systemsHash){let a=this._systemsHash[s].constructor.defaultOptions;t=c(c({},a),t)}t=c(c({},Qe.defaultOptions),t),this._roundPixels=t.roundPixels?1:0;for(let s=0;s<this.runners.init.items.length;s++)yield this.runners.init.items[s].init(t);this._initOptions=t})}render(t,r){let s=t;if(s instanceof _&&(s={container:s},r&&(oe(ae,"passing a second argument is deprecated, please use render options instead"),s.target=r.renderTexture)),s.target||(s.target=this.view.renderTarget),s.target===this.view.renderTarget&&(this._lastObjectRendered=s.container,s.clearColor??(s.clearColor=this.background.colorRgba),s.clear??(s.clear=this.background.clearBeforeRender)),s.clearColor){let i=Array.isArray(s.clearColor)&&s.clearColor.length===4;s.clearColor=i?s.clearColor:g.shared.setValue(s.clearColor).toArray()}s.transform||(s.container.updateLocalTransform(),s.transform=s.container.localTransform),s.container.visible&&(s.container.enableRenderGroup(),this.runners.prerender.emit(s),this.runners.renderStart.emit(s),this.runners.render.emit(s),this.runners.renderEnd.emit(s),this.runners.postrender.emit(s))}resize(t,r,s){let i=this.view.resolution;this.view.resize(t,r,s),this.emit("resize",this.view.screen.width,this.view.screen.height,this.view.resolution),s!==void 0&&s!==i&&this.runners.resolutionChange.emit(s)}clear(t={}){let r=this;t.target||(t.target=r.renderTarget.renderTarget),t.clearColor||(t.clearColor=this.background.colorRgba),t.clear??(t.clear=y.ALL);let{clear:s,clearColor:i,target:a}=t;g.shared.setValue(i??this.background.colorRgba),r.renderTarget.clear(a,s,g.shared.toArray())}get resolution(){return this.view.resolution}set resolution(t){this.view.resolution=t,this.runners.resolutionChange.emit(t)}get width(){return this.view.texture.frame.width}get height(){return this.view.texture.frame.height}get canvas(){return this.view.canvas}get lastObjectRendered(){return this._lastObjectRendered}get renderingToScreen(){return this.renderTarget.renderingToScreen}get screen(){return this.view.screen}_addRunners(...t){t.forEach(r=>{this.runners[r]=new I(r)})}_addSystems(t){let r;for(r in t){let s=t[r];this._addSystem(s.value,s.name)}}_addSystem(t,r){let s=new t(this);if(this[r])throw new Error(`Whoops! The name "${r}" is already in use`);this[r]=s,this._systemsHash[r]=s;for(let i in this.runners)this.runners[i].add(s);return this}_addPipes(t,r){let s=r.reduce((i,a)=>(i[a.name]=a.value,i),{});t.forEach(i=>{let a=i.value,l=i.name,u=s[l];this.renderPipes[l]=new a(this,u?new u:null),this.runners.destroy.add(this.renderPipes[l])})}destroy(t=!1){this.runners.destroy.items.reverse(),this.runners.destroy.emit(t),(t===!0||typeof t=="object"&&t.releaseGlobalResources)&&le.release(),Object.values(this.runners).forEach(r=>{r.destroy()}),this._systemsHash=null,this.renderPipes=null}generateTexture(t){return this.textureGenerator.generateTexture(t)}get roundPixels(){return!!this._roundPixels}_unsafeEvalCheck(){if(!he())throw new Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}resetState(){this.runners.resetState.emit()}};return n.defaultOptions={resolution:1,failIfMajorPerformanceCaveat:!1,roundPixels:!1},n})(),nr=Mt;var N=class{constructor(e){this._renderer=e}updateRenderable(){}destroyRenderable(){}validateRenderable(){return!1}addRenderable(e,t){this._renderer.renderPipes.batch.break(t),t.add(e)}execute(e){e.isRenderable&&e.render(this._renderer)}destroy(){this._renderer=null}};N.extension={type:[o.WebGLPipes,o.WebGPUPipes,o.CanvasPipes],name:"customRender"};function V(n,e){let t=n.instructionSet,r=t.instructions;for(let s=0;s<t.instructionSize;s++){let i=r[s];e[i.renderPipeId].execute(i)}}var Pt=new v,j=class{constructor(e){this._renderer=e}addRenderGroup(e,t){e.isCachedAsTexture?this._addRenderableCacheAsTexture(e,t):this._addRenderableDirect(e,t)}execute(e){e.isRenderable&&(e.isCachedAsTexture?this._executeCacheAsTexture(e):this._executeDirect(e))}destroy(){this._renderer=null}_addRenderableDirect(e,t){this._renderer.renderPipes.batch.break(t),e._batchableRenderGroup&&(R.return(e._batchableRenderGroup),e._batchableRenderGroup=null),t.add(e)}_addRenderableCacheAsTexture(e,t){let r=e._batchableRenderGroup??(e._batchableRenderGroup=R.get(ce));r.renderable=e.root,r.transform=e.root.relativeGroupTransform,r.texture=e.texture,r.bounds=e._textureBounds,t.add(e),this._renderer.renderPipes.blendMode.pushBlendMode(e,e.root.groupBlendMode,t),this._renderer.renderPipes.batch.addToBatch(r,t),this._renderer.renderPipes.blendMode.popBlendMode(t)}_executeCacheAsTexture(e){if(e.textureNeedsUpdate){e.textureNeedsUpdate=!1;let t=Pt.identity().translate(-e._textureBounds.x,-e._textureBounds.y);this._renderer.renderTarget.push(e.texture,!0,null,e.texture.frame),this._renderer.globalUniforms.push({worldTransformMatrix:t,worldColor:4294967295,offset:{x:0,y:0}}),V(e,this._renderer.renderPipes),this._renderer.renderTarget.finishRenderPass(),this._renderer.renderTarget.pop(),this._renderer.globalUniforms.pop()}e._batchableRenderGroup._batcher.updateElement(e._batchableRenderGroup),e._batchableRenderGroup._batcher.geometry.buffers[0].update()}_executeDirect(e){this._renderer.globalUniforms.push({worldTransformMatrix:e.inverseParentTextureTransform,worldColor:e.worldColorAlpha}),V(e,this._renderer.renderPipes),this._renderer.globalUniforms.pop()}};j.extension={type:[o.WebGLPipes,o.WebGPUPipes,o.CanvasPipes],name:"renderGroup"};function $(n,e){e||(e=0);for(let t=e;t<n.length&&n[t];t++)n[t]=null}var Rt=new _,Ze=be|ge|_e;function Se(n,e=!1){Bt(n);let t=n.childrenToUpdate,r=n.updateTick++;for(let s in t){let i=Number(s),a=t[s],l=a.list,u=a.index;for(let d=0;d<u;d++){let h=l[d];h.parentRenderGroup===n&&h.relativeRenderGroupDepth===i&&tt(h,r,0)}$(l,u),a.index=0}if(e)for(let s=0;s<n.renderGroupChildren.length;s++)Se(n.renderGroupChildren[s],e)}function Bt(n){let e=n.root,t;if(n.renderGroupParent){let r=n.renderGroupParent;n.worldTransform.appendFrom(e.relativeGroupTransform,r.worldTransform),n.worldColor=xe(e.groupColor,r.worldColor),t=e.groupAlpha*r.worldAlpha}else n.worldTransform.copyFrom(e.localTransform),n.worldColor=e.localColor,t=e.localAlpha;t=t<0?0:t>1?1:t,n.worldAlpha=t,n.worldColorAlpha=n.worldColor+((t*255|0)<<24)}function tt(n,e,t){if(e===n.updateTick)return;n.updateTick=e,n.didChange=!1;let r=n.localTransform;n.updateLocalTransform();let s=n.parent;if(s&&!s.renderGroup?(t|=n._updateFlags,n.relativeGroupTransform.appendFrom(r,s.relativeGroupTransform),t&Ze&&et(n,s,t)):(t=n._updateFlags,n.relativeGroupTransform.copyFrom(r),t&Ze&&et(n,Rt,t)),!n.renderGroup){let i=n.children,a=i.length;for(let d=0;d<a;d++)tt(i[d],e,t);let l=n.parentRenderGroup,u=n;u.renderPipeId&&!l.structureDidChange&&l.updateRenderable(u)}}function et(n,e,t){if(t&ge){n.groupColor=xe(n.localColor,e.groupColor);let r=n.localAlpha*e.groupAlpha;r=r<0?0:r>1?1:r,n.groupAlpha=r,n.groupColorAlpha=n.groupColor+((r*255|0)<<24)}t&_e&&(n.groupBlendMode=n.localBlendMode==="inherit"?e.groupBlendMode:n.localBlendMode),t&be&&(n.globalDisplayStatus=n.localDisplayStatus&e.globalDisplayStatus),n._updateFlags=0}function rt(n,e){let{list:t}=n.childrenRenderablesToUpdate,r=!1;for(let s=0;s<n.childrenRenderablesToUpdate.index;s++){let i=t[s];if(r=e[i.renderPipeId].validateRenderable(i),r)break}return n.structureDidChange=r,r}var Et=new v,q=class{constructor(e){this._renderer=e}render({container:e,transform:t}){let r=e.parent,s=e.renderGroup.renderGroupParent;e.parent=null,e.renderGroup.renderGroupParent=null;let i=this._renderer,a=Et;t&&(a.copyFrom(e.renderGroup.localTransform),e.renderGroup.localTransform.copyFrom(t));let l=i.renderPipes;this._updateCachedRenderGroups(e.renderGroup,null),this._updateRenderGroups(e.renderGroup),i.globalUniforms.start({worldTransformMatrix:t?e.renderGroup.localTransform:e.renderGroup.worldTransform,worldColor:e.renderGroup.worldColorAlpha}),V(e.renderGroup,l),l.uniformBatch&&l.uniformBatch.renderEnd(),t&&e.renderGroup.localTransform.copyFrom(a),e.parent=r,e.renderGroup.renderGroupParent=s}destroy(){this._renderer=null}_updateCachedRenderGroups(e,t){if(e._parentCacheAsTextureRenderGroup=t,e.isCachedAsTexture){if(!e.textureNeedsUpdate)return;t=e}for(let r=e.renderGroupChildren.length-1;r>=0;r--)this._updateCachedRenderGroups(e.renderGroupChildren[r],t);if(e.invalidateMatrices(),e.isCachedAsTexture){if(e.textureNeedsUpdate){let r=e.root.getLocalBounds();r.ceil();let s=e.texture;e.texture&&S.returnTexture(e.texture,!0);let i=this._renderer,a=e.textureOptions.resolution||i.view.resolution,l=e.textureOptions.antialias??i.view.antialias,u=e.textureOptions.scaleMode??"linear",d=S.getOptimalTexture(r.width,r.height,a,l);d._source.style=new We({scaleMode:u}),e.texture=d,e._textureBounds||(e._textureBounds=new B),e._textureBounds.copyFrom(r),s!==e.texture&&e.renderGroupParent&&(e.renderGroupParent.structureDidChange=!0)}}else e.texture&&(S.returnTexture(e.texture,!0),e.texture=null)}_updateRenderGroups(e){let t=this._renderer,r=t.renderPipes;if(e.runOnRender(t),e.instructionSet.renderPipes=r,e.structureDidChange?$(e.childrenRenderablesToUpdate.list,0):rt(e,r),Se(e),e.structureDidChange?(e.structureDidChange=!1,this._buildInstructions(e,t)):this._updateRenderables(e),e.childrenRenderablesToUpdate.index=0,t.renderPipes.batch.upload(e.instructionSet),!(e.isCachedAsTexture&&!e.textureNeedsUpdate))for(let s=0;s<e.renderGroupChildren.length;s++)this._updateRenderGroups(e.renderGroupChildren[s])}_updateRenderables(e){let{list:t,index:r}=e.childrenRenderablesToUpdate;for(let s=0;s<r;s++){let i=t[s];i.didViewUpdate&&e.updateRenderable(i)}$(t,r)}_buildInstructions(e,t){let r=e.root,s=e.instructionSet;s.reset();let i=t.renderPipes?t:t.batch.renderer,a=i.renderPipes;a.batch.buildStart(s),a.blendMode.buildStart(),a.colorMask.buildStart(),r.sortableChildren&&r.sortChildren(),r.collectRenderablesWithEffects(s,i,null),a.batch.buildEnd(s),a.blendMode.buildEnd(s)}};q.extension={type:[o.WebGLSystem,o.WebGPUSystem,o.CanvasSystem],name:"renderGroup"};var K=class{constructor(e){this._renderer=e}addRenderable(e,t){let r=this._getGpuSprite(e);e.didViewUpdate&&this._updateBatchableSprite(e,r),this._renderer.renderPipes.batch.addToBatch(r,t)}updateRenderable(e){let t=this._getGpuSprite(e);e.didViewUpdate&&this._updateBatchableSprite(e,t),t._batcher.updateElement(t)}validateRenderable(e){let t=this._getGpuSprite(e);return!t._batcher.checkAndUpdateTexture(t,e._texture)}_updateBatchableSprite(e,t){t.bounds=e.visualBounds,t.texture=e._texture}_getGpuSprite(e){return e._gpuData[this._renderer.uid]||this._initGPUSprite(e)}_initGPUSprite(e){let t=new ce;return t.renderable=e,t.transform=e.groupTransform,t.texture=e._texture,t.bounds=e.visualBounds,t.roundPixels=this._renderer._roundPixels|e._roundPixels,e._gpuData[this._renderer.uid]=t,t}destroy(){this._renderer=null}};K.extension={type:[o.WebGLPipes,o.WebGPUPipes,o.CanvasPipes],name:"sprite"};var A="8.14.3";var Me=class{static init(){globalThis.__PIXI_APP_INIT__?.(this,A)}static destroy(){}};Me.extension=o.Application;var Y=class{constructor(e){this._renderer=e}init(){globalThis.__PIXI_RENDERER_INIT__?.(this._renderer,A)}destroy(){this._renderer=null}};Y.extension={type:[o.WebGLSystem,o.WebGPUSystem],name:"initHook",priority:-10};var Pe=class st{constructor(e,t){this.state=Ke.for2d(),this._batchersByInstructionSet=Object.create(null),this._activeBatches=Object.create(null),this.renderer=e,this._adaptor=t,this._adaptor.init?.(this)}static getBatcher(e){return new this._availableBatchers[e]}buildStart(e){let t=this._batchersByInstructionSet[e.uid];t||(t=this._batchersByInstructionSet[e.uid]=Object.create(null),t.default||(t.default=new Ce({maxTextures:this.renderer.limits.maxBatchableTextures}))),this._activeBatches=t,this._activeBatch=this._activeBatches.default;for(let r in this._activeBatches)this._activeBatches[r].begin()}addToBatch(e,t){if(this._activeBatch.name!==e.batcherName){this._activeBatch.break(t);let r=this._activeBatches[e.batcherName];r||(r=this._activeBatches[e.batcherName]=st.getBatcher(e.batcherName),r.begin()),this._activeBatch=r}this._activeBatch.add(e)}break(e){this._activeBatch.break(e)}buildEnd(e){this._activeBatch.break(e);let t=this._activeBatches;for(let r in t){let s=t[r],i=s.geometry;i.indexBuffer.setDataWithSize(s.indexBuffer,s.indexSize,!0),i.buffers[0].setDataWithSize(s.attributeBuffer.float32View,s.attributeSize,!1)}}upload(e){let t=this._batchersByInstructionSet[e.uid];for(let r in t){let s=t[r],i=s.geometry;s.dirty&&(s.dirty=!1,i.buffers[0].update(s.attributeSize*4))}}execute(e){if(e.action==="startBatch"){let t=e.batcher,r=t.geometry,s=t.shader;this._adaptor.start(this,r,s)}this._adaptor.execute(this,e)}destroy(){this.state=null,this.renderer=null,this._adaptor=null;for(let e in this._activeBatches)this._activeBatches[e].destroy();this._activeBatches=null}};Pe.extension={type:[o.WebGLPipes,o.WebGPUPipes,o.CanvasPipes],name:"batch"};Pe._availableBatchers=Object.create(null);var Re=Pe;C.handleByMap(o.Batcher,Re._availableBatchers);C.add(Ce);var nt=`in vec2 vMaskCoord;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform sampler2D uMaskTexture;

uniform float uAlpha;
uniform vec4 uMaskClamp;
uniform float uInverse;

out vec4 finalColor;

void main(void)
{
    float clip = step(3.5,
        step(uMaskClamp.x, vMaskCoord.x) +
        step(uMaskClamp.y, vMaskCoord.y) +
        step(vMaskCoord.x, uMaskClamp.z) +
        step(vMaskCoord.y, uMaskClamp.w));

    // TODO look into why this is needed
    float npmAlpha = uAlpha;
    vec4 original = texture(uTexture, vTextureCoord);
    vec4 masky = texture(uMaskTexture, vMaskCoord);
    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);

    float a = alphaMul * masky.r * npmAlpha * clip;

    if (uInverse == 1.0) {
        a = 1.0 - a;
    }

    finalColor = original * a;
}
`;var it=`in vec2 aPosition;

out vec2 vTextureCoord;
out vec2 vMaskCoord;


uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
uniform mat3 uFilterMatrix;

vec4 filterVertexPosition(  vec2 aPosition )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
       
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(  vec2 aPosition )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

vec2 getFilterCoord( vec2 aPosition )
{
    return  ( uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}   

void main(void)
{
    gl_Position = filterVertexPosition(aPosition);
    vTextureCoord = filterTextureCoord(aPosition);
    vMaskCoord = getFilterCoord(aPosition);
}
`;var Be=`struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct MaskUniforms {
  uFilterMatrix:mat3x3<f32>,
  uMaskClamp:vec4<f32>,
  uAlpha:f32,
  uInverse:f32,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> filterUniforms : MaskUniforms;
@group(1) @binding(1) var uMaskTexture: texture_2d<f32>;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) filterUv : vec2<f32>,
};

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);
}

fn getFilterCoord(aPosition:vec2<f32> ) -> vec2<f32>
{
  return ( filterUniforms.uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}

fn getSize() -> vec2<f32>
{
  return gfu.uGlobalFrame.zw;
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>,
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
   getFilterCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) filterUv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var maskClamp = filterUniforms.uMaskClamp;
    var uAlpha = filterUniforms.uAlpha;

    var clip = step(3.5,
      step(maskClamp.x, filterUv.x) +
      step(maskClamp.y, filterUv.y) +
      step(filterUv.x, maskClamp.z) +
      step(filterUv.y, maskClamp.w));

    var mask = textureSample(uMaskTexture, uSampler, filterUv);
    var source = textureSample(uTexture, uSampler, uv);
    var alphaMul = 1.0 - uAlpha * (1.0 - mask.a);

    var a: f32 = alphaMul * mask.r * uAlpha * clip;

    if (filterUniforms.uInverse == 1.0) {
        a = 1.0 - a;
    }

    return source * a;
}
`;var fe=class extends Xe{constructor(e){let u=e,{sprite:t}=u,r=Fe(u,["sprite"]),s=new Ne(t.texture),i=new de({uFilterMatrix:{value:new v,type:"mat3x3<f32>"},uMaskClamp:{value:s.uClampFrame,type:"vec4<f32>"},uAlpha:{value:1,type:"f32"},uInverse:{value:e.inverse?1:0,type:"f32"}}),a=qe.from({vertex:{source:Be,entryPoint:"mainVertex"},fragment:{source:Be,entryPoint:"mainFragment"}}),l=$e.from({vertex:it,fragment:nt,name:"mask-filter"});super(M(c({},r),{gpuProgram:a,glProgram:l,clipToViewport:!1,resources:{filterUniforms:i,uMaskTexture:t.texture.source}})),this.sprite=t,this._textureMatrix=s}set inverse(e){this.resources.filterUniforms.uniforms.uInverse=e?1:0}get inverse(){return this.resources.filterUniforms.uniforms.uInverse===1}apply(e,t,r,s){this._textureMatrix.texture=this.sprite.texture,e.calculateSpriteMatrix(this.resources.filterUniforms.uniforms.uFilterMatrix,this.sprite).prepend(this._textureMatrix.mapCoord),this.resources.uMaskTexture=this.sprite.texture.source,e.applyFilter(this,t,r,s)}};var Ut=new B,Ee=class extends ue{constructor(){super(),this.filters=[new fe({sprite:new Ve(p.EMPTY),inverse:!1,resolution:"inherit",antialias:"inherit"})]}get sprite(){return this.filters[0].sprite}set sprite(e){this.filters[0].sprite=e}get inverse(){return this.filters[0].inverse}set inverse(e){this.filters[0].inverse=e}},X=class{constructor(e){this._activeMaskStage=[],this._renderer=e}push(e,t,r){let s=this._renderer;if(s.renderPipes.batch.break(r),r.add({renderPipeId:"alphaMask",action:"pushMaskBegin",mask:e,inverse:t._maskOptions.inverse,canBundle:!1,maskedContainer:t}),e.inverse=t._maskOptions.inverse,e.renderMaskToTexture){let i=e.mask;i.includeInBuild=!0,i.collectRenderables(r,s,null),i.includeInBuild=!1}s.renderPipes.batch.break(r),r.add({renderPipeId:"alphaMask",action:"pushMaskEnd",mask:e,maskedContainer:t,inverse:t._maskOptions.inverse,canBundle:!1})}pop(e,t,r){this._renderer.renderPipes.batch.break(r),r.add({renderPipeId:"alphaMask",action:"popMaskEnd",mask:e,inverse:t._maskOptions.inverse,canBundle:!1})}execute(e){let t=this._renderer,r=e.mask.renderMaskToTexture;if(e.action==="pushMaskBegin"){let s=R.get(Ee);if(s.inverse=e.inverse,r){e.mask.mask.measurable=!0;let i=He(e.mask.mask,!0,Ut);e.mask.mask.measurable=!1,i.ceil();let a=t.renderTarget.renderTarget.colorTexture.source,l=S.getOptimalTexture(i.width,i.height,a._resolution,a.antialias);t.renderTarget.push(l,!0),t.globalUniforms.push({offset:i,worldColor:4294967295});let u=s.sprite;u.texture=l,u.worldTransform.tx=i.minX,u.worldTransform.ty=i.minY,this._activeMaskStage.push({filterEffect:s,maskedContainer:e.maskedContainer,filterTexture:l})}else s.sprite=e.mask.mask,this._activeMaskStage.push({filterEffect:s,maskedContainer:e.maskedContainer})}else if(e.action==="pushMaskEnd"){let s=this._activeMaskStage[this._activeMaskStage.length-1];r&&(t.type===U.WEBGL&&t.renderTarget.finishRenderPass(),t.renderTarget.pop(),t.globalUniforms.pop()),t.filter.push({renderPipeId:"filter",action:"pushFilter",container:s.maskedContainer,filterEffect:s.filterEffect,canBundle:!1})}else if(e.action==="popMaskEnd"){t.filter.pop();let s=this._activeMaskStage.pop();r&&S.returnTexture(s.filterTexture),R.return(s.filterEffect)}}destroy(){this._renderer=null,this._activeMaskStage=null}};X.extension={type:[o.WebGLPipes,o.WebGPUPipes,o.CanvasPipes],name:"alphaMask"};var J=class{constructor(e){this._colorStack=[],this._colorStackIndex=0,this._currentColor=0,this._renderer=e}buildStart(){this._colorStack[0]=15,this._colorStackIndex=1,this._currentColor=15}push(e,t,r){this._renderer.renderPipes.batch.break(r);let i=this._colorStack;i[this._colorStackIndex]=i[this._colorStackIndex-1]&e.mask;let a=this._colorStack[this._colorStackIndex];a!==this._currentColor&&(this._currentColor=a,r.add({renderPipeId:"colorMask",colorMask:a,canBundle:!1})),this._colorStackIndex++}pop(e,t,r){this._renderer.renderPipes.batch.break(r);let i=this._colorStack;this._colorStackIndex--;let a=i[this._colorStackIndex-1];a!==this._currentColor&&(this._currentColor=a,r.add({renderPipeId:"colorMask",colorMask:a,canBundle:!1}))}execute(e){this._renderer.colorMask.setMask(e.colorMask)}destroy(){this._renderer=null,this._colorStack=null}};J.extension={type:[o.WebGLPipes,o.WebGPUPipes,o.CanvasPipes],name:"colorMask"};var Q=class{constructor(e){this._maskStackHash={},this._maskHash=new WeakMap,this._renderer=e}push(e,t,r){var s;let i=e,a=this._renderer;a.renderPipes.batch.break(r),a.renderPipes.blendMode.setBlendMode(i.mask,"none",r),r.add({renderPipeId:"stencilMask",action:"pushMaskBegin",mask:e,inverse:t._maskOptions.inverse,canBundle:!1});let l=i.mask;l.includeInBuild=!0,this._maskHash.has(i)||this._maskHash.set(i,{instructionsStart:0,instructionsLength:0});let u=this._maskHash.get(i);u.instructionsStart=r.instructionSize,l.collectRenderables(r,a,null),l.includeInBuild=!1,a.renderPipes.batch.break(r),r.add({renderPipeId:"stencilMask",action:"pushMaskEnd",mask:e,inverse:t._maskOptions.inverse,canBundle:!1});let d=r.instructionSize-u.instructionsStart-1;u.instructionsLength=d;let h=a.renderTarget.renderTarget.uid;(s=this._maskStackHash)[h]??(s[h]=0)}pop(e,t,r){let s=e,i=this._renderer;i.renderPipes.batch.break(r),i.renderPipes.blendMode.setBlendMode(s.mask,"none",r),r.add({renderPipeId:"stencilMask",action:"popMaskBegin",inverse:t._maskOptions.inverse,canBundle:!1});let a=this._maskHash.get(e);for(let l=0;l<a.instructionsLength;l++)r.instructions[r.instructionSize++]=r.instructions[a.instructionsStart++];r.add({renderPipeId:"stencilMask",action:"popMaskEnd",canBundle:!1})}execute(e){var t;let r=this._renderer,s=r.renderTarget.renderTarget.uid,i=(t=this._maskStackHash)[s]??(t[s]=0);e.action==="pushMaskBegin"?(r.renderTarget.ensureDepthStencil(),r.stencil.setStencilMode(m.RENDERING_MASK_ADD,i),i++,r.colorMask.setMask(0)):e.action==="pushMaskEnd"?(e.inverse?r.stencil.setStencilMode(m.INVERSE_MASK_ACTIVE,i):r.stencil.setStencilMode(m.MASK_ACTIVE,i),r.colorMask.setMask(15)):e.action==="popMaskBegin"?(r.colorMask.setMask(0),i!==0?r.stencil.setStencilMode(m.RENDERING_MASK_REMOVE,i):(r.renderTarget.clear(null,y.STENCIL),r.stencil.setStencilMode(m.DISABLED,i)),i--):e.action==="popMaskEnd"&&(e.inverse?r.stencil.setStencilMode(m.INVERSE_MASK_ACTIVE,i):r.stencil.setStencilMode(m.MASK_ACTIVE,i),r.colorMask.setMask(15)),this._maskStackHash[s]=i}destroy(){this._renderer=null,this._maskStackHash=null,this._maskHash=null}};Q.extension={type:[o.WebGLPipes,o.WebGPUPipes,o.CanvasPipes],name:"stencilMask"};var Ue=class at{constructor(){this.clearBeforeRender=!0,this._backgroundColor=new g(0),this.color=this._backgroundColor,this.alpha=1}init(e){e=c(c({},at.defaultOptions),e),this.clearBeforeRender=e.clearBeforeRender,this.color=e.background||e.backgroundColor||this._backgroundColor,this.alpha=e.backgroundAlpha,this._backgroundColor.setAlpha(e.backgroundAlpha)}get color(){return this._backgroundColor}set color(e){g.shared.setValue(e).alpha<1&&this._backgroundColor.alpha===1&&P("Cannot set a transparent background on an opaque canvas. To enable transparency, set backgroundAlpha < 1 when initializing your Application."),this._backgroundColor.setValue(e)}get alpha(){return this._backgroundColor.alpha}set alpha(e){this._backgroundColor.setAlpha(e)}get colorRgba(){return this._backgroundColor.toArray()}destroy(){}};Ue.extension={type:[o.WebGLSystem,o.WebGPUSystem,o.CanvasSystem],name:"background",priority:0};Ue.defaultOptions={backgroundAlpha:1,backgroundColor:0,clearBeforeRender:!0};var ot=Ue;var Z={};C.handle(o.BlendMode,n=>{if(!n.name)throw new Error("BlendMode extension must have a name property");Z[n.name]=n.ref},n=>{delete Z[n.name]});var ee=class{constructor(e){this._blendModeStack=[],this._isAdvanced=!1,this._filterHash=Object.create(null),this._renderer=e,this._renderer.runners.prerender.add(this)}prerender(){this._activeBlendMode="normal",this._isAdvanced=!1}pushBlendMode(e,t,r){this._blendModeStack.push(t),this.setBlendMode(e,t,r)}popBlendMode(e){this._blendModeStack.pop();let t=this._blendModeStack[this._activeBlendMode.length-1]??"normal";this.setBlendMode(null,t,e)}setBlendMode(e,t,r){let s=e instanceof ve;if(this._activeBlendMode===t){this._isAdvanced&&e&&!s&&this._renderableList?.push(e);return}this._isAdvanced&&this._endAdvancedBlendMode(r),this._activeBlendMode=t,e&&(this._isAdvanced=!!Z[t],this._isAdvanced&&this._beginAdvancedBlendMode(e,r))}_beginAdvancedBlendMode(e,t){this._renderer.renderPipes.batch.break(t);let r=this._activeBlendMode;if(!Z[r]){P(`Unable to assign BlendMode: '${r}'. You may want to include: import 'pixi.js/advanced-blend-modes'`);return}let s=this._ensureFilterEffect(r),i=e instanceof ve,a={renderPipeId:"filter",action:"pushFilter",filterEffect:s,renderables:i?null:[e],container:i?e.root:null,canBundle:!1};this._renderableList=a.renderables,t.add(a)}_ensureFilterEffect(e){let t=this._filterHash[e];return t||(t=this._filterHash[e]=new ue,t.filters=[new Z[e]]),t}_endAdvancedBlendMode(e){this._isAdvanced=!1,this._renderableList=null,this._renderer.renderPipes.batch.break(e),e.add({renderPipeId:"filter",action:"popFilter",canBundle:!1})}buildStart(){this._isAdvanced=!1}buildEnd(e){this._isAdvanced&&this._endAdvancedBlendMode(e)}destroy(){this._renderer=null,this._renderableList=null;for(let e in this._filterHash)this._filterHash[e].destroy();this._filterHash=null}};ee.extension={type:[o.WebGLPipes,o.WebGPUPipes,o.CanvasPipes],name:"blendMode"};var Ie={png:"image/png",jpg:"image/jpeg",webp:"image/webp"},Ae=class lt{constructor(e){this._renderer=e}_normalizeOptions(e,t={}){return e instanceof _||e instanceof p?c({target:e},t):c(c({},t),e)}image(e){return k(this,null,function*(){let t=E.get().createImage();return t.src=yield this.base64(e),t})}base64(e){return k(this,null,function*(){e=this._normalizeOptions(e,lt.defaultImageOptions);let{format:t,quality:r}=e,s=this.canvas(e);if(s.toBlob!==void 0)return new Promise((i,a)=>{s.toBlob(l=>{if(!l){a(new Error("ICanvas.toBlob failed!"));return}let u=new FileReader;u.onload=()=>i(u.result),u.onerror=a,u.readAsDataURL(l)},Ie[t],r)});if(s.toDataURL!==void 0)return s.toDataURL(Ie[t],r);if(s.convertToBlob!==void 0){let i=yield s.convertToBlob({type:Ie[t],quality:r});return new Promise((a,l)=>{let u=new FileReader;u.onload=()=>a(u.result),u.onerror=l,u.readAsDataURL(i)})}throw new Error("Extract.base64() requires ICanvas.toDataURL, ICanvas.toBlob, or ICanvas.convertToBlob to be implemented")})}canvas(e){e=this._normalizeOptions(e);let t=e.target,r=this._renderer;if(t instanceof p)return r.texture.generateCanvas(t);let s=r.textureGenerator.generateTexture(e),i=r.texture.generateCanvas(s);return s.destroy(!0),i}pixels(e){e=this._normalizeOptions(e);let t=e.target,r=this._renderer,s=t instanceof p?t:r.textureGenerator.generateTexture(e),i=r.texture.getPixels(s);return t instanceof _&&s.destroy(!0),i}texture(e){return e=this._normalizeOptions(e),e.target instanceof p?e.target:this._renderer.textureGenerator.generateTexture(e)}download(e){e=this._normalizeOptions(e);let t=this.canvas(e),r=document.createElement("a");r.download=e.filename??"image.png",r.href=t.toDataURL("image/png"),document.body.appendChild(r),r.click(),document.body.removeChild(r)}log(e){let t=e.width??200;e=this._normalizeOptions(e);let r=this.canvas(e),s=r.toDataURL();console.log(`[Pixi Texture] ${r.width}px ${r.height}px`);let i=["font-size: 1px;",`padding: ${t}px 300px;`,`background: url(${s}) no-repeat;`,"background-size: contain;"].join(" ");console.log("%c ",i)}destroy(){this._renderer=null}};Ae.extension={type:[o.WebGLSystem,o.WebGPUSystem],name:"extract"};Ae.defaultImageOptions={format:"png",quality:1};var ut=Ae;var pe=class n extends p{static create(e){return new n({source:new T(e)})}resize(e,t,r){return this.source.resize(e,t,r),this}};var It=new w,At=new B,Gt=[0,0,0,0],te=class{constructor(e){this._renderer=e}generateTexture(e){e instanceof _&&(e={target:e,frame:void 0,textureSourceOptions:{},resolution:void 0});let t=e.resolution||this._renderer.resolution,r=e.antialias||this._renderer.view.antialias,s=e.target,i=e.clearColor;i?i=Array.isArray(i)&&i.length===4?i:g.shared.setValue(i).toArray():i=Gt;let a=e.frame?.copyTo(It)||ze(s,At).rectangle;a.width=Math.max(a.width,1/t)|0,a.height=Math.max(a.height,1/t)|0;let l=pe.create(M(c({},e.textureSourceOptions),{width:a.width,height:a.height,resolution:t,antialias:r})),u=v.shared.translate(-a.x,-a.y);return this._renderer.render({container:s,transform:u,target:l,clearColor:i}),l.source.updateMipmaps(),l}destroy(){this._renderer=null}};te.extension={type:[o.WebGLSystem,o.WebGPUSystem],name:"textureGenerator"};var re=class{constructor(e){this._stackIndex=0,this._globalUniformDataStack=[],this._uniformsPool=[],this._activeUniforms=[],this._bindGroupPool=[],this._activeBindGroups=[],this._renderer=e}reset(){this._stackIndex=0;for(let e=0;e<this._activeUniforms.length;e++)this._uniformsPool.push(this._activeUniforms[e]);for(let e=0;e<this._activeBindGroups.length;e++)this._bindGroupPool.push(this._activeBindGroups[e]);this._activeUniforms.length=0,this._activeBindGroups.length=0}start(e){this.reset(),this.push(e)}bind({size:e,projectionMatrix:t,worldTransformMatrix:r,worldColor:s,offset:i}){let a=this._renderer.renderTarget.renderTarget,l=this._stackIndex?this._globalUniformDataStack[this._stackIndex-1]:{projectionData:a,worldTransformMatrix:new v,worldColor:4294967295,offset:new Le},u={projectionMatrix:t||this._renderer.renderTarget.projectionMatrix,resolution:e||a.size,worldTransformMatrix:r||l.worldTransformMatrix,worldColor:s||l.worldColor,offset:i||l.offset,bindGroup:null},d=this._uniformsPool.pop()||this._createUniforms();this._activeUniforms.push(d);let h=d.uniforms;h.uProjectionMatrix=u.projectionMatrix,h.uResolution=u.resolution,h.uWorldTransformMatrix.copyFrom(u.worldTransformMatrix),h.uWorldTransformMatrix.tx-=u.offset.x,h.uWorldTransformMatrix.ty-=u.offset.y,Ye(u.worldColor,h.uWorldColorAlpha,0),d.update();let f;this._renderer.renderPipes.uniformBatch?f=this._renderer.renderPipes.uniformBatch.getUniformBindGroup(d,!1):(f=this._bindGroupPool.pop()||new je,this._activeBindGroups.push(f),f.setResource(d,0)),u.bindGroup=f,this._currentGlobalUniformData=u}push(e){this.bind(e),this._globalUniformDataStack[this._stackIndex++]=this._currentGlobalUniformData}pop(){this._currentGlobalUniformData=this._globalUniformDataStack[--this._stackIndex-1],this._renderer.type===U.WEBGL&&this._currentGlobalUniformData.bindGroup.resources[0].update()}get bindGroup(){return this._currentGlobalUniformData.bindGroup}get globalUniformData(){return this._currentGlobalUniformData}get uniformGroup(){return this._currentGlobalUniformData.bindGroup.resources[0]}_createUniforms(){return new de({uProjectionMatrix:{value:new v,type:"mat3x3<f32>"},uWorldTransformMatrix:{value:new v,type:"mat3x3<f32>"},uWorldColorAlpha:{value:new Float32Array(4),type:"vec4<f32>"},uResolution:{value:[0,0],type:"vec2<f32>"}},{isStatic:!0})}destroy(){this._renderer=null,this._globalUniformDataStack.length=0,this._uniformsPool.length=0,this._activeUniforms.length=0,this._bindGroupPool.length=0,this._activeBindGroups.length=0,this._currentGlobalUniformData=null}};re.extension={type:[o.WebGLSystem,o.WebGPUSystem,o.CanvasSystem],name:"globalUniforms"};var Ot=1,se=class{constructor(){this._tasks=[],this._offset=0}init(){Te.system.add(this._update,this)}repeat(e,t,r=!0){let s=Ot++,i=0;return r&&(this._offset+=1e3,i=this._offset),this._tasks.push({func:e,duration:t,start:performance.now(),offset:i,last:performance.now(),repeat:!0,id:s}),s}cancel(e){for(let t=0;t<this._tasks.length;t++)if(this._tasks[t].id===e){this._tasks.splice(t,1);return}}_update(){let e=performance.now();for(let t=0;t<this._tasks.length;t++){let r=this._tasks[t];if(e-r.offset-r.last>=r.duration){let s=e-r.start;r.func(s),r.last=e}}}destroy(){Te.system.remove(this._update,this),this._tasks.length=0}};se.extension={type:[o.WebGLSystem,o.WebGPUSystem,o.CanvasSystem],name:"scheduler",priority:0};var dt=!1;function ct(n){if(!dt){if(E.get().getNavigator().userAgent.toLowerCase().indexOf("chrome")>-1){let e=[`%c  %c  %c  %c  %c PixiJS %c v${A} (${n}) http://www.pixijs.com/

`,"background: #E72264; padding:5px 0;","background: #6CA2EA; padding:5px 0;","background: #B5D33D; padding:5px 0;","background: #FED23F; padding:5px 0;","color: #FFFFFF; background: #E72264; padding:5px 0;","color: #E72264; background: #FFFFFF; padding:5px 0;"];globalThis.console.log(...e)}else globalThis.console&&globalThis.console.log(`PixiJS ${A} - ${n} - http://www.pixijs.com/`);dt=!0}}var G=class{constructor(e){this._renderer=e}init(e){if(e.hello){let t=this._renderer.name;this._renderer.type===U.WEBGL&&(t+=` ${this._renderer.context.webGLVersion}`),ct(t)}}};G.extension={type:[o.WebGLSystem,o.WebGPUSystem,o.CanvasSystem],name:"hello",priority:-2};G.defaultOptions={hello:!1};function ht(n){let e=!1;for(let r in n)if(n[r]==null){e=!0;break}if(!e)return n;let t=Object.create(null);for(let r in n){let s=n[r];s&&(t[r]=s)}return t}function ft(n){let e=0;for(let t=0;t<n.length;t++)n[t]==null?e++:n[t-e]=n[t];return n.length-=e,n}var Dt=0,Ge=class pt{constructor(e){this._managedRenderables=[],this._managedHashes=[],this._managedArrays=[],this._renderer=e}init(e){e=c(c({},pt.defaultOptions),e),this.maxUnusedTime=e.renderableGCMaxUnusedTime,this._frequency=e.renderableGCFrequency,this.enabled=e.renderableGCActive}get enabled(){return!!this._handler}set enabled(e){this.enabled!==e&&(e?(this._handler=this._renderer.scheduler.repeat(()=>this.run(),this._frequency,!1),this._hashHandler=this._renderer.scheduler.repeat(()=>{for(let t of this._managedHashes)t.context[t.hash]=ht(t.context[t.hash])},this._frequency),this._arrayHandler=this._renderer.scheduler.repeat(()=>{for(let t of this._managedArrays)ft(t.context[t.hash])},this._frequency)):(this._renderer.scheduler.cancel(this._handler),this._renderer.scheduler.cancel(this._hashHandler),this._renderer.scheduler.cancel(this._arrayHandler)))}addManagedHash(e,t){this._managedHashes.push({context:e,hash:t})}addManagedArray(e,t){this._managedArrays.push({context:e,hash:t})}prerender({container:e}){this._now=performance.now(),e.renderGroup.gcTick=Dt++,this._updateInstructionGCTick(e.renderGroup,e.renderGroup.gcTick)}addRenderable(e){this.enabled&&(e._lastUsed===-1&&(this._managedRenderables.push(e),e.once("destroyed",this._removeRenderable,this)),e._lastUsed=this._now)}run(){let e=this._now,t=this._managedRenderables,r=this._renderer.renderPipes,s=0;for(let i=0;i<t.length;i++){let a=t[i];if(a===null){s++;continue}let l=a.renderGroup??a.parentRenderGroup,u=l?.instructionSet?.gcTick??-1;if((l?.gcTick??0)===u&&(a._lastUsed=e),e-a._lastUsed>this.maxUnusedTime){if(!a.destroyed){let d=r;l&&(l.structureDidChange=!0),d[a.renderPipeId].destroyRenderable(a)}a._lastUsed=-1,s++,a.off("destroyed",this._removeRenderable,this)}else t[i-s]=a}t.length-=s}destroy(){this.enabled=!1,this._renderer=null,this._managedRenderables.length=0,this._managedHashes.length=0,this._managedArrays.length=0}_removeRenderable(e){let t=this._managedRenderables.indexOf(e);t>=0&&(e.off("destroyed",this._removeRenderable,this),this._managedRenderables[t]=null)}_updateInstructionGCTick(e,t){e.instructionSet.gcTick=t;for(let r of e.renderGroupChildren)this._updateInstructionGCTick(r,t)}};Ge.extension={type:[o.WebGLSystem,o.WebGPUSystem],name:"renderableGC",priority:0};Ge.defaultOptions={renderableGCActive:!0,renderableGCMaxUnusedTime:6e4,renderableGCFrequency:3e4};var mt=Ge;var Oe=class xt{constructor(e){this._renderer=e,this.count=0,this.checkCount=0}init(e){e=c(c({},xt.defaultOptions),e),this.checkCountMax=e.textureGCCheckCountMax,this.maxIdle=e.textureGCAMaxIdle??e.textureGCMaxIdle,this.active=e.textureGCActive}postrender(){this._renderer.renderingToScreen&&(this.count++,this.active&&(this.checkCount++,this.checkCount>this.checkCountMax&&(this.checkCount=0,this.run())))}run(){let e=this._renderer.texture.managedTextures;for(let t=0;t<e.length;t++){let r=e[t];r.autoGarbageCollect&&r.resource&&r._touched>-1&&this.count-r._touched>this.maxIdle&&(r._touched=-1,r.unload())}}destroy(){this._renderer=null}};Oe.extension={type:[o.WebGLSystem,o.WebGPUSystem],name:"textureGC"};Oe.defaultOptions={textureGCActive:!0,textureGCAMaxIdle:null,textureGCMaxIdle:3600,textureGCCheckCountMax:600};var vt=Oe;var Ft=(()=>{let n=class gt{constructor(t={}){if(this.uid=b("renderTarget"),this.colorTextures=[],this.dirtyId=0,this.isRoot=!1,this._size=new Float32Array(2),this._managedColorTextures=!1,t=c(c({},gt.defaultOptions),t),this.stencil=t.stencil,this.depth=t.depth,this.isRoot=t.isRoot,typeof t.colorTextures=="number"){this._managedColorTextures=!0;for(let r=0;r<t.colorTextures;r++)this.colorTextures.push(new T({width:t.width,height:t.height,resolution:t.resolution,antialias:t.antialias}))}else{this.colorTextures=[...t.colorTextures.map(s=>s.source)];let r=this.colorTexture.source;this.resize(r.width,r.height,r._resolution)}this.colorTexture.source.on("resize",this.onSourceResize,this),(t.depthStencilTexture||this.stencil)&&(t.depthStencilTexture instanceof p||t.depthStencilTexture instanceof T?this.depthStencilTexture=t.depthStencilTexture.source:this.ensureDepthStencilTexture())}get size(){let t=this._size;return t[0]=this.pixelWidth,t[1]=this.pixelHeight,t}get width(){return this.colorTexture.source.width}get height(){return this.colorTexture.source.height}get pixelWidth(){return this.colorTexture.source.pixelWidth}get pixelHeight(){return this.colorTexture.source.pixelHeight}get resolution(){return this.colorTexture.source._resolution}get colorTexture(){return this.colorTextures[0]}onSourceResize(t){this.resize(t.width,t.height,t._resolution,!0)}ensureDepthStencilTexture(){this.depthStencilTexture||(this.depthStencilTexture=new T({width:this.width,height:this.height,resolution:this.resolution,format:"depth24plus-stencil8",autoGenerateMipmaps:!1,antialias:!1,mipLevelCount:1}))}resize(t,r,s=this.resolution,i=!1){this.dirtyId++,this.colorTextures.forEach((a,l)=>{i&&l===0||a.source.resize(t,r,s)}),this.depthStencilTexture&&this.depthStencilTexture.source.resize(t,r,s)}destroy(){this.colorTexture.source.off("resize",this.onSourceResize,this),this._managedColorTextures&&this.colorTextures.forEach(t=>{t.destroy()}),this.depthStencilTexture&&(this.depthStencilTexture.destroy(),delete this.depthStencilTexture)}};return n.defaultOptions={width:0,height:0,resolution:1,colorTextures:1,stencil:!1,depth:!1,antialias:!1,isRoot:!1},n})(),ne=Ft;var O=new Map;le.register(O);function me(n,e){if(!O.has(n)){let t=new p({source:new H(c({resource:n},e))}),r=()=>{O.get(n)===t&&O.delete(n)};t.once("destroy",r),t.source.once("destroy",r),O.set(n,t)}return O.get(n)}var De=class _t{get autoDensity(){return this.texture.source.autoDensity}set autoDensity(e){this.texture.source.autoDensity=e}get resolution(){return this.texture.source._resolution}set resolution(e){this.texture.source.resize(this.texture.source.width,this.texture.source.height,e)}init(e){e=c(c({},_t.defaultOptions),e),e.view&&(oe(ae,"ViewSystem.view has been renamed to ViewSystem.canvas"),e.canvas=e.view),this.screen=new w(0,0,e.width,e.height),this.canvas=e.canvas||E.get().createCanvas(),this.antialias=!!e.antialias,this.texture=me(this.canvas,e),this.renderTarget=new ne({colorTextures:[this.texture],depth:!!e.depth,isRoot:!0}),this.texture.source.transparent=e.backgroundAlpha<1,this.resolution=e.resolution}resize(e,t,r){this.texture.source.resize(e,t,r),this.screen.width=this.texture.frame.width,this.screen.height=this.texture.frame.height}destroy(e=!1){(typeof e=="boolean"?e:!!e?.removeView)&&this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas),this.texture.destroy()}};De.extension={type:[o.WebGLSystem,o.WebGPUSystem,o.CanvasSystem],name:"view",priority:0};De.defaultOptions={width:800,height:600,autoDensity:!1,antialias:!1};var bt=De;var ai=[ot,re,G,bt,q,vt,te,ut,Y,mt,se],oi=[ee,Re,K,j,X,Q,J,N];var ui={name:"texture-bit",vertex:{header:`

        struct TextureUniforms {
            uTextureMatrix:mat3x3<f32>,
        }

        @group(2) @binding(2) var<uniform> textureUniforms : TextureUniforms;
        `,main:`
            uv = (textureUniforms.uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
            @group(2) @binding(0) var uTexture: texture_2d<f32>;
            @group(2) @binding(1) var uSampler: sampler;


        `,main:`
            outColor = textureSample(uTexture, uSampler, vUV);
        `}},di={name:"texture-bit",vertex:{header:`
            uniform mat3 uTextureMatrix;
        `,main:`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
        uniform sampler2D uTexture;


        `,main:`
            outColor = texture(uTexture, vUV);
        `}};var Tt=class{constructor(e){this._syncFunctionHash=Object.create(null),this._adaptor=e,this._systemCheck()}_systemCheck(){if(!he())throw new Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}ensureUniformGroup(e){let t=this.getUniformGroupData(e);e.buffer||(e.buffer=new ye({data:new Float32Array(t.layout.size/4),usage:z.UNIFORM|z.COPY_DST}))}getUniformGroupData(e){return this._syncFunctionHash[e._signature]||this._initUniformGroup(e)}_initUniformGroup(e){let t=e._signature,r=this._syncFunctionHash[t];if(!r){let s=Object.keys(e.uniformStructures).map(l=>e.uniformStructures[l]),i=this._adaptor.createUboElements(s),a=this._generateUboSync(i.uboElements);r=this._syncFunctionHash[t]={layout:i,syncFunction:a}}return this._syncFunctionHash[t]}_generateUboSync(e){return this._adaptor.generateUboSync(e)}syncUniformGroup(e,t,r){let s=this.getUniformGroupData(e);e.buffer||(e.buffer=new ye({data:new Float32Array(s.layout.size/4),usage:z.UNIFORM|z.COPY_DST}));let i=null;return t||(t=e.buffer.data,i=e.buffer.dataInt32),r||(r=0),s.syncFunction(e.uniforms,t,i,r),!0}updateUniformGroup(e){if(e.isStatic&&!e._dirtyId)return!1;e._dirtyId=0;let t=this.syncUniformGroup(e);return e.buffer.update(),t}destroy(){this._syncFunctionHash=null}};var yt=class extends L{constructor({buffer:e,offset:t,size:r}){super(),this.uid=b("buffer"),this._resourceType="bufferResource",this._touched=0,this._resourceId=b("resource"),this._bufferResource=!0,this.destroyed=!1,this.buffer=e,this.offset=t|0,this.size=r,this.buffer.on("change",this.onBufferChange,this)}onBufferChange(){this._resourceId=b("resource"),this.emit("change",this)}destroy(e=!1){this.destroyed=!0,e&&this.buffer.destroy(),this.emit("change",this),this.buffer=null,this.removeAllListeners()}};function Ti(n,e){for(let t in n.attributes){let r=n.attributes[t],s=e[t];s?(r.format??(r.format=s.format),r.offset??(r.offset=s.offset),r.instance??(r.instance=s.instance)):P(`Attribute ${t} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`)}Lt(n)}function Lt(n){let{buffers:e,attributes:t}=n,r={},s={};for(let i in e){let a=e[i];r[a.uid]=0,s[a.uid]=0}for(let i in t){let a=t[i];r[a.buffer.uid]+=ke(a.format).stride}for(let i in t){let a=t[i];a.stride??(a.stride=r[a.buffer.uid]),a.start??(a.start=s[a.buffer.uid]),s[a.buffer.uid]+=ke(a.format).stride}}var D=[];D[m.NONE]=void 0;D[m.DISABLED]={stencilWriteMask:0,stencilReadMask:0};D[m.RENDERING_MASK_ADD]={stencilFront:{compare:"equal",passOp:"increment-clamp"},stencilBack:{compare:"equal",passOp:"increment-clamp"}};D[m.RENDERING_MASK_REMOVE]={stencilFront:{compare:"equal",passOp:"decrement-clamp"},stencilBack:{compare:"equal",passOp:"decrement-clamp"}};D[m.MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"equal",passOp:"keep"},stencilBack:{compare:"equal",passOp:"keep"}};D[m.INVERSE_MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"not-equal",passOp:"keep"},stencilBack:{compare:"not-equal",passOp:"keep"}};function kt(n,e,t,r,s,i){let a=i?1:-1;return n.identity(),n.a=1/r*2,n.d=a*(1/s*2),n.tx=-1-e*n.a,n.ty=-a-t*n.d,n}function Ct(n){let e=n.colorTexture.source.resource;return globalThis.HTMLCanvasElement&&e instanceof HTMLCanvasElement&&document.body.contains(e)}var wt=class{constructor(e){this.rootViewPort=new w,this.viewport=new w,this.onRenderTargetChange=new I("onRenderTargetChange"),this.projectionMatrix=new v,this.defaultClearColor=[0,0,0,0],this._renderSurfaceToRenderTargetHash=new Map,this._gpuRenderTargetHash=Object.create(null),this._renderTargetStack=[],this._renderer=e,e.renderableGC.addManagedHash(this,"_gpuRenderTargetHash")}finishRenderPass(){this.adaptor.finishRenderPass(this.renderTarget)}renderStart({target:e,clear:t,clearColor:r,frame:s}){this._renderTargetStack.length=0,this.push(e,t,r,s),this.rootViewPort.copyFrom(this.viewport),this.rootRenderTarget=this.renderTarget,this.renderingToScreen=Ct(this.rootRenderTarget),this.adaptor.prerender?.(this.rootRenderTarget)}postrender(){this.adaptor.postrender?.(this.rootRenderTarget)}bind(e,t=!0,r,s){let i=this.getRenderTarget(e),a=this.renderTarget!==i;this.renderTarget=i,this.renderSurface=e;let l=this.getGpuRenderTarget(i);(i.pixelWidth!==l.width||i.pixelHeight!==l.height)&&(this.adaptor.resizeGpuRenderTarget(i),l.width=i.pixelWidth,l.height=i.pixelHeight);let u=i.colorTexture,d=this.viewport,h=u.pixelWidth,f=u.pixelHeight;if(!s&&e instanceof p&&(s=e.frame),s){let x=u._resolution;d.x=s.x*x+.5|0,d.y=s.y*x+.5|0,d.width=s.width*x+.5|0,d.height=s.height*x+.5|0}else d.x=0,d.y=0,d.width=h,d.height=f;return kt(this.projectionMatrix,0,0,d.width/u.resolution,d.height/u.resolution,!i.isRoot),this.adaptor.startRenderPass(i,t,r,d),a&&this.onRenderTargetChange.emit(i),i}clear(e,t=y.ALL,r){t&&(e&&(e=this.getRenderTarget(e)),this.adaptor.clear(e||this.renderTarget,t,r,this.viewport))}contextChange(){this._gpuRenderTargetHash=Object.create(null)}push(e,t=y.ALL,r,s){let i=this.bind(e,t,r,s);return this._renderTargetStack.push({renderTarget:i,frame:s}),i}pop(){this._renderTargetStack.pop();let e=this._renderTargetStack[this._renderTargetStack.length-1];this.bind(e.renderTarget,!1,null,e.frame)}getRenderTarget(e){return e.isTexture&&(e=e.source),this._renderSurfaceToRenderTargetHash.get(e)??this._initRenderTarget(e)}copyToTexture(e,t,r,s,i){r.x<0&&(s.width+=r.x,i.x-=r.x,r.x=0),r.y<0&&(s.height+=r.y,i.y-=r.y,r.y=0);let{pixelWidth:a,pixelHeight:l}=e;return s.width=Math.min(s.width,a-r.x),s.height=Math.min(s.height,l-r.y),this.adaptor.copyToTexture(e,t,r,s,i)}ensureDepthStencil(){this.renderTarget.stencil||(this.renderTarget.stencil=!0,this.adaptor.startRenderPass(this.renderTarget,!1,null,this.viewport))}destroy(){this._renderer=null,this._renderSurfaceToRenderTargetHash.forEach((e,t)=>{e!==t&&e.destroy()}),this._renderSurfaceToRenderTargetHash.clear(),this._gpuRenderTargetHash=Object.create(null)}_initRenderTarget(e){let t=null;return H.test(e)&&(e=me(e).source),e instanceof ne?t=e:e instanceof T&&(t=new ne({colorTextures:[e]}),e.source instanceof H&&(t.isRoot=!0),e.once("destroy",()=>{t.destroy(),this._renderSurfaceToRenderTargetHash.delete(e);let r=this._gpuRenderTargetHash[t.uid];r&&(this._gpuRenderTargetHash[t.uid]=null,this.adaptor.destroyGpuRenderTarget(r))})),this._renderSurfaceToRenderTargetHash.set(e,t),t}getGpuRenderTarget(e){return this._gpuRenderTargetHash[e.uid]||(this._gpuRenderTargetHash[e.uid]=this.adaptor.initGpuRenderTarget(e))}resetState(){this.renderTarget=null,this.renderSurface=null}};var ie=[{type:"mat3x3<f32>",test:n=>n.value.a!==void 0,ubo:`
            var matrix = uv[name].toArray(true);
            data[offset] = matrix[0];
            data[offset + 1] = matrix[1];
            data[offset + 2] = matrix[2];
            data[offset + 4] = matrix[3];
            data[offset + 5] = matrix[4];
            data[offset + 6] = matrix[5];
            data[offset + 8] = matrix[6];
            data[offset + 9] = matrix[7];
            data[offset + 10] = matrix[8];
        `,uniform:`
            gl.uniformMatrix3fv(ud[name].location, false, uv[name].toArray(true));
        `},{type:"vec4<f32>",test:n=>n.type==="vec4<f32>"&&n.size===1&&n.value.width!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
            data[offset + 2] = v.width;
            data[offset + 3] = v.height;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height) {
                cv[0] = v.x;
                cv[1] = v.y;
                cv[2] = v.width;
                cv[3] = v.height;
                gl.uniform4f(ud[name].location, v.x, v.y, v.width, v.height);
            }
        `},{type:"vec2<f32>",test:n=>n.type==="vec2<f32>"&&n.size===1&&n.value.x!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y) {
                cv[0] = v.x;
                cv[1] = v.y;
                gl.uniform2f(ud[name].location, v.x, v.y);
            }
        `},{type:"vec4<f32>",test:n=>n.type==="vec4<f32>"&&n.size===1&&n.value.red!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
            data[offset + 3] = v.alpha;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                cv[3] = v.alpha;
                gl.uniform4f(ud[name].location, v.red, v.green, v.blue, v.alpha);
            }
        `},{type:"vec3<f32>",test:n=>n.type==="vec3<f32>"&&n.size===1&&n.value.red!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                gl.uniform3f(ud[name].location, v.red, v.green, v.blue);
            }
        `}];function zi(n,e,t,r){let s=[`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `],i=0;for(let l=0;l<n.length;l++){let u=n[l],d=u.data.name,h=!1,f=0;for(let x=0;x<ie.length;x++)if(ie[x].test(u.data)){f=u.offset/4,s.push(`name = "${d}";`,`offset += ${f-i};`,ie[x][e]||ie[x].ubo),h=!0;break}if(!h)if(u.data.size>1)f=u.offset/4,s.push(t(u,f-i));else{let x=r[u.data.type];f=u.offset/4,s.push(`
                    v = uv.${d};
                    offset += ${f-i};
                    ${x};
                `)}i=f}let a=s.join(`
`);return new Function("uv","data","dataInt32","offset",a)}function F(n,e){return`
        for (let i = 0; i < ${n*e}; i++) {
            data[offset + (((i / ${n})|0) * 4) + (i % ${n})] = v[i];
        }
    `}var Ht={f32:`
        data[offset] = v;`,i32:`
        dataInt32[offset] = v;`,"vec2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];`,"vec3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];`,"vec4<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];`,"vec2<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];`,"vec3<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];`,"vec4<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];
        dataInt32[offset + 3] = v[3];`,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 4] = v[2];
        data[offset + 5] = v[3];`,"mat3x3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];
        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];`,"mat4x4<f32>":`
        for (let i = 0; i < 16; i++) {
            data[offset + i] = v[i];
        }`,"mat3x2<f32>":F(3,2),"mat4x2<f32>":F(4,2),"mat2x3<f32>":F(2,3),"mat4x3<f32>":F(4,3),"mat2x4<f32>":F(2,4),"mat3x4<f32>":F(3,4)},Ni=M(c({},Ht),{"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `});export{y as a,nr as b,ui as c,di as d,Me as e,ai as f,oi as g,Tt as h,ie as i,zi as j,Ht as k,Ni as l,yt as m,Ti as n,D as o,wt as p};
