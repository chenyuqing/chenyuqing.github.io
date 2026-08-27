(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,555,e=>{e.v({canvas:"LayerView-module-scss-module__TtS2oW__canvas",canvasEventSurface:"LayerView-module-scss-module__TtS2oW__canvasEventSurface",canvasWrap:"LayerView-module-scss-module__TtS2oW__canvasWrap",sidebar:"LayerView-module-scss-module__TtS2oW__sidebar",view:"LayerView-module-scss-module__TtS2oW__view"})},69454,e=>{"use strict";var t,o,r=e.i(43476),a=e.i(71645);function n(e){return null!=e}function i(e,t,o,r,a){if(a&&a.length!==r.length)throw Error(`Number of texture names (${a.length}) does not match number of src textures (${r.length})`);let n=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,n);for(let t=0;t<o.length;t++)e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,o[t].texture,0);e.drawBuffers(o.map((t,o)=>e.COLOR_ATTACHMENT0+o));let i=e.checkFramebufferStatus(e.FRAMEBUFFER);return i!==e.FRAMEBUFFER_COMPLETE&&console.log("createRenderPhase: framebuffer not complete: "+i),{destBuffers:o,srcBuffers:r,fbo:n,program:t,uniformNames:a,uniformsSet:!1}}function l(e,t,o,r){let a=e.createTexture();e.bindTexture(e.TEXTURE_2D,a);let[n,i]=c(e,r);return e.texImage2D(e.TEXTURE_2D,0,i,t,o,0,n,e.FLOAT,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),{width:t,height:o,texture:a,channels:r}}function s(e,t,o){if(o.length!==t.width*t.height*t.channels)throw Error("Data length does not match buffer size");e.bindTexture(e.TEXTURE_2D,t.texture);let[r]=c(e,t.channels);e.texSubImage2D(e.TEXTURE_2D,0,0,0,t.width,t.height,r,e.FLOAT,o)}function c(e,t){switch(t){case 1:return[e.RED,e.R32F];case 2:return[e.RG,e.RG32F];case 3:return[e.RGB,e.RGB32F];case 4:return[e.RGBA,e.RGBA32F];default:throw Error(`Invalid number of channels: ${t}. Must be 1, 2, 3, or 4.`)}}var u=e.i(36748);let d=`#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`;function m(e,t,o){let{gl:r,model:a,shape:{B:n,T:c,C:m},shaderManager:f}=e,h=a[t+".weight"],p=a[t+".bias"],g=l(r,1,m,1),x=l(r,1,m,1),v=l(r,1,n*c,2),b=l(r,m,n*c,1);s(r,g,h.toFloat32Array()),s(r,x,p.toFloat32Array());let y=(0,u.createShaderProgram)(f,"normAgg",d,`#version 300 es
        precision highp float;
        uniform sampler2D normInput; // (B, T) (C)
        out vec2 normAgg;            // (B, T) (1) [2]

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            // Use Welford's algorithm to compute mean and variance
            float mean = 0.0;
            float M2 = 0.0;
            for (int i = 0; i < ${m}; i++) {
                float x = texelFetch(normInput, ivec2(i, pos.y), 0).r;
                float delta = x - mean;
                mean += delta / float(i + 1);
                M2 += delta * (x - mean);
            }

            normAgg = vec2(mean, 1.0 / sqrt(M2 / float(${m}) + 0.00001));
        }
    `),_=(0,u.createShaderProgram)(f,"normApply",d,`#version 300 es
        precision highp float;
        uniform sampler2D normInput;  // (B, T) (C)
        uniform sampler2D normAgg;    // (B, T) (1) [2]
        uniform sampler2D normWeight; // (C)    (1)
        uniform sampler2D normBias;   // (C)    (1)
        out float normOutput;         // (B, T) (C)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);

            vec2 agg = texelFetch(normAgg, ivec2(0, pos.y), 0).rg;
            float mean = agg.r;
            float stdInv = agg.g;

            float x = texelFetch(normInput, pos, 0).r;

            float weight = texelFetch(normWeight, ivec2(0, pos.x), 0).r;
            float bias   = texelFetch(normBias,   ivec2(0, pos.x), 0).r;

            normOutput = (x - mean) * stdInv * weight + bias;
        }
    `),w=i(r,y,[v],[o],["normInput"]),B=i(r,_,[b],[o,v,g,x],["normInput","normAgg","normWeight","normBias"]);return{normAgg:v,normWeight:g,normBias:x,aggPhase:w,applyPhase:B,output:b}}function f(e,t,o,r,a,c,m){let{gl:f,model:h,shape:{B:p,T:g},shaderManager:x}=e;m=m??!0;let v=h[t+".weight"],b=m?h[t+".bias"]:null,y=l(f,o,r,1),_=m?l(f,1,r,1):null,w=l(f,r,p*g,1);s(f,y,v.buffer),b&&_&&s(f,_,b.buffer);let B=i(f,(0,u.createShaderProgram)(x,"linear",d,`#version 300 es
        precision highp float;          //    y     x
        uniform sampler2D linearInput;  // (B, T) (nIn)
        uniform sampler2D linearWeight; // (nOut) (nIn)
        ${m?"uniform sampler2D linearBias;":""}   // (nOut) (1)
        ${c?"uniform sampler2D linearResidual;":""}
        out float linearOutput;         // (B, T) (nOut)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);

            float res = ${m?"texelFetch(linearBias, ivec2(0, pos.x), 0).r":"0.0"};
            for (int i = 0; i < ${o}; i++) {
                float x = texelFetch(linearInput, ivec2(i, pos.y), 0).r;
                float w = texelFetch(linearWeight, ivec2(i, pos.x), 0).r;
                res += x * w;
            }

            ${c?"res += texelFetch(linearResidual, pos, 0).r;":""}
            linearOutput = res;
        }
    `),[w],[a,y,_,c].filter(n),["linearInput","linearWeight",m?"linearBias":null,c?"linearResidual":null].filter(n));return{weight:y,bias:_,linearPhase:B,output:w}}function h(e,t,o,r,a){let{gl:n,model:c,shape:{B:m,T:f},shaderManager:h}=e,p=c[t+".weight"],g=l(n,r,o,1),x=l(n,r,m*f,1);s(n,g,p.buffer);let v=i(n,(0,u.createShaderProgram)(h,"embed",d,`#version 300 es
        precision highp float;          //    y     x
        uniform sampler2D embedInput;  // (B, T)   (1)
        uniform sampler2D embedWeight; // (nEmbed) (nDims)
        out float embedOutput;         // (B, T)   (nDims)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);

            int y = int(texelFetch(embedInput, ivec2(0, pos.y), 0).r);
            float res = texelFetch(embedWeight, ivec2(pos.x, y), 0).r;

            embedOutput = res;
        }
    `),[x],[a,g],["embedInput","embedWeight"]);return{weight:g,phase:v,output:x}}function p(e,t,o){let{gl:r,shape:{B:a,T:n,C:s},shaderManager:c}=e,m=l(r,s,a*n,1);return{addPhase:i(r,(0,u.createShaderProgram)(c,"add",d,`#version 300 es
        precision highp float;     //    y    x
        uniform sampler2D inputA;  // (B, T) (C)
        uniform sampler2D inputB;  // (B, T) (C)
        out float addOutput;       // (B, T) (C)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);

            float a = texelFetch(inputA, pos, 0).r;
            float b = texelFetch(inputB, pos, 0).r;
            addOutput = a + b;
        }
    `),[m],[t,o],["inputA","inputB"]),output:m}}var g=e.i(555),x=e.i(5741),v=e.i(92921),b=e.i(51523);class y{shape;buffer;stride;isContiguous;constructor(e,t,o=[]){this.shape=e,this.buffer=t,this.stride=o;let r=e.reduce((e,t)=>e*t,1);if(r>t.length)throw Error(`Shape ${e.join(", ")} requires ${r} buffer, but buffer has size ${t.length}`);let a=Array(e.length),n=1;for(let t=e.length-1;t>=0;t--)a[t]=n,n*=e[t];if(0===o.length)this.stride=a;else if(o.length!==e.length)throw Error(`Stride length ${o.length} does not match shape length ${e.length}`);this.isContiguous=!0;for(let e=0;e<o.length;e++)if(o[e]!==a[e]){this.isContiguous=!1;break}}view(e){let t=e.reduce((e,t)=>e*t,1),o=this.shape.reduce((e,t)=>e*t,1);if(t!==o)throw Error(`Invalid reshape: new size ${t} (${e.join(", ")}) does not match existing size ${o} (${this.shape.join(", ")})`);if(!this.isContiguous)throw Error("Cannot view non-contiguous tensor (or at least, there are potential cases where it would work, but we don't support them yet)");return new y(e,this.buffer)}transpose(e,t){if(e<0||e>=this.shape.length||t<0||t>=this.shape.length||e===t)throw Error(`Invalid transpose indices: ${e}, ${t} over shape ${this.shape.join(", ")}`);let o=[...this.shape],r=[...this.stride],a=o[e];o[e]=o[t],o[t]=a;let n=r[e];return r[e]=r[t],r[t]=n,new y(o,this.buffer,r)}permute(...e){let t=new Set(Array(this.shape.length).fill(0).map((e,t)=>t));if(e.forEach(e=>t.delete(e)),e.length!==this.shape.length||0!==t.size)throw Error(`Invalid permute axes: ${e.join(", ")} over shape ${this.shape.join(", ")}`);let o=e.map(e=>this.shape[e]),r=e.map(e=>this.stride[e]);return new y(o,this.buffer,r)}g(e){return this.buffer[this.indexToOffset(e)]}s(e,t){this.buffer[this.indexToOffset(e)]=t}indexToOffset(e){if(e.length!==this.shape.length)throw Error(`Index length ${e.length} does not match shape length ${this.shape.length}`);let t=0;for(let o=0;o<e.length;o++){if(e[o]>=this.shape[o])throw Error(`Index ${e[o]} out of bounds for shape ${this.shape[o]}`);t+=e[o]*this.stride[o]}return t}*indexIterator(){let e=Array(this.shape.length).fill(0);for(;;){yield e;let t=this.shape.length-1;for(;t>=0&&(e[t]++,!(e[t]<this.shape[t]));)e[t]=0,t--;if(t<0)break}}contiguous(){return this.isContiguous?this:new y(this.shape,this.toFloat32Array())}toFloat32Array(){let e=new Float32Array(this.shape.reduce((e,t)=>e*t,1));if(this.isContiguous)e.set(this.buffer);else{let t=Array(this.shape.length).fill(0),o=0,r=0;for(;;){e[o++]=this.buffer[r];let a=this.shape.length-1;for(;a>=0&&(t[a]++,r+=this.stride[a],!(t[a]<this.shape[a]));)r-=t[a]*this.stride[a],t[a]=0,a--;if(a<0)break}}return e}static fromJson(e){if(!e.shape||!e.dtype||!e.data)throw console.error("Invalid tensor json",e),Error("Invalid tensor json");if("torch.float32"!==e.dtype)throw console.error("Invalid tensor dtype",e),Error("Invalid tensor dtype");let t=new Float32Array((0,b.base64ToArrayBuffer)(e.data));return new y(e.shape,t)}copyFrom(e){if(e.shape.length!==this.shape.length||!e.contiguous||!this.contiguous)throw Error(`Invalid copy: source shape length ${e.shape.length} does not match target shape length ${this.shape.length}`);for(let t=0;t<this.shape.length;t++)if(e.shape[t]!==this.shape[t])throw Error(`Invalid copy: source shape ${e.shape[t]} does not match target shape ${this.shape[t]}`);this.buffer.set(e.buffer)}}var _=e.i(51164),w=e.i(83891),B=e.i(76926),T=e.i(75076),E=e.i(6461);let A=new Float32Array(3072);var k=e.i(40029);let R=new Float32Array(12);function F(e,t,o,r,a,n,i=!0,l=0,s){var c,u,d,m;let f=o.sub(t);f.z=0,f=f.normalize();let h=o.sub(t).len(),p=i?Math.min(.7*h,3):0,g=new k.Mat4f,x=E.Vec3.cross(f,a).mul(-1).normalize();a=E.Vec3.cross(x,f).normalize(),g[0]=x.x,g[1]=x.y,g[2]=x.z,g[4]=f.x,g[5]=f.y,g[6]=f.z,g[8]=a.x,g[9]=a.y,g[10]=a.z,t=g.mulVec3Proj(t),o=g.mulVec3Proj(o);let v={width:r,borderColor:n.mul(.8),ribbonColor:n.mul(.3),headDepth:p,headExtra:3,lineThick:1.2,mtx:g};s=s?g.mulVec3ProjVec(s):void 0,Math.abs(t.z-o.z)>.01||s?function(){let r=Math.max(p,Math.abs(t.y-o.y-p)/2),a=new E.Vec3(t.x,t.y,t.z),n=new E.Vec3(t.x,t.y+r,t.z),l=new E.Vec3(o.x,o.y-p-r,o.z),c=new E.Vec3(o.x,o.y-p,o.z);s&&(l=o.mulAdd(s,-p-r),c=o.mulAdd(s,-p));let u=function(e,t,o,r){let a=A,n=0,i=[];function l(e,t,o,r){i.push({p0:e,p1:t,p2:o,p3:r})}l(e,t,o,r),r.writeToBuf(a,n),n+=3;for(;i.length>0;){let{p0:e,p1:t,p2:o,p3:r}=i.pop(),s=e.mid(t),c=t.mid(o),u=o.mid(r),d=s.mid(c),m=c.mid(u),f=d.mid(m),h=r.sub(e),p=t.sub(r),g=o.sub(r),x=Math.abs(p.y*h.z-p.z*h.y),v=Math.abs(g.y*h.z-g.z*h.y);if((x+v)*(x+v)>.1*h.lenSq())l(e,s,d,f),l(f,m,u,r);else{if(n+6>a.length){let e=new Float32Array(2*a.length);e.set(a),a=e}e.writeToBuf(a,n),n+=3}}return A=a,a.slice(0,n)}(a,n,l,c),d=u.length/3,m=3*!!i,f=(2*d+m)*3;R.length<f&&(R=new Float32Array(f));let h=R.subarray(0,f);for(let t=0;t<d-1;t++)S(e,new E.Vec3(u[3*t+0],u[3*t+1],u[3*t+2]),new E.Vec3(u[3*t+3],u[3*t+4],u[3*t+5]),v);let g=d+m;for(let e=0;e<d;e++){let t=g+e;h[3*t+0]=u[3*e+0]+v.width/2,h[3*t+1]=u[3*e+1],h[3*t+2]=u[3*e+2];let o=d-e-1;h[3*o+0]=u[3*e+0]-v.width/2,h[3*o+1]=u[3*e+1],h[3*o+2]=u[3*e+2]}if(i){s=s??new E.Vec3(0,1,0);let e=o.mulAdd(s,-p),t=d;h[3*t+0]=e.x-v.width/2-3,h[3*t+1]=e.y,h[3*t+2]=e.z,h[3*(t+=1)+0]=o.x,h[3*t+1]=o.y,h[3*t+2]=o.z,h[3*(t+=1)+0]=e.x+v.width/2+3,h[3*t+1]=e.y,h[3*t+2]=e.z}let x=(0,B.makeLineOpts)({thick:v.lineThick,mtx:v.mtx,color:v.borderColor});(0,B.drawLineSegs)(e.lineRender,h,x)}():S(e,t,o.sub(new E.Vec3(0,p)),v),0!==l&&function(e,t,o,r){let a=1===o?1:-1;O.x=t.x+r.width/2*a,O.y=t.y+r.width/2,O.z=t.z,W.z=t.z,G.z=t.z;for(let t=0;t<8;t++){let o=t/7*Math.PI/2,n=r.width*Math.cos(o)*a,i=r.width*Math.sin(o);W.x=O.x-n,W.y=O.y-i,(0,T.addVert)(e.triRender,W,r.ribbonColor,j,r.mtx),(0,T.addVert)(e.triRender,O,r.ribbonColor,j,r.mtx);let l=G;G=W,W=l}(0,T.addPrimitiveRestart)(e.triRender)}(e,t.sub(new E.Vec3(0,r/2)),l,v),i&&(s=s??new E.Vec3(0,1,0),c=e,u=o.mulAdd(s,-p),d=o,m=v,V.copy_(u),V.x-=m.width/2,D.copy_(u),D.x+=m.width/2,z.copy_(d),z.x+=m.width/2,I.copy_(u),I.x=V.x-3,C.copy_(u),C.x=z.x+3,L.copy_(d),L.x=V.x+m.width/2,(0,T.addVert)(c.triRender,I,m.ribbonColor,U,m.mtx),(0,T.addVert)(c.triRender,L,m.ribbonColor,U,m.mtx),(0,T.addVert)(c.triRender,C,m.ribbonColor,U,m.mtx),(0,T.addPrimitiveRestart)(c.triRender))}let M=new E.Vec3,P=new E.Vec3;function S(e,t,o,r){M.x=t.x-r.width/2,M.y=t.y,M.z=t.z,P.x=o.x+r.width/2,P.y=o.y,P.z=o.z,(0,T.addQuad)(e.triRender,M,P,r.ribbonColor,r.mtx)}new E.Vec3,new E.Vec3;let V=new E.Vec3,D=new E.Vec3,z=new E.Vec3,I=new E.Vec3,C=new E.Vec3,L=new E.Vec3,U=new E.Vec3(0,0,1),O=new E.Vec3,j=new E.Vec3(0,0,1),W=new E.Vec3,G=new E.Vec3;var N=e.i(10738);function X(e,t,o,r,a){let n=new k.Mat4f;n[14]=(o.z+r.z)/2;let i=a.color,l=a.fontSize,s=a.pad??10,c=i.mul(.4),u=(0,x.measureTextWidth)(e.modelFontBuf,t,l);(0,x.writeTextToBuffer)(e.modelFontBuf,t,i,o.x-u-2*s,(o.y+r.y)/2-l/2,l,n);let d=new E.Vec3(o.x,o.y,(o.z+r.z)/2),m=new E.Vec3(r.x,r.y,(o.z+r.z)/2);o.z!=r.z&&(d=new E.Vec3(o.x,(o.y+r.y)/2,o.z),m=new E.Vec3(o.x,(o.y+r.y)/2,r.z));let f=new E.Vec3(1,0,0);(0,B.addLine)(e.lineRender,1,c,d.mulAdd(f,-s),m.mulAdd(f,-s),void 0),(0,B.addLine)(e.lineRender,1,c,d.mulAdd(f,-s),d,void 0),(0,B.addLine)(e.lineRender,1,c,m.mulAdd(f,-s),m,void 0)}var $=e.i(21729),q=e.i(710),H=e.i(85539),Y=e.i(35050);function Q(e){if(!e)return null;let t=e.gl,o=`
    layout (std140) uniform BlockUbo {
        uniform vec3 u_offset;
        uniform vec3 u_size;
        uniform vec3 u_nCells;
        uniform mat4 u_localPosMtx;
        uniform vec4 u_baseColor;
        uniform float u_highlight;
    };`,r=`
    layout (std140) uniform BlockAccessUbo {
        layout(row_major) uniform mat4x2 u_accessMtx;
        uniform float u_accessTexChannel;
        uniform float u_accessTexScale;
    };`,a=(0,u.createFloatBuffer)(t,t.UNIFORM_BUFFER,t.createBuffer(),1024,144,null),n=(0,u.createFloatBuffer)(t,t.UNIFORM_BUFFER,t.createBuffer(),1024,80,null),i=function(e){let t=[-1,1,-1,-1,1,1,1,1,-1,-1,1,-1],o=[new k.Mat4f,k.Mat4f.fromAxisAngle(new E.Vec3(1,0),Math.PI/2),k.Mat4f.fromAxisAngle(new E.Vec3(1,0),Math.PI),k.Mat4f.fromAxisAngle(new E.Vec3(1,0),-Math.PI/2),k.Mat4f.fromAxisAngle(new E.Vec3(0,1),Math.PI/2),k.Mat4f.fromAxisAngle(new E.Vec3(0,1),-Math.PI/2)],r=k.Mat4f.fromTranslation(new E.Vec3(.5,.5,.5)).mul(k.Mat4f.fromScale(new E.Vec3(.5,.5,.5))),a=new Float32Array(216),n=0;for(let e of o)for(let o=0;o<6;o++){let i=r.mulVec3Proj(e.mulVec3Proj(new E.Vec3(t[2*o],t[2*o+1],-1))),l=e.mulVec3Proj(new E.Vec3(0,0,-1));a[n++]=Math.round(i.x),a[n++]=Math.round(i.y),a[n++]=Math.round(i.z),a[n++]=l.x,a[n++]=l.y,a[n++]=l.z}let i=e.createVertexArray();e.bindVertexArray(i);let l=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,a,e.STATIC_DRAW),(0,u.bindFloatAttribs)(e,l,{},[{name:"a_position",size:3},{name:"a_normal",size:3}]),{name:"cube",vao:i,vbo:l,type:e.TRIANGLES,numVerts:36}}(t),l=t.createVertexArray();t.bindVertexArray(l),t.bindBuffer(t.ARRAY_BUFFER,i.vbo),(0,u.bindFloatAttribs)(t,i.vbo,{},[{name:"a_position",size:3},{name:"a_normal",size:3}]);let s=t.createBuffer(),c=(0,u.bindFloatAttribs)(t,s,{locOffset:2,divisor:1},[{name:"a_offset",size:4},{name:"a_size",size:4},{name:"a_nCells",size:4},{name:"a_localPosMtx0",size:4},{name:"a_localPosMtx1",size:4},{name:"a_localPosMtx2",size:4},{name:"a_localPosMtx3",size:4},{name:"a_baseColor",size:4},{name:"a_highlight",size:1}]),d=(0,u.createFloatBuffer)(t,t.ARRAY_BUFFER,s,1024,c,null),m=t.createTexture();function f(e){return`#version 300 es
        precision highp float;

        ${Y.modelViewUboText}

        ${e?"":o}

        ${r}

        layout(location = 0) in vec3 a_position;
        layout(location = 1) in vec3 a_normal;
        out vec3 v_normal;
        out vec3 v_modelPos;
        out vec3 v_blockPos;
        out vec2 v_accessPos;
        out vec3 v_cubePos;

        ${e?`
            layout(location = 2) in vec4 a_offset;
            layout(location = 3) in vec4 a_size;
            layout(location = 4) in vec4 a_nCells;
            layout(location = 5) in vec4 a_localPosMtx0;
            layout(location = 6) in vec4 a_localPosMtx1;
            layout(location = 7) in vec4 a_localPosMtx2;
            layout(location = 8) in vec4 a_localPosMtx3;
            layout(location = 9) in vec4 a_baseColor;
            layout(location = 10) in float a_highlight;

            out vec4 u_baseColor;
            out float u_highlight;
        `:""}

        void main() {
            ${e?`
                vec3 u_offset = a_offset.xyz;
                vec3 u_size = a_size.xyz;
                vec3 u_nCells = a_nCells.xyz;
                mat4 u_localPosMtx = mat4(a_localPosMtx0, a_localPosMtx1, a_localPosMtx2, a_localPosMtx3);
                u_baseColor = a_baseColor;
                u_highlight = a_highlight;
            `:""}

            vec3 localPos = (u_localPosMtx * vec4(a_position, 1.0)).xyz;
            vec3 model_pos = a_position * u_size + u_offset;
            gl_Position = u_view * u_model * vec4(model_pos, 1);
            v_normal = a_normal;
            v_modelPos = model_pos;
            v_blockPos = localPos * u_nCells;
            v_accessPos = u_accessMtx * vec4(v_blockPos, 1.0);
            v_cubePos = localPos;
            ${e?" ":""}
        }`}function h(e){return`#version 300 es
        precision highp float;
        in vec3 v_normal;
        out vec4 o_color;
        in vec3 v_blockPos;
        in vec3 v_cubePos;
        in vec3 v_modelPos;
        in vec2 v_accessPos;
        uniform vec3 u_camPos; // in model space

        ${e?`
            in vec4 u_baseColor;
            in float u_highlight;
        `:o}

        ${r}

        uniform sampler2D u_accessSampler;

        void main() {
            ivec3 blockPos = ivec3(v_blockPos - v_normal * 0.1);

            bool cellDark = (blockPos.x + blockPos.y + blockPos.z) % 2 == 0;

            float maxDist = 4000.0;
            float minDist = 600.0;
            float dist = distance(u_camPos, v_modelPos);
            float t = clamp((dist - minDist) / (maxDist - minDist), 0.0, 1.0);

            vec3 baseColor = mix(u_baseColor.rgb, vec3(0.5, 0.5, 0.5), 0.5);
            if (cellDark) {
                baseColor *= mix(0.9, 1.0, t);
            }

            if (u_accessTexScale > 0.0 && dist < maxDist) { // have access texture
                vec3 texBaseColor = mix(baseColor, vec3(0.5, 0.5, 0.5), 0.8);

                vec3 d = fract(v_blockPos) - 0.5;
                float r2 = 0.3*0.3;
                bool insideX = d.y * d.y + d.z * d.z < r2;
                bool insideY = d.x * d.x + d.z * d.z < r2;
                bool insideZ = d.x * d.x + d.y * d.y < r2;
                bool insideAny = insideX || insideY || insideZ;

                if (insideAny) {
                    ivec2 accessPos = ivec2(u_accessMtx * vec4(blockPos, 1.0));
                    vec4 valVec = texelFetch(u_accessSampler, accessPos, 0) * u_accessTexScale;
                    float val = u_accessTexChannel == 0.0 ? valVec.r : u_accessTexChannel == 1.0 ? valVec.g : valVec.b;

                    float weight = clamp(abs(val), 0.0, 1.0);

                    vec3 negColor = vec3(0.0, 0.0, 0.0);
                    vec3 posColor = u_baseColor.rgb; // vec3(0.0, 1.0, 0.0);
                    vec3 zeroColor = vec3(0.5, 0.5, 0.5);
                    texBaseColor = mix(mix(zeroColor, negColor, weight), mix(zeroColor, posColor, weight), step(0.0, val));
                }

                baseColor = mix(texBaseColor, baseColor, t);
            }

            if (true) {
                vec3 block16 = v_blockPos / 16.0;
                vec3 pxPerBlock16 = 1.0 / fwidth(block16);
                float strength16 = min(min(pxPerBlock16.x, pxPerBlock16.y), pxPerBlock16.z);
                vec3 colorEdge = vec3(1.0, 1.0, 1.0);
                vec3 color16 = vec3(1.0, 1.0, 1.0) * 0.7;
                vec3 color256 = vec3(1.0, 1.0, 1.0);

                // if we're zoomed out enough, show 256 & (256 * 16) grid lines
                // the 16 grid lines are faded out by this point (fade out between 10px -> 1px)
                if (strength16 < 2.0) {
                    block16 = block16 / 16.0;
                    pxPerBlock16 = 1.0 / fwidth(block16);
                    strength16 = min(min(pxPerBlock16.x, pxPerBlock16.y), pxPerBlock16.z);
                    color16 = color256;
                    // orange
                    color256 = vec3(1.0, 0.7, 0.4);
                }

                float visibility16 = smoothstep(2.0, 10.0, strength16); // below 10px between lines, fade out
                vec3 block16Grid = 1.0 - abs(fract(block16 - 0.5) - 0.5) * pxPerBlock16;
                float line16 = max(max(block16Grid.x, block16Grid.y), block16Grid.z) * visibility16;

                vec3 block256 = block16 / 16.0;
                vec3 block256Grid = 1.0 - abs(fract(block256 - 0.5) - 0.5) / fwidth(block256);
                float line256 = max(max(block256Grid.x, block256Grid.y), block256Grid.z);

                vec3 cube = v_cubePos - v_normal * 0.1;
                vec3 cubeGrid = 1.0 - abs(fract(cube - 0.5) - 0.5) / fwidth(cube);
                float lineCube = max(max(cubeGrid.x, cubeGrid.y), cubeGrid.z);

                float bestPxPerBlock = min(min(pxPerBlock16.x, pxPerBlock16.y), pxPerBlock16.z);
                float edgeWeight = smoothstep(0.0, 1.0, max(max(line16, lineCube), line256));
                vec3 color = lineCube > 0.0 ? colorEdge : (line256 > 0.0 ? color256 : color16);
                baseColor = mix(baseColor, color, edgeWeight);
            }

            vec3 color = mix(baseColor * 0.7, u_baseColor.rgb, u_highlight);

            o_color = vec4(color, 1) * u_baseColor.a;
        }`}t.bindTexture(t.TEXTURE_2D,m),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST);let p=(0,u.createShaderProgram)(e,"block",f(!1),h(!1),["u_camPos","u_accessSampler"],{uboBindings:{ModelViewUbo:Y.UboBindings.ModelView,BlockUbo:Y.UboBindings.Block,BlockAccessUbo:Y.UboBindings.BlockAccess}}),g=(0,u.createShaderProgram)(e,"block-instanced",f(!0),h(!0),["u_camPos","u_accessSampler"],{uboBindings:{ModelViewUbo:Y.UboBindings.ModelView,BlockAccessUbo:Y.UboBindings.BlockAccess}});return{gl:t,cubeGeom:i,shader:p,simpleShader:(0,u.createShaderProgram)(e,"block-simple",`#version 300 es
        precision highp float;
        ${Y.modelViewUboText}
        uniform vec3 u_size;
        uniform vec3 u_offset;

        layout(location = 0) in vec3 a_position;
        void main() {
            vec3 model_pos = a_position * u_size + u_offset;
            gl_Position = u_view * u_model * vec4(model_pos, 1);
        }
    `,`#version 300 es
        precision highp float;
        out vec4 o_color;
        uniform vec4 u_baseColor;

        void main() {
            o_color = u_baseColor;
        }
    `,["u_size","u_offset","u_baseColor"],{uboBindings:{ModelViewUbo:Y.UboBindings.ModelView}}),blockUbo:a,blockAccessUbo:n,dummyTexture:m,instancedShader:g,instancedVao:l,instancedFloatBuf:d,instancedDataStale:!0,instancedNumBlocks:0}}var K=e.i(91760),J=e.i(74120),Z=e.i(18190),ee=e.i(95147),et=e.i(46419);async function eo(){let e=await fetch("native.wasm"),t="",o=new WebAssembly.Memory({initial:1,maximum:256}),r={env:{memory:o},odin_env:{write:(e,o,a)=>{let n=new Uint8Array(r.env.memory.buffer,o,a),i=new TextDecoder().decode(n).split("\n");for(let e=0;e<i.length-1;e++)console.log(t+i[e]),t="";t+=i[i.length-1]},time_now:()=>BigInt(Date.now()),tick_now:()=>performance.now(),time_sleep:e=>{},trap:()=>{throw Error("odin trap")},rand_bytes:(e,t)=>{let o=new Uint8Array(r.env.memory.buffer,e,t);crypto.getRandomValues(o)}},odin_dom:{init_event_raw:e=>{console.log("ODIN: init_event_raw",e)}}},a=await WebAssembly.instantiateStreaming(e,r),n=a.instance.exports;return n.init_allocator(n.__heap_base),new er(a,n,o)}class er{module;exports;memory;viewBuf;int32View;ptrView;constructor(e,t,o){this.module=e,this.exports=t,this.memory=o,this.viewBuf=o.buffer,this.int32View=new Int32Array(o.buffer),this.ptrView=new Uint32Array(o.buffer)}createModel(e){return this.exports.wasm_create_model(e.B??1,e.block_size,e.n_embd,e.n_layer,e.n_head,e.vocab_size)}runModel(e){this.exports.wasm_run_model(e)}getModelTensor(e,t,o=0){let r=this.exports.wasm_get_model_tensor(e,t,o);this.checkViews();let a=this.int32View[r/4],n=this.int32View[r/4+1],i=this.ptrView[r/4+2],l=this.ptrView[r/4+3],s=this.ptrView[r/4+4],c=new Int32Array(this.memory.buffer,l,n),u=new Int32Array(this.memory.buffer,s,n);return new y([...c],new Float32Array(this.memory.buffer,i,a),[...u])}checkViews(){this.viewBuf!==this.memory.buffer&&(this.viewBuf=this.memory.buffer,this.int32View=new Int32Array(this.memory.buffer),this.ptrView=new Uint32Array(this.memory.buffer))}}var ea=((t={})[t.Wte=0]="Wte",t[t.Wpe=1]="Wpe",t[t.LmHeadW=2]="LmHeadW",t[t.AttnQkvW=3]="AttnQkvW",t[t.AttnQkvB=4]="AttnQkvB",t[t.AttnProjW=5]="AttnProjW",t[t.AttnProjB=6]="AttnProjB",t[t.MlpW=7]="MlpW",t[t.MlpB=8]="MlpB",t[t.MlpProjW=9]="MlpProjW",t[t.MlpProjB=10]="MlpProjB",t[t.Ln1Gamma=11]="Ln1Gamma",t[t.Ln1Beta=12]="Ln1Beta",t[t.Ln2Gamma=13]="Ln2Gamma",t[t.Ln2Beta=14]="Ln2Beta",t[t.LnFGamma=15]="LnFGamma",t[t.LnFBeta=16]="LnFBeta",t[t.InputTokens=17]="InputTokens",t[t.InputTokenEmbed=18]="InputTokenEmbed",t[t.InputEmbed=19]="InputEmbed",t[t.Ln1Agg=20]="Ln1Agg",t[t.Ln1Norm=21]="Ln1Norm",t[t.AttnQkv=22]="AttnQkv",t[t.Attn=23]="Attn",t[t.AttnSmAgg=24]="AttnSmAgg",t[t.AttnSm=25]="AttnSm",t[t.AttnVOut=26]="AttnVOut",t[t.AttnProj=27]="AttnProj",t[t.AttnResidual=28]="AttnResidual",t[t.Ln2Agg=29]="Ln2Agg",t[t.Ln2Norm=30]="Ln2Norm",t[t.MlpMlp=31]="MlpMlp",t[t.MlpAct=32]="MlpAct",t[t.MlpProj=33]="MlpProj",t[t.MlpResidual=34]="MlpResidual",t[t.LnFAgg=35]="LnFAgg",t[t.LnFNorm=36]="LnFNorm",t[t.Logits=37]="Logits",t[t.LogitsSmAgg=38]="LogitsSmAgg",t[t.LogitsSm=39]="LogitsSm",t);function en(e){let{gl:t,shape:{B:o,T:r,C:a}}=e;return{output:l(t,a,o*r,1)}}function ei(e,t,o){let{gl:r,shape:{B:a,T:n,C:i}}=e;return{weight:l(r,i,o,1),output:l(r,i,a*n,1)}}function el(e,t,o,r){let{gl:a,shape:{B:n,T:i}}=e;return{weight:l(a,o,r,1),bias:l(a,1,r,1),output:l(a,r,n*i,1)}}function es(e){let{gl:t,shape:{B:o,T:r,C:a}}=e;return{normWeight:l(t,1,a,1),normBias:l(t,1,a,1),normAgg:l(t,1,o*r,2),output:l(t,a,o*r,1)}}function ec(e,t){let o=e.weightsDirty||e.intersDirty;e.lastMemoryBuffer!==e.native.memory.buffer&&(e.lastMemoryBuffer=e.native.memory.buffer,o=!0),o&&(function(e,t,o=!1,r=!1){c(ea.Wte,0,t.vocabEmbed.weight,!0),c(ea.Wpe,0,t.posEmbed.weight,!0),c(ea.InputTokens,0,t.inputTokens),c(ea.InputEmbed,0,t.add.output);for(let e=0;e<t.blocks.length;e++){let o=t.blocks[e];c(ea.Ln1Gamma,e,o.ln_1.normWeight,!0),c(ea.Ln1Beta,e,o.ln_1.normBias,!0),c(ea.Ln1Agg,e,o.ln_1.normAgg),c(ea.Ln1Norm,e,o.ln_1.output),c(ea.AttnQkvW,e,o.attn.qkvWeight,!0),c(ea.AttnQkvB,e,o.attn.qkvBias,!0),c(ea.AttnQkv,e,o.attn.qkvOutput),c(ea.Attn,e,o.attn.attnMatrix),c(ea.AttnSmAgg,e,o.attn.attnMatrixAgg),c(ea.AttnSm,e,o.attn.attnMatrixSoftmax),c(ea.AttnVOut,e,o.attn.scaledVectors),c(ea.AttnProjW,e,o.attn.proj.weight,!0),c(ea.AttnProjB,e,o.attn.proj.bias,!0),c(ea.AttnProj,e,o.attn.proj.output),c(ea.AttnResidual,e,o.attn.output),c(ea.Ln2Gamma,e,o.ln_2.normWeight,!0),c(ea.Ln2Beta,e,o.ln_2.normBias,!0),c(ea.Ln2Agg,e,o.ln_2.normAgg),c(ea.Ln2Norm,e,o.ln_2.output),c(ea.MlpW,e,o.mlp.fcLayer.weight,!0),c(ea.MlpB,e,o.mlp.fcLayer.bias,!0),c(ea.MlpProjW,e,o.mlp.projLayer.weight,!0),c(ea.MlpProjB,e,o.mlp.projLayer.bias,!0),c(ea.MlpMlp,e,o.mlp.fcLayer.output),c(ea.MlpAct,e,o.mlp.mlpGelu),c(ea.MlpProj,e,o.mlp.projLayer.output),c(ea.MlpResidual,e,o.mlp.addLayer.output)}c(ea.LnFGamma,0,t.ln_f.normWeight,!0),c(ea.LnFBeta,0,t.ln_f.normBias,!0),c(ea.LnFAgg,0,t.ln_f.normAgg),c(ea.LnFNorm,0,t.ln_f.output),c(ea.LmHeadW,0,t.lm_head.weight,!0),c(ea.Logits,0,t.lm_head.output),c(ea.LogitsSmAgg,0,t.softmaxFinal.agg),c(ea.LogitsSm,0,t.softmaxFinal.output);let{T:a,vocabSize:n}=t.shape,i=t.softmaxFinal.output.localBuffer,l=new Float32Array(2*i.length);for(let e=0;e<a;e++){let t=[...i.slice(e*n,(e+1)*n)].map((e,t)=>({v:e,i:t}));t.sort((e,t)=>t.v-e.v);for(let o=0;o<t.length;o++)l[(e*n+o)*2+0]=t[o].i,l[(e*n+o)*2+1]=t[o].v}function c(a,n,i,l){let c=e.native.getModelTensor(e.modelPtr,a,n);var u=`${ea[a]}${n}`,d=c,m=i;let f=m.height*m.width*m.channels;if(d.buffer.length!==f)throw Error(`readToBufferTex: buffer size mismatch for ${u}. bufferTex: ${f} [h: ${m.height}, w: ${m.width}, c: ${m.channels}], wasmBuffer:  ${d.buffer.length} [${d.shape.join(", ")}]`);m.localBuffer=d.buffer,(l?r:o)&&s(t.gl,i,i.localBuffer)}t.sortedBuf=l}(e,t,e.intersDirty,e.weightsDirty),e.weightsDirty=!1,e.intersDirty=!1)}var eu=e.i(14632),ed=e.i(1477);let em=({children:e})=>{let[t,o]=(0,a.useState)(null),n=(0,_.useProgramState)(),i=(0,a.useCallback)(e=>{e(n),n.markDirty()},[n]);function l(e,t,o){let r=e.camAngle,a=e.camTarget.clone();a.z=a.z+.1*o*r.z;let n=Math.sin(r.x*Math.PI/180)>0?1:-1;a.x=a.x+n*t*.1*r.z,i(e=>{e.camera.center=a})}function s(e,t,o){let r=e.camAngle.clone();r.x=r.x-.5*t,r.y=(0,b.clamp)(r.y+.5*o,-87,87),i(e=>{e.camera.angle=r})}let[c,u]=(0,ed.useGlobalDrag)(function(e,t){let o=e.clientX-t.clientX,r=e.clientY-t.clientY;t.shiftKey||1===t.button||2===t.button?s(t.data,o,r):l(t.data,o,r),e.preventDefault()});return((0,ed.useTouchEvents)(t,{camAngle:n.camera.angle,camTarget:n.camera.center},{alwaysSendDragEvent:!0},function(e,t){let o=t.touches[0],r=e.touches[0],a=r.clientX-o.clientX,n=r.clientY-o.clientY;l(t.data,a,n),e.preventDefault()},function(e,t){var o;let r,a=t.touches[0],n=t.touches[1],l=e.touches[0],c=e.touches[1],u=(a.clientX+n.clientX)/2,d=(a.clientY+n.clientY)/2,m=(l.clientX+c.clientX)/2,f=(l.clientY+c.clientY)/2,h=Math.sqrt((a.clientX-n.clientX)**2+(a.clientY-n.clientY)**2),p=Math.sqrt((l.clientX-c.clientX)**2+(l.clientY-c.clientY)**2);s(t.data,m-u,f-d),o=t.data,(r=o.camAngle.clone()).z=(0,b.clamp)(r.z/(p/h),.1,1e5),i(e=>{e.camera.angle=r}),e.preventDefault()}),n.render)?(0,r.jsx)("div",{ref:o,className:g.default.canvasEventSurface,onMouseDown:function(e){n&&u(e,{camAngle:n.camera.angle,camTarget:n.camera.center})},onMouseMove:function(e){if(n){let t=n.render.canvasEl.getBoundingClientRect(),o=new E.Vec3(e.clientX-t.left,e.clientY-t.top,0);i(e=>{e.mouse.mousePos=o})}},onWheel:function(e){if(n){let t=n.camera.angle,o=(0,b.clamp)(t.z*Math.pow(1.0013,e.deltaY),.01,1e5);i(e=>{e.camera.angle=new E.Vec3(t.x,t.y,o)})}e.stopPropagation()},onContextMenu:e=>e.preventDefault(),style:{cursor:c?"grabbing":n.display.hoverTarget?"crosshair":"grab"},children:e}):null};var ef=e.i(68757),eh=e.i(49721),ep=e.i(7670);e.i(163);var eg=((o={})[o.Up=0]="Up",o[o.Down=1]="Down",o[o.Left=2]="Left",o[o.Right=3]="Right",o[o.Focus=4]="Focus",o[o.In=5]="In",o[o.Out=6]="Out",o[o.Expand=7]="Expand",o),ex=e.i(31337),ev=e.i(90904),eb=e.i(81632),ey=e.i(78278);let e_=()=>{let e=(0,_.useProgramState)();function t(t){let o=e.examples[t]??e.mainExample,a=o.enabled,n=e.currExampleId===t;return(0,r.jsx)("div",{className:(0,ep.default)("m-2 px-2 py-1 rounded shadow cursor-pointer hover:bg-blue-300",n?"bg-blue-200":"bg-white"),onClick:function(){a||(o.enabled=!0),e.currExampleId=t,e.camera.desiredCamera=o.camera,e.markDirty()},children:o.name})}return(0,r.jsxs)("div",{className:"absolute top-0 left-0 flex flex-col",children:[(0,r.jsxs)("div",{className:"mt-2 ml-2 flex flex-row",children:[t(0),t(-1),t(1),t(2)]}),(0,r.jsxs)("div",{className:"ml-2 flex flex-row",children:[(0,r.jsx)("div",{className:(0,ep.default)("m-2 p-2 bg-white min-w-[2rem] flex justify-center rounded shadow cursor-pointer hover:bg-blue-300"),onClick:function(){let t=e.examples[e.currExampleId]??e.mainExample;e.camera.desiredCamera=t.camera,e.markDirty()},children:(0,r.jsx)(eh.FontAwesomeIcon,{icon:ef.faExpand})}),(0,r.jsx)("div",{className:(0,ep.default)("m-2 p-2 bg-white min-w-[2rem] flex justify-center rounded shadow cursor-pointer hover:bg-blue-300"),onClick:function(){let t=e.examples[e.currExampleId]??e.mainExample,o=(t.layout??e.layout).residual0,r=new E.Vec3(o.x,o.y,o.z),a=e.camera.modelMtx.mul(k.Mat4f.fromTranslation(t.offset)).mulVec3Proj(r),n=-1===e.currExampleId?.7:4;e.camera.desiredCamera={center:a,angle:new E.Vec3(270,4.5,n)},e.markDirty()},children:(0,r.jsx)(eh.FontAwesomeIcon,{icon:ef.faMagnifyingGlass})})]})]})};async function ew(e){let t=await fetch(e),o=await t.json();for(let e in o)o[e].shape&&(o[e]=y.fromJson(o[e]));return o}class eB{canvasData;renderState;progState;modelState;random;stopped;canvasSizeDirty;constructor(e,t,o){this.canvasData=t,this.modelState=null,this.stopped=!1,this.canvasSizeDirty=!0,this.prevTime=performance.now(),this.rafHandle=0,this.isDirty=!1,this.isWaitingForSync=!1,this.markDirty=()=>{this.canvasData&&!this.stopped&&(this.isDirty=!0,this.rafHandle||(this.prevTime=performance.now(),this.rafHandle=requestAnimationFrame(this.loop)))},this.loop=e=>{if(!(this.isDirty||this.isWaitingForSync)||this.stopped){this.rafHandle=0;return}let t=this.isDirty;this.isDirty=!1,this.isWaitingForSync=!1;let o=e-this.prevTime;this.prevTime=e,o<8&&(o=16),this.checkSyncObjects();let r=this.progState.render?.syncObjects.length??0;(t||this.isDirty)&&this.render(e,o),(this.progState.render?.syncObjects.length??0)!==r&&(this.isWaitingForSync=!0),this.rafHandle=requestAnimationFrame(this.loop)},this.progState=function(e,t){let o=function(e,t){let o=e.getContext("webgl2",{antialias:!0});if(!o)return null;let r={colorBufferFloat:o.getExtension("EXT_color_buffer_float"),disjointTimerQuery:o.getExtension("EXT_disjoint_timer_query_webgl2")};r.colorBufferFloat||console.log("initRender: EXT_color_buffer_float not supported: floating point textures will not work."),r.disjointTimerQuery||console.log("initRender: EXT_disjoint_timer_query_webgl2 not supported: GPU timing will not work.");let a=(0,u.createShaderManager)(o),n={gl:o,shaderManager:a,ext:r},i=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,i),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,1]),o.STATIC_DRAW);let l=o.createVertexArray();o.bindVertexArray(l),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0);let s=(0,Y.initSharedRender)(n),c=(0,x.setupFontAtlas)(n,t),d=(0,x.createFontBuffers)(c,s),m=(0,K.initThreadRender)(n),f=(0,B.createLineRender)(n,s),h=Q(n),p=(0,T.initTriRender)(n,s),g=function(e,t){let o=e.gl,r=Math.max(o.canvas.width,1),a=Math.max(o.canvas.height,1),n=o.createFramebuffer(),i=o.createTexture();function l(){let e=o.createFramebuffer(),t=o.createTexture();o.bindFramebuffer(o.FRAMEBUFFER,e),o.bindTexture(o.TEXTURE_2D,t),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,r,a,0,o.RGBA,o.UNSIGNED_BYTE,null),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.framebufferTexture2D(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,t,0);{let e=o.checkFramebufferStatus(o.FRAMEBUFFER);e!==o.FRAMEBUFFER_COMPLETE&&console.log(`Blur framebuffer not complete: ${e.toString(16)}`)}return{fbo:e,tex:t}}o.bindFramebuffer(o.FRAMEBUFFER,n),o.bindTexture(o.TEXTURE_2D,i),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,r,a,0,o.RGBA,o.UNSIGNED_BYTE,null),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.framebufferTexture2D(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,i,0);let s=[l(),l()],c=new Float32Array(36),d=0;for(let e=-4;e<=4;e++){let t=e/2,o=Math.exp(-t*t*.5);c[4*(e+4)]=o,d+=o}for(let e=0;e<9;e++)c[4*e]/=d;let m=o.createBuffer();function f(t,o){return(0,u.createShaderProgram)(e.shaderManager,t,`#version 300 es
            precision highp float;
            layout(location = 0) in vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0, 1);
            }
        `,`#version 300 es
            precision highp float;

            layout(std140) uniform BlurWeights {
                float weights[9];
            };

            uniform sampler2D u_texture;
            out vec4 o_color;

            void main() {
                ivec2 pos = ivec2(gl_FragCoord.xy);
                vec4 color = vec4(0);
                vec4 center = texelFetch(u_texture, pos, 0);
                for (int i = -4; i <= 4; i++) {
                    int wId = i + 4;
                    color += texelFetch(u_texture, pos + ivec2(${o===E.Dim.X?"i, 0":"0, i"}) * 2, 0) * weights[wId];
                }
                o_color = max(color, center);
            }
        `,["u_texture"],{uboBindings:{BlurWeights:Y.UboBindings.blur}})}o.bindBuffer(o.UNIFORM_BUFFER,m),o.bufferData(o.UNIFORM_BUFFER,c.buffer,o.STATIC_DRAW),o.bindBufferBase(o.UNIFORM_BUFFER,Y.UboBindings.blur,m);let h=f("blurHoriz",E.Dim.X);return{gl:o,quadVao:t,initialFbo:n,initialTex:i,blurFbos:s,horizShader:h,vertShader:f("blurVert",E.Dim.Y),overlayShader:(0,u.createShaderProgram)(e.shaderManager,"blurOverlay",`#version 300 es
            precision highp float;
            layout(location = 0) in vec2 a_position;
            out vec2 v_uv;
            void main() {
                gl_Position = vec4(a_position, 0, 1);
                v_uv = a_position * 0.5 + 0.5;
            }
        `,`#version 300 es
            precision highp float;
            uniform sampler2D u_texture;
            uniform sampler2D u_initTexture;
            in vec2 v_uv;
            out vec4 o_color;

            void main() {
                ivec2 pos = ivec2(gl_FragCoord.xy);
                vec4 blurColor = texture(u_texture, v_uv);
                // vec4 initColor = texture(u_initTexture, v_uv);

                vec4 base = vec4(0.9, 0.9, 0.9, 0.1);
                // if (blurColor.a == 0.0) {
                //     blurColor = vec4(0.1, 0.1, 0.1, 1.0);
                // }
                o_color = blurColor; // + initColor * (1.0 - blurColor.a);
                // o_color = initColor;
            }
        `,["u_texture"]),currViewSize:new E.Vec3(0,0),blurFactor:.3}}(n,l),v={ctx:n,queries:new Map,TIME_ELAPSED_EXT:n.ext.disjointTimerQuery?.TIME_ELAPSED_EXT};return(0,u.ensureShadersReady)(a),{canvasEl:e,gl:o,ctx:n,blockRender:h,threadRender:m,lineRender:f,blurRender:g,triRender:p,sharedRender:s,fontAtlas:c,modelFontBuf:d,quadVao:l,queryManager:v,syncObjects:[],size:new E.Vec3(1,1),lastGpuMs:0,lastJsMs:0,renderTiming:!1}}(e,t),r=(0,Z.initWalkthrough)(),a=J.SavedState.state,n={angle:a?.camera.angle??new E.Vec3(296,16,13.5),center:a?.camera.center??new E.Vec3(-8.4,0,-481.5),transition:{},modelMtx:new k.Mat4f,viewMtx:new k.Mat4f,lookAtMtx:new k.Mat4f,camPos:new E.Vec3,camPosModel:new E.Vec3},i={B:1,T:11,C:48,nHeads:3,A:16,nBlocks:3,vocabSize:3};function l(e,t){return{center:e,angle:t}}let s=new E.Vec3(1e4,0,0);return{native:null,wasmGptModel:null,render:o,inWalkthrough:!0,walkthrough:r,camera:n,shape:i,layout:(0,q.genGptModelLayout)(i),currExampleId:-1,mainExample:{name:"nano-gpt",enabled:!0,shape:i,offset:new E.Vec3,modelCardOffset:new E.Vec3,blockRender:null,camera:l(new E.Vec3(42.771,0,-569.287),new E.Vec3(284.959,26.501,12.867))},examples:[{name:"GPT-2 (small)",enabled:!0,shape:{B:1,T:1024,C:768,nHeads:12,A:64,nBlocks:12,vocabSize:50257},offset:s.mul(-5),modelCardOffset:s.mul(-2),blockRender:Q(o?.ctx??null),camera:l(new E.Vec3(-65141.321,0,-69843.439),new E.Vec3(224.459,24.501,1574.24))},{name:"GPT-2 (XL)",enabled:!0,shape:{B:1,T:1024,C:1600,nHeads:25,A:64,nBlocks:48,vocabSize:50257},offset:s.mul(20),modelCardOffset:s.mul(.5),blockRender:Q(o?.ctx??null),camera:l(new E.Vec3(237902.688,0,-47282.484),new E.Vec3(311.959,23.501,1382.449))},{name:"GPT-3",enabled:!1,shape:{B:1,T:1024,C:12288,nHeads:96,A:128,nBlocks:96,vocabSize:50257},offset:s.mul(50),modelCardOffset:s.mul(15),blockRender:Q(o?.ctx??null),camera:l(new E.Vec3(837678.163,0,-485242.286),new E.Vec3(238.959,10.501,12583.939))}],gptGpuModel:null,jsGptModel:null,stepModel:!1,markDirty:()=>{},htmlSubs:new eu.Subscriptions,mouse:{mousePos:new E.Vec3},movement:{action:null,actionHover:null,target:[0,0],depth:1,cameraLerp:null},display:{tokenColors:null,tokenIdxColors:null,tokenOutputColors:null,lines:[],hoverTarget:null,dimHover:null,blkIdxHover:null},pageLayout:{height:0,width:0,isDesktop:!0,isPhone:!0}}}(e,o),this.progState.markDirty=this.markDirty,this.progState.walkthrough.markDirty=this.markDirty,this.renderState=this.progState.render,this.random=new v.Random(4)}destroy(){this.stopped=!0}setData(e){if(this.canvasData=e,e.dataAndModel&&!this.progState.gptGpuModel&&this.progState.render){var t,o,r,a;let n,c,g,x,v,y,_,w,B,T;this.progState.gptGpuModel=(t=this.renderState,o=e.dataAndModel,function(e,t){let o=e.gl,r="transformer",a=t.config,n=a.n_embd,c=a.n_head,g=a.block_size,x=a.n_layer,v=a.vocab_size,b=n/c,y={B:1,C:n,nHeads:c,T:g,A:b,nBlocks:x,vocabSize:v},_={gl:o,model:t,shape:y,shaderManager:e},w=new Float32Array(+g),B=l(o,1,+g,1),T=new Float32Array(+g);for(let e=0;e<1;e++)for(let t=0;t<g;t++)T[e*g+t]=t;let E=l(o,1,+g,1);s(o,E,T);let A=h(_,r+".wte",v,n,B),k=h(_,r+".wpe",g,n,E),R=p(_,A.output,k.output),F=[],M=R.output;for(let e=0;e<x;e++){let t=function(e,t,o){let r=m(e,t+".ln_1",o),a=function(e,t,o,r){let{gl:a,model:n,shape:{B:c,T:m,C:h,nHeads:g,A:x},shaderManager:v}=e,b=n[t+".c_attn.weight"].view([3,g,x,h]).permute(1,2,3,0),y=n[t+".c_attn.bias"].view([3,g,x]).permute(1,2,0),_=l(a,h,g*x,3),w=l(a,1,g*x,3),B=l(a,x,c*g*m,4),T=l(a,m,c*g*m,1),E=l(a,1,c*g*m,2),A=l(a,m,c*g*m,1),k=l(a,g*x,c*m,1);s(a,_,b.toFloat32Array()),s(a,w,y.toFloat32Array());let R=(0,u.createShaderProgram)(v,"qkv",d,`#version 300 es
        precision highp float;
        uniform sampler2D attnInput; // (B, T)         (C)
        uniform sampler2D qkvWeight; // (nHeads, A)    (C) [3]
        uniform sampler2D qkvBias;   // (nHeads, A)    (1) [3]
        out vec4 qkvOutput;          // (B, nHeads, T) (A)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);

            int headIdx = pos.y / ${m};
            int tIdx = pos.y % ${m};
            int bIdx = headIdx / ${g};
            headIdx = headIdx % ${g};

            vec3 a = texelFetch(qkvBias, ivec2(0, headIdx * ${x} + pos.x), 0).rgb;
            for (int i = 0; i < ${h}; i++) {
                float inVal = texelFetch(attnInput, ivec2(i, tIdx + bIdx * ${m}    ), 0).r;
                vec3 qkvW   = texelFetch(qkvWeight,  ivec2(i, headIdx * ${x} + pos.x), 0).rgb;
                a += inVal * qkvW;
            }

            qkvOutput = vec4(a, 1);
        }
    `),F=(0,u.createShaderProgram)(v,"selfAttend",d,`#version 300 es
        precision highp float;
        uniform sampler2D qkvOutput; // (B, nHeads, T) (A)
        out float attnMatrix;        // (B, nHeads, T) (T)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            int tIdxK = pos.x;
            int tIdxQ = pos.y % ${m};
            int yOffset = pos.y - tIdxQ;

            if (tIdxK > tIdxQ) { // # forward attention only
                discard;
            }

            float a = 0.0;
            for (int i = 0; i < ${x}; i++) {
                float q = texelFetch(qkvOutput, ivec2(i, yOffset + tIdxQ), 0).r;
                float k = texelFetch(qkvOutput, ivec2(i, yOffset + tIdxK), 0).g;
                a += q * k;
            }

            attnMatrix = a / sqrt(float(${x}));
        }
    `),M=(0,u.createShaderProgram)(v,"attnMatrixAgg",d,`#version 300 es
        precision highp float;
        uniform sampler2D attnMatrix; // (B, nHeads, T) (T)
        out vec2 attnMatrixAgg;       // (B, nHeads, T) (1) [2]

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            int tIdxY = pos.y % ${m};

            // Pass 1 finds the max
            float m = 0.0;
            for (int i = 0; i <= tIdxY; i++) {
                float p = texelFetch(attnMatrix, ivec2(i, pos.y), 0).r;
                m = max(m, p);
            }

            // Pass 2 finds the exp sum (shifted by max)
            float a = 0.0;
            for (int i = 0; i <= tIdxY; i++) {
                float p = texelFetch(attnMatrix, ivec2(i, pos.y), 0).r;
                a += exp(p - m);
            }

            // Store sufficient information to compute/apply the softmax
            attnMatrixAgg = vec2(1.0 / a, m);
        }
    `),P=(0,u.createShaderProgram)(v,"attnMatrixSoftmax",d,`#version 300 es
        precision highp float;
        uniform sampler2D attnMatrix;    // (B, nHeads, T) (T)
        uniform sampler2D attnMatrixAgg; // (B, nHeads, T) (1) [2]
        out float attnMatrixSoftmax;     // (B, nHeads, T) (T)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            int tIdxX = pos.x;
            int tIdxY = pos.y % ${m};

            if (tIdxX > tIdxY) { // # forward attention only
                attnMatrixSoftmax = 0.0;
                discard;
            }

            vec2 agg = texelFetch(attnMatrixAgg, ivec2(0, pos.y), 0).rg;
            float expSumInv = agg.r;
            float maxVal = agg.g;

            float p = texelFetch(attnMatrix, pos, 0).r;
            attnMatrixSoftmax = exp(p - maxVal) * expSumInv;
        }
    `),S=(0,u.createShaderProgram)(v,"scaledVectors",d,`#version 300 es
        precision highp float;
        uniform sampler2D qkvOutput;         // (B, nHeads, T) (A)
        uniform sampler2D attnMatrixSoftmax; // (B, nHeads, T) (T)
        out float scaledVectors;             // (B, T)         (A * nHeads)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            int aIdx = pos.x % ${x};
            int headIdx = pos.x / ${x};

            int tIdxY = pos.y % ${m};
            int bIdx = pos.y / ${m};

            int yOffset = bIdx * ${m} * ${g} + headIdx * ${m};

            float res = 0.0;
            for (int i = 0; i <= tIdxY; i++) {
                float sm = texelFetch(attnMatrixSoftmax, ivec2(i, yOffset + tIdxY), 0).r;
                float v = texelFetch(qkvOutput, ivec2(aIdx, yOffset + i), 0).b;
                res += sm * v;
            }

            scaledVectors = res;
        }
    `);if(!R||!F||!M||!P||!S)throw Error("Failed to create shader program");let V=i(a,R,[B],[o,_,w],["attnInput","qkvWeight","qkvBias"]),D=i(a,F,[T],[B],["qkvOutput"]),z=i(a,M,[E],[T],["attnMatrix"]),I=i(a,P,[A],[T,E],["attnMatrix","attnMatrixAgg"]),C=i(a,S,[k],[B,A],["qkvOutput","attnMatrixSoftmax"]),L=f(e,t+".c_proj",h,h,k),U=p(e,L.output,r);return{qkvWeight:_,qkvBias:w,qkvOutput:B,attnMatrix:T,attnMatrixAgg:E,attnMatrixSoftmax:A,scaledVectors:k,qkvPhase:V,selfAttendPhase:D,attnMatrixAggPhase:z,attnMatrixSoftmaxPhase:I,scaledVectorsPhase:C,proj:L,add:U,output:U.output}}(e,t+".attn",r.output,o),n=m(e,t+".ln_2",a.output),c=function(e,t,o,r){let{gl:a,shape:{B:n,T:s,C:c},shaderManager:m}=e,h=l(a,4*c,n*s,1),g=(0,u.createShaderProgram)(m,"mlpGelu",d,`#version 300 es
        precision highp float;
        uniform sampler2D geluInput;  // (B, T) (C * 4)
        out float geluOutput; // (B, T) (C * 4)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            float x = texelFetch(geluInput, pos, 0).r;
            geluOutput = x * 0.5 * (1.0 + tanh(sqrt(2.0 / 3.14159265358) * (x + 0.044715 * x * x * x)));
        }
    `),x=f(e,t+".c_fc",c,4*c,o),v=i(a,g,[h],[x.output],["geluInput"]),b=f(e,t+".c_proj",4*c,c,h),y=p(e,b.output,r);return{fcLayer:x,mlpGelu:h,geluPhase:v,projLayer:b,addLayer:y,output:y.output}}(e,t+".mlp",n.output,a.output);return{attn:a,ln_1:r,ln_2:n,mlp:c,output:c.output}}(_,r+".h."+e,M);F.push(t),M=t.output}let P=m(_,r+".ln_f",M),S=f(_,"lm_head",n,v,P.output,void 0,!1),V=function(e,t){let{gl:o,shape:{B:r,T:a,C:n,vocabSize:s},shaderManager:c}=e,m=l(o,1,r*a,2),f=l(o,s,r*a,1),h=(0,u.createShaderProgram)(c,"softmaxAgg",d,`#version 300 es
        precision highp float;       //    y      x
        uniform sampler2D smInput;   // (B, T) (nVocab)
        out vec2 smAgg;              // (B)    (nVocab) [2]

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            int tIdxY = pos.y % ${a};

            // Pass 1 finds the max
            float m = 0.0;
            for (int i = 0; i < ${s}; i++) {
                float p = texelFetch(smInput, ivec2(i, pos.y), 0).r;
                m = max(m, p);
            }

            // Pass 2 finds the exp sum (shifted by max)
            float a = 0.0;
            for (int i = 0; i < ${s}; i++) {
                float p = texelFetch(smInput, ivec2(i, pos.y), 0).r;
                a += exp(p - m);
            }

            // Store sufficient information to compute/apply the softmax
            smAgg = vec2(1.0 / a, m);
        }
    `),p=(0,u.createShaderProgram)(c,"softmax",d,`#version 300 es
        precision highp float;
        uniform sampler2D smInput;    // (B, T) (nVocab)
        uniform sampler2D smAgg;      // (B)    (nVocab) [2]
        out float smOutput;           // (B, T) (nVocab)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            int tIdxX = pos.x;
            int tIdxY = pos.y % ${a};

            vec2 agg = texelFetch(smAgg, ivec2(0, pos.y), 0).rg;
            float expSumInv = agg.r;
            float maxVal = agg.g;

            float p = texelFetch(smInput, pos, 0).r;
            smOutput = exp(p - maxVal) * expSumInv;
        }
    `),g=i(o,h,[m],[t],["smInput"]),x=i(o,p,[f],[t,m],["smInput","smAgg"]);return{bufs:[m,f],progs:[h,p],phases:[g,x],agg:m,aggPhase:g,softmaxPhase:x,output:f}}(_,S.output),D=function(e,t,o){let{gl:r,shape:{T:a,vocabSize:n},shaderManager:l}=e;return{copyPhase:i(r,(0,u.createShaderProgram)(l,"copy",d,`#version 300 es
        precision highp float;         //    y    x
        uniform sampler2D prevOutput;  // (B, T) (n_vocab)
        uniform int u_targetTIdx;
        out float currInput;           // (B, T) (1)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);

            int tIdx = pos.y % ${a};

            if (tIdx != u_targetTIdx) {
                discard;
            }

            int maxVocabI = 0;
            float maxVocabP = 0.0;
            for (int i = 0; i < ${n}; i++) {
                float p = texelFetch(prevOutput, ivec2(i, pos.y), 0).r;
                if (p > maxVocabP) {
                    maxVocabP = p;
                    maxVocabI = i;
                }
            }

            currInput = float(maxVocabI);
        }
    `),[o],[t],["prevOutput"])}}(_,V.output,B);return(0,u.ensureShadersReady)(e),{gl:o,inputBuf:w,inputTokens:B,vocabEmbed:A,posEmbed:k,add:R,blocks:F,ln_f:P,lm_head:S,shape:y,softmaxFinal:V,copyOutputToInput:D,output:V.output,inputLen:6,resultBuf:null,sortedBuf:null,readbackSync:null}}(t.ctx.shaderManager,o.model)),this.progState.native=e.dataAndModel.native,this.progState.wasmGptModel=function(e,t,o){let r=o.createModel(t);n("transformer.wte.weight",ea.Wte),n("transformer.wpe.weight",ea.Wpe),n("lm_head.weight",ea.LmHeadW),a("transformer.ln_f",ea.LnFGamma,ea.LnFBeta);for(let e=0;e<t.n_layer;e++){let t=`transformer.h.${e}`;a(t+".ln_1",ea.Ln1Gamma,ea.Ln1Beta,e),a(t+".ln_2",ea.Ln2Gamma,ea.Ln2Beta,e),a(t+".attn.c_attn",ea.AttnQkvW,ea.AttnQkvB,e),a(t+".attn.c_proj",ea.AttnProjW,ea.AttnProjB,e),a(t+".mlp.c_fc",ea.MlpW,ea.MlpB,e),a(t+".mlp.c_proj",ea.MlpProjW,ea.MlpProjB,e)}function a(e,t,o,r=0){n(e+".weight",t,r),n(e+".bias",o,r)}function n(t,a,i=0){e[t]?o.getModelTensor(r,a,i).copyFrom(e[t]):console.log("ERROR: missing tensor name:",t)}o.getModelTensor(r,ea.InputTokens).buffer.set([2,1,0,1,1,2,0,0,0,0,0]);{let e=performance.now();o.runModel(r),console.log("runModel",(performance.now()-e).toFixed(2)+"ms")}return{native:o,modelPtr:r,lastMemoryBuffer:null,weightsDirty:!0,intersDirty:!0}}(e.dataAndModel.model,e.dataAndModel.model.config,e.dataAndModel.native),this.progState.jsGptModel=(r=this.renderState.gl,n=(a=e.dataAndModel.model.config).n_embd,c=a.n_head,g=a.block_size,x=a.n_layer,v=a.vocab_size,y=n/c,w={gl:r,shape:_={B:1,C:n,nHeads:c,T:g,A:y,nBlocks:x,vocabSize:v}},B=l(r,1,+g,1),T=function(e){let{gl:t,shape:{B:o,T:r,vocabSize:a}}=e;return{agg:l(t,1,o*r,2),output:l(t,a,o*r,1)}}(w),{gl:r,add:en(w),inputBuf:new Float32Array,inputLen:6,ln_f:es(w),inputTokens:B,lm_head:el(w,g,n,v),blocks:(0,b.makeArray)(x).map(()=>{var e;let t;return t=function(e){let{gl:t,shape:{B:o,T:r,C:a}}=e,n=en(e);return{fcLayer:el(e,r,a,4*a),mlpGelu:l(t,4*a,o*r,1),projLayer:el(e,r,4*a,a),addLayer:n,output:n.output}}(e=w),{ln_1:es(e),attn:function(e){var t,o;let{gl:r,shape:{B:a,T:n,C:i,nHeads:s,A:c}}=e,u=en(e);return{qkvWeight:l(r,i,3*s*c,1),qkvBias:l(r,1,3*s*c,1),attnMatrix:(t=a*s*n,l(r,n,t,1)),attnMatrixAgg:l(r,1,a*s*n,2),attnMatrixSoftmax:(o=a*s*n,l(r,n,o,1)),qkvOutput:l(r,3*s*c,a*n,1),add:en(e),proj:el(e,n,i,i),scaledVectors:l(r,s*c,a*n,1),output:u.output}}(e),ln_2:es(e),mlp:t,output:t.output}}),output:T.output,posEmbed:ei(w,B,g),vocabEmbed:ei(w,B,v),shape:_,softmaxFinal:T,resultBuf:null,sortedBuf:null})}this.markDirty()}prevTime;rafHandle;isDirty;isWaitingForSync;markDirty;loop;checkSyncObjects(){if(!this.progState.render)return;let e=this.renderState.gl,t=this.progState.render.syncObjects,o=!1;for(let r=0;r<t.length;r++){let a=t[r];if(a.isReady){o=!0;continue}e.clientWaitSync(a.sync,0,0)===e.TIMEOUT_EXPIRED?this.isWaitingForSync=!0:(a.isReady=!0,a.elapsedMs=performance.now()-a.startTime,e.deleteSync(a.sync),o=!0)}o&&(this.progState.render.syncObjects=t.filter(e=>!e.isReady),this.markDirty())}render(e,t){if(!this.progState.render)return;let o=this.renderState.canvasEl;if(this.canvasSizeDirty){let e=o.getBoundingClientRect(),t=window.devicePixelRatio;o.width=e.width*t,o.height=e.height*t,this.progState.render.size=new E.Vec3(e.width,e.height),this.canvasSizeDirty=!1}!function(e,t){var o;let r=performance.now();if(!t.render)return;for(let e of(o=t.render,(0,B.resetLineRender)(o.lineRender),(0,x.resetFontBuffers)(o.modelFontBuf),(0,T.resetTriRender)(o.triRender),t.render.sharedRender.activePhase=Y.RenderPhase.Opaque,t.display.lines=[],t.display.hoverTarget=null,t.display.tokenColors=null,t.display.tokenIdxColors=null,t.wasmGptModel&&t.jsGptModel&&ec(t.wasmGptModel,t.jsGptModel),t.stepModel&&t.wasmGptModel&&t.jsGptModel&&(t.stepModel=!1,!function(e,t){let{native:o,modelPtr:r}=e,{shape:{B:a,T:n,vocabSize:i}}=t,l=t.inputLen-1;if(!t.sortedBuf||l>=n-1)return;let s=o.getModelTensor(r,ea.InputTokens);for(let e=0;e<a;e++){let o=t.sortedBuf[e*n*i*2+l*i*2+0];s.buffer[e*n+l+1]=o}t.inputLen+=1,o.runModel(r),e.intersDirty=!0,ec(e,t)}(t.wasmGptModel,t.jsGptModel)),t.layout=(0,q.genGptModelLayout)(t.shape,t.jsGptModel),t.examples))if(e.enabled&&!e.layout){let t=(0,q.genGptModelLayout)(e.shape,null,e.offset);e.layout=t}(0,w.genModelViewMatrices)(t,t.layout);let a=function(e,t){if(!e.ctx.ext.disjointTimerQuery)return null;let o=e.queries.get(t);if(!o){let r=e.ctx.gl.createQuery();e.queries.set(t,o={query:r,hasRun:!1,hasStarted:!1})}let r=!1;o.hasRun&&(r=e.ctx.gl.getQueryParameter(o.query,e.ctx.gl.QUERY_RESULT_AVAILABLE));let a=null;return r&&(a=e.ctx.gl.getQueryParameter(o.query,e.ctx.gl.QUERY_RESULT)/1e6),(!o.hasRun||r)&&(e.ctx.gl.beginQuery(e.TIME_ELAPSED_EXT,o.query),o.hasRun=!0,o.hasStarted=!0),a}(t.render.queryManager,"render");for(let o of((0,b.isNotNil)(a)&&(t.render.lastGpuMs=a),t.render.renderTiming=!1,t.inWalkthrough&&(0,Z.runWalkthrough)(t,e),(0,w.updateCamera)(t,e),!function(e){for(let t of e.layout.cubes){let o=new E.Vec3(t.x+t.dx/2,t.y,t.z+t.dz/2),r=(0,w.camScaleToScreen)(e,o);r=Math.min(r,1.45);let a=new E.Vec4(1,1,1,1).mul(t.opacity),n=new E.Vec4(0,0,0,1).mul(t.opacity);if(0===t.opacity||!t.name)continue;let i=t.name,l=k.Mat4f.fromTranslation(o),s={color:a,size:2.5*r,mtx:l},c=(0,x.measureText)(e.render.modelFontBuf,i,s);e.render.sharedRender.activePhase=Y.RenderPhase.Opaque,(0,et.drawRoundedRect)(e.render,new E.Vec3(-c/2-.4,-s.size-.8,0),new E.Vec3(c/2+.4,0,0),n,l,.4*r),e.render.sharedRender.activePhase=Y.RenderPhase.Overlay,(0,x.drawText)(e.render.modelFontBuf,i,-c/2,-s.size-.4,s)}}(t),!function(e,t){let o=t.residual0,r=E.Vec4.fromHexColor("#3333aa"),a=E.Vec4.fromHexColor("#33aa33");i(t.idxObj,t.residual0),l(t.tokEmbedObj,t.residual0),d(t.posEmbedObj,0,t.residual0,1);for(let e=0;e<3;e++){let r=t.blocks[e];for(let e of(i(o,r.attnResidual),c(o,r.ln1.lnResid),c(o,r.ln1.lnAgg2,2),i(r.ln1.lnAgg2,r.ln1.lnResid,2),r.heads))d(r.ln1.lnResid,0,e.qBlock,1),d(r.ln1.lnResid,0,e.kBlock,1),d(r.ln1.lnResid,0,e.vBlock,1),l(e.qBiasBlock,e.qWeightBlock),l(e.kBiasBlock,e.kWeightBlock),l(e.vBiasBlock,e.vWeightBlock),l(e.qWeightBlock,e.qBlock),l(e.kWeightBlock,e.kBlock),l(e.vWeightBlock,e.vBlock),u(e.qBlock,e.attnMtx,0,void 0,e.qBlock.y!==e.kBlock.y),u(e.kBlock,e.attnMtx,0,void 0,e.kBlock.y!==e.qBlock.y),u(e.vBlock,e.vOutBlock,0,void 0,e.vBlock.y!==e.kBlock.y),d(e.attnMtx,0,e.attnMtxAgg2,1),d(e.attnMtxAgg1,0,e.attnMtxSm,1),d(e.attnMtxSm,3,e.vOutBlock,0),d(e.vOutBlock,3,r.attnOut,2);i(r.attnResidual,r.mlpResidual),l(r.attnOut,r.attnResidual),l(r.projBias,r.projWeight),l(r.projWeight,r.attnOut),l(r.ln1.lnMu,r.ln1.lnSigma),l(r.ln1.lnSigma,r.ln1.lnResid),c(r.attnResidual,r.ln2.lnAgg2,2),i(r.ln2.lnAgg2,r.ln2.lnResid,2),l(r.ln2.lnMu,r.ln2.lnSigma),l(r.ln2.lnSigma,r.ln2.lnResid),c(r.attnResidual,r.ln2.lnResid),d(r.ln2.lnResid,3,r.mlpFc,1),i(r.mlpFcBias,r.mlpFcWeight),i(r.mlpFcWeight,r.mlpFc,12),i(r.mlpFc,r.mlpAct,12),l(r.mlpProjBias,r.mlpProjWeight),l(r.mlpProjWeight,r.mlpResult),l(r.mlpResult,r.mlpResidual),d(r.mlpAct,1,r.mlpResult,2),o=r.mlpResidual}function n(e){return"w"===e.t?r:a}function i(e,t,o=6){d(e,3,t,2,o)}function l(e,t,o=6){d(e,1,t,0,o)}function s(e,t){let o=e.z+e.dz/2;switch(t){case 0:return new E.Vec3(e.x-2,e.y+e.dy/2,o);case 1:return new E.Vec3(e.x+e.dx+2,e.y+e.dy/2,o);case 2:return new E.Vec3(e.x+e.dx/2,e.y-2,o);case 3:return new E.Vec3(e.x+e.dx/2,e.y+e.dy+2,o)}}function c(t,o,r=6){let a=s(t,3),i=s(o,1),l=Math.min(t.opacity,o.opacity);if(0===l)return;let u=new E.Vec3(0,0,1),d=n(t).mul(l);F(e,new E.Vec3(a.x-3,i.y),i,r,u,d,!0)}function u(o,r,a,i=6,l=!1){let c=s(o,3),d=c.z>r.z+r.dz/2,m=new E.Vec3(r.x+r.dx/2,r.y+t.cell*(a+.5),d?r.z+r.dz/2+2:r.z-2),f=Math.min(o.opacity,r.opacity);if(0===f)return;let h=new E.Vec3(0,0,1),p=n(o).mul(f),g=new E.Vec3(0,0,d?-1:1);1>Math.abs(c.z-(r.z+r.dz/2))&&!l&&(g=void 0,m=s(r,2)),F(e,c,m,i,h,p,!0,0,g)}function d(t,o,r,a,i=6){let l=s(t,o),c=s(r,a),u=Math.min(t.opacity,r.opacity);if(0===u)return;let m=new E.Vec3(0,0,1),f=n(t).mul(u);if(0===o&&1===a&&(l.y=c.y),1===o&&2===a){let t=new E.Vec3(c.x-i/2,l.y,l.z),o=new E.Vec3(c.x,l.y+i/2,c.z);F(e,l,t,i,m,f,!1),F(e,o,c,i,m,f,!0,1)}else if(3===o&&1===a){let t=new E.Vec3(l.x,c.y-i/2,c.z),o=new E.Vec3(l.x-i/2,c.y,c.z);F(e,l,t,i,m,f,!1),F(e,o,c,i,m,f,!0,1)}else if(3===o&&0===a){let t=new E.Vec3(l.x,c.y-i/2,c.z),o=new E.Vec3(l.x+i/2,c.y,c.z);F(e,l,t,i,m,f,!1,0,new E.Vec3(0,1,0)),F(e,o,c,i,m,f,!0,2)}else F(e,l,c,i,m,f,!0)}c(o,t.ln_f.lnAgg2,2),d(o,3,t.ln_f.lnResid,1),i(t.ln_f.lnAgg2,t.ln_f.lnResid),l(t.ln_f.lnMu,t.ln_f.lnSigma),l(t.ln_f.lnSigma,t.ln_f.lnResid),t.logitsTransposed?(d(t.ln_f.lnResid,3,t.logits,1),i(t.lmHeadWeight,t.logits),i(t.logits,t.logitsSoftmax),l(t.logits,t.logitsAgg1,2),d(t.logitsAgg2,3,t.logitsSoftmax,1,2)):(i(t.ln_f.lnResid,t.logits),l(t.lmHeadWeight,t.logits),i(t.logits,t.logitsAgg2),i(t.logitsAgg1,t.logitsSoftmax))}(t.render,t.layout),(0,$.drawModelCard)(t,t.layout,"nano-gpt",new E.Vec3),t.examples))o.enabled&&o.layout&&(0,$.drawModelCard)(t,o.layout,o.name,o.offset.add(o.modelCardOffset));(0,ee.runMouseHitTesting)(t),t.render.sharedRender.activePhase=Y.RenderPhase.Opaque,function(e,t){let o=new E.Vec4(.4,.4,.4,1);{let r=o.mul(t.embedLabel.visible);X(e,"Embedding",new E.Vec3(t.tokEmbedObj.x-2*t.margin,t.tokEmbedObj.y,0),new E.Vec3(t.tokEmbedObj.x-2*t.margin,t.tokEmbedObj.y+t.tokEmbedObj.dy,0),{color:r,fontSize:6,pad:4})}let r=0;for(let a of t.blocks){let n=a.ln1.lnResid.y-t.margin/2,i=a.mlpResult.y+a.mlpResult.dy+t.margin/2,l=a.mlpProjBias.x-3*t.margin,s=a.projBias.x-t.margin,c=s-3*t.margin,u=(0,N.lerp)(s,l,.6),d=a.attnOut.y-t.margin/2,m=a.attnOut.y+a.attnOut.dy+t.margin/2,f=a.mlpFcBias.y-t.margin/2,h=l-6*t.margin;{let t=o.mul(a.mlpResidual.opacity*a.transformerLabel.visible);X(e,`Transformer ${r}`,new E.Vec3(h,n,0),new E.Vec3(h,i,0),{color:t,fontSize:26})}{let t=o.mul(a.attnResidual.opacity*a.selfAttendLabel.visible);X(e,"Self-attention",new E.Vec3(u,n,0),new E.Vec3(u,m,0),{color:t,fontSize:12})}{let t=o.mul(a.mlpAct.opacity*a.mlpLabel.visible);X(e,"MLP",new E.Vec3(l,f,0),new E.Vec3(l,i,0),{color:t,fontSize:12})}{let t=o.mul(a.attnOut.opacity*a.projLabel.visible);X(e,"Projection",new E.Vec3(c,d,0),new E.Vec3(c,m,0),{color:t,fontSize:10})}let p=0;for(let t of a.heads){{let r=o.mul(t.attnMtx.opacity*t.headLabel.visible),a=new E.Vec3(c,t.vBlock.y,t.vBlock.z+t.vBlock.dz/2),n=new E.Vec3(c,t.qBlock.y+t.qBlock.dy,t.qBlock.z+t.qBlock.dz/2);t.qBlock.y!==t.vBlock.y&&(a=new E.Vec3(c,t.vBlock.y,t.vOutBlock.z+t.vOutBlock.dz/2),n=new E.Vec3(c,t.vOutBlock.y+t.vOutBlock.dy,t.vOutBlock.z+t.vOutBlock.dz/2)),X(e,`Head ${p}`,a,n,{color:r,fontSize:10})}{let r=o.mul(t.qBlock.opacity*t.qLabel.visible);X(e,"Q",new E.Vec3(s,t.qBlock.y,t.qBlock.z+t.qBlock.dz/2),new E.Vec3(s,t.qBlock.y+t.qBlock.dy,t.qBlock.z+t.qBlock.dz/2),{color:r,fontSize:6,pad:4})}{let r=o.mul(t.kBlock.opacity*t.kLabel.visible);X(e,"K",new E.Vec3(s,t.kBlock.y,t.kBlock.z+t.kBlock.dz/2),new E.Vec3(s,t.kBlock.y+t.kBlock.dy,t.kBlock.z+t.kBlock.dz/2),{color:r,fontSize:6,pad:4})}{let r=o.mul(t.vBlock.opacity*t.vLabel.visible);X(e,"V",new E.Vec3(s,t.vBlock.y,t.vBlock.z+t.vBlock.dz/2),new E.Vec3(s,t.vBlock.y+t.vBlock.dy,t.vBlock.z+t.vBlock.dz/2),{color:r,fontSize:6,pad:4})}p++}r++}}(t.render,t.layout);let n=1,i=t.render.size.x;for(let e of(t.render.sharedRender.activePhase=Y.RenderPhase.Overlay2D,t.display.lines)){let o={color:new E.Vec4,size:14},r=(0,x.measureText)(t.render.modelFontBuf,e,o);(0,x.drawText)(t.render.modelFontBuf,e,i-r-4,n*o.size*1.3+4,o),n++}!function(e){let{layout:t,render:o,camera:r}=e,{gl:a,blockRender:n,size:i}=o,{modelMtx:l,viewMtx:s}=r,{camPos:c}=(0,w.cameraToMatrixView)(r),d=[new E.Vec3(100,400,600),new E.Vec3(-200,-300,-300),new E.Vec3(200,-100,0)],m=[new E.Vec3(1,.2,.2),new E.Vec3(1,.2,.2),new E.Vec3(1,.2,.2)],f=new Float32Array(9),h=new Float32Array(9);for(let e=0;e<3;e++)l.mulVec3Proj(d[e]).writeToBuf(f,3*e),l.mulVec3Proj(m[e]).writeToBuf(h,3*e);if(a.bindFramebuffer(a.FRAMEBUFFER,null),a.viewport(0,0,i.x,i.y),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT|a.DEPTH_BUFFER_BIT),a.enable(a.BLEND),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),a.enable(a.DEPTH_TEST),a.enable(a.CULL_FACE),a.cullFace(a.FRONT),a.frontFace(a.CW),o.renderTiming){let e=`GPU: ${o.lastGpuMs.toFixed(1)}ms JS: ${o.lastJsMs.toFixed(1)}ms`,t=i.x;o.sharedRender.activePhase=Y.RenderPhase.Overlay2D;let r=(0,x.measureTextWidth)(o.modelFontBuf,e,14);(0,x.writeTextToBuffer)(o.modelFontBuf,e,new E.Vec4(0,0,0,1),t-r-4,4,14,new k.Mat4f)}(0,Y.writeModelViewUbo)(o.sharedRender,l,s);{var p;let e,r,a,i,l,s=t.cubes.filter(e=>e.highlight>0);!function(e){let t=e.gl,o=t.canvas.width,r=t.canvas.height,a=Math.floor(o*e.blurFactor),n=Math.floor(r*e.blurFactor);if(e.currViewSize.x!==o||e.currViewSize.y!==r){for(let o of(t.bindTexture(t.TEXTURE_2D,e.initialTex),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,a,n,0,t.RGBA,t.UNSIGNED_BYTE,null),e.blurFbos))t.bindTexture(t.TEXTURE_2D,o.tex),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,a,n,0,t.RGBA,t.UNSIGNED_BYTE,null);e.currViewSize=new E.Vec3(o,r)}t.bindFramebuffer(t.FRAMEBUFFER,e.initialFbo),t.viewport(0,0,a,n),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT)}(o.blurRender),function(e,t){let o=e.gl;if(!e.simpleShader.ready)return;let r=e.simpleShader.locs,a=e.cubeGeom;for(let n of(o.useProgram(e.simpleShader.program),o.bindVertexArray(a.vao),t)){o.uniform3f(r.u_size,n.dx,n.dy,n.dz),o.uniform3f(r.u_offset,n.x,n.y,n.z);let e=("w"===n.t?new E.Vec4(.3,.3,1,1):new E.Vec4(.4,.8,.4,1)).mul(n.highlight);o.uniform4f(r.u_baseColor,e.x,e.y,e.z,e.w),o.drawArrays(a.type,0,a.numVerts)}}(n,s),r=(e=(p=o.blurRender).gl).canvas.width,a=e.canvas.height,i=Math.floor(r*p.blurFactor),l=Math.floor(a*p.blurFactor),e.bindVertexArray(p.quadVao),e.disable(e.DEPTH_TEST),e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.STENCIL_TEST),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,p.initialTex),e.bindFramebuffer(e.FRAMEBUFFER,p.blurFbos[0].fbo),e.viewport(0,0,i,l),e.useProgram(p.horizShader.program),e.uniform1i(p.horizShader.locs.u_texture,0),e.drawArrays(e.TRIANGLE_FAN,0,4),e.bindTexture(e.TEXTURE_2D,p.blurFbos[0].tex),e.bindFramebuffer(e.FRAMEBUFFER,p.blurFbos[1].fbo),e.viewport(0,0,i,l),e.useProgram(p.vertShader.program),e.uniform1i(p.vertShader.locs.u_texture,0),e.drawArrays(e.TRIANGLE_FAN,0,4),e.enable(e.BLEND),e.viewport(0,0,r,a),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindTexture(e.TEXTURE_2D,p.blurFbos[1].tex),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,p.initialTex),e.useProgram(p.overlayShader.program),e.uniform1i(p.overlayShader.locs.u_texture,0),e.drawArrays(e.TRIANGLE_FAN,0,4)}for(let i of(a.enable(a.DEPTH_TEST),(0,B.uploadAllLines)(o.lineRender),(0,T.uploadAllTris)(o.triRender),(0,x.uploadAllText)(o.modelFontBuf),!function(e,t,o,r){let a=e.gl,n=e.shader.locs,i=e.cubeGeom;if(!e.shader.ready)return;a.useProgram(e.shader.program);let l=o.mulVec3Proj(r);a.uniform3f(n.u_camPos,l.x,l.y,l.z),a.uniform1i(n.u_accessSampler,0),a.enable(a.BLEND),a.enable(a.CULL_FACE),a.activeTexture(a.TEXTURE0),a.bindVertexArray(i.vao);let s=[],c=[];t.cubes.forEach(function e(t){t.subs?t.subs.forEach(e):t.opacity<.8&&t.opacity>0?c.push(t):t.opacity>0&&s.push(t)});let d=[...s,...c],m=s.length,f=e.blockUbo.localBufs[0],h=e.blockAccessUbo.localBufs[0];{(0,u.resetFloatBufferMap)(e.blockUbo),(0,u.ensureFloatBufferSize)(f,s.length);let t=f.buf;for(let e of d){let o=f.usedEls*f.strideFloats;t[o+0]=e.x,t[o+1]=e.y,t[o+2]=e.z,t[o+4]=e.dx,t[o+5]=e.dy,t[o+6]=e.dz,t[o+8]=e.cx,t[o+9]=e.cy,t[o+10]=e.cz,t.set(e.localMtx??new k.Mat4f,o+12);let r="w"===e.t?H.Colors.Weights:"i"===e.t?H.Colors.Intermediates:H.Colors.Aggregates;new E.Vec4(r.x,r.y,r.z,e.opacity).writeToBuf(t,o+28),t[o+32]=e.highlight,f.usedEls+=1}(0,u.uploadFloatBuffer)(a,e.blockUbo)}{(0,u.resetFloatBufferMap)(e.blockAccessUbo),(0,u.ensureFloatBufferSize)(h,s.length);let t=h.buf;for(let e of d){let o=h.usedEls*h.strideFloats;if(e.access&&!0!==e.access.disable){t.set(e.access.mat.slice(0,8),o);let r=e.access.channel;t[o+8]="r"===r?0:"g"===r?1:"b"===r?2:3,t[o+9]=e.access.scale}else t[o+9]=0;h.usedEls+=1}(0,u.uploadFloatBuffer)(a,e.blockAccessUbo)}let p=!0,g=0;for(let t of d){g===m&&a.depthMask(!1),a.bindBufferRange(a.UNIFORM_BUFFER,Y.UboBindings.Block,e.blockUbo.buf,g*f.strideBytes,f.strideBytes);let o=!!t.access&&!0!==t.access.disable;(p||o)&&(a.bindBufferRange(a.UNIFORM_BUFFER,Y.UboBindings.BlockAccess,e.blockAccessUbo.buf,g*h.strideBytes,h.strideBytes),a.bindTexture(a.TEXTURE_2D,o&&t.access?t.access.src.texture:e.dummyTexture),p=o),a.drawArrays(i.type,0,i.numVerts),g++}a.depthMask(!0)}(n,t,l,c),o.sharedRender.activePhase=Y.RenderPhase.Opaque,e.examples))if(i.enabled&&i.layout){let{modelMtx:e,viewMtx:t}=r,{camPos:a}=(0,w.cameraToMatrixView)(r);var g=e.mul(k.Mat4f.fromTranslation(i.offset));(0,Y.writeModelViewUbo)(o.sharedRender,g,t),function(e,t,o,r){if(!e.instancedShader.ready)return;let a=e.gl,n=e.instancedShader.locs,i=e.blockAccessUbo.localBufs[0];a.useProgram(e.instancedShader.program);let l=o.invert().mulVec3Proj(r);if(a.uniform3f(n.u_camPos,l.x,l.y,l.z),a.uniform1i(n.u_accessSampler,0),a.enable(a.BLEND),a.enable(a.CULL_FACE),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,e.dummyTexture),a.bindVertexArray(e.instancedVao),e.instancedDataStale){e.instancedDataStale=!1;{(0,u.resetFloatBufferMap)(e.instancedFloatBuf);let o=e.instancedFloatBuf.localBufs[0];(0,u.ensureFloatBufferSize)(o,t.cubes.length);let r=o.buf;for(let e of t.cubes){if(e.small)continue;let t=o.usedEls*o.strideFloats;r[t+0]=e.x,r[t+1]=e.y,r[t+2]=e.z,r[t+4]=e.dx,r[t+5]=e.dy,r[t+6]=e.dz,r[t+8]=e.cx,r[t+9]=e.cy,r[t+10]=e.cz,r.set(e.localMtx??new k.Mat4f,t+12);let a="w"===e.t?H.Colors.Weights:"i"===e.t?H.Colors.Intermediates:H.Colors.Aggregates;new E.Vec4(a.x,a.y,a.z,e.opacity).writeToBuf(r,t+28),r[t+32]=e.highlight,o.usedEls+=1}(0,u.uploadFloatBuffer)(a,e.instancedFloatBuf),e.instancedNumBlocks=o.usedEls}(0,u.resetFloatBufferMap)(e.blockAccessUbo),(0,u.ensureFloatBufferSize)(i,1),i.buf[9]=0,i.usedEls+=1,(0,u.uploadFloatBuffer)(a,e.blockAccessUbo)}a.bindBufferRange(a.UNIFORM_BUFFER,Y.UboBindings.BlockAccess,e.blockAccessUbo.buf,0,i.strideBytes),a.drawArraysInstanced(e.cubeGeom.type,0,e.cubeGeom.numVerts,e.instancedNumBlocks),a.depthMask(!0)}(i.blockRender,i.layout,g,a)}for(let e of((0,Y.writeModelViewUbo)(o.sharedRender,l,s),(0,K.renderAllThreads)(o.threadRender),a.polygonOffset(-1,-2),[Y.RenderPhase.Opaque,Y.RenderPhase.Arrows,Y.RenderPhase.Overlay,Y.RenderPhase.Overlay2D])){if(e===Y.RenderPhase.Overlay2D){let e=i.x,t=i.y;a.clear(a.DEPTH_BUFFER_BIT),(0,Y.writeModelViewUbo)(o.sharedRender,new k.Mat4f,k.Mat4f.fromOrtho(0,e,t,0,-1,1))}e===Y.RenderPhase.Overlay||e===Y.RenderPhase.Overlay2D?a.enable(a.POLYGON_OFFSET_FILL):a.disable(a.POLYGON_OFFSET_FILL),(0,T.renderAllTris)(o.triRender,e),(0,x.renderAllText)(o.modelFontBuf,e),(0,B.renderAllLines)(o.lineRender,e)}a.disable(a.POLYGON_OFFSET_FILL)}(t),function(e,t){if(!e.ctx.ext.disjointTimerQuery)return;let o=e.queries.get(t);o&&o.hasRun&&o.hasStarted&&(e.ctx.gl.endQuery(e.TIME_ELAPSED_EXT),o.hasStarted=!1)}(t.render.queryManager,"render"),t.render.gl.flush(),t.render.lastJsMs=performance.now()-r}({time:e,dt:t,markDirty:this.markDirty},this.progState),this.progState.htmlSubs.notify()}}e.s(["LayerView",0,function(){let[e,t]=(0,a.useState)(null),[o,n]=(0,a.useState)(null),[i,l]=(0,a.useState)(null),[s,c]=(0,a.useState)(null),u=(0,ex.useScreenLayout)(),d=(0,a.useContext)(eb.KeyboardManagerContext);(0,eb.useGlobalKeyboard)(eb.KeyboardOrder.MainPage,e=>{if(!i?.progState)return;let t=e.key.toLowerCase(),o=i.progState.walkthrough,r=i.progState.movement;" "===e.key&&(o.time>=o.phaseLength?((0,ev.jumpPhase)(o,1),o.time=0):o.running=!o.running,i.markDirty()),("Backspace"===e.key||"Delete"===e.key)&&(o.running=!1,o.time=0,i.markDirty()),("ArrowLeft"===e.key||"a"===t)&&(r.action=eg.Left,i.markDirty()),("ArrowRight"===e.key||"d"===t)&&(r.action=eg.Right,i.markDirty()),("ArrowUp"===e.key||"w"===t)&&(r.action=eg.Up,i.markDirty()),("ArrowDown"===e.key||"s"===t)&&(r.action=eg.Down,i.markDirty()),("PageUp"===e.key||"q"===t)&&(r.action=eg.In,i.markDirty()),("PageDown"===e.key||"e"===t)&&(r.action=eg.Out,i.markDirty()),"r"===t&&(r.action=eg.Expand,i.markDirty()),"f"===t&&(r.action=eg.Focus,i.markDirty())," "===e.key&&e.preventDefault()}),(0,a.useEffect)(()=>(document.addEventListener("keydown",d.handleKey),()=>{document.removeEventListener("keydown",d.handleKey)}),[d]),(0,a.useEffect)(()=>{let e=!1;return async function(){let t=ew("gpt-nano-sort-t0-partials.json"),o=ew("gpt-nano-sort-model.json"),r=eo(),[a,i,l]=await Promise.all([t,o,r]);e||n({data:a,model:i,native:l})}(),()=>{e=!0}},[]),(0,a.useEffect)(()=>{let e=!1;return async function(){let t=await (0,x.fetchFontAtlasData)();e||c(t)}(),()=>{e=!0}},[]),(0,a.useEffect)(()=>{if(e&&s){let t=new eB(e,null,s),o=new ResizeObserver(()=>{t.canvasSizeDirty=!0,t.markDirty()}),r=e=>e.preventDefault();return l(t),o.observe(e),e.addEventListener("wheel",r,{passive:!1}),()=>{e.removeEventListener("wheel",r),t.destroy(),o.disconnect()}}l(null)},[e,s]),(0,a.useEffect)(()=>{i?.setData({dataAndModel:o})},[i,o]),(0,a.useLayoutEffect)(()=>{i&&(i.progState.pageLayout=u,i.markDirty())},[i,u]);let m=i&&(0,r.jsx)("div",{className:g.default.sidebar,children:(0,r.jsx)(_.ProgramStateContext.Provider,{value:i.progState,children:(0,r.jsx)(_.WalkthroughSidebar,{})})}),f=(0,r.jsxs)("div",{className:g.default.canvasWrap,children:[(0,r.jsx)("canvas",{className:g.default.canvas,ref:t}),i&&!i.progState.render&&(0,r.jsxs)("div",{className:"absolute flex flex-col items-center w-full h-full justify-center",children:[(0,r.jsx)("div",{className:"text-2xl",children:"This application requires a WebGL2 capable browser."}),(0,r.jsx)("div",{className:"text-lg mt-2",children:"Please try the latest version of Chrome or Firefox."})]}),i&&(0,r.jsxs)(_.ProgramStateContext.Provider,{value:i.progState,children:[(0,r.jsx)(em,{}),(0,r.jsx)(e_,{})]})]});return(0,r.jsx)("div",{className:g.default.view,children:(0,r.jsxs)(ey.Resizer,{id:"llm-sidebar",className:"flex-1",vertical:!u.isDesktop,defaultAmt:.4,children:[u.isDesktop&&m,f,!u.isDesktop&&m]})})}],69454)},93337,e=>{e.v({body:"WelcomePopup-module-scss-module__gB50DG__body",footer:"WelcomePopup-module-scss-module__gB50DG__footer",header:"WelcomePopup-module-scss-module__gB50DG__header",image:"WelcomePopup-module-scss-module__gB50DG__image",infoBtn:"WelcomePopup-module-scss-module__gB50DG__infoBtn",modalWindow:"WelcomePopup-module-scss-module__gB50DG__modalWindow",modalWindowBackdrop:"WelcomePopup-module-scss-module__gB50DG__modalWindowBackdrop",opacityFadeIn:"WelcomePopup-module-scss-module__gB50DG__opacityFadeIn",text:"WelcomePopup-module-scss-module__gB50DG__text"})},52814,e=>{"use strict";var t=e.i(43476),o=e.i(77774),r=e.i(49721),a=e.i(71645),n=e.i(51523),i=e.i(81632),l=e.i(72621),s=e.i(72702),c=e.i(93337),u=e.i(62328),d=e.i(14632);function m(e){return{visible:e?.visible??!0}}class f{subscriptions=new d.Subscriptions;forceVisible=!1;showWelcomeDialog(){this.forceVisible=!0,this.subscriptions.notify()}}let h=(0,a.createContext)(new f);e.s(["InfoButton",0,()=>{let e=(0,a.useContext)(h);return(0,t.jsx)("div",{onClick:()=>e.showWelcomeDialog(),className:c.default.infoBtn,children:(0,t.jsx)(r.FontAwesomeIcon,{icon:o.faCircleQuestion})})},"WelcomePopup",0,()=>{let e=(0,a.useContext)(h);(0,d.useSubscriptions)(e.subscriptions);let[o,r]=(0,l.useLocalStorageState)("welcome-popup",m);function f(){r(e=>(0,n.assignImm)(e,{visible:!1}))}return((0,i.useGlobalKeyboard)(i.KeyboardOrder.Modal,e=>{"Escape"===e.key&&f(),e.stopPropagation()}),(0,a.useEffect)(()=>{e.forceVisible&&(e.forceVisible=!1,r(e=>(0,n.assignImm)(e,{visible:!0})))},[e,r,e.forceVisible]),o.visible)?(0,t.jsxs)(s.ModalWindow,{className:c.default.modalWindow,backdropClassName:c.default.modalWindowBackdrop,onBackdropClick:f,children:[(0,t.jsx)("div",{className:c.default.header,children:(0,t.jsx)("div",{className:c.default.title,children:"Welcome!"})}),(0,t.jsxs)("div",{className:c.default.body,children:[(0,t.jsx)("div",{style:{width:600,flex:"0 0 auto"},children:(0,t.jsx)(u.TocDiagram,{activePhase:null,onEnterPhase:f})}),(0,t.jsxs)("div",{className:c.default.text,children:[(0,t.jsx)("p",{children:"This is an interactive 3D Visualization of a Large Language Model (LLM), of the likes that powers GPT-3 & ChatGPT."}),(0,t.jsx)("p",{children:"We show a very small model of the same design, to help you understand how these models work."}),(0,t.jsx)("p",{children:"As well as being interactive, we provide a walkthrough of the model showing the step-by-step process of how it works, with every single add, multiply & math operation described."})]})]}),(0,t.jsx)("div",{className:c.default.footer,children:(0,t.jsx)("button",{className:c.default.button,onClick:f,children:"Get Started"})})]}):null}])},163,e=>{e.v({arrow:"MovementControls-module-scss-module__bRvSgq__arrow",control:"MovementControls-module-scss-module__bRvSgq__control",controls:"MovementControls-module-scss-module__bRvSgq__controls"})}]);

//# sourceMappingURL=0qqvygvhef9rv.js.map