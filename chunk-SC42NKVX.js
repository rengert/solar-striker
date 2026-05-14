import{a as F}from"./chunk-4ER6F76V.js";import{k as v}from"./chunk-7FXSR6ZL.js";import{F as y,L as x,M as g,c as I,i as b,m as M}from"./chunk-2ACP26B7.js";import{a as d,b as p}from"./chunk-RA2WU32H.js";var _={name:"local-uniform-bit",vertex:{header:`

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,main:`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,end:`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `}},A=p(d({},_),{vertex:p(d({},_.vertex),{header:_.vertex.header.replace("group(1)","group(2)")})}),k={name:"local-uniform-bit",vertex:{header:`

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,main:`
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `,end:`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `}};var P={name:"texture-bit",vertex:{header:`

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
        `}},B={name:"texture-bit",vertex:{header:`
            uniform mat3 uTextureMatrix;
        `,main:`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
        uniform sampler2D uTexture;


        `,main:`
            outColor = texture(uTexture, vUV);
        `}};var T=class{constructor(t){this._syncFunctionHash=Object.create(null),this._adaptor=t,this._systemCheck()}_systemCheck(){if(!F())throw new Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}ensureUniformGroup(t){let a=this.getUniformGroupData(t);t.buffer||(t.buffer=new g({data:new Float32Array(a.layout.size/4),usage:x.UNIFORM|x.COPY_DST}))}getUniformGroupData(t){return this._syncFunctionHash[t._signature]||this._initUniformGroup(t)}_initUniformGroup(t){let a=t._signature,r=this._syncFunctionHash[a];if(!r){let o=Object.keys(t.uniformStructures).map(l=>t.uniformStructures[l]),n=this._adaptor.createUboElements(o),s=this._generateUboSync(n.uboElements);r=this._syncFunctionHash[a]={layout:n,syncFunction:s}}return this._syncFunctionHash[a]}_generateUboSync(t){return this._adaptor.generateUboSync(t)}syncUniformGroup(t,a,r){let o=this.getUniformGroupData(t);t.buffer||(t.buffer=new g({data:new Float32Array(o.layout.size/4),usage:x.UNIFORM|x.COPY_DST}));let n=null;return a||(a=t.buffer.data,n=t.buffer.dataInt32),r||(r=0),o.syncFunction(t.uniforms,a,n,r),!0}updateUniformGroup(t){if(t.isStatic&&!t._dirtyId)return!1;t._dirtyId=0;let a=this.syncUniformGroup(t);return t.buffer.update(),a}destroy(){this._syncFunctionHash=null}};var E=class extends I{constructor({buffer:t,offset:a,size:r}){super(),this.uid=b("buffer"),this._resourceType="bufferResource",this._touched=0,this._resourceId=b("resource"),this._bufferResource=!0,this.destroyed=!1,this.buffer=t,this.offset=a|0,this.size=r,this.buffer.on("change",this.onBufferChange,this)}onBufferChange(){this._resourceId=b("resource"),this.emit("change",this)}destroy(t=!1){this.destroyed=!0,t&&this.buffer.destroy(),this.emit("change",this),this.buffer=null,this.removeAllListeners()}};function W(e,t){for(let a in e.attributes){let r=e.attributes[a],o=t[a];o?(r.format??(r.format=o.format),r.offset??(r.offset=o.offset),r.instance??(r.instance=o.instance)):M(`Attribute ${a} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`)}C(e)}function C(e){let{buffers:t,attributes:a}=e,r={},o={};for(let n in t){let s=t[n];r[s.uid]=0,o[s.uid]=0}for(let n in a){let s=a[n];r[s.buffer.uid]+=y(s.format).stride}for(let n in a){let s=a[n];s.stride??(s.stride=r[s.buffer.uid]),s.start??(s.start=o[s.buffer.uid]),o[s.buffer.uid]+=y(s.format).stride}}var c=[];c[v.NONE]=void 0;c[v.DISABLED]={stencilWriteMask:0,stencilReadMask:0};c[v.RENDERING_MASK_ADD]={stencilFront:{compare:"equal",passOp:"increment-clamp"},stencilBack:{compare:"equal",passOp:"increment-clamp"}};c[v.RENDERING_MASK_REMOVE]={stencilFront:{compare:"equal",passOp:"decrement-clamp"},stencilBack:{compare:"equal",passOp:"decrement-clamp"}};c[v.MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"equal",passOp:"keep"},stencilBack:{compare:"equal",passOp:"keep"}};c[v.INVERSE_MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"not-equal",passOp:"keep"},stencilBack:{compare:"not-equal",passOp:"keep"}};var h=[{type:"mat3x3<f32>",test:e=>e.value.a!==void 0,ubo:`
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
        `},{type:"vec4<f32>",test:e=>e.type==="vec4<f32>"&&e.size===1&&e.value.width!==void 0,ubo:`
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
        `},{type:"vec2<f32>",test:e=>e.type==="vec2<f32>"&&e.size===1&&e.value.x!==void 0,ubo:`
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
        `},{type:"vec4<f32>",test:e=>e.type==="vec4<f32>"&&e.size===1&&e.value.red!==void 0,ubo:`
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
        `},{type:"vec3<f32>",test:e=>e.type==="vec3<f32>"&&e.size===1&&e.value.red!==void 0,ubo:`
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
        `}];function tt(e,t,a,r){let o=[`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `],n=0;for(let l=0;l<e.length;l++){let f=e[l],U=f.data.name,S=!1,i=0;for(let u=0;u<h.length;u++)if(h[u].test(f.data)){i=f.offset/4,o.push(`name = "${U}";`,`offset += ${i-n};`,h[u][t]||h[u].ubo),S=!0;break}if(!S)if(f.data.size>1)i=f.offset/4,o.push(a(f,i-n));else{let u=r[f.data.type];i=f.offset/4,o.push(`
                    v = uv.${U};
                    offset += ${i-n};
                    ${u};
                `)}n=i}let s=o.join(`
`);return new Function("uv","data","dataInt32","offset",s)}function m(e,t){return`
        for (let i = 0; i < ${e*t}; i++) {
            data[offset + (((i / ${e})|0) * 4) + (i % ${e})] = v[i];
        }
    `}var D={f32:`
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
        }`,"mat3x2<f32>":m(3,2),"mat4x2<f32>":m(4,2),"mat2x3<f32>":m(2,3),"mat4x3<f32>":m(4,3),"mat2x4<f32>":m(2,4),"mat3x4<f32>":m(3,4)},at=p(d({},D),{"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `});export{_ as a,A as b,k as c,P as d,B as e,T as f,h as g,tt as h,D as i,at as j,E as k,W as l,c as m};
