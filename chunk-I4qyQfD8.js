import{a as x}from"./chunk-DMAWJU-B.js";import{D as _$1,E as Ze$1,S as Ve$1,U as vt,b as U$1,c as I$1,d as Je,j as ct$1,k as _t,l as Ie$1,m as Le,r as C$1,t as $$1}from"./chunk-CHQIWXVB.js";var G=/* @__PURE__ */ new Set;var O=!1;function K(r,t,e=2){let n=t&&t.length,i=n?t[0]*e:r.length;G.size&&G.clear();let o=zt(r,0,i,e,!0),s=[];if(!o||o.next===o.prev)return s;let u=0,a=0,l=0;if(n&&(o=ye(r,t,o,e)),r.length>80*e){u=r[0],a=r[1];let x=u,d=a;for(let p=e;p<i;p+=e){let m=r[p],f=r[p+1];m<u&&(u=m),f<a&&(a=f),m>x&&(x=m),f>d&&(d=f)}l=Math.max(x-u,d-a),l=l!==0?32767/l:0}return q(o,s,u,a,l),s}function zt(r,t,e,n,i){let o=null;if(i===Ce(r,t,e,n)>0)for(let s=t;s<e;s+=n)o=Pt(s/n|0,r[s],r[s+1],o);else for(let s=e-n;s>=t;s-=n)o=Pt(s/n|0,r[s],r[s+1],o);return o&&E(o,o.next)&&(D(o),o=o.next),o}function M(r,t=r){let e=t===r,n=r,i;do i=!1,n!==n.next&&(G.size===0||!G.has(n))&&(E(n,n.next)||b(n.prev,n,n.next)===0)?((e||n===t)&&(t=n.prev),O=!0,D(n),n=n.prev,i=!0):(e||n!==t)&&(n=n.next,i=!e);while(i||n!==t);return t}function q(r,t,e,n,i){i&&Ie(r,e,n,i);let o=r,s=!1;for(;r.prev!==r.next;){let u=r.prev,a=r.next;if(b(u,r,a)<0&&(i?de(r,e,n,i):me(r))){t.push(u.i,r.i,a.i),D(r),r=a,o=a;continue}if(r=a,r===o){if(O=!1,r=M(r),O){o=r;continue}if(!s){r=ve(r,t),o=r,s=!0;continue}ge(r,t,e,n,i);break}}}function me(r){let t=r.prev,e=r,n=r.next,i=t.x,o=e.x,s=n.x,u=t.y,a=e.y,l=n.y,x=Math.min(i,o,s),d=Math.min(u,a,l),p=Math.max(i,o,s),m=Math.max(u,a,l),f=n.next;for(;f!==t;){if(f.x>=x&&f.x<=p&&f.y>=d&&f.y<=m&&!(i===f.x&&u===f.y)&&Y(i,u,o,a,s,l,f.x,f.y)&&b(f.prev,f,f.next)>=0)return!1;f=f.next}return!0}function de(r,t,e,n){let i=r.prev,o=r,s=r.next,u=i.x,a=o.x,l=s.x,x=i.y,d=o.y,p=s.y,m=Math.min(u,a,l),f=Math.min(x,d,p),g=Math.max(u,a,l),w=Math.max(x,d,p),c=nt(m,f,t,e,n),B=nt(g,w,t,e,n),h=r.prevZ;for(;h&&h.z>=c;){if(h.x>=m&&h.x<=g&&h.y>=f&&h.y<=w&&h!==s&&!(u===h.x&&x===h.y)&&Y(u,x,a,d,l,p,h.x,h.y)&&b(h.prev,h,h.next)>=0)return!1;h=h.prevZ}let v=r.nextZ;for(;v&&v.z<=B;){if(v.x>=m&&v.x<=g&&v.y>=f&&v.y<=w&&v!==s&&!(u===v.x&&x===v.y)&&Y(u,x,a,d,l,p,v.x,v.y)&&b(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function ve(r,t){let e=r,n=!1;do{let i=e.prev,o=e.next.next;kt(i,e,e.next,o,!1)&&V(i,o)&&V(o,i)&&(t.push(i.i,e.i,o.i),D(e),D(e.next),e=r=o,n=!0),e=e.next}while(e!==r);return n?M(e):e}function ge(r,t,e,n,i){let o=r;do{let s=o.next.next;for(;s!==o.prev;){if(o.i!==s.i&&Pe(o,s)){let u=Gt(o,s);o=M(o,o.next),u=M(u,u.next),q(o,t,e,n,i),q(u,t,e,n,i);return}s=s.next}o=o.next}while(o!==r)}var tt=!1;function ye(r,t,e,n){let i=[];for(let o=0,s=t.length;o<s;o++){let l=zt(r,t[o]*n,o<s-1?t[o+1]*n:r.length,n,!1);l===l.next&&G.add(l),i.push(Ue(l))}i.sort(be),_e(r.length/n,t.length),Ct(e,e),tt=!0;for(let o=0;o<i.length;o++)e=we(i[o],e);return tt=!1,M(e)}function be(r,t){return r.x-t.x||r.y-t.y||(r.next.y-r.y)/(r.next.x-r.x)-(t.next.y-t.y)/(t.next.x-t.x)}function we(r,t){let e=Be(r,t);if(!e)return t;let n=Gt(e,r),i=n.next;return Ct(e,i.next),M(n,n.next),M(e,e.next)}var Tt=16;var y=/* @__PURE__ */ new Float64Array(0);var W=0;var et=[];var rt=[];function _e(r,t){let e=Math.ceil((r+2*t)/Tt)+t+2;y.length<e*4&&(y=new Float64Array(e*4)),W=0}function Ct(r,t){let e=r;do{let n=W++;et[n]=e;let i=e.x,o=e.y,s=e.x,u=e.y,a=0;do{let x=e.next;e.z=n,x.x<i&&(i=x.x),x.x>s&&(s=x.x),x.y<o&&(o=x.y),x.y>u&&(u=x.y),e=x}while(++a<Tt&&e!==t);rt[n]=e;let l=n*4;y[l]=i,y[l+1]=o,y[l+2]=s,y[l+3]=u}while(e!==t)}function Se(r,t){let e=r.z*4;t.x<y[e]&&(y[e]=t.x),t.y<y[e+1]&&(y[e+1]=t.y),t.x>y[e+2]&&(y[e+2]=t.x),t.y>y[e+3]&&(y[e+3]=t.y)}function Mt(r){let t=rt[r];for(;t.prev.next!==t;)t=t.next;return rt[r]=t,t}function Ut(r){let t=et[r];for(;t.prev.next!==t;)t=t.next;return et[r]=t,t}function Be(r,t){let e=t,n=r.x,i=r.y,o=-1/0,s;if(E(r,e))return e;for(let p=0,m=0;p<W;p++,m+=4){if(i<y[m+1]||i>y[m+3]||y[m]>n||y[m+2]<=o)continue;let f=Mt(p);e=Ut(p);do{if(e.prev.next===e){if(E(r,e.next))return e.next;if(i<=e.y&&i>=e.next.y&&e.next.y!==e.y){let g=e.x+(i-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(g<=n&&g>o&&(o=g,s=e.x<e.next.x?e:e.next,g===n))return s}}e=e.next}while(e!==f)}if(!s)return null;let u=s.x,a=s.y,l=Math.min(i,a),x=Math.max(i,a),d=1/0;for(let p=0,m=0;p<W;p++,m+=4){if(y[m+2]<u||y[m]>n||y[m+3]<l||y[m+1]>x)continue;let f=Mt(p);e=Ut(p);do{if(e.prev.next===e&&n>=e.x&&e.x>=u&&n!==e.x&&Y(i<a?n:o,i,u,a,i<a?o:n,i,e.x,e.y)){let g=Math.abs(i-e.y)/(n-e.x);(V(e,r)||e.y===i&&e.next.y===i&&e.next.x>n)&&(g<d||g===d&&(e.x>s.x||e.x===s.x&&Ae(s,e)))&&(s=e,d=g)}e=e.next}while(e!==f)}return s}function Ae(r,t){return b(r.prev,r,t.prev)<0&&b(t.next,r,r.next)<0}var _=[];var U=[];var I=/* @__PURE__ */ new Uint32Array(0);var C=/* @__PURE__ */ new Uint32Array(0);var k=/* @__PURE__ */ new Uint32Array(256);function Ie(r,t,e,n){let i=r,o=0;do i.z=nt(i.x,i.y,t,e,n),_[o++]=i,i=i.next;while(i!==r);Me(o);let s=null;for(let u=0;u<o;u++){let a=_[u];a.prevZ=s,s&&(s.nextZ=a),s=a}s.nextZ=null,_.fill(null,0,o),U.fill(null,0,o)}function Me(r){if(r<=32){for(let t=1;t<r;t++){let e=_[t],n=e.z,i=t-1;for(;i>=0&&_[i].z>n;)_[i+1]=_[i],i--;_[i+1]=e}return}I.length<r&&(I=new Uint32Array(r),C=new Uint32Array(r),U=new Array(r));for(let t=0;t<r;t++)I[t]=_[t].z;Z(r,_,I,U,C,0),Z(r,U,C,_,I,8),Z(r,_,I,U,C,16),Z(r,U,C,_,I,24)}function Z(r,t,e,n,i,o){k.fill(0);for(let u=0;u<r;u++)k[e[u]>>>o&255]++;let s=0;for(let u=0;u<256;u++){let a=k[u];k[u]=s,s+=a}for(let u=0;u<r;u++){let a=e[u],l=k[a>>>o&255]++;n[l]=t[u],i[l]=a}}function nt(r,t,e,n,i){return r=(r-e)*i|0,t=(t-n)*i|0,r=(r|r<<8)&16711935,r=(r|r<<4)&252645135,r=(r|r<<2)&858993459,r=(r|r<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,r|t<<1}function Ue(r){let t=r,e=r;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==r);return e}function Y(r,t,e,n,i,o,s,u){return(i-s)*(t-u)>=(r-s)*(o-u)&&(r-s)*(n-u)>=(e-s)*(t-u)&&(e-s)*(o-u)>=(i-s)*(n-u)}function Pe(r,t){let e=E(r,t)&&b(r.prev,r,r.next)>0&&b(t.prev,t,t.next)>0;return r.next.i!==t.i&&(e||V(r,t)&&V(t,r)&&(b(r.prev,r,t.prev)!==0||b(r,t.prev,t)!==0))&&!ze(r,t)&&(e||Te(r,t))}function b(r,t,e){return(t.y-r.y)*(e.x-t.x)-(t.x-r.x)*(e.y-t.y)}function E(r,t){return r.x===t.x&&r.y===t.y}function kt(r,t,e,n,i=!0){let o=b(r,t,e),s=b(r,t,n),u=b(e,n,r),a=b(e,n,t);return(o>0&&s<0||o<0&&s>0)&&(u>0&&a<0||u<0&&a>0)?!0:i?!!(o===0&&N(r,e,t)||s===0&&N(r,n,t)||u===0&&N(e,r,n)||a===0&&N(e,t,n)):!1}function N(r,t,e){return t.x<=Math.max(r.x,e.x)&&t.x>=Math.min(r.x,e.x)&&t.y<=Math.max(r.y,e.y)&&t.y>=Math.min(r.y,e.y)}function ze(r,t){let e=Math.min(r.x,t.x),n=Math.max(r.x,t.x),i=Math.min(r.y,t.y),o=Math.max(r.y,t.y),s=r;do{let u=s.next;if(s.x>n&&u.x>n||s.x<e&&u.x<e||s.y>o&&u.y>o||s.y<i&&u.y<i){s=u;continue}if(s.i!==r.i&&u.i!==r.i&&s.i!==t.i&&u.i!==t.i&&kt(s,u,r,t))return!0;s=u}while(s!==r);return!1}function V(r,t){return b(r.prev,r,r.next)<0?b(r,t,r.next)>=0&&b(r,r.prev,t)>=0:b(r,t,r.prev)<0||b(r,r.next,t)<0}function Te(r,t){let e=r,n=!1,i=(r.x+t.x)/2,o=(r.y+t.y)/2;do{let s=e.next;e.y>o!=s.y>o&&i<(s.x-e.x)*(o-e.y)/(s.y-e.y)+e.x&&(n=!n),e=s}while(e!==r);return n}function Gt(r,t){let e=it(r.i,r.x,r.y),n=it(t.i,t.x,t.y),i=r.next,o=t.prev;return r.next=t,t.prev=r,e.next=i,i.prev=e,n.next=e,e.prev=n,o.next=n,n.prev=o,n}function Pt(r,t,e,n){let i=it(r,t,e);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function D(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ),tt&&Se(r.prev,r.next)}function it(r,t,e){return{i:r,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null}}function Ce(r,t,e,n){let i=0;for(let o=t,s=e-n;o<e;o+=n)i+=(r[s]-r[o])*(r[o+1]+r[s+1]),s=o;return i}var Xe=K.default||K;function ot(r,t,e){if(r)for(let n in r){let o=t[n.toLocaleLowerCase()];if(o){let s=r[n];n===`header`&&(s=s.replace(/@in\s+[^;]+;\s*/g,``).replace(/@out\s+[^;]+;\s*/g,``)),e&&o.push(`//----${e}----//`),o.push(s)}else U$1(`${n} placement hook does not exist in shader`)}}var ke=/\{\{(.*?)\}\}/g;function st(r){let t={};return(r.match(ke)?.map(n=>n.replace(/[{()}]/g,``))??[]).forEach(n=>{t[n]=[]}),t}function Et(r,t){let e,n=/@in\s+([^;]+);/g;for(;(e=n.exec(r))!==null;)t.push(e[1])}function ut(r,t,e=!1){let n=[];Et(t,n),r.forEach(u=>{u.header&&Et(u.header,n)});let i=n;e&&i.sort();let o=i.map((u,a)=>`       @location(${a}) ${u},`).join(`
`),s=t.replace(/@in\s+[^;]+;\s*/g,``);return s=s.replace(`{{in}}`,`
${o}
`),s}function Vt(r,t){let e,n=/@out\s+([^;]+);/g;for(;(e=n.exec(r))!==null;)t.push(e[1])}function Ge(r){let e=/\b(\w+)\s*:/g.exec(r);return e?e[1]:``}function Ee(r){return r.replace(/@.*?\s+/g,``)}function Dt(r,t){let e=[];Vt(t,e),r.forEach(a=>{a.header&&Vt(a.header,e)});let n=0,i=e.sort().map(a=>a.indexOf(`builtin`)>-1?a:`@location(${n++}) ${a}`).join(`,
`),o=e.sort().map(a=>`       var ${Ee(a)};`).join(`
`),s=`return VSOutput(
            ${e.sort().map(a=>` ${Ge(a)}`).join(`,
`)});`,u=t.replace(/@out\s+[^;]+;\s*/g,``);return u=u.replace(`{{struct}}`,`
${i}
`),u=u.replace(`{{start}}`,`
${o}
`),u=u.replace(`{{return}}`,`
${s}
`),u}function at(r,t){let e=r;for(let n in t){let i=t[n];i.join(`
`).length?e=e.replace(`{{${n}}}`,`//-----${n} START-----//
${i.join(`
`)}
//----${n} FINISH----//`):e=e.replace(`{{${n}}}`,``)}return e}var A=Object.create(null);var lt=/* @__PURE__ */ new Map;var Ve=0;function Rt({template:r,bits:t}){let e=Ft(r,t);if(A[e])return A[e];let{vertex:n,fragment:i}=De(r,t);return A[e]=Ht(n,i,t),A[e]}function $t({template:r,bits:t}){let e=Ft(r,t);return A[e]||(A[e]=Ht(r.vertex,r.fragment,t)),A[e]}function De(r,t){let e=t.map(s=>s.vertex).filter(s=>!!s),n=t.map(s=>s.fragment).filter(s=>!!s),i=ut(e,r.vertex,!0);i=Dt(e,i);let o=ut(n,r.fragment,!0);return{vertex:i,fragment:o}}function Ft(r,t){return t.map(e=>(lt.has(e)||lt.set(e,Ve++),lt.get(e))).sort((e,n)=>e-n).join(`-`)+r.vertex+r.fragment}function Ht(r,t,e){let n=st(r),i=st(t);return e.forEach(o=>{ot(o.vertex,n,o.name),ot(o.fragment,i,o.name)}),{vertex:at(r,n),fragment:at(t,i)}}var jt=`
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}

        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);

        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`;var Zt=`
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;

    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {

        {{start}}

        var outColor:vec4<f32>;

        {{main}}

        var finalColor:vec4<f32> = outColor * vColor;

        {{end}}

        return finalColor;
      };
`;var Nt=`
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;

        {{start}}

        vColor = vec4(1.);

        {{main}}

        vUV = uv;

        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`;var Wt=`

    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {

        {{start}}

        vec4 outColor;

        {{main}}

        finalColor = outColor * vColor;

        {{end}}
    }
`;var Yt={name:`global-uniforms-bit`,vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}};var Kt={name:`global-uniforms-bit`,vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}};function Qt({bits:r,name:t}){let e=Rt({template:{fragment:Zt,vertex:jt},bits:[Yt,...r]});return _t.from({name:t,vertex:{source:e.vertex,entryPoint:`main`},fragment:{source:e.fragment,entryPoint:`main`}})}function Xt({bits:r,name:t}){return new Le(x({name:t},$t({template:{vertex:Nt,fragment:Wt},bits:[Kt,...r]})))}var Lt={name:`color-bit`,vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}};var Jt={name:`color-bit`,vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}};var ct={};function Re(r){let t=[];if(r===1)t.push(`@group(1) @binding(0) var textureSource1: texture_2d<f32>;`),t.push(`@group(1) @binding(1) var textureSampler1: sampler;`);else{let e=0;for(let n=0;n<r;n++)t.push(`@group(1) @binding(${e++}) var textureSource${n+1}: texture_2d<f32>;`),t.push(`@group(1) @binding(${e++}) var textureSampler${n+1}: sampler;`)}return t.join(`
`)}function $e(r){let t=[];if(r===1)t.push(`outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);`);else{t.push(`switch vTextureId {`);for(let e=0;e<r;e++)e===r-1?t.push(`  default:{`):t.push(`  case ${e}:{`),t.push(`      outColor = textureSampleGrad(textureSource${e+1}, textureSampler${e+1}, vUV, uvDx, uvDy);`),t.push(`      break;}`);t.push(`}`)}return t.join(`
`)}function Ot(r){return ct[r]||(ct[r]={name:`texture-batch-bit`,vertex:{header:`
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `},fragment:{header:`
                @in @interpolate(flat) vTextureId: u32;

                ${Re(r)}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${$e(r)}
            `}}),ct[r]}var ft={};function Fe(r){let t=[];for(let e=0;e<r;e++)e>0&&t.push(`else`),e<r-1&&t.push(`if(vTextureId < ${e}.5)`),t.push(`{`),t.push(`	outColor = texture(uTextures[${e}], vUV);`),t.push(`}`);return t.join(`
`)}function qt(r){return ft[r]||(ft[r]={name:`texture-batch-bit`,vertex:{header:`
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `},fragment:{header:`
                in float vTextureId;

                uniform sampler2D uTextures[${r}];

            `,main:`

                ${Fe(r)}
            `}}),ft[r]}var te={name:`round-pixels-bit`,vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}};var ee={name:`round-pixels-bit`,vertex:{header:`
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}};function ht(r,t,e,n){if(e??(e=0),n??(n=Math.min(r.byteLength-e,t.byteLength)),!(e&7)&&!(n&7)){let i=n/8;new Float64Array(t,0,i).set(new Float64Array(r,e,i))}else if(!(e&3)&&!(n&3)){let i=n/4;new Float32Array(t,0,i).set(new Float32Array(r,e,i))}else new Uint8Array(t).set(new Uint8Array(r,e,n))}var re={normal:`normal-npm`,add:`add-npm`,screen:`screen-npm`};var He=(r=>(r[r.DISABLED=0]=`DISABLED`,r[r.RENDERING_MASK_ADD=1]=`RENDERING_MASK_ADD`,r[r.MASK_ACTIVE=2]=`MASK_ACTIVE`,r[r.INVERSE_MASK_ACTIVE=3]=`INVERSE_MASK_ACTIVE`,r[r.RENDERING_MASK_REMOVE=4]=`RENDERING_MASK_REMOVE`,r[r.NONE=5]=`NONE`,r))(He||{});var je=[`precision mediump float;`,`void main(void){`,`float test = 0.1;`,`%forloop%`,`gl_FragColor = vec4(0.0);`,`}`].join(`
`);function Ze(r){let t=``;for(let e=0;e<r;++e)e>0&&(t+=`
else `),e<r-1&&(t+=`if(test == ${e}.0){}`);return t}function ne(r,t){if(r===0)throw new Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");let e=t.createShader(t.FRAGMENT_SHADER);try{for(;;){let n=je.replace(/%forloop%/gi,Ze(r));if(t.shaderSource(e,n),t.compileShader(e),!t.getShaderParameter(e,t.COMPILE_STATUS))r=r/2|0;else break}}finally{t.deleteShader(e)}return r}var ie={};function oe(r){let t=ie[r];if(t)return t;let e=new Int32Array(r);for(let n=0;n<r;n++)e[n]=n;return t=ie[r]=new Ve$1({uTextures:{value:e,type:`i32`,size:r}},{isStatic:!0}),t}var R=class{constructor(t){typeof t==`number`?this.rawBinaryData=new ArrayBuffer(t):t instanceof Uint8Array?this.rawBinaryData=t.buffer:this.rawBinaryData=t,this.uint32View=new Uint32Array(this.rawBinaryData),this.float32View=new Float32Array(this.rawBinaryData),this.size=this.rawBinaryData.byteLength}get int8View(){return this._int8View||(this._int8View=new Int8Array(this.rawBinaryData)),this._int8View}get uint8View(){return this._uint8View||(this._uint8View=new Uint8Array(this.rawBinaryData)),this._uint8View}get int16View(){return this._int16View||(this._int16View=new Int16Array(this.rawBinaryData)),this._int16View}get int32View(){return this._int32View||(this._int32View=new Int32Array(this.rawBinaryData)),this._int32View}get float64View(){return this._float64Array||(this._float64Array=new Float64Array(this.rawBinaryData)),this._float64Array}get bigUint64View(){return this._bigUint64Array||(this._bigUint64Array=new BigUint64Array(this.rawBinaryData)),this._bigUint64Array}view(t){return this[`${t}View`]}destroy(){this.rawBinaryData=null,this.uint32View=null,this.float32View=null,this.uint16View=null,this._int8View=null,this._uint8View=null,this._int16View=null,this._int32View=null,this._float64Array=null,this._bigUint64Array=null}static sizeOf(t){switch(t){case`int8`:case`uint8`:return 1;case`int16`:case`uint16`:return 2;case`int32`:case`uint32`:case`float32`:return 4;default:throw new Error(`${t} isn't a valid view type`)}}};function xt(r,t){return t.alphaMode===`no-premultiply-alpha`&&re[r]||r}var P=null;function se(){if(P)return P;let r=Ie$1();return P=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),P=ne(P,r),r.getExtension(`WEBGL_lose_context`)?.loseContext(),P}var Q=class{constructor(){this.ids=Object.create(null),this.textures=[],this.count=0}clear(){for(let t=0;t<this.count;t++){let e=this.textures[t];this.textures[t]=null,this.ids[e.uid]=null}this.count=0}};var pt=class{constructor(){this.renderPipeId=`batch`,this.action=`startBatch`,this.start=0,this.size=0,this.textures=new Q,this.blendMode=`normal`,this.topology=`triangle-strip`,this.canBundle=!0}destroy(){this.textures=null,this.gpuBindGroup=null,this.bindGroup=null,this.batcher=null,this.elements=null}};var F=[];var X=0;ct$1.register({clear:()=>{if(F.length>0)for(let r of F)r&&r.destroy();F.length=0,X=0}});function ue(){return X>0?F[--X]:new pt}function ae(r){r.elements=null,F[X++]=r}var $=0;var le=class ce{constructor(t){this.uid=_$1(`batcher`),this.dirty=!0,this.batchIndex=0,this.batches=[],this._elements=[],t=x(x({},ce.defaultOptions),t),t.maxTextures||(C$1(`v8.8.0`,`maxTextures is a required option for Batcher now, please pass it in the options`),t.maxTextures=se());let{maxTextures:e,attributesInitialSize:n,indicesInitialSize:i}=t;this.attributeBuffer=new R(n*4),this.indexBuffer=new Uint16Array(i),this.maxTextures=e}begin(){this.elementSize=0,this.elementStart=0,this.indexSize=0,this.attributeSize=0;for(let t=0;t<this.batchIndex;t++)ae(this.batches[t]);this.batchIndex=0,this._batchIndexStart=0,this._batchIndexSize=0,this.dirty=!0}add(t){this._elements[this.elementSize++]=t,t._indexStart=this.indexSize,t._attributeStart=this.attributeSize,t._batcher=this,this.indexSize+=t.indexSize,this.attributeSize+=t.attributeSize*this.vertexSize}checkAndUpdateTexture(t,e){let n=t._batch.textures.ids[e._source.uid];return!n&&n!==0?!1:(t._textureId=n,t.texture=e,!0)}updateElement(t){this.dirty=!0;let e=this.attributeBuffer;t.packAsQuad?this.packQuadAttributes(t,e.float32View,e.uint32View,t._attributeStart,t._textureId):this.packAttributes(t,e.float32View,e.uint32View,t._attributeStart,t._textureId)}break(t){let e=this._elements;if(!e[this.elementStart])return;let n=ue(),i=n.textures;i.clear();let o=e[this.elementStart],s=xt(o.blendMode,o.texture._source),u=o.topology;this.attributeSize*4>this.attributeBuffer.size&&this._resizeAttributeBuffer(this.attributeSize*4),this.indexSize>this.indexBuffer.length&&this._resizeIndexBuffer(this.indexSize);let a=this.attributeBuffer.float32View,l=this.attributeBuffer.uint32View,x=this.indexBuffer,d=this._batchIndexSize,p=this._batchIndexStart,m=`startBatch`,f=[],g=this.maxTextures;for(let w=this.elementStart;w<this.elementSize;++w){let c=e[w];e[w]=null;let h=c.texture._source,v=xt(c.blendMode,h),S=s!==v||u!==c.topology;if(h._batchTick===$&&!S){c._textureId=h._textureBindLocation,d+=c.indexSize,c.packAsQuad?(this.packQuadAttributes(c,a,l,c._attributeStart,c._textureId),this.packQuadIndex(x,c._indexStart,c._attributeStart/this.vertexSize)):(this.packAttributes(c,a,l,c._attributeStart,c._textureId),this.packIndex(c,x,c._indexStart,c._attributeStart/this.vertexSize)),c._batch=n,f.push(c);continue}h._batchTick=$,(i.count>=g||S)&&(this._finishBatch(n,p,d-p,i,s,u,t,m,f),m=`renderBatch`,p=d,s=v,u=c.topology,n=ue(),i=n.textures,i.clear(),f=[],++$),c._textureId=h._textureBindLocation=i.count,i.ids[h.uid]=i.count,i.textures[i.count++]=h,c._batch=n,f.push(c),d+=c.indexSize,c.packAsQuad?(this.packQuadAttributes(c,a,l,c._attributeStart,c._textureId),this.packQuadIndex(x,c._indexStart,c._attributeStart/this.vertexSize)):(this.packAttributes(c,a,l,c._attributeStart,c._textureId),this.packIndex(c,x,c._indexStart,c._attributeStart/this.vertexSize))}i.count>0&&(this._finishBatch(n,p,d-p,i,s,u,t,m,f),p=d,++$),this.elementStart=this.elementSize,this._batchIndexStart=p,this._batchIndexSize=d}_finishBatch(t,e,n,i,o,s,u,a,l){t.gpuBindGroup=null,t.bindGroup=null,t.action=a,t.batcher=this,t.textures=i,t.blendMode=o,t.topology=s,t.start=e,t.size=n,t.elements=l,++$,this.batches[this.batchIndex++]=t,u.add(t)}finish(t){this.break(t)}ensureAttributeBuffer(t){t*4<=this.attributeBuffer.size||this._resizeAttributeBuffer(t*4)}ensureIndexBuffer(t){t<=this.indexBuffer.length||this._resizeIndexBuffer(t)}_resizeAttributeBuffer(t){let n=new R(Math.max(t,this.attributeBuffer.size*2));ht(this.attributeBuffer.rawBinaryData,n.rawBinaryData),this.attributeBuffer=n}_resizeIndexBuffer(t){let e=this.indexBuffer,n=Math.max(t,e.length*1.5);n+=n%2;let i=n>65535?new Uint32Array(n):new Uint16Array(n);if(i.BYTES_PER_ELEMENT!==e.BYTES_PER_ELEMENT)for(let o=0;o<e.length;o++)i[o]=e[o];else ht(e.buffer,i.buffer);this.indexBuffer=i}packQuadIndex(t,e,n){t[e]=n+0,t[e+1]=n+1,t[e+2]=n+2,t[e+3]=n+0,t[e+4]=n+2,t[e+5]=n+3}packIndex(t,e,n,i){let o=t.indices,s=t.indexSize,u=t.indexOffset,a=t.attributeOffset;for(let l=0;l<s;l++)e[n++]=i+o[l+u]-a}destroy(t={}){if(this.batches!==null){for(let e=0;e<this.batchIndex;e++)ae(this.batches[e]);this.batches=null,this.geometry.destroy(!0),this.geometry=null,t.shader&&(this.shader?.destroy(),this.shader=null);for(let e=0;e<this._elements.length;e++)this._elements[e]&&(this._elements[e]._batch=null);this._elements=null,this.indexBuffer=null,this.attributeBuffer.destroy(),this.attributeBuffer=null}}};le.defaultOptions={maxTextures:null,attributesInitialSize:4,indicesInitialSize:6};var fe=le;var Ne=/* @__PURE__ */ new Float32Array(1);var We=/* @__PURE__ */ new Uint32Array(1);var L=class extends Ze$1{constructor(){let e=new $$1({data:Ne,label:`attribute-batch-buffer`,usage:I$1.VERTEX|I$1.COPY_DST,shrinkToFit:!1}),n=new $$1({data:We,label:`index-batch-buffer`,usage:I$1.INDEX|I$1.COPY_DST,shrinkToFit:!1}),i=24;super({attributes:{aPosition:{buffer:e,format:`float32x2`,stride:i,offset:0},aUV:{buffer:e,format:`float32x2`,stride:i,offset:8},aColor:{buffer:e,format:`unorm8x4`,stride:i,offset:16},aTextureIdAndRound:{buffer:e,format:`uint16x2`,stride:i,offset:20}},indexBuffer:n})}};var H=class extends Je{constructor(t){let e=Xt({name:`batch`,bits:[Jt,qt(t),ee]}),n=Qt({name:`batch`,bits:[Lt,Ot(t),te]});super({glProgram:e,gpuProgram:n,resources:{batchSamplers:oe(t)}}),this.maxTextures=t}};var j=null;var he=class xe extends fe{constructor(t){super(t),this.geometry=new L,this.name=xe.extension.name,this.vertexSize=6,j??(j=new H(t.maxTextures)),this.shader=j}packAttributes(t,e,n,i,o){let s=o<<16|t.roundPixels&65535,u=t.transform,a=u.a,l=u.b,x=u.c,d=u.d,p=u.tx,m=u.ty,{positions:f,uvs:g}=t,w=t.color,c=t.attributeOffset,B=c+t.attributeSize;for(let h=c;h<B;h++){let v=h*2,S=f[v],mt=f[v+1];e[i++]=a*S+x*mt+p,e[i++]=d*mt+l*S+m,e[i++]=g[v],e[i++]=g[v+1],n[i++]=w,n[i++]=s}}packQuadAttributes(t,e,n,i,o){let s=t.texture,u=t.transform,a=u.a,l=u.b,x=u.c,d=u.d,p=u.tx,m=u.ty,f=t.bounds,g=f.maxX,w=f.minX,c=f.maxY,B=f.minY,h=s.uvs,v=t.color,S=o<<16|t.roundPixels&65535;e[i+0]=a*w+x*B+p,e[i+1]=d*B+l*w+m,e[i+2]=h.x0,e[i+3]=h.y0,n[i+4]=v,n[i+5]=S,e[i+6]=a*g+x*B+p,e[i+7]=d*B+l*g+m,e[i+8]=h.x1,e[i+9]=h.y1,n[i+10]=v,n[i+11]=S,e[i+12]=a*g+x*c+p,e[i+13]=d*c+l*g+m,e[i+14]=h.x2,e[i+15]=h.y2,n[i+16]=v,n[i+17]=S,e[i+18]=a*w+x*c+p,e[i+19]=d*c+l*w+m,e[i+20]=h.x3,e[i+21]=h.y3,n[i+22]=v,n[i+23]=S}_updateMaxTextures(t){this.shader.maxTextures!==t&&(j=new H(t),this.shader=j)}destroy(){this.shader=null,super.destroy()}};he.extension={type:[vt.Batcher],name:`default`};var sn=he;var pe=class{constructor(t){this.items=Object.create(null);let{renderer:e,type:n,onUnload:i,priority:o,name:s}=t;this._renderer=e,e.gc.addResourceHash(this,`items`,n,o??0),this._onUnload=i,this.name=s}add(t){return this.items[t.uid]?!1:(this.items[t.uid]=t,t.once(`unload`,this.remove,this),t._gcLastUsed=this._renderer.gc.now,!0)}remove(t,...e){if(!this.items[t.uid])return;let n=t._gpuData[this._renderer.uid];n&&(this._onUnload?.(t,...e),t.off(`unload`,this.remove,this),n.destroy(),t._gpuData[this._renderer.uid]=null,this.items[t.uid]=null)}removeAll(...t){Object.values(this.items).forEach(e=>e&&this.remove(e,...t))}destroy(...t){this.removeAll(...t),this.items=Object.create(null),this._renderer=null,this._onUnload=null}};export{Qt as a,ee as c,oe as d,pe as f,xt as g,te as h,Ot as i,ht as l,sn as m,Jt as n,Xe as o,qt as p,Lt as r,Xt as s,He as t,ne as u};