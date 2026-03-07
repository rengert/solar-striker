import{D as lt,E as ct,G as ft,J as ht,K as xt,L as U,M as W,N as pt,a as it,i as ot,l as st,m as ut,n as at}from"./chunk-GUGJKPMZ.js";import{a as P}from"./chunk-RA2WU32H.js";function Z(e,r,t=2){let n=r&&r.length,i=n?r[0]*t:e.length,s=dt(e,0,i,t,!0),o=[];if(!s||s.next===s.prev)return o;let u,a,l;if(n&&(s=ne(e,r,s,t)),e.length>80*t){u=e[0],a=e[1];let p=u,m=a;for(let d=t;d<i;d+=t){let v=e[d],x=e[d+1];v<u&&(u=v),x<a&&(a=x),v>p&&(p=v),x>m&&(m=x)}l=Math.max(p-u,m-a),l=l!==0?32767/l:0}return T(s,o,t,u,a,l,0),o}function dt(e,r,t,n,i){let s;if(i===pe(e,r,t,n)>0)for(let o=r;o<t;o+=n)s=mt(o/n|0,e[o],e[o+1],s);else for(let o=t-n;o>=r;o-=n)s=mt(o/n|0,e[o],e[o+1],s);return s&&A(s,s.next)&&(G(s),s=s.next),s}function w(e,r){if(!e)return e;r||(r=e);let t=e,n;do if(n=!1,!t.steiner&&(A(t,t.next)||g(t.prev,t,t.next)===0)){if(G(t),t=r=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==r);return r}function T(e,r,t,n,i,s,o){if(!e)return;!o&&s&&ae(e,n,i,s);let u=e;for(;e.prev!==e.next;){let a=e.prev,l=e.next;if(s?te(e,n,i,s):qt(e)){r.push(a.i,e.i,l.i),G(e),e=l.next,u=l.next;continue}if(e=l,e===u){o?o===1?(e=ee(w(e),r),T(e,r,t,n,i,s,2)):o===2&&re(e,r,t,n,i,s):T(w(e),r,t,n,i,s,1);break}}}function qt(e){let r=e.prev,t=e,n=e.next;if(g(r,t,n)>=0)return!1;let i=r.x,s=t.x,o=n.x,u=r.y,a=t.y,l=n.y,p=Math.min(i,s,o),m=Math.min(u,a,l),d=Math.max(i,s,o),v=Math.max(u,a,l),x=n.next;for(;x!==r;){if(x.x>=p&&x.x<=d&&x.y>=m&&x.y<=v&&z(i,u,s,a,o,l,x.x,x.y)&&g(x.prev,x,x.next)>=0)return!1;x=x.next}return!0}function te(e,r,t,n){let i=e.prev,s=e,o=e.next;if(g(i,s,o)>=0)return!1;let u=i.x,a=s.x,l=o.x,p=i.y,m=s.y,d=o.y,v=Math.min(u,a,l),x=Math.min(p,m,d),y=Math.max(u,a,l),S=Math.max(p,m,d),_=Q(v,x,r,t,n),f=Q(y,S,r,t,n),h=e.prevZ,c=e.nextZ;for(;h&&h.z>=_&&c&&c.z<=f;){if(h.x>=v&&h.x<=y&&h.y>=x&&h.y<=S&&h!==i&&h!==o&&z(u,p,a,m,l,d,h.x,h.y)&&g(h.prev,h,h.next)>=0||(h=h.prevZ,c.x>=v&&c.x<=y&&c.y>=x&&c.y<=S&&c!==i&&c!==o&&z(u,p,a,m,l,d,c.x,c.y)&&g(c.prev,c,c.next)>=0))return!1;c=c.nextZ}for(;h&&h.z>=_;){if(h.x>=v&&h.x<=y&&h.y>=x&&h.y<=S&&h!==i&&h!==o&&z(u,p,a,m,l,d,h.x,h.y)&&g(h.prev,h,h.next)>=0)return!1;h=h.prevZ}for(;c&&c.z<=f;){if(c.x>=v&&c.x<=y&&c.y>=x&&c.y<=S&&c!==i&&c!==o&&z(u,p,a,m,l,d,c.x,c.y)&&g(c.prev,c,c.next)>=0)return!1;c=c.nextZ}return!0}function ee(e,r){let t=e;do{let n=t.prev,i=t.next.next;!A(n,i)&&gt(n,t,t.next,i)&&C(n,i)&&C(i,n)&&(r.push(n.i,t.i,i.i),G(t),G(t.next),t=e=i),t=t.next}while(t!==e);return w(t)}function re(e,r,t,n,i,s){let o=e;do{let u=o.next.next;for(;u!==o.prev;){if(o.i!==u.i&&fe(o,u)){let a=yt(o,u);o=w(o,o.next),a=w(a,a.next),T(o,r,t,n,i,s,0),T(a,r,t,n,i,s,0);return}u=u.next}o=o.next}while(o!==e)}function ne(e,r,t,n){let i=[];for(let s=0,o=r.length;s<o;s++){let u=r[s]*n,a=s<o-1?r[s+1]*n:e.length,l=dt(e,u,a,n,!1);l===l.next&&(l.steiner=!0),i.push(ce(l))}i.sort(ie);for(let s=0;s<i.length;s++)t=oe(i[s],t);return t}function ie(e,r){let t=e.x-r.x;if(t===0&&(t=e.y-r.y,t===0)){let n=(e.next.y-e.y)/(e.next.x-e.x),i=(r.next.y-r.y)/(r.next.x-r.x);t=n-i}return t}function oe(e,r){let t=se(e,r);if(!t)return r;let n=yt(t,e);return w(n,n.next),w(t,t.next)}function se(e,r){let t=r,n=e.x,i=e.y,s=-1/0,o;if(A(e,t))return t;do{if(A(e,t.next))return t.next;if(i<=t.y&&i>=t.next.y&&t.next.y!==t.y){let m=t.x+(i-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(m<=n&&m>s&&(s=m,o=t.x<t.next.x?t:t.next,m===n))return o}t=t.next}while(t!==r);if(!o)return null;let u=o,a=o.x,l=o.y,p=1/0;t=o;do{if(n>=t.x&&t.x>=a&&n!==t.x&&vt(i<l?n:s,i,a,l,i<l?s:n,i,t.x,t.y)){let m=Math.abs(i-t.y)/(n-t.x);C(t,e)&&(m<p||m===p&&(t.x>o.x||t.x===o.x&&ue(o,t)))&&(o=t,p=m)}t=t.next}while(t!==u);return o}function ue(e,r){return g(e.prev,e,r.prev)<0&&g(r.next,e,e.next)<0}function ae(e,r,t,n){let i=e;do i.z===0&&(i.z=Q(i.x,i.y,r,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,le(i)}function le(e){let r,t=1;do{let n=e,i;e=null;let s=null;for(r=0;n;){r++;let o=n,u=0;for(let l=0;l<t&&(u++,o=o.nextZ,!!o);l++);let a=t;for(;u>0||a>0&&o;)u!==0&&(a===0||!o||n.z<=o.z)?(i=n,n=n.nextZ,u--):(i=o,o=o.nextZ,a--),s?s.nextZ=i:e=i,i.prevZ=s,s=i;n=o}s.nextZ=null,t*=2}while(r>1);return e}function Q(e,r,t,n,i){return e=(e-t)*i|0,r=(r-n)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,r=(r|r<<8)&16711935,r=(r|r<<4)&252645135,r=(r|r<<2)&858993459,r=(r|r<<1)&1431655765,e|r<<1}function ce(e){let r=e,t=e;do(r.x<t.x||r.x===t.x&&r.y<t.y)&&(t=r),r=r.next;while(r!==e);return t}function vt(e,r,t,n,i,s,o,u){return(i-o)*(r-u)>=(e-o)*(s-u)&&(e-o)*(n-u)>=(t-o)*(r-u)&&(t-o)*(s-u)>=(i-o)*(n-u)}function z(e,r,t,n,i,s,o,u){return!(e===o&&r===u)&&vt(e,r,t,n,i,s,o,u)}function fe(e,r){return e.next.i!==r.i&&e.prev.i!==r.i&&!he(e,r)&&(C(e,r)&&C(r,e)&&xe(e,r)&&(g(e.prev,e,r.prev)||g(e,r.prev,r))||A(e,r)&&g(e.prev,e,e.next)>0&&g(r.prev,r,r.next)>0)}function g(e,r,t){return(r.y-e.y)*(t.x-r.x)-(r.x-e.x)*(t.y-r.y)}function A(e,r){return e.x===r.x&&e.y===r.y}function gt(e,r,t,n){let i=F(g(e,r,t)),s=F(g(e,r,n)),o=F(g(t,n,e)),u=F(g(t,n,r));return!!(i!==s&&o!==u||i===0&&$(e,t,r)||s===0&&$(e,n,r)||o===0&&$(t,e,n)||u===0&&$(t,r,n))}function $(e,r,t){return r.x<=Math.max(e.x,t.x)&&r.x>=Math.min(e.x,t.x)&&r.y<=Math.max(e.y,t.y)&&r.y>=Math.min(e.y,t.y)}function F(e){return e>0?1:e<0?-1:0}function he(e,r){let t=e;do{if(t.i!==e.i&&t.next.i!==e.i&&t.i!==r.i&&t.next.i!==r.i&&gt(t,t.next,e,r))return!0;t=t.next}while(t!==e);return!1}function C(e,r){return g(e.prev,e,e.next)<0?g(e,r,e.next)>=0&&g(e,e.prev,r)>=0:g(e,r,e.prev)<0||g(e,e.next,r)<0}function xe(e,r){let t=e,n=!1,i=(e.x+r.x)/2,s=(e.y+r.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&i<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==e);return n}function yt(e,r){let t=K(e.i,e.x,e.y),n=K(r.i,r.x,r.y),i=e.next,s=r.prev;return e.next=r,r.prev=e,t.next=i,i.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function mt(e,r,t,n){let i=K(e,r,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function G(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function K(e,r,t){return{i:e,x:r,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function pe(e,r,t,n){let i=0;for(let s=r,o=t-n;s<t;s+=n)i+=(e[o]-e[s])*(e[s+1]+e[o+1]),o=s;return i}var Ce=Z.default||Z;function L(e,r,t){if(e)for(let n in e){let i=n.toLocaleLowerCase(),s=r[i];if(s){let o=e[n];n==="header"&&(o=o.replace(/@in\s+[^;]+;\s*/g,"").replace(/@out\s+[^;]+;\s*/g,"")),t&&s.push(`//----${t}----//`),s.push(o)}else ut(`${n} placement hook does not exist in shader`)}}var me=/\{\{(.*?)\}\}/g;function X(e){let r={};return(e.match(me)?.map(n=>n.replace(/[{()}]/g,""))??[]).forEach(n=>{r[n]=[]}),r}function _t(e,r){let t,n=/@in\s+([^;]+);/g;for(;(t=n.exec(e))!==null;)r.push(t[1])}function Y(e,r,t=!1){let n=[];_t(r,n),e.forEach(u=>{u.header&&_t(u.header,n)});let i=n;t&&i.sort();let s=i.map((u,a)=>`       @location(${a}) ${u},`).join(`
`),o=r.replace(/@in\s+[^;]+;\s*/g,"");return o=o.replace("{{in}}",`
${s}
`),o}function St(e,r){let t,n=/@out\s+([^;]+);/g;for(;(t=n.exec(e))!==null;)r.push(t[1])}function de(e){let t=/\b(\w+)\s*:/g.exec(e);return t?t[1]:""}function ve(e){let r=/@.*?\s+/g;return e.replace(r,"")}function bt(e,r){let t=[];St(r,t),e.forEach(a=>{a.header&&St(a.header,t)});let n=0,i=t.sort().map(a=>a.indexOf("builtin")>-1?a:`@location(${n++}) ${a}`).join(`,
`),s=t.sort().map(a=>`       var ${ve(a)};`).join(`
`),o=`return VSOutput(
            ${t.sort().map(a=>` ${de(a)}`).join(`,
`)});`,u=r.replace(/@out\s+[^;]+;\s*/g,"");return u=u.replace("{{struct}}",`
${i}
`),u=u.replace("{{start}}",`
${s}
`),u=u.replace("{{return}}",`
${o}
`),u}function J(e,r){let t=e;for(let n in r){let i=r[n];i.join(`
`).length?t=t.replace(`{{${n}}}`,`//-----${n} START-----//
${i.join(`
`)}
//----${n} FINISH----//`):t=t.replace(`{{${n}}}`,"")}return t}var B=Object.create(null),O=new Map,ge=0;function Bt({template:e,bits:r}){let t=At(e,r);if(B[t])return B[t];let{vertex:n,fragment:i}=ye(e,r);return B[t]=It(n,i,r),B[t]}function wt({template:e,bits:r}){let t=At(e,r);return B[t]||(B[t]=It(e.vertex,e.fragment,r)),B[t]}function ye(e,r){let t=r.map(o=>o.vertex).filter(o=>!!o),n=r.map(o=>o.fragment).filter(o=>!!o),i=Y(t,e.vertex,!0);i=bt(t,i);let s=Y(n,e.fragment,!0);return{vertex:i,fragment:s}}function At(e,r){return r.map(t=>(O.has(t)||O.set(t,ge++),O.get(t))).sort((t,n)=>t-n).join("-")+e.vertex+e.fragment}function It(e,r,t){let n=X(e),i=X(r);return t.forEach(s=>{L(s.vertex,n,s.name),L(s.fragment,i,s.name)}),{vertex:J(e,n),fragment:J(r,i)}}var Mt=`
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
`,Pt=`
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
`,Ut=`
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
`,zt=`

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
`;var Tt={name:"global-uniforms-bit",vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}};var Ct={name:"global-uniforms-bit",vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}};function Gt({bits:e,name:r}){let t=Bt({template:{fragment:Pt,vertex:Mt},bits:[Tt,...e]});return ft.from({name:r,vertex:{source:t.vertex,entryPoint:"main"},fragment:{source:t.fragment,entryPoint:"main"}})}function Et({bits:e,name:r}){return new ct(P({name:r},wt({template:{vertex:Ut,fragment:zt},bits:[Ct,...e]})))}var Vt={name:"color-bit",vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},kt={name:"color-bit",vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}};var q={};function _e(e){let r=[];if(e===1)r.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;"),r.push("@group(1) @binding(1) var textureSampler1: sampler;");else{let t=0;for(let n=0;n<e;n++)r.push(`@group(1) @binding(${t++}) var textureSource${n+1}: texture_2d<f32>;`),r.push(`@group(1) @binding(${t++}) var textureSampler${n+1}: sampler;`)}return r.join(`
`)}function Se(e){let r=[];if(e===1)r.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");else{r.push("switch vTextureId {");for(let t=0;t<e;t++)t===e-1?r.push("  default:{"):r.push(`  case ${t}:{`),r.push(`      outColor = textureSampleGrad(textureSource${t+1}, textureSampler${t+1}, vUV, uvDx, uvDy);`),r.push("      break;}");r.push("}")}return r.join(`
`)}function Dt(e){return q[e]||(q[e]={name:"texture-batch-bit",vertex:{header:`
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

                ${_e(e)}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${Se(e)}
            `}}),q[e]}var tt={};function be(e){let r=[];for(let t=0;t<e;t++)t>0&&r.push("else"),t<e-1&&r.push(`if(vTextureId < ${t}.5)`),r.push("{"),r.push(`	outColor = texture(uTextures[${t}], vUV);`),r.push("}");return r.join(`
`)}function Rt(e){return tt[e]||(tt[e]={name:"texture-batch-bit",vertex:{header:`
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

                uniform sampler2D uTextures[${e}];

            `,main:`

                ${be(e)}
            `}}),tt[e]}var $t={name:"round-pixels-bit",vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},Ft={name:"round-pixels-bit",vertex:{header:`
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}};function et(e,r,t,n){if(t??(t=0),n??(n=Math.min(e.byteLength-t,r.byteLength)),!(t&7)&&!(n&7)){let i=n/8;new Float64Array(r,0,i).set(new Float64Array(e,t,i))}else if(!(t&3)&&!(n&3)){let i=n/4;new Float32Array(r,0,i).set(new Float32Array(e,t,i))}else new Uint8Array(r).set(new Uint8Array(e,t,n))}var Zt={normal:"normal-npm",add:"add-npm",screen:"screen-npm"},Be=(e=>(e[e.DISABLED=0]="DISABLED",e[e.RENDERING_MASK_ADD=1]="RENDERING_MASK_ADD",e[e.MASK_ACTIVE=2]="MASK_ACTIVE",e[e.INVERSE_MASK_ACTIVE=3]="INVERSE_MASK_ACTIVE",e[e.RENDERING_MASK_REMOVE=4]="RENDERING_MASK_REMOVE",e[e.NONE=5]="NONE",e))(Be||{});var we=["precision mediump float;","void main(void){","float test = 0.1;","%forloop%","gl_FragColor = vec4(0.0);","}"].join(`
`);function Ae(e){let r="";for(let t=0;t<e;++t)t>0&&(r+=`
else `),t<e-1&&(r+=`if(test == ${t}.0){}`);return r}function Ht(e,r){if(e===0)throw new Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");let t=r.createShader(r.FRAGMENT_SHADER);try{for(;;){let n=we.replace(/%forloop%/gi,Ae(e));if(r.shaderSource(t,n),r.compileShader(t),!r.getShaderParameter(t,r.COMPILE_STATUS))e=e/2|0;else break}}finally{r.deleteShader(t)}return e}var jt={};function Nt(e){let r=jt[e];if(r)return r;let t=new Int32Array(e);for(let n=0;n<e;n++)t[n]=n;return r=jt[e]=new ht({uTextures:{value:t,type:"i32",size:e}},{isStatic:!0}),r}var E=class{constructor(r){typeof r=="number"?this.rawBinaryData=new ArrayBuffer(r):r instanceof Uint8Array?this.rawBinaryData=r.buffer:this.rawBinaryData=r,this.uint32View=new Uint32Array(this.rawBinaryData),this.float32View=new Float32Array(this.rawBinaryData),this.size=this.rawBinaryData.byteLength}get int8View(){return this._int8View||(this._int8View=new Int8Array(this.rawBinaryData)),this._int8View}get uint8View(){return this._uint8View||(this._uint8View=new Uint8Array(this.rawBinaryData)),this._uint8View}get int16View(){return this._int16View||(this._int16View=new Int16Array(this.rawBinaryData)),this._int16View}get int32View(){return this._int32View||(this._int32View=new Int32Array(this.rawBinaryData)),this._int32View}get float64View(){return this._float64Array||(this._float64Array=new Float64Array(this.rawBinaryData)),this._float64Array}get bigUint64View(){return this._bigUint64Array||(this._bigUint64Array=new BigUint64Array(this.rawBinaryData)),this._bigUint64Array}view(r){return this[`${r}View`]}destroy(){this.rawBinaryData=null,this.uint32View=null,this.float32View=null,this.uint16View=null,this._int8View=null,this._uint8View=null,this._int16View=null,this._int32View=null,this._float64Array=null,this._bigUint64Array=null}static sizeOf(r){switch(r){case"int8":case"uint8":return 1;case"int16":case"uint16":return 2;case"int32":case"uint32":case"float32":return 4;default:throw new Error(`${r} isn't a valid view type`)}}};function rt(e,r){return r.alphaMode==="no-premultiply-alpha"&&Zt[e]||e}var I=null;function Wt(){if(I)return I;let e=lt();return I=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),I=Ht(I,e),e.getExtension("WEBGL_lose_context")?.loseContext(),I}var H=class{constructor(){this.ids=Object.create(null),this.textures=[],this.count=0}clear(){for(let r=0;r<this.count;r++){let t=this.textures[r];this.textures[r]=null,this.ids[t.uid]=null}this.count=0}};var nt=class{constructor(){this.renderPipeId="batch",this.action="startBatch",this.start=0,this.size=0,this.textures=new H,this.blendMode="normal",this.topology="triangle-strip",this.canBundle=!0}destroy(){this.textures=null,this.gpuBindGroup=null,this.bindGroup=null,this.batcher=null,this.elements=null}},k=[],j=0;at.register({clear:()=>{if(k.length>0)for(let e of k)e&&e.destroy();k.length=0,j=0}});function Qt(){return j>0?k[--j]:new nt}function Kt(e){e.elements=null,k[j++]=e}var V=0,Ie=(()=>{let e=class Lt{constructor(t){this.uid=ot("batcher"),this.dirty=!0,this.batchIndex=0,this.batches=[],this._elements=[],t=P(P({},Lt.defaultOptions),t),t.maxTextures||(st("v8.8.0","maxTextures is a required option for Batcher now, please pass it in the options"),t.maxTextures=Wt());let{maxTextures:n,attributesInitialSize:i,indicesInitialSize:s}=t;this.attributeBuffer=new E(i*4),this.indexBuffer=new Uint16Array(s),this.maxTextures=n}begin(){this.elementSize=0,this.elementStart=0,this.indexSize=0,this.attributeSize=0;for(let t=0;t<this.batchIndex;t++)Kt(this.batches[t]);this.batchIndex=0,this._batchIndexStart=0,this._batchIndexSize=0,this.dirty=!0}add(t){this._elements[this.elementSize++]=t,t._indexStart=this.indexSize,t._attributeStart=this.attributeSize,t._batcher=this,this.indexSize+=t.indexSize,this.attributeSize+=t.attributeSize*this.vertexSize}checkAndUpdateTexture(t,n){let i=t._batch.textures.ids[n._source.uid];return!i&&i!==0?!1:(t._textureId=i,t.texture=n,!0)}updateElement(t){this.dirty=!0;let n=this.attributeBuffer;t.packAsQuad?this.packQuadAttributes(t,n.float32View,n.uint32View,t._attributeStart,t._textureId):this.packAttributes(t,n.float32View,n.uint32View,t._attributeStart,t._textureId)}break(t){let n=this._elements;if(!n[this.elementStart])return;let i=Qt(),s=i.textures;s.clear();let o=n[this.elementStart],u=rt(o.blendMode,o.texture._source),a=o.topology;this.attributeSize*4>this.attributeBuffer.size&&this._resizeAttributeBuffer(this.attributeSize*4),this.indexSize>this.indexBuffer.length&&this._resizeIndexBuffer(this.indexSize);let l=this.attributeBuffer.float32View,p=this.attributeBuffer.uint32View,m=this.indexBuffer,d=this._batchIndexSize,v=this._batchIndexStart,x="startBatch",y=[],S=this.maxTextures;for(let _=this.elementStart;_<this.elementSize;++_){let f=n[_];n[_]=null;let c=f.texture._source,b=rt(f.blendMode,c),M=u!==b||a!==f.topology;if(c._batchTick===V&&!M){f._textureId=c._textureBindLocation,d+=f.indexSize,f.packAsQuad?(this.packQuadAttributes(f,l,p,f._attributeStart,f._textureId),this.packQuadIndex(m,f._indexStart,f._attributeStart/this.vertexSize)):(this.packAttributes(f,l,p,f._attributeStart,f._textureId),this.packIndex(f,m,f._indexStart,f._attributeStart/this.vertexSize)),f._batch=i,y.push(f);continue}c._batchTick=V,(s.count>=S||M)&&(this._finishBatch(i,v,d-v,s,u,a,t,x,y),x="renderBatch",v=d,u=b,a=f.topology,i=Qt(),s=i.textures,s.clear(),y=[],++V),f._textureId=c._textureBindLocation=s.count,s.ids[c.uid]=s.count,s.textures[s.count++]=c,f._batch=i,y.push(f),d+=f.indexSize,f.packAsQuad?(this.packQuadAttributes(f,l,p,f._attributeStart,f._textureId),this.packQuadIndex(m,f._indexStart,f._attributeStart/this.vertexSize)):(this.packAttributes(f,l,p,f._attributeStart,f._textureId),this.packIndex(f,m,f._indexStart,f._attributeStart/this.vertexSize))}s.count>0&&(this._finishBatch(i,v,d-v,s,u,a,t,x,y),v=d,++V),this.elementStart=this.elementSize,this._batchIndexStart=v,this._batchIndexSize=d}_finishBatch(t,n,i,s,o,u,a,l,p){t.gpuBindGroup=null,t.bindGroup=null,t.action=l,t.batcher=this,t.textures=s,t.blendMode=o,t.topology=u,t.start=n,t.size=i,t.elements=p,++V,this.batches[this.batchIndex++]=t,a.add(t)}finish(t){this.break(t)}ensureAttributeBuffer(t){t*4<=this.attributeBuffer.size||this._resizeAttributeBuffer(t*4)}ensureIndexBuffer(t){t<=this.indexBuffer.length||this._resizeIndexBuffer(t)}_resizeAttributeBuffer(t){let n=Math.max(t,this.attributeBuffer.size*2),i=new E(n);et(this.attributeBuffer.rawBinaryData,i.rawBinaryData),this.attributeBuffer=i}_resizeIndexBuffer(t){let n=this.indexBuffer,i=Math.max(t,n.length*1.5);i+=i%2;let s=i>65535?new Uint32Array(i):new Uint16Array(i);if(s.BYTES_PER_ELEMENT!==n.BYTES_PER_ELEMENT)for(let o=0;o<n.length;o++)s[o]=n[o];else et(n.buffer,s.buffer);this.indexBuffer=s}packQuadIndex(t,n,i){t[n]=i+0,t[n+1]=i+1,t[n+2]=i+2,t[n+3]=i+0,t[n+4]=i+2,t[n+5]=i+3}packIndex(t,n,i,s){let o=t.indices,u=t.indexSize,a=t.indexOffset,l=t.attributeOffset;for(let p=0;p<u;p++)n[i++]=s+o[p+a]-l}destroy(t={}){if(this.batches!==null){for(let n=0;n<this.batchIndex;n++)Kt(this.batches[n]);this.batches=null,this.geometry.destroy(!0),this.geometry=null,t.shader&&(this.shader?.destroy(),this.shader=null);for(let n=0;n<this._elements.length;n++)this._elements[n]&&(this._elements[n]._batch=null);this._elements=null,this.indexBuffer=null,this.attributeBuffer.destroy(),this.attributeBuffer=null}}};return e.defaultOptions={maxTextures:null,attributesInitialSize:4,indicesInitialSize:6},e})(),Xt=Ie;var Me=new Float32Array(1),Pe=new Uint32Array(1),N=class extends pt{constructor(){let t=new W({data:Me,label:"attribute-batch-buffer",usage:U.VERTEX|U.COPY_DST,shrinkToFit:!1}),n=new W({data:Pe,label:"index-batch-buffer",usage:U.INDEX|U.COPY_DST,shrinkToFit:!1}),i=24;super({attributes:{aPosition:{buffer:t,format:"float32x2",stride:i,offset:0},aUV:{buffer:t,format:"float32x2",stride:i,offset:8},aColor:{buffer:t,format:"unorm8x4",stride:i,offset:16},aTextureIdAndRound:{buffer:t,format:"uint16x2",stride:i,offset:20}},indexBuffer:n})}};var D=class extends xt{constructor(r){let t=Et({name:"batch",bits:[kt,Rt(r),Ft]}),n=Gt({name:"batch",bits:[Vt,Dt(r),$t]});super({glProgram:t,gpuProgram:n,resources:{batchSamplers:Nt(r)}}),this.maxTextures=r}};var R=null,Yt=class Jt extends Xt{constructor(r){super(r),this.geometry=new N,this.name=Jt.extension.name,this.vertexSize=6,R??(R=new D(r.maxTextures)),this.shader=R}packAttributes(r,t,n,i,s){let o=s<<16|r.roundPixels&65535,u=r.transform,a=u.a,l=u.b,p=u.c,m=u.d,d=u.tx,v=u.ty,{positions:x,uvs:y}=r,S=r.color,_=r.attributeOffset,f=_+r.attributeSize;for(let h=_;h<f;h++){let c=h*2,b=x[c],M=x[c+1];t[i++]=a*b+p*M+d,t[i++]=m*M+l*b+v,t[i++]=y[c],t[i++]=y[c+1],n[i++]=S,n[i++]=o}}packQuadAttributes(r,t,n,i,s){let o=r.texture,u=r.transform,a=u.a,l=u.b,p=u.c,m=u.d,d=u.tx,v=u.ty,x=r.bounds,y=x.maxX,S=x.minX,_=x.maxY,f=x.minY,h=o.uvs,c=r.color,b=s<<16|r.roundPixels&65535;t[i+0]=a*S+p*f+d,t[i+1]=m*f+l*S+v,t[i+2]=h.x0,t[i+3]=h.y0,n[i+4]=c,n[i+5]=b,t[i+6]=a*y+p*f+d,t[i+7]=m*f+l*y+v,t[i+8]=h.x1,t[i+9]=h.y1,n[i+10]=c,n[i+11]=b,t[i+12]=a*y+p*_+d,t[i+13]=m*_+l*y+v,t[i+14]=h.x2,t[i+15]=h.y2,n[i+16]=c,n[i+17]=b,t[i+18]=a*S+p*_+d,t[i+19]=m*_+l*S+v,t[i+20]=h.x3,t[i+21]=h.y3,n[i+22]=c,n[i+23]=b}_updateMaxTextures(r){this.shader.maxTextures!==r&&(R=new D(r),this.shader=R)}destroy(){this.shader=null,super.destroy()}};Yt.extension={type:[it.Batcher],name:"default"};var Hr=Yt;var Ot=class{constructor(r){this.items=Object.create(null);let{renderer:t,type:n,onUnload:i,priority:s,name:o}=r;this._renderer=t,t.gc.addResourceHash(this,"items",n,s??0),this._onUnload=i,this.name=o}add(r){return this.items[r.uid]?!1:(this.items[r.uid]=r,r.once("unload",this.remove,this),r._gcLastUsed=this._renderer.gc.now,!0)}remove(r,...t){if(!this.items[r.uid])return;let n=r._gpuData[this._renderer.uid];n&&(this._onUnload?.(r,...t),n.destroy(),r._gpuData[this._renderer.uid]=null,this.items[r.uid]=null)}removeAll(...r){Object.values(this.items).forEach(t=>t&&this.remove(t,...r))}destroy(...r){this.removeAll(...r),this.items=Object.create(null),this._renderer=null,this._onUnload=null}};export{Ce as a,Gt as b,Et as c,Vt as d,kt as e,Dt as f,Rt as g,$t as h,Ft as i,et as j,Be as k,rt as l,Ht as m,Nt as n,Hr as o,Ot as p};
