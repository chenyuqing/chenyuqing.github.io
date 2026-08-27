(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,555,e=>{e.v({canvas:"LayerView-module-scss-module__TtS2oW__canvas",canvasEventSurface:"LayerView-module-scss-module__TtS2oW__canvasEventSurface",canvasWrap:"LayerView-module-scss-module__TtS2oW__canvasWrap",focusTag:"LayerView-module-scss-module__TtS2oW__focusTag",sidebar:"LayerView-module-scss-module__TtS2oW__sidebar",view:"LayerView-module-scss-module__TtS2oW__view"})},69454,e=>{"use strict";var t,o,a=e.i(43476),r=e.i(71645);function n(e){return null!=e}function l(e,t,o,a,r){if(r&&r.length!==a.length)throw Error(`Number of texture names (${r.length}) does not match number of src textures (${a.length})`);let n=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,n);for(let t=0;t<o.length;t++)e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,o[t].texture,0);e.drawBuffers(o.map((t,o)=>e.COLOR_ATTACHMENT0+o));let l=e.checkFramebufferStatus(e.FRAMEBUFFER);return l!==e.FRAMEBUFFER_COMPLETE&&console.log("createRenderPhase: framebuffer not complete: "+l),{destBuffers:o,srcBuffers:a,fbo:n,program:t,uniformNames:r,uniformsSet:!1}}function i(e,t,o,a){let r=e.createTexture();e.bindTexture(e.TEXTURE_2D,r);let[n,l]=c(e,a);return e.texImage2D(e.TEXTURE_2D,0,l,t,o,0,n,e.FLOAT,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),{width:t,height:o,texture:r,channels:a}}function s(e,t,o){if(o.length!==t.width*t.height*t.channels)throw Error("Data length does not match buffer size");e.bindTexture(e.TEXTURE_2D,t.texture);let[a]=c(e,t.channels);e.texSubImage2D(e.TEXTURE_2D,0,0,0,t.width,t.height,a,e.FLOAT,o)}function c(e,t){switch(t){case 1:return[e.RED,e.R32F];case 2:return[e.RG,e.RG32F];case 3:return[e.RGB,e.RGB32F];case 4:return[e.RGBA,e.RGBA32F];default:throw Error(`Invalid number of channels: ${t}. Must be 1, 2, 3, or 4.`)}}var u=e.i(36748);let d=`#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`;function m(e,t,o){let{gl:a,model:r,shape:{B:n,T:c,C:m},shaderManager:f}=e,p=r[t+".weight"],g=r[t+".bias"],h=i(a,1,m,1),x=i(a,1,m,1),y=i(a,1,n*c,2),b=i(a,m,n*c,1);s(a,h,p.toFloat32Array()),s(a,x,g.toFloat32Array());let v=(0,u.createShaderProgram)(f,"normAgg",d,`#version 300 es
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
    `),w=l(a,v,[y],[o],["normInput"]),T=l(a,_,[b],[o,y,h,x],["normInput","normAgg","normWeight","normBias"]);return{normAgg:y,normWeight:h,normBias:x,aggPhase:w,applyPhase:T,output:b}}function f(e,t,o,a,r,c,m){let{gl:f,model:p,shape:{B:g,T:h},shaderManager:x}=e;m=m??!0;let y=p[t+".weight"],b=m?p[t+".bias"]:null,v=i(f,o,a,1),_=m?i(f,1,a,1):null,w=i(f,a,g*h,1);s(f,v,y.buffer),b&&_&&s(f,_,b.buffer);let T=l(f,(0,u.createShaderProgram)(x,"linear",d,`#version 300 es
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
    `),[w],[r,v,_,c].filter(n),["linearInput","linearWeight",m?"linearBias":null,c?"linearResidual":null].filter(n));return{weight:v,bias:_,linearPhase:T,output:w}}function p(e,t,o,a,r){let{gl:n,model:c,shape:{B:m,T:f},shaderManager:p}=e,g=c[t+".weight"],h=i(n,a,o,1),x=i(n,a,m*f,1);s(n,h,g.buffer);let y=l(n,(0,u.createShaderProgram)(p,"embed",d,`#version 300 es
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
    `),[x],[r,h],["embedInput","embedWeight"]);return{weight:h,phase:y,output:x}}function g(e,t,o){let{gl:a,shape:{B:r,T:n,C:s},shaderManager:c}=e,m=i(a,s,r*n,1);return{addPhase:l(a,(0,u.createShaderProgram)(c,"add",d,`#version 300 es
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
    `),[m],[t,o],["inputA","inputB"]),output:m}}var h=e.i(555),x=e.i(5741),y=e.i(92921),b=e.i(51523),v=e.i(51164),_=e.i(83891),w=e.i(76926),T=e.i(75076),B=e.i(6461);let E=new Float32Array(3072);var R=e.i(40029);let A=new Float32Array(12);function M(e,t,o,a,r,n,l=!0,i=0,s){var c,u,d,m;let f=o.sub(t);f.z=0,f=f.normalize();let p=o.sub(t).len(),g=l?Math.min(.7*p,3):0,h=new R.Mat4f,x=B.Vec3.cross(f,r).mul(-1).normalize();r=B.Vec3.cross(x,f).normalize(),h[0]=x.x,h[1]=x.y,h[2]=x.z,h[4]=f.x,h[5]=f.y,h[6]=f.z,h[8]=r.x,h[9]=r.y,h[10]=r.z,t=h.mulVec3Proj(t),o=h.mulVec3Proj(o);let y={width:a,borderColor:n.mul(.8),ribbonColor:n.mul(.3),headDepth:g,headExtra:3,lineThick:1.2,mtx:h};s=s?h.mulVec3ProjVec(s):void 0,Math.abs(t.z-o.z)>.01||s?function(){let a=Math.max(g,Math.abs(t.y-o.y-g)/2),r=new B.Vec3(t.x,t.y,t.z),n=new B.Vec3(t.x,t.y+a,t.z),i=new B.Vec3(o.x,o.y-g-a,o.z),c=new B.Vec3(o.x,o.y-g,o.z);s&&(i=o.mulAdd(s,-g-a),c=o.mulAdd(s,-g));let u=function(e,t,o,a){let r=E,n=0,l=[];function i(e,t,o,a){l.push({p0:e,p1:t,p2:o,p3:a})}i(e,t,o,a),a.writeToBuf(r,n),n+=3;for(;l.length>0;){let{p0:e,p1:t,p2:o,p3:a}=l.pop(),s=e.mid(t),c=t.mid(o),u=o.mid(a),d=s.mid(c),m=c.mid(u),f=d.mid(m),p=a.sub(e),g=t.sub(a),h=o.sub(a),x=Math.abs(g.y*p.z-g.z*p.y),y=Math.abs(h.y*p.z-h.z*p.y);if((x+y)*(x+y)>.1*p.lenSq())i(e,s,d,f),i(f,m,u,a);else{if(n+6>r.length){let e=new Float32Array(2*r.length);e.set(r),r=e}e.writeToBuf(r,n),n+=3}}return E=r,r.slice(0,n)}(r,n,i,c),d=u.length/3,m=3*!!l,f=(2*d+m)*3;A.length<f&&(A=new Float32Array(f));let p=A.subarray(0,f);for(let t=0;t<d-1;t++)S(e,new B.Vec3(u[3*t+0],u[3*t+1],u[3*t+2]),new B.Vec3(u[3*t+3],u[3*t+4],u[3*t+5]),y);let h=d+m;for(let e=0;e<d;e++){let t=h+e;p[3*t+0]=u[3*e+0]+y.width/2,p[3*t+1]=u[3*e+1],p[3*t+2]=u[3*e+2];let o=d-e-1;p[3*o+0]=u[3*e+0]-y.width/2,p[3*o+1]=u[3*e+1],p[3*o+2]=u[3*e+2]}if(l){s=s??new B.Vec3(0,1,0);let e=o.mulAdd(s,-g),t=d;p[3*t+0]=e.x-y.width/2-3,p[3*t+1]=e.y,p[3*t+2]=e.z,p[3*(t+=1)+0]=o.x,p[3*t+1]=o.y,p[3*t+2]=o.z,p[3*(t+=1)+0]=e.x+y.width/2+3,p[3*t+1]=e.y,p[3*t+2]=e.z}let x=(0,w.makeLineOpts)({thick:y.lineThick,mtx:y.mtx,color:y.borderColor});(0,w.drawLineSegs)(e.lineRender,p,x)}():S(e,t,o.sub(new B.Vec3(0,g)),y),0!==i&&function(e,t,o,a){let r=1===o?1:-1;C.x=t.x+a.width/2*r,C.y=t.y+a.width/2,C.z=t.z,W.z=t.z,j.z=t.z;for(let t=0;t<8;t++){let o=t/7*Math.PI/2,n=a.width*Math.cos(o)*r,l=a.width*Math.sin(o);W.x=C.x-n,W.y=C.y-l,(0,T.addVert)(e.triRender,W,a.ribbonColor,O,a.mtx),(0,T.addVert)(e.triRender,C,a.ribbonColor,O,a.mtx);let i=j;j=W,W=i}(0,T.addPrimitiveRestart)(e.triRender)}(e,t.sub(new B.Vec3(0,a/2)),i,y),l&&(s=s??new B.Vec3(0,1,0),c=e,u=o.mulAdd(s,-g),d=o,m=y,P.copy_(u),P.x-=m.width/2,V.copy_(u),V.x+=m.width/2,D.copy_(d),D.x+=m.width/2,L.copy_(u),L.x=P.x-3,z.copy_(u),z.x=D.x+3,I.copy_(d),I.x=P.x+m.width/2,(0,T.addVert)(c.triRender,L,m.ribbonColor,U,m.mtx),(0,T.addVert)(c.triRender,I,m.ribbonColor,U,m.mtx),(0,T.addVert)(c.triRender,z,m.ribbonColor,U,m.mtx),(0,T.addPrimitiveRestart)(c.triRender))}let k=new B.Vec3,F=new B.Vec3;function S(e,t,o,a){k.x=t.x-a.width/2,k.y=t.y,k.z=t.z,F.x=o.x+a.width/2,F.y=o.y,F.z=o.z,(0,T.addQuad)(e.triRender,k,F,a.ribbonColor,a.mtx)}new B.Vec3,new B.Vec3;let P=new B.Vec3,V=new B.Vec3,D=new B.Vec3,L=new B.Vec3,z=new B.Vec3,I=new B.Vec3,U=new B.Vec3(0,0,1),C=new B.Vec3,O=new B.Vec3(0,0,1),W=new B.Vec3,j=new B.Vec3;var G=e.i(10738);function N(e,t,o,a,r){let n=new R.Mat4f;n[14]=(o.z+a.z)/2;let l=r.color,i=r.fontSize,s=r.pad??10,c=l.mul(.4),u=(0,x.measureTextWidth)(e.modelFontBuf,t,i);(0,x.writeTextToBuffer)(e.modelFontBuf,t,l,o.x-u-2*s,(o.y+a.y)/2-i/2,i,n);let d=new B.Vec3(o.x,o.y,(o.z+a.z)/2),m=new B.Vec3(a.x,a.y,(o.z+a.z)/2);o.z!=a.z&&(d=new B.Vec3(o.x,(o.y+a.y)/2,o.z),m=new B.Vec3(o.x,(o.y+a.y)/2,a.z));let f=new B.Vec3(1,0,0);(0,w.addLine)(e.lineRender,1,c,d.mulAdd(f,-s),m.mulAdd(f,-s),void 0),(0,w.addLine)(e.lineRender,1,c,d.mulAdd(f,-s),d,void 0),(0,w.addLine)(e.lineRender,1,c,m.mulAdd(f,-s),m,void 0)}var X=e.i(21729),q=e.i(710),$=e.i(85539),H=e.i(35050),Y=e.i(91760),Q=e.i(18190),K=e.i(95147),J=e.i(46419),Z=((t={})[t.Wte=0]="Wte",t[t.Wpe=1]="Wpe",t[t.LmHeadW=2]="LmHeadW",t[t.AttnQkvW=3]="AttnQkvW",t[t.AttnQkvB=4]="AttnQkvB",t[t.AttnProjW=5]="AttnProjW",t[t.AttnProjB=6]="AttnProjB",t[t.MlpW=7]="MlpW",t[t.MlpB=8]="MlpB",t[t.MlpProjW=9]="MlpProjW",t[t.MlpProjB=10]="MlpProjB",t[t.Ln1Gamma=11]="Ln1Gamma",t[t.Ln1Beta=12]="Ln1Beta",t[t.Ln2Gamma=13]="Ln2Gamma",t[t.Ln2Beta=14]="Ln2Beta",t[t.LnFGamma=15]="LnFGamma",t[t.LnFBeta=16]="LnFBeta",t[t.InputTokens=17]="InputTokens",t[t.InputTokenEmbed=18]="InputTokenEmbed",t[t.InputEmbed=19]="InputEmbed",t[t.Ln1Agg=20]="Ln1Agg",t[t.Ln1Norm=21]="Ln1Norm",t[t.AttnQkv=22]="AttnQkv",t[t.Attn=23]="Attn",t[t.AttnSmAgg=24]="AttnSmAgg",t[t.AttnSm=25]="AttnSm",t[t.AttnVOut=26]="AttnVOut",t[t.AttnProj=27]="AttnProj",t[t.AttnResidual=28]="AttnResidual",t[t.Ln2Agg=29]="Ln2Agg",t[t.Ln2Norm=30]="Ln2Norm",t[t.MlpMlp=31]="MlpMlp",t[t.MlpAct=32]="MlpAct",t[t.MlpProj=33]="MlpProj",t[t.MlpResidual=34]="MlpResidual",t[t.LnFAgg=35]="LnFAgg",t[t.LnFNorm=36]="LnFNorm",t[t.Logits=37]="Logits",t[t.LogitsSmAgg=38]="LogitsSmAgg",t[t.LogitsSm=39]="LogitsSm",t);function ee(e){let{gl:t,shape:{B:o,T:a,C:r}}=e;return{output:i(t,r,o*a,1)}}function et(e,t,o){let{gl:a,shape:{B:r,T:n,C:l}}=e;return{weight:i(a,l,o,1),output:i(a,l,r*n,1)}}function eo(e,t,o,a){let{gl:r,shape:{B:n,T:l}}=e;return{weight:i(r,o,a,1),bias:i(r,1,a,1),output:i(r,a,n*l,1)}}function ea(e){let{gl:t,shape:{B:o,T:a,C:r}}=e;return{normWeight:i(t,1,r,1),normBias:i(t,1,r,1),normAgg:i(t,1,o*a,2),output:i(t,r,o*a,1)}}function er(e,t){let o=e.weightsDirty||e.intersDirty;e.lastMemoryBuffer!==e.native.memory.buffer&&(e.lastMemoryBuffer=e.native.memory.buffer,o=!0),o&&(function(e,t,o=!1,a=!1){c(Z.Wte,0,t.vocabEmbed.weight,!0),c(Z.Wpe,0,t.posEmbed.weight,!0),c(Z.InputTokens,0,t.inputTokens),c(Z.InputEmbed,0,t.add.output);for(let e=0;e<t.blocks.length;e++){let o=t.blocks[e];c(Z.Ln1Gamma,e,o.ln_1.normWeight,!0),c(Z.Ln1Beta,e,o.ln_1.normBias,!0),c(Z.Ln1Agg,e,o.ln_1.normAgg),c(Z.Ln1Norm,e,o.ln_1.output),c(Z.AttnQkvW,e,o.attn.qkvWeight,!0),c(Z.AttnQkvB,e,o.attn.qkvBias,!0),c(Z.AttnQkv,e,o.attn.qkvOutput),c(Z.Attn,e,o.attn.attnMatrix),c(Z.AttnSmAgg,e,o.attn.attnMatrixAgg),c(Z.AttnSm,e,o.attn.attnMatrixSoftmax),c(Z.AttnVOut,e,o.attn.scaledVectors),c(Z.AttnProjW,e,o.attn.proj.weight,!0),c(Z.AttnProjB,e,o.attn.proj.bias,!0),c(Z.AttnProj,e,o.attn.proj.output),c(Z.AttnResidual,e,o.attn.output),c(Z.Ln2Gamma,e,o.ln_2.normWeight,!0),c(Z.Ln2Beta,e,o.ln_2.normBias,!0),c(Z.Ln2Agg,e,o.ln_2.normAgg),c(Z.Ln2Norm,e,o.ln_2.output),c(Z.MlpW,e,o.mlp.fcLayer.weight,!0),c(Z.MlpB,e,o.mlp.fcLayer.bias,!0),c(Z.MlpProjW,e,o.mlp.projLayer.weight,!0),c(Z.MlpProjB,e,o.mlp.projLayer.bias,!0),c(Z.MlpMlp,e,o.mlp.fcLayer.output),c(Z.MlpAct,e,o.mlp.mlpGelu),c(Z.MlpProj,e,o.mlp.projLayer.output),c(Z.MlpResidual,e,o.mlp.addLayer.output)}c(Z.LnFGamma,0,t.ln_f.normWeight,!0),c(Z.LnFBeta,0,t.ln_f.normBias,!0),c(Z.LnFAgg,0,t.ln_f.normAgg),c(Z.LnFNorm,0,t.ln_f.output),c(Z.LmHeadW,0,t.lm_head.weight,!0),c(Z.Logits,0,t.lm_head.output),c(Z.LogitsSmAgg,0,t.softmaxFinal.agg),c(Z.LogitsSm,0,t.softmaxFinal.output);let{T:r,vocabSize:n}=t.shape,l=t.softmaxFinal.output.localBuffer,i=new Float32Array(2*l.length);for(let e=0;e<r;e++){let t=[...l.slice(e*n,(e+1)*n)].map((e,t)=>({v:e,i:t}));t.sort((e,t)=>t.v-e.v);for(let o=0;o<t.length;o++)i[(e*n+o)*2+0]=t[o].i,i[(e*n+o)*2+1]=t[o].v}function c(r,n,l,i){let c=e.native.getModelTensor(e.modelPtr,r,n);var u=`${Z[r]}${n}`,d=c,m=l;let f=m.height*m.width*m.channels;if(d.buffer.length!==f)throw Error(`readToBufferTex: buffer size mismatch for ${u}. bufferTex: ${f} [h: ${m.height}, w: ${m.width}, c: ${m.channels}], wasmBuffer:  ${d.buffer.length} [${d.shape.join(", ")}]`);m.localBuffer=d.buffer,(i?a:o)&&s(t.gl,l,l.localBuffer)}t.sortedBuf=i}(e,t,e.intersDirty,e.weightsDirty),e.weightsDirty=!1,e.intersDirty=!1)}var en=e.i(14632),el=e.i(1477);let ei=({children:e})=>{let[t,o]=(0,r.useState)(null),n=(0,v.useProgramState)(),l=(0,r.useCallback)(e=>{e(n),n.markDirty()},[n]);function i(e,t,o){let a=e.camAngle,r=e.camTarget.clone();r.z=r.z+.1*o*a.z;let n=Math.sin(a.x*Math.PI/180)>0?1:-1;r.x=r.x+n*t*.1*a.z,l(e=>{e.camera.center=r})}function s(e,t,o){let a=e.camAngle.clone();a.x=a.x-.5*t,a.y=(0,b.clamp)(a.y+.5*o,-87,87),l(e=>{e.camera.angle=a})}let[c,u]=(0,el.useGlobalDrag)(function(e,t){let o=e.clientX-t.clientX,a=e.clientY-t.clientY;t.shiftKey||1===t.button||2===t.button?s(t.data,o,a):i(t.data,o,a),e.preventDefault()});return((0,el.useTouchEvents)(t,{camAngle:n.camera.angle,camTarget:n.camera.center},{alwaysSendDragEvent:!0},function(e,t){let o=t.touches[0],a=e.touches[0],r=a.clientX-o.clientX,n=a.clientY-o.clientY;i(t.data,r,n),e.preventDefault()},function(e,t){var o;let a,r=t.touches[0],n=t.touches[1],i=e.touches[0],c=e.touches[1],u=(r.clientX+n.clientX)/2,d=(r.clientY+n.clientY)/2,m=(i.clientX+c.clientX)/2,f=(i.clientY+c.clientY)/2,p=Math.sqrt((r.clientX-n.clientX)**2+(r.clientY-n.clientY)**2),g=Math.sqrt((i.clientX-c.clientX)**2+(i.clientY-c.clientY)**2);s(t.data,m-u,f-d),o=t.data,(a=o.camAngle.clone()).z=(0,b.clamp)(a.z/(g/p),.1,1e5),l(e=>{e.camera.angle=a}),e.preventDefault()}),n.render)?(0,a.jsx)("div",{ref:o,className:h.default.canvasEventSurface,onMouseDown:function(e){n&&u(e,{camAngle:n.camera.angle,camTarget:n.camera.center})},onMouseMove:function(e){if(n){let t=n.render.canvasEl.getBoundingClientRect(),o=new B.Vec3(e.clientX-t.left,e.clientY-t.top,0);l(e=>{e.mouse.mousePos=o})}},onWheel:function(e){if(n){let t=n.camera.angle,o=(0,b.clamp)(t.z*Math.pow(1.0013,e.deltaY),.01,1e5);l(e=>{e.camera.angle=new B.Vec3(t.x,t.y,o)})}e.stopPropagation()},onContextMenu:e=>e.preventDefault(),style:{cursor:c?"grabbing":n.display.hoverTarget?"crosshair":"grab"},children:e}):null};e.i(68757),e.i(49721),e.i(7670),e.i(163);var es=((o={})[o.Up=0]="Up",o[o.Down=1]="Down",o[o.Left=2]="Left",o[o.Right=3]="Right",o[o.Focus=4]="Focus",o[o.In=5]="In",o[o.Out=6]="Out",o[o.Expand=7]="Expand",o),ec=e.i(31337),eu=e.i(90904),ed=e.i(81632);class em{canvasData;renderState;progState;modelState;random;stopped;canvasSizeDirty;constructor(e,t,o){this.canvasData=t,this.modelState=null,this.stopped=!1,this.canvasSizeDirty=!0,this.prevTime=performance.now(),this.rafHandle=0,this.isDirty=!1,this.isWaitingForSync=!1,this.markDirty=()=>{this.canvasData&&!this.stopped&&(this.isDirty=!0,this.rafHandle||(this.prevTime=performance.now(),this.rafHandle=requestAnimationFrame(this.loop)))},this.loop=e=>{if(!(this.isDirty||this.isWaitingForSync)||this.stopped){this.rafHandle=0;return}let t=this.isDirty;this.isDirty=!1,this.isWaitingForSync=!1;let o=e-this.prevTime;this.prevTime=e,o<8&&(o=16),this.checkSyncObjects();let a=this.progState.render?.syncObjects.length??0;(t||this.isDirty)&&this.render(e,o),(this.progState.render?.syncObjects.length??0)!==a&&(this.isWaitingForSync=!0),this.rafHandle=requestAnimationFrame(this.loop)},this.progState=function(e,t){let o=function(e,t){let o=e.getContext("webgl2",{antialias:!0});if(!o)return null;let a={colorBufferFloat:o.getExtension("EXT_color_buffer_float"),disjointTimerQuery:o.getExtension("EXT_disjoint_timer_query_webgl2")};a.colorBufferFloat||console.log("initRender: EXT_color_buffer_float not supported: floating point textures will not work."),a.disjointTimerQuery||console.log("initRender: EXT_disjoint_timer_query_webgl2 not supported: GPU timing will not work.");let r=(0,u.createShaderManager)(o),n={gl:o,shaderManager:r,ext:a},l=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,l),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,1]),o.STATIC_DRAW);let i=o.createVertexArray();o.bindVertexArray(i),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0);let s=(0,H.initSharedRender)(n),c=(0,x.setupFontAtlas)(n,t),d=(0,x.createFontBuffers)(c,s),m=(0,Y.initThreadRender)(n),f=(0,w.createLineRender)(n,s),p=function(e){if(!e)return null;let t=e.gl,o=`
    layout (std140) uniform BlockUbo {
        uniform vec3 u_offset;
        uniform vec3 u_size;
        uniform vec3 u_nCells;
        uniform mat4 u_localPosMtx;
        uniform vec4 u_baseColor;
        uniform float u_highlight;
    };`,a=`
    layout (std140) uniform BlockAccessUbo {
        layout(row_major) uniform mat4x2 u_accessMtx;
        uniform float u_accessTexChannel;
        uniform float u_accessTexScale;
    };`,r=(0,u.createFloatBuffer)(t,t.UNIFORM_BUFFER,t.createBuffer(),1024,144,null),n=(0,u.createFloatBuffer)(t,t.UNIFORM_BUFFER,t.createBuffer(),1024,80,null),l=function(e){let t=[-1,1,-1,-1,1,1,1,1,-1,-1,1,-1],o=[new R.Mat4f,R.Mat4f.fromAxisAngle(new B.Vec3(1,0),Math.PI/2),R.Mat4f.fromAxisAngle(new B.Vec3(1,0),Math.PI),R.Mat4f.fromAxisAngle(new B.Vec3(1,0),-Math.PI/2),R.Mat4f.fromAxisAngle(new B.Vec3(0,1),Math.PI/2),R.Mat4f.fromAxisAngle(new B.Vec3(0,1),-Math.PI/2)],a=R.Mat4f.fromTranslation(new B.Vec3(.5,.5,.5)).mul(R.Mat4f.fromScale(new B.Vec3(.5,.5,.5))),r=new Float32Array(216),n=0;for(let e of o)for(let o=0;o<6;o++){let l=a.mulVec3Proj(e.mulVec3Proj(new B.Vec3(t[2*o],t[2*o+1],-1))),i=e.mulVec3Proj(new B.Vec3(0,0,-1));r[n++]=Math.round(l.x),r[n++]=Math.round(l.y),r[n++]=Math.round(l.z),r[n++]=i.x,r[n++]=i.y,r[n++]=i.z}let l=e.createVertexArray();e.bindVertexArray(l);let i=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,r,e.STATIC_DRAW),(0,u.bindFloatAttribs)(e,i,{},[{name:"a_position",size:3},{name:"a_normal",size:3}]),{name:"cube",vao:l,vbo:i,type:e.TRIANGLES,numVerts:36}}(t),i=t.createVertexArray();t.bindVertexArray(i),t.bindBuffer(t.ARRAY_BUFFER,l.vbo),(0,u.bindFloatAttribs)(t,l.vbo,{},[{name:"a_position",size:3},{name:"a_normal",size:3}]);let s=t.createBuffer(),c=(0,u.bindFloatAttribs)(t,s,{locOffset:2,divisor:1},[{name:"a_offset",size:4},{name:"a_size",size:4},{name:"a_nCells",size:4},{name:"a_localPosMtx0",size:4},{name:"a_localPosMtx1",size:4},{name:"a_localPosMtx2",size:4},{name:"a_localPosMtx3",size:4},{name:"a_baseColor",size:4},{name:"a_highlight",size:1}]),d=(0,u.createFloatBuffer)(t,t.ARRAY_BUFFER,s,1024,c,null),m=t.createTexture();function f(e){return`#version 300 es
        precision highp float;

        ${H.modelViewUboText}

        ${e?"":o}

        ${a}

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
        }`}function p(e){return`#version 300 es
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

        ${a}

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
        }`}t.bindTexture(t.TEXTURE_2D,m),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST);let g=(0,u.createShaderProgram)(e,"block",f(!1),p(!1),["u_camPos","u_accessSampler"],{uboBindings:{ModelViewUbo:H.UboBindings.ModelView,BlockUbo:H.UboBindings.Block,BlockAccessUbo:H.UboBindings.BlockAccess}}),h=(0,u.createShaderProgram)(e,"block-instanced",f(!0),p(!0),["u_camPos","u_accessSampler"],{uboBindings:{ModelViewUbo:H.UboBindings.ModelView,BlockAccessUbo:H.UboBindings.BlockAccess}});return{gl:t,cubeGeom:l,shader:g,simpleShader:(0,u.createShaderProgram)(e,"block-simple",`#version 300 es
        precision highp float;
        ${H.modelViewUboText}
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
    `,["u_size","u_offset","u_baseColor"],{uboBindings:{ModelViewUbo:H.UboBindings.ModelView}}),blockUbo:r,blockAccessUbo:n,dummyTexture:m,instancedShader:h,instancedVao:i,instancedFloatBuf:d,instancedDataStale:!0,instancedNumBlocks:0}}(n),g=(0,T.initTriRender)(n,s),h=function(e,t){let o=e.gl,a=Math.max(o.canvas.width,1),r=Math.max(o.canvas.height,1),n=o.createFramebuffer(),l=o.createTexture();function i(){let e=o.createFramebuffer(),t=o.createTexture();o.bindFramebuffer(o.FRAMEBUFFER,e),o.bindTexture(o.TEXTURE_2D,t),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,a,r,0,o.RGBA,o.UNSIGNED_BYTE,null),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.framebufferTexture2D(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,t,0);{let e=o.checkFramebufferStatus(o.FRAMEBUFFER);e!==o.FRAMEBUFFER_COMPLETE&&console.log(`Blur framebuffer not complete: ${e.toString(16)}`)}return{fbo:e,tex:t}}o.bindFramebuffer(o.FRAMEBUFFER,n),o.bindTexture(o.TEXTURE_2D,l),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,a,r,0,o.RGBA,o.UNSIGNED_BYTE,null),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.framebufferTexture2D(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,l,0);let s=[i(),i()],c=new Float32Array(36),d=0;for(let e=-4;e<=4;e++){let t=e/2,o=Math.exp(-t*t*.5);c[4*(e+4)]=o,d+=o}for(let e=0;e<9;e++)c[4*e]/=d;let m=o.createBuffer();function f(t,o){return(0,u.createShaderProgram)(e.shaderManager,t,`#version 300 es
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
                    color += texelFetch(u_texture, pos + ivec2(${o===B.Dim.X?"i, 0":"0, i"}) * 2, 0) * weights[wId];
                }
                o_color = max(color, center);
            }
        `,["u_texture"],{uboBindings:{BlurWeights:H.UboBindings.blur}})}o.bindBuffer(o.UNIFORM_BUFFER,m),o.bufferData(o.UNIFORM_BUFFER,c.buffer,o.STATIC_DRAW),o.bindBufferBase(o.UNIFORM_BUFFER,H.UboBindings.blur,m);let p=f("blurHoriz",B.Dim.X);return{gl:o,quadVao:t,initialFbo:n,initialTex:l,blurFbos:s,horizShader:p,vertShader:f("blurVert",B.Dim.Y),overlayShader:(0,u.createShaderProgram)(e.shaderManager,"blurOverlay",`#version 300 es
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
        `,["u_texture"]),currViewSize:new B.Vec3(0,0),blurFactor:.3}}(n,i),y={ctx:n,queries:new Map,TIME_ELAPSED_EXT:n.ext.disjointTimerQuery?.TIME_ELAPSED_EXT};return(0,u.ensureShadersReady)(r),{canvasEl:e,gl:o,ctx:n,blockRender:p,threadRender:m,lineRender:f,blurRender:h,triRender:g,sharedRender:s,fontAtlas:c,modelFontBuf:d,quadVao:i,queryManager:y,syncObjects:[],size:new B.Vec3(1,1),lastGpuMs:0,lastJsMs:0,renderTiming:!1}}(e,t),a=(0,Q.initWalkthrough)(),r="layer"===new URLSearchParams(window.location.search).get("view"),n={B:1,T:r?6:11,C:r?24:48,nHeads:r?1:3,A:r?24:16,nBlocks:r?1:64,vocabSize:3};(0,q.genGptModelLayout)(n);let l={angle:new B.Vec3(296,16,r?1.65:9),center:new B.Vec3(0,r?86:300,0),transition:{},modelMtx:new R.Mat4f,viewMtx:new R.Mat4f,lookAtMtx:new R.Mat4f,camPos:new B.Vec3,camPosModel:new B.Vec3};return new B.Vec3(1e4,0,0),{native:null,wasmGptModel:null,render:o,inWalkthrough:!1,walkthrough:a,camera:l,shape:n,layout:(0,q.genGptModelLayout)(n),currExampleId:-1,mainExample:{name:"Qwen3.8-27B",enabled:!0,shape:n,offset:new B.Vec3,modelCardOffset:new B.Vec3,blockRender:null,camera:{center:l.center,angle:l.angle}},examples:[],gptGpuModel:null,jsGptModel:null,stepModel:!1,conciseLayerView:r,markDirty:()=>{},htmlSubs:new en.Subscriptions,mouse:{mousePos:new B.Vec3},movement:{action:null,actionHover:null,target:[0,0],depth:1,cameraLerp:null},display:{tokenColors:null,tokenIdxColors:null,tokenOutputColors:null,lines:[],hoverTarget:null,dimHover:null,blkIdxHover:null},pageLayout:{height:0,width:0,isDesktop:!0,isPhone:!0}}}(e,o),this.progState.markDirty=this.markDirty,this.progState.walkthrough.markDirty=this.markDirty,this.renderState=this.progState.render,this.random=new y.Random(4)}destroy(){this.stopped=!0}focusSection(e){let t=this.progState.layout,o=Math.max(0,Math.min(28,t.blocks.length-4)),a=t.blocks.slice(o,o+4),r=a[2]??a[0],n=a[3]??a.at(-1),l=a[2]??a[0],i=n??l,s=[],c="";switch(e){case"input":s=[t.idxObj,t.tokEmbedObj,t.posEmbedObj,t.residual0],c="MULTIMODAL INPUT · text embedding entrance";break;case"vision":s=[t.idxObj,t.tokEmbedObj,t.posEmbedObj,t.residual0],c="VISION ENCODER · projected text-residual entrance";break;case"merge":s=[t.residual0],c="MULTIMODAL MERGE + TEXT EMBED";break;case"backbone":s=a.flatMap(e=>e.cubes),c="TEXT BACKBONE · representative 4-layer group";break;case"layer":s=i?.cubes??[],c="TRANSFORMER LAYER · attention + SwiGLU + residual";break;case"linear":s=r?.selfAttendLabel.cubes??[],c="LINEAR ATTENTION · GQA / mRoPE";break;case"full":s=n?.selfAttendLabel.cubes??[],c="FULL ATTENTION · every 4th text layer";break;case"ffn":s=l?.mlpLabel.cubes??[],c="SWIGLU · 5,120 → 17,408";break;case"output":s=[...t.ln_f.cubes,t.lmHeadWeight,t.logits,t.logitsAgg1,t.logitsAgg2,t.logitsSoftmax],c="RMSNORM → LM HEAD → MTP";break;default:return null}let u=s.filter(Boolean);if(!u.length)return null;let d=u.flatMap(e=>[new B.Vec3(e.x,e.y,e.z),new B.Vec3(e.x+e.dx,e.y+e.dy,e.z+e.dz)].map(e=>this.progState.camera.modelMtx.mulVec3Proj(e))),m=d[0].clone(),f=d[0].clone();for(let e of d.slice(1))m.x=Math.min(m.x,e.x),m.y=Math.min(m.y,e.y),m.z=Math.min(m.z,e.z),f.x=Math.max(f.x,e.x),f.y=Math.max(f.y,e.y),f.z=Math.max(f.z,e.z);let p=m.add(f).mul(.5),g=Math.max(1.15,Math.min(32,f.sub(m).len()/138));return this.progState.camera.center=p,this.progState.camera.angle=new B.Vec3(296,16,g),this.markDirty(),c}setData(e){if(this.canvasData=e,e.dataAndModel&&!this.progState.gptGpuModel&&this.progState.render){var t,o,a,r;let n,c,h,x,y,v,_,w,T,B;this.progState.gptGpuModel=(t=this.renderState,o=e.dataAndModel,function(e,t){let o=e.gl,a="transformer",r=t.config,n=r.n_embd,c=r.n_head,h=r.block_size,x=r.n_layer,y=r.vocab_size,b=n/c,v={B:1,C:n,nHeads:c,T:h,A:b,nBlocks:x,vocabSize:y},_={gl:o,model:t,shape:v,shaderManager:e},w=new Float32Array(+h),T=i(o,1,+h,1),B=new Float32Array(+h);for(let e=0;e<1;e++)for(let t=0;t<h;t++)B[e*h+t]=t;let E=i(o,1,+h,1);s(o,E,B);let R=p(_,a+".wte",y,n,T),A=p(_,a+".wpe",h,n,E),M=g(_,R.output,A.output),k=[],F=M.output;for(let e=0;e<x;e++){let t=function(e,t,o){let a=m(e,t+".ln_1",o),r=function(e,t,o,a){let{gl:r,model:n,shape:{B:c,T:m,C:p,nHeads:h,A:x},shaderManager:y}=e,b=n[t+".c_attn.weight"].view([3,h,x,p]).permute(1,2,3,0),v=n[t+".c_attn.bias"].view([3,h,x]).permute(1,2,0),_=i(r,p,h*x,3),w=i(r,1,h*x,3),T=i(r,x,c*h*m,4),B=i(r,m,c*h*m,1),E=i(r,1,c*h*m,2),R=i(r,m,c*h*m,1),A=i(r,h*x,c*m,1);s(r,_,b.toFloat32Array()),s(r,w,v.toFloat32Array());let M=(0,u.createShaderProgram)(y,"qkv",d,`#version 300 es
        precision highp float;
        uniform sampler2D attnInput; // (B, T)         (C)
        uniform sampler2D qkvWeight; // (nHeads, A)    (C) [3]
        uniform sampler2D qkvBias;   // (nHeads, A)    (1) [3]
        out vec4 qkvOutput;          // (B, nHeads, T) (A)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);

            int headIdx = pos.y / ${m};
            int tIdx = pos.y % ${m};
            int bIdx = headIdx / ${h};
            headIdx = headIdx % ${h};

            vec3 a = texelFetch(qkvBias, ivec2(0, headIdx * ${x} + pos.x), 0).rgb;
            for (int i = 0; i < ${p}; i++) {
                float inVal = texelFetch(attnInput, ivec2(i, tIdx + bIdx * ${m}    ), 0).r;
                vec3 qkvW   = texelFetch(qkvWeight,  ivec2(i, headIdx * ${x} + pos.x), 0).rgb;
                a += inVal * qkvW;
            }

            qkvOutput = vec4(a, 1);
        }
    `),k=(0,u.createShaderProgram)(y,"selfAttend",d,`#version 300 es
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
    `),F=(0,u.createShaderProgram)(y,"attnMatrixAgg",d,`#version 300 es
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
    `),S=(0,u.createShaderProgram)(y,"attnMatrixSoftmax",d,`#version 300 es
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
    `),P=(0,u.createShaderProgram)(y,"scaledVectors",d,`#version 300 es
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

            int yOffset = bIdx * ${m} * ${h} + headIdx * ${m};

            float res = 0.0;
            for (int i = 0; i <= tIdxY; i++) {
                float sm = texelFetch(attnMatrixSoftmax, ivec2(i, yOffset + tIdxY), 0).r;
                float v = texelFetch(qkvOutput, ivec2(aIdx, yOffset + i), 0).b;
                res += sm * v;
            }

            scaledVectors = res;
        }
    `);if(!M||!k||!F||!S||!P)throw Error("Failed to create shader program");let V=l(r,M,[T],[o,_,w],["attnInput","qkvWeight","qkvBias"]),D=l(r,k,[B],[T],["qkvOutput"]),L=l(r,F,[E],[B],["attnMatrix"]),z=l(r,S,[R],[B,E],["attnMatrix","attnMatrixAgg"]),I=l(r,P,[A],[T,R],["qkvOutput","attnMatrixSoftmax"]),U=f(e,t+".c_proj",p,p,A),C=g(e,U.output,a);return{qkvWeight:_,qkvBias:w,qkvOutput:T,attnMatrix:B,attnMatrixAgg:E,attnMatrixSoftmax:R,scaledVectors:A,qkvPhase:V,selfAttendPhase:D,attnMatrixAggPhase:L,attnMatrixSoftmaxPhase:z,scaledVectorsPhase:I,proj:U,add:C,output:C.output}}(e,t+".attn",a.output,o),n=m(e,t+".ln_2",r.output),c=function(e,t,o,a){let{gl:r,shape:{B:n,T:s,C:c},shaderManager:m}=e,p=i(r,4*c,n*s,1),h=(0,u.createShaderProgram)(m,"mlpGelu",d,`#version 300 es
        precision highp float;
        uniform sampler2D geluInput;  // (B, T) (C * 4)
        out float geluOutput; // (B, T) (C * 4)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            float x = texelFetch(geluInput, pos, 0).r;
            geluOutput = x * 0.5 * (1.0 + tanh(sqrt(2.0 / 3.14159265358) * (x + 0.044715 * x * x * x)));
        }
    `),x=f(e,t+".c_fc",c,4*c,o),y=l(r,h,[p],[x.output],["geluInput"]),b=f(e,t+".c_proj",4*c,c,p),v=g(e,b.output,a);return{fcLayer:x,mlpGelu:p,geluPhase:y,projLayer:b,addLayer:v,output:v.output}}(e,t+".mlp",n.output,r.output);return{attn:r,ln_1:a,ln_2:n,mlp:c,output:c.output}}(_,a+".h."+e,F);k.push(t),F=t.output}let S=m(_,a+".ln_f",F),P=f(_,"lm_head",n,y,S.output,void 0,!1),V=function(e,t){let{gl:o,shape:{B:a,T:r,C:n,vocabSize:s},shaderManager:c}=e,m=i(o,1,a*r,2),f=i(o,s,a*r,1),p=(0,u.createShaderProgram)(c,"softmaxAgg",d,`#version 300 es
        precision highp float;       //    y      x
        uniform sampler2D smInput;   // (B, T) (nVocab)
        out vec2 smAgg;              // (B)    (nVocab) [2]

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            int tIdxY = pos.y % ${r};

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
    `),g=(0,u.createShaderProgram)(c,"softmax",d,`#version 300 es
        precision highp float;
        uniform sampler2D smInput;    // (B, T) (nVocab)
        uniform sampler2D smAgg;      // (B)    (nVocab) [2]
        out float smOutput;           // (B, T) (nVocab)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            int tIdxX = pos.x;
            int tIdxY = pos.y % ${r};

            vec2 agg = texelFetch(smAgg, ivec2(0, pos.y), 0).rg;
            float expSumInv = agg.r;
            float maxVal = agg.g;

            float p = texelFetch(smInput, pos, 0).r;
            smOutput = exp(p - maxVal) * expSumInv;
        }
    `),h=l(o,p,[m],[t],["smInput"]),x=l(o,g,[f],[t,m],["smInput","smAgg"]);return{bufs:[m,f],progs:[p,g],phases:[h,x],agg:m,aggPhase:h,softmaxPhase:x,output:f}}(_,P.output),D=function(e,t,o){let{gl:a,shape:{T:r,vocabSize:n},shaderManager:i}=e;return{copyPhase:l(a,(0,u.createShaderProgram)(i,"copy",d,`#version 300 es
        precision highp float;         //    y    x
        uniform sampler2D prevOutput;  // (B, T) (n_vocab)
        uniform int u_targetTIdx;
        out float currInput;           // (B, T) (1)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);

            int tIdx = pos.y % ${r};

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
    `),[o],[t],["prevOutput"])}}(_,V.output,T);return(0,u.ensureShadersReady)(e),{gl:o,inputBuf:w,inputTokens:T,vocabEmbed:R,posEmbed:A,add:M,blocks:k,ln_f:S,lm_head:P,shape:v,softmaxFinal:V,copyOutputToInput:D,output:V.output,inputLen:6,resultBuf:null,sortedBuf:null,readbackSync:null}}(t.ctx.shaderManager,o.model)),this.progState.native=e.dataAndModel.native,this.progState.wasmGptModel=function(e,t,o){let a=o.createModel(t);n("transformer.wte.weight",Z.Wte),n("transformer.wpe.weight",Z.Wpe),n("lm_head.weight",Z.LmHeadW),r("transformer.ln_f",Z.LnFGamma,Z.LnFBeta);for(let e=0;e<t.n_layer;e++){let t=`transformer.h.${e}`;r(t+".ln_1",Z.Ln1Gamma,Z.Ln1Beta,e),r(t+".ln_2",Z.Ln2Gamma,Z.Ln2Beta,e),r(t+".attn.c_attn",Z.AttnQkvW,Z.AttnQkvB,e),r(t+".attn.c_proj",Z.AttnProjW,Z.AttnProjB,e),r(t+".mlp.c_fc",Z.MlpW,Z.MlpB,e),r(t+".mlp.c_proj",Z.MlpProjW,Z.MlpProjB,e)}function r(e,t,o,a=0){n(e+".weight",t,a),n(e+".bias",o,a)}function n(t,r,l=0){e[t]?o.getModelTensor(a,r,l).copyFrom(e[t]):console.log("ERROR: missing tensor name:",t)}o.getModelTensor(a,Z.InputTokens).buffer.set([2,1,0,1,1,2,0,0,0,0,0]);{let e=performance.now();o.runModel(a),console.log("runModel",(performance.now()-e).toFixed(2)+"ms")}return{native:o,modelPtr:a,lastMemoryBuffer:null,weightsDirty:!0,intersDirty:!0}}(e.dataAndModel.model,e.dataAndModel.model.config,e.dataAndModel.native),this.progState.jsGptModel=(a=this.renderState.gl,n=(r=e.dataAndModel.model.config).n_embd,c=r.n_head,h=r.block_size,x=r.n_layer,y=r.vocab_size,v=n/c,w={gl:a,shape:_={B:1,C:n,nHeads:c,T:h,A:v,nBlocks:x,vocabSize:y}},T=i(a,1,+h,1),B=function(e){let{gl:t,shape:{B:o,T:a,vocabSize:r}}=e;return{agg:i(t,1,o*a,2),output:i(t,r,o*a,1)}}(w),{gl:a,add:ee(w),inputBuf:new Float32Array,inputLen:6,ln_f:ea(w),inputTokens:T,lm_head:eo(w,h,n,y),blocks:(0,b.makeArray)(x).map(()=>{var e;let t;return t=function(e){let{gl:t,shape:{B:o,T:a,C:r}}=e,n=ee(e);return{fcLayer:eo(e,a,r,4*r),mlpGelu:i(t,4*r,o*a,1),projLayer:eo(e,a,4*r,r),addLayer:n,output:n.output}}(e=w),{ln_1:ea(e),attn:function(e){var t,o;let{gl:a,shape:{B:r,T:n,C:l,nHeads:s,A:c}}=e,u=ee(e);return{qkvWeight:i(a,l,3*s*c,1),qkvBias:i(a,1,3*s*c,1),attnMatrix:(t=r*s*n,i(a,n,t,1)),attnMatrixAgg:i(a,1,r*s*n,2),attnMatrixSoftmax:(o=r*s*n,i(a,n,o,1)),qkvOutput:i(a,3*s*c,r*n,1),add:ee(e),proj:eo(e,n,l,l),scaledVectors:i(a,s*c,r*n,1),output:u.output}}(e),ln_2:ea(e),mlp:t,output:t.output}}),output:B.output,posEmbed:et(w,T,h),vocabEmbed:et(w,T,y),shape:_,softmaxFinal:B,resultBuf:null,sortedBuf:null})}this.markDirty()}prevTime;rafHandle;isDirty;isWaitingForSync;markDirty;loop;checkSyncObjects(){if(!this.progState.render)return;let e=this.renderState.gl,t=this.progState.render.syncObjects,o=!1;for(let a=0;a<t.length;a++){let r=t[a];if(r.isReady){o=!0;continue}e.clientWaitSync(r.sync,0,0)===e.TIMEOUT_EXPIRED?this.isWaitingForSync=!0:(r.isReady=!0,r.elapsedMs=performance.now()-r.startTime,e.deleteSync(r.sync),o=!0)}o&&(this.progState.render.syncObjects=t.filter(e=>!e.isReady),this.markDirty())}render(e,t){if(!this.progState.render)return;let o=this.renderState.canvasEl;if(this.canvasSizeDirty){let e=o.getBoundingClientRect(),t=window.devicePixelRatio;o.width=e.width*t,o.height=e.height*t,this.progState.render.size=new B.Vec3(e.width,e.height),this.canvasSizeDirty=!1}!function(e,t){var o;let a=performance.now();if(!t.render)return;for(let e of(o=t.render,(0,w.resetLineRender)(o.lineRender),(0,x.resetFontBuffers)(o.modelFontBuf),(0,T.resetTriRender)(o.triRender),t.render.sharedRender.activePhase=H.RenderPhase.Opaque,t.display.lines=[],t.display.hoverTarget=null,t.display.tokenColors=null,t.display.tokenIdxColors=null,t.wasmGptModel&&t.jsGptModel&&er(t.wasmGptModel,t.jsGptModel),t.stepModel&&t.wasmGptModel&&t.jsGptModel&&(t.stepModel=!1,!function(e,t){let{native:o,modelPtr:a}=e,{shape:{B:r,T:n,vocabSize:l}}=t,i=t.inputLen-1;if(!t.sortedBuf||i>=n-1)return;let s=o.getModelTensor(a,Z.InputTokens);for(let e=0;e<r;e++){let o=t.sortedBuf[e*n*l*2+i*l*2+0];s.buffer[e*n+i+1]=o}t.inputLen+=1,o.runModel(a),e.intersDirty=!0,er(e,t)}(t.wasmGptModel,t.jsGptModel)),t.layout=(0,q.genGptModelLayout)(t.shape,t.jsGptModel),t.layout.weightCount=27e9,t.conciseLayerView&&function(e){let t=e.blocks[0];if(!t)return;for(let t of e.cubes)t.opacity=0,t.highlight=0;let o=t.heads[0]?.qWeightBlock??t.projWeight;for(let[e,a,r,n,l]of[[t.ln1.lnResid,-42,0,34,18],[o,12,0,52,18],[t.attnResidual,-15,48,52,18],[t.ln2.lnResid,-42,98,34,18],[t.mlpAct,12,98,52,18],[t.mlpResidual,-15,146,52,18]])e.x=a,e.y=r,e.z=-4,e.dx=n,e.dy=l,e.dz=8,e.cx=8,e.cy=6,e.cz=2,e.opacity=1;e.height=176}(t.layout),t.examples))if(e.enabled&&!e.layout){let t=(0,q.genGptModelLayout)(e.shape,null,e.offset);e.layout=t}(0,_.genModelViewMatrices)(t,t.layout);let r=function(e,t){if(!e.ctx.ext.disjointTimerQuery)return null;let o=e.queries.get(t);if(!o){let a=e.ctx.gl.createQuery();e.queries.set(t,o={query:a,hasRun:!1,hasStarted:!1})}let a=!1;o.hasRun&&(a=e.ctx.gl.getQueryParameter(o.query,e.ctx.gl.QUERY_RESULT_AVAILABLE));let r=null;return a&&(r=e.ctx.gl.getQueryParameter(o.query,e.ctx.gl.QUERY_RESULT)/1e6),(!o.hasRun||a)&&(e.ctx.gl.beginQuery(e.TIME_ELAPSED_EXT,o.query),o.hasRun=!0,o.hasStarted=!0),r}(t.render.queryManager,"render");for(let o of((0,b.isNotNil)(r)&&(t.render.lastGpuMs=r),t.render.renderTiming=!1,t.inWalkthrough&&(0,Q.runWalkthrough)(t,e),(0,_.updateCamera)(t,e),!function(e){for(let t of e.layout.cubes){let o=new B.Vec3(t.x+t.dx/2,t.y,t.z+t.dz/2),a=(0,_.camScaleToScreen)(e,o);a=Math.min(a,1.45);let r=new B.Vec4(1,1,1,1).mul(t.opacity),n=new B.Vec4(0,0,0,1).mul(t.opacity);if(0===t.opacity||!t.name)continue;let l=t.name,i=R.Mat4f.fromTranslation(o),s={color:r,size:2.5*a,mtx:i},c=(0,x.measureText)(e.render.modelFontBuf,l,s);e.render.sharedRender.activePhase=H.RenderPhase.Opaque,(0,J.drawRoundedRect)(e.render,new B.Vec3(-c/2-.4,-s.size-.8,0),new B.Vec3(c/2+.4,0,0),n,i,.4*a),e.render.sharedRender.activePhase=H.RenderPhase.Overlay,(0,x.drawText)(e.render.modelFontBuf,l,-c/2,-s.size-.4,s)}}(t),t.conciseLayerView?!function(e){let t=e.layout.blocks[0];if(!t)return;let o=t.heads[0]?.qWeightBlock??t.projWeight,a=t.ln1.lnResid,r=t.attnResidual,n=t.ln2.lnResid,l=t.mlpAct,i=t.mlpResidual,s=B.Vec4.fromHexColor("#8ed19b"),c=B.Vec4.fromHexColor("#9190ec"),u=B.Vec4.fromHexColor("#7b8170"),d=new B.Vec3(0,0,1),m=(t,o,a,r=2.4)=>(0,w.addLine)(e.render.lineRender,r,a,t,o,d);m(new B.Vec3(a.x+a.dx,a.y+a.dy/2,7),new B.Vec3(o.x,o.y+o.dy/2,7),c),m(new B.Vec3(o.x+o.dx/2,o.y+o.dy,7),new B.Vec3(r.x+r.dx/2,r.y,7),s),m(new B.Vec3(a.x+a.dx/2,a.y+a.dy,7),new B.Vec3(-66,a.y+a.dy,7),u,1.8),m(new B.Vec3(-66,a.y+a.dy,7),new B.Vec3(-66,r.y+r.dy/2,7),u,1.8),m(new B.Vec3(-66,r.y+r.dy/2,7),new B.Vec3(r.x,r.y+r.dy/2,7),u,1.8),m(new B.Vec3(r.x+r.dx/2,r.y+r.dy,7),new B.Vec3(n.x+n.dx/2,n.y,7),s),m(new B.Vec3(n.x+n.dx,n.y+n.dy/2,7),new B.Vec3(l.x,l.y+l.dy/2,7),c),m(new B.Vec3(l.x+l.dx/2,l.y+l.dy,7),new B.Vec3(i.x+i.dx/2,i.y,7),s),m(new B.Vec3(r.x+r.dx/2,r.y+r.dy,7),new B.Vec3(-66,r.y+r.dy,7),u,1.8),m(new B.Vec3(-66,r.y+r.dy,7),new B.Vec3(-66,i.y+i.dy/2,7),u,1.8),m(new B.Vec3(-66,i.y+i.dy/2,7),new B.Vec3(i.x,i.y+i.dy/2,7),u,1.8)}(t):(!function(e,t){let o=t.residual0,a=B.Vec4.fromHexColor("#3333aa"),r=B.Vec4.fromHexColor("#33aa33");l(t.idxObj,t.residual0),i(t.tokEmbedObj,t.residual0),d(t.posEmbedObj,0,t.residual0,1);for(let e=0;e<Math.min(3,t.blocks.length);e++){let a=t.blocks[e];for(let e of(l(o,a.attnResidual),c(o,a.ln1.lnResid),c(o,a.ln1.lnAgg2,2),l(a.ln1.lnAgg2,a.ln1.lnResid,2),a.heads))d(a.ln1.lnResid,0,e.qBlock,1),d(a.ln1.lnResid,0,e.kBlock,1),d(a.ln1.lnResid,0,e.vBlock,1),i(e.qBiasBlock,e.qWeightBlock),i(e.kBiasBlock,e.kWeightBlock),i(e.vBiasBlock,e.vWeightBlock),i(e.qWeightBlock,e.qBlock),i(e.kWeightBlock,e.kBlock),i(e.vWeightBlock,e.vBlock),u(e.qBlock,e.attnMtx,0,void 0,e.qBlock.y!==e.kBlock.y),u(e.kBlock,e.attnMtx,0,void 0,e.kBlock.y!==e.qBlock.y),u(e.vBlock,e.vOutBlock,0,void 0,e.vBlock.y!==e.kBlock.y),d(e.attnMtx,0,e.attnMtxAgg2,1),d(e.attnMtxAgg1,0,e.attnMtxSm,1),d(e.attnMtxSm,3,e.vOutBlock,0),d(e.vOutBlock,3,a.attnOut,2);l(a.attnResidual,a.mlpResidual),i(a.attnOut,a.attnResidual),i(a.projBias,a.projWeight),i(a.projWeight,a.attnOut),i(a.ln1.lnMu,a.ln1.lnSigma),i(a.ln1.lnSigma,a.ln1.lnResid),c(a.attnResidual,a.ln2.lnAgg2,2),l(a.ln2.lnAgg2,a.ln2.lnResid,2),i(a.ln2.lnMu,a.ln2.lnSigma),i(a.ln2.lnSigma,a.ln2.lnResid),c(a.attnResidual,a.ln2.lnResid),d(a.ln2.lnResid,3,a.mlpFc,1),l(a.mlpFcBias,a.mlpFcWeight),l(a.mlpFcWeight,a.mlpFc,12),l(a.mlpFc,a.mlpAct,12),i(a.mlpProjBias,a.mlpProjWeight),i(a.mlpProjWeight,a.mlpResult),i(a.mlpResult,a.mlpResidual),d(a.mlpAct,1,a.mlpResult,2),o=a.mlpResidual}function n(e){return"w"===e.t?a:r}function l(e,t,o=6){d(e,3,t,2,o)}function i(e,t,o=6){d(e,1,t,0,o)}function s(e,t){let o=e.z+e.dz/2;switch(t){case 0:return new B.Vec3(e.x-2,e.y+e.dy/2,o);case 1:return new B.Vec3(e.x+e.dx+2,e.y+e.dy/2,o);case 2:return new B.Vec3(e.x+e.dx/2,e.y-2,o);case 3:return new B.Vec3(e.x+e.dx/2,e.y+e.dy+2,o)}}function c(t,o,a=6){let r=s(t,3),l=s(o,1),i=Math.min(t.opacity,o.opacity);if(0===i)return;let u=new B.Vec3(0,0,1),d=n(t).mul(i);M(e,new B.Vec3(r.x-3,l.y),l,a,u,d,!0)}function u(o,a,r,l=6,i=!1){let c=s(o,3),d=c.z>a.z+a.dz/2,m=new B.Vec3(a.x+a.dx/2,a.y+t.cell*(r+.5),d?a.z+a.dz/2+2:a.z-2),f=Math.min(o.opacity,a.opacity);if(0===f)return;let p=new B.Vec3(0,0,1),g=n(o).mul(f),h=new B.Vec3(0,0,d?-1:1);1>Math.abs(c.z-(a.z+a.dz/2))&&!i&&(h=void 0,m=s(a,2)),M(e,c,m,l,p,g,!0,0,h)}function d(t,o,a,r,l=6){let i=s(t,o),c=s(a,r),u=Math.min(t.opacity,a.opacity);if(0===u)return;let m=new B.Vec3(0,0,1),f=n(t).mul(u);if(0===o&&1===r&&(i.y=c.y),1===o&&2===r){let t=new B.Vec3(c.x-l/2,i.y,i.z),o=new B.Vec3(c.x,i.y+l/2,c.z);M(e,i,t,l,m,f,!1),M(e,o,c,l,m,f,!0,1)}else if(3===o&&1===r){let t=new B.Vec3(i.x,c.y-l/2,c.z),o=new B.Vec3(i.x-l/2,c.y,c.z);M(e,i,t,l,m,f,!1),M(e,o,c,l,m,f,!0,1)}else if(3===o&&0===r){let t=new B.Vec3(i.x,c.y-l/2,c.z),o=new B.Vec3(i.x+l/2,c.y,c.z);M(e,i,t,l,m,f,!1,0,new B.Vec3(0,1,0)),M(e,o,c,l,m,f,!0,2)}else M(e,i,c,l,m,f,!0)}c(o,t.ln_f.lnAgg2,2),d(o,3,t.ln_f.lnResid,1),l(t.ln_f.lnAgg2,t.ln_f.lnResid),i(t.ln_f.lnMu,t.ln_f.lnSigma),i(t.ln_f.lnSigma,t.ln_f.lnResid),t.logitsTransposed?(d(t.ln_f.lnResid,3,t.logits,1),l(t.lmHeadWeight,t.logits),l(t.logits,t.logitsSoftmax),i(t.logits,t.logitsAgg1,2),d(t.logitsAgg2,3,t.logitsSoftmax,1,2)):(l(t.ln_f.lnResid,t.logits),i(t.lmHeadWeight,t.logits),l(t.logits,t.logitsAgg2),l(t.logitsAgg1,t.logitsSoftmax))}(t.render,t.layout),(0,X.drawModelCard)(t,t.layout,"Qwen3.8-27B",new B.Vec3)),t.examples))o.enabled&&o.layout&&(0,X.drawModelCard)(t,o.layout,o.name,o.offset.add(o.modelCardOffset));(0,K.runMouseHitTesting)(t),t.render.sharedRender.activePhase=H.RenderPhase.Opaque,function(e,t){let o=new B.Vec4(.4,.4,.4,1);{let a=o.mul(t.embedLabel.visible);N(e,"Embedding",new B.Vec3(t.tokEmbedObj.x-2*t.margin,t.tokEmbedObj.y,0),new B.Vec3(t.tokEmbedObj.x-2*t.margin,t.tokEmbedObj.y+t.tokEmbedObj.dy,0),{color:a,fontSize:6,pad:4})}let a=0;for(let r of t.blocks){let n=r.ln1.lnResid.y-t.margin/2,l=r.mlpResult.y+r.mlpResult.dy+t.margin/2,i=r.mlpProjBias.x-3*t.margin,s=r.projBias.x-t.margin,c=s-3*t.margin,u=(0,G.lerp)(s,i,.6),d=r.attnOut.y-t.margin/2,m=r.attnOut.y+r.attnOut.dy+t.margin/2,f=r.mlpFcBias.y-t.margin/2,p=i-6*t.margin;{let t=o.mul(r.mlpResidual.opacity*r.transformerLabel.visible);N(e,`Transformer ${a}`,new B.Vec3(p,n,0),new B.Vec3(p,l,0),{color:t,fontSize:26})}{let t=o.mul(r.attnResidual.opacity*r.selfAttendLabel.visible);N(e,"Self-attention",new B.Vec3(u,n,0),new B.Vec3(u,m,0),{color:t,fontSize:12})}{let t=o.mul(r.mlpAct.opacity*r.mlpLabel.visible);N(e,"MLP",new B.Vec3(i,f,0),new B.Vec3(i,l,0),{color:t,fontSize:12})}{let t=o.mul(r.attnOut.opacity*r.projLabel.visible);N(e,"Projection",new B.Vec3(c,d,0),new B.Vec3(c,m,0),{color:t,fontSize:10})}let g=0;for(let t of r.heads){{let a=o.mul(t.attnMtx.opacity*t.headLabel.visible),r=new B.Vec3(c,t.vBlock.y,t.vBlock.z+t.vBlock.dz/2),n=new B.Vec3(c,t.qBlock.y+t.qBlock.dy,t.qBlock.z+t.qBlock.dz/2);t.qBlock.y!==t.vBlock.y&&(r=new B.Vec3(c,t.vBlock.y,t.vOutBlock.z+t.vOutBlock.dz/2),n=new B.Vec3(c,t.vOutBlock.y+t.vOutBlock.dy,t.vOutBlock.z+t.vOutBlock.dz/2)),N(e,`Head ${g}`,r,n,{color:a,fontSize:10})}{let a=o.mul(t.qBlock.opacity*t.qLabel.visible);N(e,"Q",new B.Vec3(s,t.qBlock.y,t.qBlock.z+t.qBlock.dz/2),new B.Vec3(s,t.qBlock.y+t.qBlock.dy,t.qBlock.z+t.qBlock.dz/2),{color:a,fontSize:6,pad:4})}{let a=o.mul(t.kBlock.opacity*t.kLabel.visible);N(e,"K",new B.Vec3(s,t.kBlock.y,t.kBlock.z+t.kBlock.dz/2),new B.Vec3(s,t.kBlock.y+t.kBlock.dy,t.kBlock.z+t.kBlock.dz/2),{color:a,fontSize:6,pad:4})}{let a=o.mul(t.vBlock.opacity*t.vLabel.visible);N(e,"V",new B.Vec3(s,t.vBlock.y,t.vBlock.z+t.vBlock.dz/2),new B.Vec3(s,t.vBlock.y+t.vBlock.dy,t.vBlock.z+t.vBlock.dz/2),{color:a,fontSize:6,pad:4})}g++}a++}}(t.render,t.layout);let n=1,l=t.render.size.x;for(let e of(t.render.sharedRender.activePhase=H.RenderPhase.Overlay2D,t.display.lines)){let o={color:new B.Vec4,size:14},a=(0,x.measureText)(t.render.modelFontBuf,e,o);(0,x.drawText)(t.render.modelFontBuf,e,l-a-4,n*o.size*1.3+4,o),n++}!function(e){let{layout:t,render:o,camera:a}=e,{gl:r,blockRender:n,size:l}=o,{modelMtx:i,viewMtx:s}=a,{camPos:c}=(0,_.cameraToMatrixView)(a),d=[new B.Vec3(100,400,600),new B.Vec3(-200,-300,-300),new B.Vec3(200,-100,0)],m=[new B.Vec3(1,.2,.2),new B.Vec3(1,.2,.2),new B.Vec3(1,.2,.2)],f=new Float32Array(9),p=new Float32Array(9);for(let e=0;e<3;e++)i.mulVec3Proj(d[e]).writeToBuf(f,3*e),i.mulVec3Proj(m[e]).writeToBuf(p,3*e);if(r.bindFramebuffer(r.FRAMEBUFFER,null),r.viewport(0,0,l.x,l.y),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT|r.DEPTH_BUFFER_BIT),r.enable(r.BLEND),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.enable(r.DEPTH_TEST),r.enable(r.CULL_FACE),r.cullFace(r.FRONT),r.frontFace(r.CW),o.renderTiming){let e=`GPU: ${o.lastGpuMs.toFixed(1)}ms JS: ${o.lastJsMs.toFixed(1)}ms`,t=l.x;o.sharedRender.activePhase=H.RenderPhase.Overlay2D;let a=(0,x.measureTextWidth)(o.modelFontBuf,e,14);(0,x.writeTextToBuffer)(o.modelFontBuf,e,new B.Vec4(0,0,0,1),t-a-4,4,14,new R.Mat4f)}(0,H.writeModelViewUbo)(o.sharedRender,i,s);{var g;let e,a,r,l,i,s=t.cubes.filter(e=>e.highlight>0);!function(e){let t=e.gl,o=t.canvas.width,a=t.canvas.height,r=Math.floor(o*e.blurFactor),n=Math.floor(a*e.blurFactor);if(e.currViewSize.x!==o||e.currViewSize.y!==a){for(let o of(t.bindTexture(t.TEXTURE_2D,e.initialTex),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,r,n,0,t.RGBA,t.UNSIGNED_BYTE,null),e.blurFbos))t.bindTexture(t.TEXTURE_2D,o.tex),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,r,n,0,t.RGBA,t.UNSIGNED_BYTE,null);e.currViewSize=new B.Vec3(o,a)}t.bindFramebuffer(t.FRAMEBUFFER,e.initialFbo),t.viewport(0,0,r,n),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT)}(o.blurRender),function(e,t){let o=e.gl;if(!e.simpleShader.ready)return;let a=e.simpleShader.locs,r=e.cubeGeom;for(let n of(o.useProgram(e.simpleShader.program),o.bindVertexArray(r.vao),t)){o.uniform3f(a.u_size,n.dx,n.dy,n.dz),o.uniform3f(a.u_offset,n.x,n.y,n.z);let e=("w"===n.t?new B.Vec4(.3,.3,1,1):new B.Vec4(.4,.8,.4,1)).mul(n.highlight);o.uniform4f(a.u_baseColor,e.x,e.y,e.z,e.w),o.drawArrays(r.type,0,r.numVerts)}}(n,s),a=(e=(g=o.blurRender).gl).canvas.width,r=e.canvas.height,l=Math.floor(a*g.blurFactor),i=Math.floor(r*g.blurFactor),e.bindVertexArray(g.quadVao),e.disable(e.DEPTH_TEST),e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.STENCIL_TEST),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,g.initialTex),e.bindFramebuffer(e.FRAMEBUFFER,g.blurFbos[0].fbo),e.viewport(0,0,l,i),e.useProgram(g.horizShader.program),e.uniform1i(g.horizShader.locs.u_texture,0),e.drawArrays(e.TRIANGLE_FAN,0,4),e.bindTexture(e.TEXTURE_2D,g.blurFbos[0].tex),e.bindFramebuffer(e.FRAMEBUFFER,g.blurFbos[1].fbo),e.viewport(0,0,l,i),e.useProgram(g.vertShader.program),e.uniform1i(g.vertShader.locs.u_texture,0),e.drawArrays(e.TRIANGLE_FAN,0,4),e.enable(e.BLEND),e.viewport(0,0,a,r),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindTexture(e.TEXTURE_2D,g.blurFbos[1].tex),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,g.initialTex),e.useProgram(g.overlayShader.program),e.uniform1i(g.overlayShader.locs.u_texture,0),e.drawArrays(e.TRIANGLE_FAN,0,4)}for(let l of(r.enable(r.DEPTH_TEST),(0,w.uploadAllLines)(o.lineRender),(0,T.uploadAllTris)(o.triRender),(0,x.uploadAllText)(o.modelFontBuf),!function(e,t,o,a){let r=e.gl,n=e.shader.locs,l=e.cubeGeom;if(!e.shader.ready)return;r.useProgram(e.shader.program);let i=o.mulVec3Proj(a);r.uniform3f(n.u_camPos,i.x,i.y,i.z),r.uniform1i(n.u_accessSampler,0),r.enable(r.BLEND),r.enable(r.CULL_FACE),r.activeTexture(r.TEXTURE0),r.bindVertexArray(l.vao);let s=[],c=[];t.cubes.forEach(function e(t){t.subs?t.subs.forEach(e):t.opacity<.8&&t.opacity>0?c.push(t):t.opacity>0&&s.push(t)});let d=[...s,...c],m=s.length,f=e.blockUbo.localBufs[0],p=e.blockAccessUbo.localBufs[0];{(0,u.resetFloatBufferMap)(e.blockUbo),(0,u.ensureFloatBufferSize)(f,d.length);let t=f.buf;for(let e of d){let o=f.usedEls*f.strideFloats;t[o+0]=e.x,t[o+1]=e.y,t[o+2]=e.z,t[o+4]=e.dx,t[o+5]=e.dy,t[o+6]=e.dz,t[o+8]=e.cx,t[o+9]=e.cy,t[o+10]=e.cz,t.set(e.localMtx??new R.Mat4f,o+12);let a="w"===e.t?$.Colors.Weights:"i"===e.t?$.Colors.Intermediates:$.Colors.Aggregates;new B.Vec4(a.x,a.y,a.z,e.opacity).writeToBuf(t,o+28),t[o+32]=e.highlight,f.usedEls+=1}(0,u.uploadFloatBuffer)(r,e.blockUbo)}{(0,u.resetFloatBufferMap)(e.blockAccessUbo),(0,u.ensureFloatBufferSize)(p,d.length);let t=p.buf;for(let e of d){let o=p.usedEls*p.strideFloats;if(e.access&&!0!==e.access.disable){t.set(e.access.mat.slice(0,8),o);let a=e.access.channel;t[o+8]="r"===a?0:"g"===a?1:"b"===a?2:3,t[o+9]=e.access.scale}else t[o+9]=0;p.usedEls+=1}(0,u.uploadFloatBuffer)(r,e.blockAccessUbo)}let g=!0,h=0;for(let t of d){h===m&&r.depthMask(!1),r.bindBufferRange(r.UNIFORM_BUFFER,H.UboBindings.Block,e.blockUbo.buf,h*f.strideBytes,f.strideBytes);let o=!!t.access&&!0!==t.access.disable;(g||o)&&(r.bindBufferRange(r.UNIFORM_BUFFER,H.UboBindings.BlockAccess,e.blockAccessUbo.buf,h*p.strideBytes,p.strideBytes),r.bindTexture(r.TEXTURE_2D,o&&t.access?t.access.src.texture:e.dummyTexture),g=o),r.drawArrays(l.type,0,l.numVerts),h++}r.depthMask(!0)}(n,t,i,c),o.sharedRender.activePhase=H.RenderPhase.Opaque,e.examples))if(l.enabled&&l.layout){let{modelMtx:e,viewMtx:t}=a,{camPos:r}=(0,_.cameraToMatrixView)(a);var h=e.mul(R.Mat4f.fromTranslation(l.offset));(0,H.writeModelViewUbo)(o.sharedRender,h,t),function(e,t,o,a){if(!e.instancedShader.ready)return;let r=e.gl,n=e.instancedShader.locs,l=e.blockAccessUbo.localBufs[0];r.useProgram(e.instancedShader.program);let i=o.invert().mulVec3Proj(a);if(r.uniform3f(n.u_camPos,i.x,i.y,i.z),r.uniform1i(n.u_accessSampler,0),r.enable(r.BLEND),r.enable(r.CULL_FACE),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,e.dummyTexture),r.bindVertexArray(e.instancedVao),e.instancedDataStale){e.instancedDataStale=!1;{(0,u.resetFloatBufferMap)(e.instancedFloatBuf);let o=e.instancedFloatBuf.localBufs[0];(0,u.ensureFloatBufferSize)(o,t.cubes.length);let a=o.buf;for(let e of t.cubes){if(e.small)continue;let t=o.usedEls*o.strideFloats;a[t+0]=e.x,a[t+1]=e.y,a[t+2]=e.z,a[t+4]=e.dx,a[t+5]=e.dy,a[t+6]=e.dz,a[t+8]=e.cx,a[t+9]=e.cy,a[t+10]=e.cz,a.set(e.localMtx??new R.Mat4f,t+12);let r="w"===e.t?$.Colors.Weights:"i"===e.t?$.Colors.Intermediates:$.Colors.Aggregates;new B.Vec4(r.x,r.y,r.z,e.opacity).writeToBuf(a,t+28),a[t+32]=e.highlight,o.usedEls+=1}(0,u.uploadFloatBuffer)(r,e.instancedFloatBuf),e.instancedNumBlocks=o.usedEls}(0,u.resetFloatBufferMap)(e.blockAccessUbo),(0,u.ensureFloatBufferSize)(l,1),l.buf[9]=0,l.usedEls+=1,(0,u.uploadFloatBuffer)(r,e.blockAccessUbo)}r.bindBufferRange(r.UNIFORM_BUFFER,H.UboBindings.BlockAccess,e.blockAccessUbo.buf,0,l.strideBytes),r.drawArraysInstanced(e.cubeGeom.type,0,e.cubeGeom.numVerts,e.instancedNumBlocks),r.depthMask(!0)}(l.blockRender,l.layout,h,r)}for(let e of((0,H.writeModelViewUbo)(o.sharedRender,i,s),(0,Y.renderAllThreads)(o.threadRender),r.polygonOffset(-1,-2),[H.RenderPhase.Opaque,H.RenderPhase.Arrows,H.RenderPhase.Overlay,H.RenderPhase.Overlay2D])){if(e===H.RenderPhase.Overlay2D){let e=l.x,t=l.y;r.clear(r.DEPTH_BUFFER_BIT),(0,H.writeModelViewUbo)(o.sharedRender,new R.Mat4f,R.Mat4f.fromOrtho(0,e,t,0,-1,1))}e===H.RenderPhase.Overlay||e===H.RenderPhase.Overlay2D?r.enable(r.POLYGON_OFFSET_FILL):r.disable(r.POLYGON_OFFSET_FILL),(0,T.renderAllTris)(o.triRender,e),(0,x.renderAllText)(o.modelFontBuf,e),(0,w.renderAllLines)(o.lineRender,e)}r.disable(r.POLYGON_OFFSET_FILL)}(t),function(e,t){if(!e.ctx.ext.disjointTimerQuery)return;let o=e.queries.get(t);o&&o.hasRun&&o.hasStarted&&(e.ctx.gl.endQuery(e.TIME_ELAPSED_EXT),o.hasStarted=!1)}(t.render.queryManager,"render"),t.render.gl.flush(),t.render.lastJsMs=performance.now()-a}({time:e,dt:t,markDirty:this.markDirty},this.progState),this.progState.htmlSubs.notify()}}e.s(["LayerView",0,function(){let[e,t]=(0,r.useState)(null),[o,n]=(0,r.useState)(null),[l,i]=(0,r.useState)(null),[s,c]=(0,r.useState)(null),[u,d]=(0,r.useState)(""),m=(0,ec.useScreenLayout)(),f=(0,r.useContext)(ed.KeyboardManagerContext);(0,ed.useGlobalKeyboard)(ed.KeyboardOrder.MainPage,e=>{if(!l?.progState)return;let t=e.key.toLowerCase(),o=l.progState.walkthrough,a=l.progState.movement;" "===e.key&&(o.time>=o.phaseLength?((0,eu.jumpPhase)(o,1),o.time=0):o.running=!o.running,l.markDirty()),("Backspace"===e.key||"Delete"===e.key)&&(o.running=!1,o.time=0,l.markDirty()),("ArrowLeft"===e.key||"a"===t)&&(a.action=es.Left,l.markDirty()),("ArrowRight"===e.key||"d"===t)&&(a.action=es.Right,l.markDirty()),("ArrowUp"===e.key||"w"===t)&&(a.action=es.Up,l.markDirty()),("ArrowDown"===e.key||"s"===t)&&(a.action=es.Down,l.markDirty()),("PageUp"===e.key||"q"===t)&&(a.action=es.In,l.markDirty()),("PageDown"===e.key||"e"===t)&&(a.action=es.Out,l.markDirty()),"r"===t&&(a.action=es.Expand,l.markDirty()),"f"===t&&(a.action=es.Focus,l.markDirty())," "===e.key&&e.preventDefault()}),(0,r.useEffect)(()=>(document.addEventListener("keydown",f.handleKey),()=>{document.removeEventListener("keydown",f.handleKey)}),[f]),(0,r.useEffect)(()=>{},[]),(0,r.useEffect)(()=>{let e=!1;return async function(){let t=await (0,x.fetchFontAtlasData)();e||c(t)}(),()=>{e=!0}},[]),(0,r.useEffect)(()=>{if(e&&s){let t=new em(e,null,s),o=new ResizeObserver(()=>{t.canvasSizeDirty=!0,t.markDirty()}),a=e=>e.preventDefault();return i(t),o.observe(e),e.addEventListener("wheel",a,{passive:!1}),()=>{e.removeEventListener("wheel",a),t.destroy(),o.disconnect()}}i(null)},[e,s]),(0,r.useEffect)(()=>{l?.setData({dataAndModel:o})},[l,o]),(0,r.useEffect)(()=>{if(l)return window.addEventListener("message",e),()=>window.removeEventListener("message",e);function e(e){if(e.origin!==window.location.origin||e.data?.type!=="qwen-focus"||"string"!=typeof e.data.target)return;let t=l.focusSection(e.data.target);t&&d(t)}},[l]),(0,r.useLayoutEffect)(()=>{l&&(l.progState.pageLayout=m,l.markDirty())},[l,m]),l&&(h.default.sidebar,v.ProgramStateContext.Provider,l.progState,v.WalkthroughSidebar);let p=(0,a.jsxs)("div",{className:h.default.canvasWrap,children:[(0,a.jsx)("canvas",{className:h.default.canvas,ref:t}),l&&!l.progState.render&&(0,a.jsxs)("div",{className:"absolute flex flex-col items-center w-full h-full justify-center",children:[(0,a.jsx)("div",{className:"text-2xl",children:"This application requires a WebGL2 capable browser."}),(0,a.jsx)("div",{className:"text-lg mt-2",children:"Please try the latest version of Chrome or Firefox."})]}),l&&(0,a.jsx)(v.ProgramStateContext.Provider,{value:l.progState,children:(0,a.jsx)(ei,{})}),u&&(0,a.jsx)("div",{className:h.default.focusTag,children:u})]});return(0,a.jsx)("div",{className:h.default.view,children:p})}],69454)},163,e=>{e.v({arrow:"MovementControls-module-scss-module__bRvSgq__arrow",control:"MovementControls-module-scss-module__bRvSgq__control",controls:"MovementControls-module-scss-module__bRvSgq__controls"})}]);

//# sourceMappingURL=0ca1nj8t5sswm.js.map