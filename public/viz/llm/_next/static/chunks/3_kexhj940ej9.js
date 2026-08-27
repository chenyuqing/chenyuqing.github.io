(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,555,e=>{e.v({canvas:"LayerView-module-scss-module__TtS2oW__canvas",canvasEventSurface:"LayerView-module-scss-module__TtS2oW__canvasEventSurface",canvasWrap:"LayerView-module-scss-module__TtS2oW__canvasWrap",sidebar:"LayerView-module-scss-module__TtS2oW__sidebar",view:"LayerView-module-scss-module__TtS2oW__view"})},69454,e=>{"use strict";var t,o,r=e.i(43476),a=e.i(71645);function n(e){return null!=e}function l(e,t,o,r,a){if(a&&a.length!==r.length)throw Error(`Number of texture names (${a.length}) does not match number of src textures (${r.length})`);let n=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,n);for(let t=0;t<o.length;t++)e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,o[t].texture,0);e.drawBuffers(o.map((t,o)=>e.COLOR_ATTACHMENT0+o));let l=e.checkFramebufferStatus(e.FRAMEBUFFER);return l!==e.FRAMEBUFFER_COMPLETE&&console.log("createRenderPhase: framebuffer not complete: "+l),{destBuffers:o,srcBuffers:r,fbo:n,program:t,uniformNames:a,uniformsSet:!1}}function i(e,t,o,r){let a=e.createTexture();e.bindTexture(e.TEXTURE_2D,a);let[n,l]=c(e,r);return e.texImage2D(e.TEXTURE_2D,0,l,t,o,0,n,e.FLOAT,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),{width:t,height:o,texture:a,channels:r}}function s(e,t,o){if(o.length!==t.width*t.height*t.channels)throw Error("Data length does not match buffer size");e.bindTexture(e.TEXTURE_2D,t.texture);let[r]=c(e,t.channels);e.texSubImage2D(e.TEXTURE_2D,0,0,0,t.width,t.height,r,e.FLOAT,o)}function c(e,t){switch(t){case 1:return[e.RED,e.R32F];case 2:return[e.RG,e.RG32F];case 3:return[e.RGB,e.RGB32F];case 4:return[e.RGBA,e.RGBA32F];default:throw Error(`Invalid number of channels: ${t}. Must be 1, 2, 3, or 4.`)}}var u=e.i(36748);let d=`#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`;function m(e,t,o){let{gl:r,model:a,shape:{B:n,T:c,C:m},shaderManager:f}=e,p=a[t+".weight"],h=a[t+".bias"],g=i(r,1,m,1),x=i(r,1,m,1),v=i(r,1,n*c,2),b=i(r,m,n*c,1);s(r,g,p.toFloat32Array()),s(r,x,h.toFloat32Array());let y=(0,u.createShaderProgram)(f,"normAgg",d,`#version 300 es
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
    `),T=l(r,y,[v],[o],["normInput"]),B=l(r,_,[b],[o,v,g,x],["normInput","normAgg","normWeight","normBias"]);return{normAgg:v,normWeight:g,normBias:x,aggPhase:T,applyPhase:B,output:b}}function f(e,t,o,r,a,c,m){let{gl:f,model:p,shape:{B:h,T:g},shaderManager:x}=e;m=m??!0;let v=p[t+".weight"],b=m?p[t+".bias"]:null,y=i(f,o,r,1),_=m?i(f,1,r,1):null,T=i(f,r,h*g,1);s(f,y,v.buffer),b&&_&&s(f,_,b.buffer);let B=l(f,(0,u.createShaderProgram)(x,"linear",d,`#version 300 es
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
    `),[T],[a,y,_,c].filter(n),["linearInput","linearWeight",m?"linearBias":null,c?"linearResidual":null].filter(n));return{weight:y,bias:_,linearPhase:B,output:T}}function p(e,t,o,r,a){let{gl:n,model:c,shape:{B:m,T:f},shaderManager:p}=e,h=c[t+".weight"],g=i(n,r,o,1),x=i(n,r,m*f,1);s(n,g,h.buffer);let v=l(n,(0,u.createShaderProgram)(p,"embed",d,`#version 300 es
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
    `),[x],[a,g],["embedInput","embedWeight"]);return{weight:g,phase:v,output:x}}function h(e,t,o){let{gl:r,shape:{B:a,T:n,C:s},shaderManager:c}=e,m=i(r,s,a*n,1);return{addPhase:l(r,(0,u.createShaderProgram)(c,"add",d,`#version 300 es
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
    `),[m],[t,o],["inputA","inputB"]),output:m}}var g=e.i(555),x=e.i(5741),v=e.i(92921),b=e.i(51523),y=e.i(51164),_=e.i(83891),T=e.i(76926),B=e.i(75076),w=e.i(6461);let E=new Float32Array(3072);var A=e.i(40029);let R=new Float32Array(12);function F(e,t,o,r,a,n,l=!0,i=0,s){var c,u,d,m;let f=o.sub(t);f.z=0,f=f.normalize();let p=o.sub(t).len(),h=l?Math.min(.7*p,3):0,g=new A.Mat4f,x=w.Vec3.cross(f,a).mul(-1).normalize();a=w.Vec3.cross(x,f).normalize(),g[0]=x.x,g[1]=x.y,g[2]=x.z,g[4]=f.x,g[5]=f.y,g[6]=f.z,g[8]=a.x,g[9]=a.y,g[10]=a.z,t=g.mulVec3Proj(t),o=g.mulVec3Proj(o);let v={width:r,borderColor:n.mul(.8),ribbonColor:n.mul(.3),headDepth:h,headExtra:3,lineThick:1.2,mtx:g};s=s?g.mulVec3ProjVec(s):void 0,Math.abs(t.z-o.z)>.01||s?function(){let r=Math.max(h,Math.abs(t.y-o.y-h)/2),a=new w.Vec3(t.x,t.y,t.z),n=new w.Vec3(t.x,t.y+r,t.z),i=new w.Vec3(o.x,o.y-h-r,o.z),c=new w.Vec3(o.x,o.y-h,o.z);s&&(i=o.mulAdd(s,-h-r),c=o.mulAdd(s,-h));let u=function(e,t,o,r){let a=E,n=0,l=[];function i(e,t,o,r){l.push({p0:e,p1:t,p2:o,p3:r})}i(e,t,o,r),r.writeToBuf(a,n),n+=3;for(;l.length>0;){let{p0:e,p1:t,p2:o,p3:r}=l.pop(),s=e.mid(t),c=t.mid(o),u=o.mid(r),d=s.mid(c),m=c.mid(u),f=d.mid(m),p=r.sub(e),h=t.sub(r),g=o.sub(r),x=Math.abs(h.y*p.z-h.z*p.y),v=Math.abs(g.y*p.z-g.z*p.y);if((x+v)*(x+v)>.1*p.lenSq())i(e,s,d,f),i(f,m,u,r);else{if(n+6>a.length){let e=new Float32Array(2*a.length);e.set(a),a=e}e.writeToBuf(a,n),n+=3}}return E=a,a.slice(0,n)}(a,n,i,c),d=u.length/3,m=3*!!l,f=(2*d+m)*3;R.length<f&&(R=new Float32Array(f));let p=R.subarray(0,f);for(let t=0;t<d-1;t++)P(e,new w.Vec3(u[3*t+0],u[3*t+1],u[3*t+2]),new w.Vec3(u[3*t+3],u[3*t+4],u[3*t+5]),v);let g=d+m;for(let e=0;e<d;e++){let t=g+e;p[3*t+0]=u[3*e+0]+v.width/2,p[3*t+1]=u[3*e+1],p[3*t+2]=u[3*e+2];let o=d-e-1;p[3*o+0]=u[3*e+0]-v.width/2,p[3*o+1]=u[3*e+1],p[3*o+2]=u[3*e+2]}if(l){s=s??new w.Vec3(0,1,0);let e=o.mulAdd(s,-h),t=d;p[3*t+0]=e.x-v.width/2-3,p[3*t+1]=e.y,p[3*t+2]=e.z,p[3*(t+=1)+0]=o.x,p[3*t+1]=o.y,p[3*t+2]=o.z,p[3*(t+=1)+0]=e.x+v.width/2+3,p[3*t+1]=e.y,p[3*t+2]=e.z}let x=(0,T.makeLineOpts)({thick:v.lineThick,mtx:v.mtx,color:v.borderColor});(0,T.drawLineSegs)(e.lineRender,p,x)}():P(e,t,o.sub(new w.Vec3(0,h)),v),0!==i&&function(e,t,o,r){let a=1===o?1:-1;U.x=t.x+r.width/2*a,U.y=t.y+r.width/2,U.z=t.z,W.z=t.z,j.z=t.z;for(let t=0;t<8;t++){let o=t/7*Math.PI/2,n=r.width*Math.cos(o)*a,l=r.width*Math.sin(o);W.x=U.x-n,W.y=U.y-l,(0,B.addVert)(e.triRender,W,r.ribbonColor,O,r.mtx),(0,B.addVert)(e.triRender,U,r.ribbonColor,O,r.mtx);let i=j;j=W,W=i}(0,B.addPrimitiveRestart)(e.triRender)}(e,t.sub(new w.Vec3(0,r/2)),i,v),l&&(s=s??new w.Vec3(0,1,0),c=e,u=o.mulAdd(s,-h),d=o,m=v,S.copy_(u),S.x-=m.width/2,V.copy_(u),V.x+=m.width/2,D.copy_(d),D.x+=m.width/2,z.copy_(u),z.x=S.x-3,L.copy_(u),L.x=D.x+3,I.copy_(d),I.x=S.x+m.width/2,(0,B.addVert)(c.triRender,z,m.ribbonColor,C,m.mtx),(0,B.addVert)(c.triRender,I,m.ribbonColor,C,m.mtx),(0,B.addVert)(c.triRender,L,m.ribbonColor,C,m.mtx),(0,B.addPrimitiveRestart)(c.triRender))}let M=new w.Vec3,k=new w.Vec3;function P(e,t,o,r){M.x=t.x-r.width/2,M.y=t.y,M.z=t.z,k.x=o.x+r.width/2,k.y=o.y,k.z=o.z,(0,B.addQuad)(e.triRender,M,k,r.ribbonColor,r.mtx)}new w.Vec3,new w.Vec3;let S=new w.Vec3,V=new w.Vec3,D=new w.Vec3,z=new w.Vec3,L=new w.Vec3,I=new w.Vec3,C=new w.Vec3(0,0,1),U=new w.Vec3,O=new w.Vec3(0,0,1),W=new w.Vec3,j=new w.Vec3;var G=e.i(10738);function X(e,t,o,r,a){let n=new A.Mat4f;n[14]=(o.z+r.z)/2;let l=a.color,i=a.fontSize,s=a.pad??10,c=l.mul(.4),u=(0,x.measureTextWidth)(e.modelFontBuf,t,i);(0,x.writeTextToBuffer)(e.modelFontBuf,t,l,o.x-u-2*s,(o.y+r.y)/2-i/2,i,n);let d=new w.Vec3(o.x,o.y,(o.z+r.z)/2),m=new w.Vec3(r.x,r.y,(o.z+r.z)/2);o.z!=r.z&&(d=new w.Vec3(o.x,(o.y+r.y)/2,o.z),m=new w.Vec3(o.x,(o.y+r.y)/2,r.z));let f=new w.Vec3(1,0,0);(0,T.addLine)(e.lineRender,1,c,d.mulAdd(f,-s),m.mulAdd(f,-s),void 0),(0,T.addLine)(e.lineRender,1,c,d.mulAdd(f,-s),d,void 0),(0,T.addLine)(e.lineRender,1,c,m.mulAdd(f,-s),m,void 0)}var q=e.i(21729),N=e.i(710),$=e.i(85539),H=e.i(35050),Y=e.i(91760),Q=e.i(18190),K=e.i(95147),J=e.i(46419),Z=((t={})[t.Wte=0]="Wte",t[t.Wpe=1]="Wpe",t[t.LmHeadW=2]="LmHeadW",t[t.AttnQkvW=3]="AttnQkvW",t[t.AttnQkvB=4]="AttnQkvB",t[t.AttnProjW=5]="AttnProjW",t[t.AttnProjB=6]="AttnProjB",t[t.MlpW=7]="MlpW",t[t.MlpB=8]="MlpB",t[t.MlpProjW=9]="MlpProjW",t[t.MlpProjB=10]="MlpProjB",t[t.Ln1Gamma=11]="Ln1Gamma",t[t.Ln1Beta=12]="Ln1Beta",t[t.Ln2Gamma=13]="Ln2Gamma",t[t.Ln2Beta=14]="Ln2Beta",t[t.LnFGamma=15]="LnFGamma",t[t.LnFBeta=16]="LnFBeta",t[t.InputTokens=17]="InputTokens",t[t.InputTokenEmbed=18]="InputTokenEmbed",t[t.InputEmbed=19]="InputEmbed",t[t.Ln1Agg=20]="Ln1Agg",t[t.Ln1Norm=21]="Ln1Norm",t[t.AttnQkv=22]="AttnQkv",t[t.Attn=23]="Attn",t[t.AttnSmAgg=24]="AttnSmAgg",t[t.AttnSm=25]="AttnSm",t[t.AttnVOut=26]="AttnVOut",t[t.AttnProj=27]="AttnProj",t[t.AttnResidual=28]="AttnResidual",t[t.Ln2Agg=29]="Ln2Agg",t[t.Ln2Norm=30]="Ln2Norm",t[t.MlpMlp=31]="MlpMlp",t[t.MlpAct=32]="MlpAct",t[t.MlpProj=33]="MlpProj",t[t.MlpResidual=34]="MlpResidual",t[t.LnFAgg=35]="LnFAgg",t[t.LnFNorm=36]="LnFNorm",t[t.Logits=37]="Logits",t[t.LogitsSmAgg=38]="LogitsSmAgg",t[t.LogitsSm=39]="LogitsSm",t);function ee(e){let{gl:t,shape:{B:o,T:r,C:a}}=e;return{output:i(t,a,o*r,1)}}function et(e,t,o){let{gl:r,shape:{B:a,T:n,C:l}}=e;return{weight:i(r,l,o,1),output:i(r,l,a*n,1)}}function eo(e,t,o,r){let{gl:a,shape:{B:n,T:l}}=e;return{weight:i(a,o,r,1),bias:i(a,1,r,1),output:i(a,r,n*l,1)}}function er(e){let{gl:t,shape:{B:o,T:r,C:a}}=e;return{normWeight:i(t,1,a,1),normBias:i(t,1,a,1),normAgg:i(t,1,o*r,2),output:i(t,a,o*r,1)}}function ea(e,t){let o=e.weightsDirty||e.intersDirty;e.lastMemoryBuffer!==e.native.memory.buffer&&(e.lastMemoryBuffer=e.native.memory.buffer,o=!0),o&&(function(e,t,o=!1,r=!1){c(Z.Wte,0,t.vocabEmbed.weight,!0),c(Z.Wpe,0,t.posEmbed.weight,!0),c(Z.InputTokens,0,t.inputTokens),c(Z.InputEmbed,0,t.add.output);for(let e=0;e<t.blocks.length;e++){let o=t.blocks[e];c(Z.Ln1Gamma,e,o.ln_1.normWeight,!0),c(Z.Ln1Beta,e,o.ln_1.normBias,!0),c(Z.Ln1Agg,e,o.ln_1.normAgg),c(Z.Ln1Norm,e,o.ln_1.output),c(Z.AttnQkvW,e,o.attn.qkvWeight,!0),c(Z.AttnQkvB,e,o.attn.qkvBias,!0),c(Z.AttnQkv,e,o.attn.qkvOutput),c(Z.Attn,e,o.attn.attnMatrix),c(Z.AttnSmAgg,e,o.attn.attnMatrixAgg),c(Z.AttnSm,e,o.attn.attnMatrixSoftmax),c(Z.AttnVOut,e,o.attn.scaledVectors),c(Z.AttnProjW,e,o.attn.proj.weight,!0),c(Z.AttnProjB,e,o.attn.proj.bias,!0),c(Z.AttnProj,e,o.attn.proj.output),c(Z.AttnResidual,e,o.attn.output),c(Z.Ln2Gamma,e,o.ln_2.normWeight,!0),c(Z.Ln2Beta,e,o.ln_2.normBias,!0),c(Z.Ln2Agg,e,o.ln_2.normAgg),c(Z.Ln2Norm,e,o.ln_2.output),c(Z.MlpW,e,o.mlp.fcLayer.weight,!0),c(Z.MlpB,e,o.mlp.fcLayer.bias,!0),c(Z.MlpProjW,e,o.mlp.projLayer.weight,!0),c(Z.MlpProjB,e,o.mlp.projLayer.bias,!0),c(Z.MlpMlp,e,o.mlp.fcLayer.output),c(Z.MlpAct,e,o.mlp.mlpGelu),c(Z.MlpProj,e,o.mlp.projLayer.output),c(Z.MlpResidual,e,o.mlp.addLayer.output)}c(Z.LnFGamma,0,t.ln_f.normWeight,!0),c(Z.LnFBeta,0,t.ln_f.normBias,!0),c(Z.LnFAgg,0,t.ln_f.normAgg),c(Z.LnFNorm,0,t.ln_f.output),c(Z.LmHeadW,0,t.lm_head.weight,!0),c(Z.Logits,0,t.lm_head.output),c(Z.LogitsSmAgg,0,t.softmaxFinal.agg),c(Z.LogitsSm,0,t.softmaxFinal.output);let{T:a,vocabSize:n}=t.shape,l=t.softmaxFinal.output.localBuffer,i=new Float32Array(2*l.length);for(let e=0;e<a;e++){let t=[...l.slice(e*n,(e+1)*n)].map((e,t)=>({v:e,i:t}));t.sort((e,t)=>t.v-e.v);for(let o=0;o<t.length;o++)i[(e*n+o)*2+0]=t[o].i,i[(e*n+o)*2+1]=t[o].v}function c(a,n,l,i){let c=e.native.getModelTensor(e.modelPtr,a,n);var u=`${Z[a]}${n}`,d=c,m=l;let f=m.height*m.width*m.channels;if(d.buffer.length!==f)throw Error(`readToBufferTex: buffer size mismatch for ${u}. bufferTex: ${f} [h: ${m.height}, w: ${m.width}, c: ${m.channels}], wasmBuffer:  ${d.buffer.length} [${d.shape.join(", ")}]`);m.localBuffer=d.buffer,(i?r:o)&&s(t.gl,l,l.localBuffer)}t.sortedBuf=i}(e,t,e.intersDirty,e.weightsDirty),e.weightsDirty=!1,e.intersDirty=!1)}var en=e.i(14632),el=e.i(1477);let ei=({children:e})=>{let[t,o]=(0,a.useState)(null),n=(0,y.useProgramState)(),l=(0,a.useCallback)(e=>{e(n),n.markDirty()},[n]);function i(e,t,o){let r=e.camAngle,a=e.camTarget.clone();a.z=a.z+.1*o*r.z;let n=Math.sin(r.x*Math.PI/180)>0?1:-1;a.x=a.x+n*t*.1*r.z,l(e=>{e.camera.center=a})}function s(e,t,o){let r=e.camAngle.clone();r.x=r.x-.5*t,r.y=(0,b.clamp)(r.y+.5*o,-87,87),l(e=>{e.camera.angle=r})}let[c,u]=(0,el.useGlobalDrag)(function(e,t){let o=e.clientX-t.clientX,r=e.clientY-t.clientY;t.shiftKey||1===t.button||2===t.button?s(t.data,o,r):i(t.data,o,r),e.preventDefault()});return((0,el.useTouchEvents)(t,{camAngle:n.camera.angle,camTarget:n.camera.center},{alwaysSendDragEvent:!0},function(e,t){let o=t.touches[0],r=e.touches[0],a=r.clientX-o.clientX,n=r.clientY-o.clientY;i(t.data,a,n),e.preventDefault()},function(e,t){var o;let r,a=t.touches[0],n=t.touches[1],i=e.touches[0],c=e.touches[1],u=(a.clientX+n.clientX)/2,d=(a.clientY+n.clientY)/2,m=(i.clientX+c.clientX)/2,f=(i.clientY+c.clientY)/2,p=Math.sqrt((a.clientX-n.clientX)**2+(a.clientY-n.clientY)**2),h=Math.sqrt((i.clientX-c.clientX)**2+(i.clientY-c.clientY)**2);s(t.data,m-u,f-d),o=t.data,(r=o.camAngle.clone()).z=(0,b.clamp)(r.z/(h/p),.1,1e5),l(e=>{e.camera.angle=r}),e.preventDefault()}),n.render)?(0,r.jsx)("div",{ref:o,className:g.default.canvasEventSurface,onMouseDown:function(e){n&&u(e,{camAngle:n.camera.angle,camTarget:n.camera.center})},onMouseMove:function(e){if(n){let t=n.render.canvasEl.getBoundingClientRect(),o=new w.Vec3(e.clientX-t.left,e.clientY-t.top,0);l(e=>{e.mouse.mousePos=o})}},onWheel:function(e){if(n){let t=n.camera.angle,o=(0,b.clamp)(t.z*Math.pow(1.0013,e.deltaY),.01,1e5);l(e=>{e.camera.angle=new w.Vec3(t.x,t.y,o)})}e.stopPropagation()},onContextMenu:e=>e.preventDefault(),style:{cursor:c?"grabbing":n.display.hoverTarget?"crosshair":"grab"},children:e}):null};e.i(68757),e.i(49721),e.i(7670),e.i(163);var es=((o={})[o.Up=0]="Up",o[o.Down=1]="Down",o[o.Left=2]="Left",o[o.Right=3]="Right",o[o.Focus=4]="Focus",o[o.In=5]="In",o[o.Out=6]="Out",o[o.Expand=7]="Expand",o),ec=e.i(31337),eu=e.i(90904),ed=e.i(81632);class em{canvasData;renderState;progState;modelState;random;stopped;canvasSizeDirty;constructor(e,t,o){this.canvasData=t,this.modelState=null,this.stopped=!1,this.canvasSizeDirty=!0,this.prevTime=performance.now(),this.rafHandle=0,this.isDirty=!1,this.isWaitingForSync=!1,this.markDirty=()=>{this.canvasData&&!this.stopped&&(this.isDirty=!0,this.rafHandle||(this.prevTime=performance.now(),this.rafHandle=requestAnimationFrame(this.loop)))},this.loop=e=>{if(!(this.isDirty||this.isWaitingForSync)||this.stopped){this.rafHandle=0;return}let t=this.isDirty;this.isDirty=!1,this.isWaitingForSync=!1;let o=e-this.prevTime;this.prevTime=e,o<8&&(o=16),this.checkSyncObjects();let r=this.progState.render?.syncObjects.length??0;(t||this.isDirty)&&this.render(e,o),(this.progState.render?.syncObjects.length??0)!==r&&(this.isWaitingForSync=!0),this.rafHandle=requestAnimationFrame(this.loop)},this.progState=function(e,t){let o=function(e,t){let o=e.getContext("webgl2",{antialias:!0});if(!o)return null;let r={colorBufferFloat:o.getExtension("EXT_color_buffer_float"),disjointTimerQuery:o.getExtension("EXT_disjoint_timer_query_webgl2")};r.colorBufferFloat||console.log("initRender: EXT_color_buffer_float not supported: floating point textures will not work."),r.disjointTimerQuery||console.log("initRender: EXT_disjoint_timer_query_webgl2 not supported: GPU timing will not work.");let a=(0,u.createShaderManager)(o),n={gl:o,shaderManager:a,ext:r},l=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,l),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,1]),o.STATIC_DRAW);let i=o.createVertexArray();o.bindVertexArray(i),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0);let s=(0,H.initSharedRender)(n),c=(0,x.setupFontAtlas)(n,t),d=(0,x.createFontBuffers)(c,s),m=(0,Y.initThreadRender)(n),f=(0,T.createLineRender)(n,s),p=function(e){if(!e)return null;let t=e.gl,o=`
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
    };`,a=(0,u.createFloatBuffer)(t,t.UNIFORM_BUFFER,t.createBuffer(),1024,144,null),n=(0,u.createFloatBuffer)(t,t.UNIFORM_BUFFER,t.createBuffer(),1024,80,null),l=function(e){let t=[-1,1,-1,-1,1,1,1,1,-1,-1,1,-1],o=[new A.Mat4f,A.Mat4f.fromAxisAngle(new w.Vec3(1,0),Math.PI/2),A.Mat4f.fromAxisAngle(new w.Vec3(1,0),Math.PI),A.Mat4f.fromAxisAngle(new w.Vec3(1,0),-Math.PI/2),A.Mat4f.fromAxisAngle(new w.Vec3(0,1),Math.PI/2),A.Mat4f.fromAxisAngle(new w.Vec3(0,1),-Math.PI/2)],r=A.Mat4f.fromTranslation(new w.Vec3(.5,.5,.5)).mul(A.Mat4f.fromScale(new w.Vec3(.5,.5,.5))),a=new Float32Array(216),n=0;for(let e of o)for(let o=0;o<6;o++){let l=r.mulVec3Proj(e.mulVec3Proj(new w.Vec3(t[2*o],t[2*o+1],-1))),i=e.mulVec3Proj(new w.Vec3(0,0,-1));a[n++]=Math.round(l.x),a[n++]=Math.round(l.y),a[n++]=Math.round(l.z),a[n++]=i.x,a[n++]=i.y,a[n++]=i.z}let l=e.createVertexArray();e.bindVertexArray(l);let i=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,a,e.STATIC_DRAW),(0,u.bindFloatAttribs)(e,i,{},[{name:"a_position",size:3},{name:"a_normal",size:3}]),{name:"cube",vao:l,vbo:i,type:e.TRIANGLES,numVerts:36}}(t),i=t.createVertexArray();t.bindVertexArray(i),t.bindBuffer(t.ARRAY_BUFFER,l.vbo),(0,u.bindFloatAttribs)(t,l.vbo,{},[{name:"a_position",size:3},{name:"a_normal",size:3}]);let s=t.createBuffer(),c=(0,u.bindFloatAttribs)(t,s,{locOffset:2,divisor:1},[{name:"a_offset",size:4},{name:"a_size",size:4},{name:"a_nCells",size:4},{name:"a_localPosMtx0",size:4},{name:"a_localPosMtx1",size:4},{name:"a_localPosMtx2",size:4},{name:"a_localPosMtx3",size:4},{name:"a_baseColor",size:4},{name:"a_highlight",size:1}]),d=(0,u.createFloatBuffer)(t,t.ARRAY_BUFFER,s,1024,c,null),m=t.createTexture();function f(e){return`#version 300 es
        precision highp float;

        ${H.modelViewUboText}

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
        }`}t.bindTexture(t.TEXTURE_2D,m),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST);let h=(0,u.createShaderProgram)(e,"block",f(!1),p(!1),["u_camPos","u_accessSampler"],{uboBindings:{ModelViewUbo:H.UboBindings.ModelView,BlockUbo:H.UboBindings.Block,BlockAccessUbo:H.UboBindings.BlockAccess}}),g=(0,u.createShaderProgram)(e,"block-instanced",f(!0),p(!0),["u_camPos","u_accessSampler"],{uboBindings:{ModelViewUbo:H.UboBindings.ModelView,BlockAccessUbo:H.UboBindings.BlockAccess}});return{gl:t,cubeGeom:l,shader:h,simpleShader:(0,u.createShaderProgram)(e,"block-simple",`#version 300 es
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
    `,["u_size","u_offset","u_baseColor"],{uboBindings:{ModelViewUbo:H.UboBindings.ModelView}}),blockUbo:a,blockAccessUbo:n,dummyTexture:m,instancedShader:g,instancedVao:i,instancedFloatBuf:d,instancedDataStale:!0,instancedNumBlocks:0}}(n),h=(0,B.initTriRender)(n,s),g=function(e,t){let o=e.gl,r=Math.max(o.canvas.width,1),a=Math.max(o.canvas.height,1),n=o.createFramebuffer(),l=o.createTexture();function i(){let e=o.createFramebuffer(),t=o.createTexture();o.bindFramebuffer(o.FRAMEBUFFER,e),o.bindTexture(o.TEXTURE_2D,t),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,r,a,0,o.RGBA,o.UNSIGNED_BYTE,null),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.framebufferTexture2D(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,t,0);{let e=o.checkFramebufferStatus(o.FRAMEBUFFER);e!==o.FRAMEBUFFER_COMPLETE&&console.log(`Blur framebuffer not complete: ${e.toString(16)}`)}return{fbo:e,tex:t}}o.bindFramebuffer(o.FRAMEBUFFER,n),o.bindTexture(o.TEXTURE_2D,l),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,r,a,0,o.RGBA,o.UNSIGNED_BYTE,null),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.framebufferTexture2D(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,l,0);let s=[i(),i()],c=new Float32Array(36),d=0;for(let e=-4;e<=4;e++){let t=e/2,o=Math.exp(-t*t*.5);c[4*(e+4)]=o,d+=o}for(let e=0;e<9;e++)c[4*e]/=d;let m=o.createBuffer();function f(t,o){return(0,u.createShaderProgram)(e.shaderManager,t,`#version 300 es
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
                    color += texelFetch(u_texture, pos + ivec2(${o===w.Dim.X?"i, 0":"0, i"}) * 2, 0) * weights[wId];
                }
                o_color = max(color, center);
            }
        `,["u_texture"],{uboBindings:{BlurWeights:H.UboBindings.blur}})}o.bindBuffer(o.UNIFORM_BUFFER,m),o.bufferData(o.UNIFORM_BUFFER,c.buffer,o.STATIC_DRAW),o.bindBufferBase(o.UNIFORM_BUFFER,H.UboBindings.blur,m);let p=f("blurHoriz",w.Dim.X);return{gl:o,quadVao:t,initialFbo:n,initialTex:l,blurFbos:s,horizShader:p,vertShader:f("blurVert",w.Dim.Y),overlayShader:(0,u.createShaderProgram)(e.shaderManager,"blurOverlay",`#version 300 es
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
        `,["u_texture"]),currViewSize:new w.Vec3(0,0),blurFactor:.3}}(n,i),v={ctx:n,queries:new Map,TIME_ELAPSED_EXT:n.ext.disjointTimerQuery?.TIME_ELAPSED_EXT};return(0,u.ensureShadersReady)(a),{canvasEl:e,gl:o,ctx:n,blockRender:p,threadRender:m,lineRender:f,blurRender:g,triRender:h,sharedRender:s,fontAtlas:c,modelFontBuf:d,quadVao:i,queryManager:v,syncObjects:[],size:new w.Vec3(1,1),lastGpuMs:0,lastJsMs:0,renderTiming:!1}}(e,t),r=(0,Q.initWalkthrough)(),a={B:1,T:11,C:48,nHeads:3,A:16,nBlocks:64,vocabSize:3},n=(0,N.genGptModelLayout)(a),l={angle:new w.Vec3(296,15,Math.max(n.height/120,2500)),center:new w.Vec3(0,n.height/2,0),transition:{},modelMtx:new A.Mat4f,viewMtx:new A.Mat4f,lookAtMtx:new A.Mat4f,camPos:new w.Vec3,camPosModel:new w.Vec3};return new w.Vec3(1e4,0,0),{native:null,wasmGptModel:null,render:o,inWalkthrough:!1,walkthrough:r,camera:l,shape:a,layout:(0,N.genGptModelLayout)(a),currExampleId:-1,mainExample:{name:"Qwen3.8-27B",enabled:!0,shape:a,offset:new w.Vec3,modelCardOffset:new w.Vec3,blockRender:null,camera:{center:l.center,angle:l.angle}},examples:[],gptGpuModel:null,jsGptModel:null,stepModel:!1,markDirty:()=>{},htmlSubs:new en.Subscriptions,mouse:{mousePos:new w.Vec3},movement:{action:null,actionHover:null,target:[0,0],depth:1,cameraLerp:null},display:{tokenColors:null,tokenIdxColors:null,tokenOutputColors:null,lines:[],hoverTarget:null,dimHover:null,blkIdxHover:null},pageLayout:{height:0,width:0,isDesktop:!0,isPhone:!0}}}(e,o),this.progState.markDirty=this.markDirty,this.progState.walkthrough.markDirty=this.markDirty,this.renderState=this.progState.render,this.random=new v.Random(4)}destroy(){this.stopped=!0}setData(e){if(this.canvasData=e,e.dataAndModel&&!this.progState.gptGpuModel&&this.progState.render){var t,o,r,a;let n,c,g,x,v,y,_,T,B,w;this.progState.gptGpuModel=(t=this.renderState,o=e.dataAndModel,function(e,t){let o=e.gl,r="transformer",a=t.config,n=a.n_embd,c=a.n_head,g=a.block_size,x=a.n_layer,v=a.vocab_size,b=n/c,y={B:1,C:n,nHeads:c,T:g,A:b,nBlocks:x,vocabSize:v},_={gl:o,model:t,shape:y,shaderManager:e},T=new Float32Array(+g),B=i(o,1,+g,1),w=new Float32Array(+g);for(let e=0;e<1;e++)for(let t=0;t<g;t++)w[e*g+t]=t;let E=i(o,1,+g,1);s(o,E,w);let A=p(_,r+".wte",v,n,B),R=p(_,r+".wpe",g,n,E),F=h(_,A.output,R.output),M=[],k=F.output;for(let e=0;e<x;e++){let t=function(e,t,o){let r=m(e,t+".ln_1",o),a=function(e,t,o,r){let{gl:a,model:n,shape:{B:c,T:m,C:p,nHeads:g,A:x},shaderManager:v}=e,b=n[t+".c_attn.weight"].view([3,g,x,p]).permute(1,2,3,0),y=n[t+".c_attn.bias"].view([3,g,x]).permute(1,2,0),_=i(a,p,g*x,3),T=i(a,1,g*x,3),B=i(a,x,c*g*m,4),w=i(a,m,c*g*m,1),E=i(a,1,c*g*m,2),A=i(a,m,c*g*m,1),R=i(a,g*x,c*m,1);s(a,_,b.toFloat32Array()),s(a,T,y.toFloat32Array());let F=(0,u.createShaderProgram)(v,"qkv",d,`#version 300 es
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
            for (int i = 0; i < ${p}; i++) {
                float inVal = texelFetch(attnInput, ivec2(i, tIdx + bIdx * ${m}    ), 0).r;
                vec3 qkvW   = texelFetch(qkvWeight,  ivec2(i, headIdx * ${x} + pos.x), 0).rgb;
                a += inVal * qkvW;
            }

            qkvOutput = vec4(a, 1);
        }
    `),M=(0,u.createShaderProgram)(v,"selfAttend",d,`#version 300 es
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
    `),k=(0,u.createShaderProgram)(v,"attnMatrixAgg",d,`#version 300 es
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
    `);if(!F||!M||!k||!P||!S)throw Error("Failed to create shader program");let V=l(a,F,[B],[o,_,T],["attnInput","qkvWeight","qkvBias"]),D=l(a,M,[w],[B],["qkvOutput"]),z=l(a,k,[E],[w],["attnMatrix"]),L=l(a,P,[A],[w,E],["attnMatrix","attnMatrixAgg"]),I=l(a,S,[R],[B,A],["qkvOutput","attnMatrixSoftmax"]),C=f(e,t+".c_proj",p,p,R),U=h(e,C.output,r);return{qkvWeight:_,qkvBias:T,qkvOutput:B,attnMatrix:w,attnMatrixAgg:E,attnMatrixSoftmax:A,scaledVectors:R,qkvPhase:V,selfAttendPhase:D,attnMatrixAggPhase:z,attnMatrixSoftmaxPhase:L,scaledVectorsPhase:I,proj:C,add:U,output:U.output}}(e,t+".attn",r.output,o),n=m(e,t+".ln_2",a.output),c=function(e,t,o,r){let{gl:a,shape:{B:n,T:s,C:c},shaderManager:m}=e,p=i(a,4*c,n*s,1),g=(0,u.createShaderProgram)(m,"mlpGelu",d,`#version 300 es
        precision highp float;
        uniform sampler2D geluInput;  // (B, T) (C * 4)
        out float geluOutput; // (B, T) (C * 4)

        void main() {
            ivec2 pos = ivec2(gl_FragCoord.xy);
            float x = texelFetch(geluInput, pos, 0).r;
            geluOutput = x * 0.5 * (1.0 + tanh(sqrt(2.0 / 3.14159265358) * (x + 0.044715 * x * x * x)));
        }
    `),x=f(e,t+".c_fc",c,4*c,o),v=l(a,g,[p],[x.output],["geluInput"]),b=f(e,t+".c_proj",4*c,c,p),y=h(e,b.output,r);return{fcLayer:x,mlpGelu:p,geluPhase:v,projLayer:b,addLayer:y,output:y.output}}(e,t+".mlp",n.output,a.output);return{attn:a,ln_1:r,ln_2:n,mlp:c,output:c.output}}(_,r+".h."+e,k);M.push(t),k=t.output}let P=m(_,r+".ln_f",k),S=f(_,"lm_head",n,v,P.output,void 0,!1),V=function(e,t){let{gl:o,shape:{B:r,T:a,C:n,vocabSize:s},shaderManager:c}=e,m=i(o,1,r*a,2),f=i(o,s,r*a,1),p=(0,u.createShaderProgram)(c,"softmaxAgg",d,`#version 300 es
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
    `),h=(0,u.createShaderProgram)(c,"softmax",d,`#version 300 es
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
    `),g=l(o,p,[m],[t],["smInput"]),x=l(o,h,[f],[t,m],["smInput","smAgg"]);return{bufs:[m,f],progs:[p,h],phases:[g,x],agg:m,aggPhase:g,softmaxPhase:x,output:f}}(_,S.output),D=function(e,t,o){let{gl:r,shape:{T:a,vocabSize:n},shaderManager:i}=e;return{copyPhase:l(r,(0,u.createShaderProgram)(i,"copy",d,`#version 300 es
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
    `),[o],[t],["prevOutput"])}}(_,V.output,B);return(0,u.ensureShadersReady)(e),{gl:o,inputBuf:T,inputTokens:B,vocabEmbed:A,posEmbed:R,add:F,blocks:M,ln_f:P,lm_head:S,shape:y,softmaxFinal:V,copyOutputToInput:D,output:V.output,inputLen:6,resultBuf:null,sortedBuf:null,readbackSync:null}}(t.ctx.shaderManager,o.model)),this.progState.native=e.dataAndModel.native,this.progState.wasmGptModel=function(e,t,o){let r=o.createModel(t);n("transformer.wte.weight",Z.Wte),n("transformer.wpe.weight",Z.Wpe),n("lm_head.weight",Z.LmHeadW),a("transformer.ln_f",Z.LnFGamma,Z.LnFBeta);for(let e=0;e<t.n_layer;e++){let t=`transformer.h.${e}`;a(t+".ln_1",Z.Ln1Gamma,Z.Ln1Beta,e),a(t+".ln_2",Z.Ln2Gamma,Z.Ln2Beta,e),a(t+".attn.c_attn",Z.AttnQkvW,Z.AttnQkvB,e),a(t+".attn.c_proj",Z.AttnProjW,Z.AttnProjB,e),a(t+".mlp.c_fc",Z.MlpW,Z.MlpB,e),a(t+".mlp.c_proj",Z.MlpProjW,Z.MlpProjB,e)}function a(e,t,o,r=0){n(e+".weight",t,r),n(e+".bias",o,r)}function n(t,a,l=0){e[t]?o.getModelTensor(r,a,l).copyFrom(e[t]):console.log("ERROR: missing tensor name:",t)}o.getModelTensor(r,Z.InputTokens).buffer.set([2,1,0,1,1,2,0,0,0,0,0]);{let e=performance.now();o.runModel(r),console.log("runModel",(performance.now()-e).toFixed(2)+"ms")}return{native:o,modelPtr:r,lastMemoryBuffer:null,weightsDirty:!0,intersDirty:!0}}(e.dataAndModel.model,e.dataAndModel.model.config,e.dataAndModel.native),this.progState.jsGptModel=(r=this.renderState.gl,n=(a=e.dataAndModel.model.config).n_embd,c=a.n_head,g=a.block_size,x=a.n_layer,v=a.vocab_size,y=n/c,T={gl:r,shape:_={B:1,C:n,nHeads:c,T:g,A:y,nBlocks:x,vocabSize:v}},B=i(r,1,+g,1),w=function(e){let{gl:t,shape:{B:o,T:r,vocabSize:a}}=e;return{agg:i(t,1,o*r,2),output:i(t,a,o*r,1)}}(T),{gl:r,add:ee(T),inputBuf:new Float32Array,inputLen:6,ln_f:er(T),inputTokens:B,lm_head:eo(T,g,n,v),blocks:(0,b.makeArray)(x).map(()=>{var e;let t;return t=function(e){let{gl:t,shape:{B:o,T:r,C:a}}=e,n=ee(e);return{fcLayer:eo(e,r,a,4*a),mlpGelu:i(t,4*a,o*r,1),projLayer:eo(e,r,4*a,a),addLayer:n,output:n.output}}(e=T),{ln_1:er(e),attn:function(e){var t,o;let{gl:r,shape:{B:a,T:n,C:l,nHeads:s,A:c}}=e,u=ee(e);return{qkvWeight:i(r,l,3*s*c,1),qkvBias:i(r,1,3*s*c,1),attnMatrix:(t=a*s*n,i(r,n,t,1)),attnMatrixAgg:i(r,1,a*s*n,2),attnMatrixSoftmax:(o=a*s*n,i(r,n,o,1)),qkvOutput:i(r,3*s*c,a*n,1),add:ee(e),proj:eo(e,n,l,l),scaledVectors:i(r,s*c,a*n,1),output:u.output}}(e),ln_2:er(e),mlp:t,output:t.output}}),output:w.output,posEmbed:et(T,B,g),vocabEmbed:et(T,B,v),shape:_,softmaxFinal:w,resultBuf:null,sortedBuf:null})}this.markDirty()}prevTime;rafHandle;isDirty;isWaitingForSync;markDirty;loop;checkSyncObjects(){if(!this.progState.render)return;let e=this.renderState.gl,t=this.progState.render.syncObjects,o=!1;for(let r=0;r<t.length;r++){let a=t[r];if(a.isReady){o=!0;continue}e.clientWaitSync(a.sync,0,0)===e.TIMEOUT_EXPIRED?this.isWaitingForSync=!0:(a.isReady=!0,a.elapsedMs=performance.now()-a.startTime,e.deleteSync(a.sync),o=!0)}o&&(this.progState.render.syncObjects=t.filter(e=>!e.isReady),this.markDirty())}render(e,t){if(!this.progState.render)return;let o=this.renderState.canvasEl;if(this.canvasSizeDirty){let e=o.getBoundingClientRect(),t=window.devicePixelRatio;o.width=e.width*t,o.height=e.height*t,this.progState.render.size=new w.Vec3(e.width,e.height),this.canvasSizeDirty=!1}!function(e,t){var o;let r=performance.now();if(!t.render)return;for(let e of(o=t.render,(0,T.resetLineRender)(o.lineRender),(0,x.resetFontBuffers)(o.modelFontBuf),(0,B.resetTriRender)(o.triRender),t.render.sharedRender.activePhase=H.RenderPhase.Opaque,t.display.lines=[],t.display.hoverTarget=null,t.display.tokenColors=null,t.display.tokenIdxColors=null,t.wasmGptModel&&t.jsGptModel&&ea(t.wasmGptModel,t.jsGptModel),t.stepModel&&t.wasmGptModel&&t.jsGptModel&&(t.stepModel=!1,!function(e,t){let{native:o,modelPtr:r}=e,{shape:{B:a,T:n,vocabSize:l}}=t,i=t.inputLen-1;if(!t.sortedBuf||i>=n-1)return;let s=o.getModelTensor(r,Z.InputTokens);for(let e=0;e<a;e++){let o=t.sortedBuf[e*n*l*2+i*l*2+0];s.buffer[e*n+i+1]=o}t.inputLen+=1,o.runModel(r),e.intersDirty=!0,ea(e,t)}(t.wasmGptModel,t.jsGptModel)),t.layout=(0,N.genGptModelLayout)(t.shape,t.jsGptModel),t.layout.weightCount=27e9,t.examples))if(e.enabled&&!e.layout){let t=(0,N.genGptModelLayout)(e.shape,null,e.offset);e.layout=t}(0,_.genModelViewMatrices)(t,t.layout);let a=function(e,t){if(!e.ctx.ext.disjointTimerQuery)return null;let o=e.queries.get(t);if(!o){let r=e.ctx.gl.createQuery();e.queries.set(t,o={query:r,hasRun:!1,hasStarted:!1})}let r=!1;o.hasRun&&(r=e.ctx.gl.getQueryParameter(o.query,e.ctx.gl.QUERY_RESULT_AVAILABLE));let a=null;return r&&(a=e.ctx.gl.getQueryParameter(o.query,e.ctx.gl.QUERY_RESULT)/1e6),(!o.hasRun||r)&&(e.ctx.gl.beginQuery(e.TIME_ELAPSED_EXT,o.query),o.hasRun=!0,o.hasStarted=!0),a}(t.render.queryManager,"render");for(let o of((0,b.isNotNil)(a)&&(t.render.lastGpuMs=a),t.render.renderTiming=!1,t.inWalkthrough&&(0,Q.runWalkthrough)(t,e),(0,_.updateCamera)(t,e),!function(e){for(let t of e.layout.cubes){let o=new w.Vec3(t.x+t.dx/2,t.y,t.z+t.dz/2),r=(0,_.camScaleToScreen)(e,o);r=Math.min(r,1.45);let a=new w.Vec4(1,1,1,1).mul(t.opacity),n=new w.Vec4(0,0,0,1).mul(t.opacity);if(0===t.opacity||!t.name)continue;let l=t.name,i=A.Mat4f.fromTranslation(o),s={color:a,size:2.5*r,mtx:i},c=(0,x.measureText)(e.render.modelFontBuf,l,s);e.render.sharedRender.activePhase=H.RenderPhase.Opaque,(0,J.drawRoundedRect)(e.render,new w.Vec3(-c/2-.4,-s.size-.8,0),new w.Vec3(c/2+.4,0,0),n,i,.4*r),e.render.sharedRender.activePhase=H.RenderPhase.Overlay,(0,x.drawText)(e.render.modelFontBuf,l,-c/2,-s.size-.4,s)}}(t),!function(e,t){let o=t.residual0,r=w.Vec4.fromHexColor("#3333aa"),a=w.Vec4.fromHexColor("#33aa33");l(t.idxObj,t.residual0),i(t.tokEmbedObj,t.residual0),d(t.posEmbedObj,0,t.residual0,1);for(let e=0;e<3;e++){let r=t.blocks[e];for(let e of(l(o,r.attnResidual),c(o,r.ln1.lnResid),c(o,r.ln1.lnAgg2,2),l(r.ln1.lnAgg2,r.ln1.lnResid,2),r.heads))d(r.ln1.lnResid,0,e.qBlock,1),d(r.ln1.lnResid,0,e.kBlock,1),d(r.ln1.lnResid,0,e.vBlock,1),i(e.qBiasBlock,e.qWeightBlock),i(e.kBiasBlock,e.kWeightBlock),i(e.vBiasBlock,e.vWeightBlock),i(e.qWeightBlock,e.qBlock),i(e.kWeightBlock,e.kBlock),i(e.vWeightBlock,e.vBlock),u(e.qBlock,e.attnMtx,0,void 0,e.qBlock.y!==e.kBlock.y),u(e.kBlock,e.attnMtx,0,void 0,e.kBlock.y!==e.qBlock.y),u(e.vBlock,e.vOutBlock,0,void 0,e.vBlock.y!==e.kBlock.y),d(e.attnMtx,0,e.attnMtxAgg2,1),d(e.attnMtxAgg1,0,e.attnMtxSm,1),d(e.attnMtxSm,3,e.vOutBlock,0),d(e.vOutBlock,3,r.attnOut,2);l(r.attnResidual,r.mlpResidual),i(r.attnOut,r.attnResidual),i(r.projBias,r.projWeight),i(r.projWeight,r.attnOut),i(r.ln1.lnMu,r.ln1.lnSigma),i(r.ln1.lnSigma,r.ln1.lnResid),c(r.attnResidual,r.ln2.lnAgg2,2),l(r.ln2.lnAgg2,r.ln2.lnResid,2),i(r.ln2.lnMu,r.ln2.lnSigma),i(r.ln2.lnSigma,r.ln2.lnResid),c(r.attnResidual,r.ln2.lnResid),d(r.ln2.lnResid,3,r.mlpFc,1),l(r.mlpFcBias,r.mlpFcWeight),l(r.mlpFcWeight,r.mlpFc,12),l(r.mlpFc,r.mlpAct,12),i(r.mlpProjBias,r.mlpProjWeight),i(r.mlpProjWeight,r.mlpResult),i(r.mlpResult,r.mlpResidual),d(r.mlpAct,1,r.mlpResult,2),o=r.mlpResidual}function n(e){return"w"===e.t?r:a}function l(e,t,o=6){d(e,3,t,2,o)}function i(e,t,o=6){d(e,1,t,0,o)}function s(e,t){let o=e.z+e.dz/2;switch(t){case 0:return new w.Vec3(e.x-2,e.y+e.dy/2,o);case 1:return new w.Vec3(e.x+e.dx+2,e.y+e.dy/2,o);case 2:return new w.Vec3(e.x+e.dx/2,e.y-2,o);case 3:return new w.Vec3(e.x+e.dx/2,e.y+e.dy+2,o)}}function c(t,o,r=6){let a=s(t,3),l=s(o,1),i=Math.min(t.opacity,o.opacity);if(0===i)return;let u=new w.Vec3(0,0,1),d=n(t).mul(i);F(e,new w.Vec3(a.x-3,l.y),l,r,u,d,!0)}function u(o,r,a,l=6,i=!1){let c=s(o,3),d=c.z>r.z+r.dz/2,m=new w.Vec3(r.x+r.dx/2,r.y+t.cell*(a+.5),d?r.z+r.dz/2+2:r.z-2),f=Math.min(o.opacity,r.opacity);if(0===f)return;let p=new w.Vec3(0,0,1),h=n(o).mul(f),g=new w.Vec3(0,0,d?-1:1);1>Math.abs(c.z-(r.z+r.dz/2))&&!i&&(g=void 0,m=s(r,2)),F(e,c,m,l,p,h,!0,0,g)}function d(t,o,r,a,l=6){let i=s(t,o),c=s(r,a),u=Math.min(t.opacity,r.opacity);if(0===u)return;let m=new w.Vec3(0,0,1),f=n(t).mul(u);if(0===o&&1===a&&(i.y=c.y),1===o&&2===a){let t=new w.Vec3(c.x-l/2,i.y,i.z),o=new w.Vec3(c.x,i.y+l/2,c.z);F(e,i,t,l,m,f,!1),F(e,o,c,l,m,f,!0,1)}else if(3===o&&1===a){let t=new w.Vec3(i.x,c.y-l/2,c.z),o=new w.Vec3(i.x-l/2,c.y,c.z);F(e,i,t,l,m,f,!1),F(e,o,c,l,m,f,!0,1)}else if(3===o&&0===a){let t=new w.Vec3(i.x,c.y-l/2,c.z),o=new w.Vec3(i.x+l/2,c.y,c.z);F(e,i,t,l,m,f,!1,0,new w.Vec3(0,1,0)),F(e,o,c,l,m,f,!0,2)}else F(e,i,c,l,m,f,!0)}c(o,t.ln_f.lnAgg2,2),d(o,3,t.ln_f.lnResid,1),l(t.ln_f.lnAgg2,t.ln_f.lnResid),i(t.ln_f.lnMu,t.ln_f.lnSigma),i(t.ln_f.lnSigma,t.ln_f.lnResid),t.logitsTransposed?(d(t.ln_f.lnResid,3,t.logits,1),l(t.lmHeadWeight,t.logits),l(t.logits,t.logitsSoftmax),i(t.logits,t.logitsAgg1,2),d(t.logitsAgg2,3,t.logitsSoftmax,1,2)):(l(t.ln_f.lnResid,t.logits),i(t.lmHeadWeight,t.logits),l(t.logits,t.logitsAgg2),l(t.logitsAgg1,t.logitsSoftmax))}(t.render,t.layout),(0,q.drawModelCard)(t,t.layout,"Qwen3.8-27B",new w.Vec3),t.examples))o.enabled&&o.layout&&(0,q.drawModelCard)(t,o.layout,o.name,o.offset.add(o.modelCardOffset));(0,K.runMouseHitTesting)(t),t.render.sharedRender.activePhase=H.RenderPhase.Opaque,function(e,t){let o=new w.Vec4(.4,.4,.4,1);{let r=o.mul(t.embedLabel.visible);X(e,"Embedding",new w.Vec3(t.tokEmbedObj.x-2*t.margin,t.tokEmbedObj.y,0),new w.Vec3(t.tokEmbedObj.x-2*t.margin,t.tokEmbedObj.y+t.tokEmbedObj.dy,0),{color:r,fontSize:6,pad:4})}let r=0;for(let a of t.blocks){let n=a.ln1.lnResid.y-t.margin/2,l=a.mlpResult.y+a.mlpResult.dy+t.margin/2,i=a.mlpProjBias.x-3*t.margin,s=a.projBias.x-t.margin,c=s-3*t.margin,u=(0,G.lerp)(s,i,.6),d=a.attnOut.y-t.margin/2,m=a.attnOut.y+a.attnOut.dy+t.margin/2,f=a.mlpFcBias.y-t.margin/2,p=i-6*t.margin;{let t=o.mul(a.mlpResidual.opacity*a.transformerLabel.visible);X(e,`Transformer ${r}`,new w.Vec3(p,n,0),new w.Vec3(p,l,0),{color:t,fontSize:26})}{let t=o.mul(a.attnResidual.opacity*a.selfAttendLabel.visible);X(e,"Self-attention",new w.Vec3(u,n,0),new w.Vec3(u,m,0),{color:t,fontSize:12})}{let t=o.mul(a.mlpAct.opacity*a.mlpLabel.visible);X(e,"MLP",new w.Vec3(i,f,0),new w.Vec3(i,l,0),{color:t,fontSize:12})}{let t=o.mul(a.attnOut.opacity*a.projLabel.visible);X(e,"Projection",new w.Vec3(c,d,0),new w.Vec3(c,m,0),{color:t,fontSize:10})}let h=0;for(let t of a.heads){{let r=o.mul(t.attnMtx.opacity*t.headLabel.visible),a=new w.Vec3(c,t.vBlock.y,t.vBlock.z+t.vBlock.dz/2),n=new w.Vec3(c,t.qBlock.y+t.qBlock.dy,t.qBlock.z+t.qBlock.dz/2);t.qBlock.y!==t.vBlock.y&&(a=new w.Vec3(c,t.vBlock.y,t.vOutBlock.z+t.vOutBlock.dz/2),n=new w.Vec3(c,t.vOutBlock.y+t.vOutBlock.dy,t.vOutBlock.z+t.vOutBlock.dz/2)),X(e,`Head ${h}`,a,n,{color:r,fontSize:10})}{let r=o.mul(t.qBlock.opacity*t.qLabel.visible);X(e,"Q",new w.Vec3(s,t.qBlock.y,t.qBlock.z+t.qBlock.dz/2),new w.Vec3(s,t.qBlock.y+t.qBlock.dy,t.qBlock.z+t.qBlock.dz/2),{color:r,fontSize:6,pad:4})}{let r=o.mul(t.kBlock.opacity*t.kLabel.visible);X(e,"K",new w.Vec3(s,t.kBlock.y,t.kBlock.z+t.kBlock.dz/2),new w.Vec3(s,t.kBlock.y+t.kBlock.dy,t.kBlock.z+t.kBlock.dz/2),{color:r,fontSize:6,pad:4})}{let r=o.mul(t.vBlock.opacity*t.vLabel.visible);X(e,"V",new w.Vec3(s,t.vBlock.y,t.vBlock.z+t.vBlock.dz/2),new w.Vec3(s,t.vBlock.y+t.vBlock.dy,t.vBlock.z+t.vBlock.dz/2),{color:r,fontSize:6,pad:4})}h++}r++}}(t.render,t.layout);let n=1,l=t.render.size.x;for(let e of(t.render.sharedRender.activePhase=H.RenderPhase.Overlay2D,t.display.lines)){let o={color:new w.Vec4,size:14},r=(0,x.measureText)(t.render.modelFontBuf,e,o);(0,x.drawText)(t.render.modelFontBuf,e,l-r-4,n*o.size*1.3+4,o),n++}!function(e){let{layout:t,render:o,camera:r}=e,{gl:a,blockRender:n,size:l}=o,{modelMtx:i,viewMtx:s}=r,{camPos:c}=(0,_.cameraToMatrixView)(r),d=[new w.Vec3(100,400,600),new w.Vec3(-200,-300,-300),new w.Vec3(200,-100,0)],m=[new w.Vec3(1,.2,.2),new w.Vec3(1,.2,.2),new w.Vec3(1,.2,.2)],f=new Float32Array(9),p=new Float32Array(9);for(let e=0;e<3;e++)i.mulVec3Proj(d[e]).writeToBuf(f,3*e),i.mulVec3Proj(m[e]).writeToBuf(p,3*e);if(a.bindFramebuffer(a.FRAMEBUFFER,null),a.viewport(0,0,l.x,l.y),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT|a.DEPTH_BUFFER_BIT),a.enable(a.BLEND),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),a.enable(a.DEPTH_TEST),a.enable(a.CULL_FACE),a.cullFace(a.FRONT),a.frontFace(a.CW),o.renderTiming){let e=`GPU: ${o.lastGpuMs.toFixed(1)}ms JS: ${o.lastJsMs.toFixed(1)}ms`,t=l.x;o.sharedRender.activePhase=H.RenderPhase.Overlay2D;let r=(0,x.measureTextWidth)(o.modelFontBuf,e,14);(0,x.writeTextToBuffer)(o.modelFontBuf,e,new w.Vec4(0,0,0,1),t-r-4,4,14,new A.Mat4f)}(0,H.writeModelViewUbo)(o.sharedRender,i,s);{var h;let e,r,a,l,i,s=t.cubes.filter(e=>e.highlight>0);!function(e){let t=e.gl,o=t.canvas.width,r=t.canvas.height,a=Math.floor(o*e.blurFactor),n=Math.floor(r*e.blurFactor);if(e.currViewSize.x!==o||e.currViewSize.y!==r){for(let o of(t.bindTexture(t.TEXTURE_2D,e.initialTex),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,a,n,0,t.RGBA,t.UNSIGNED_BYTE,null),e.blurFbos))t.bindTexture(t.TEXTURE_2D,o.tex),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,a,n,0,t.RGBA,t.UNSIGNED_BYTE,null);e.currViewSize=new w.Vec3(o,r)}t.bindFramebuffer(t.FRAMEBUFFER,e.initialFbo),t.viewport(0,0,a,n),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT)}(o.blurRender),function(e,t){let o=e.gl;if(!e.simpleShader.ready)return;let r=e.simpleShader.locs,a=e.cubeGeom;for(let n of(o.useProgram(e.simpleShader.program),o.bindVertexArray(a.vao),t)){o.uniform3f(r.u_size,n.dx,n.dy,n.dz),o.uniform3f(r.u_offset,n.x,n.y,n.z);let e=("w"===n.t?new w.Vec4(.3,.3,1,1):new w.Vec4(.4,.8,.4,1)).mul(n.highlight);o.uniform4f(r.u_baseColor,e.x,e.y,e.z,e.w),o.drawArrays(a.type,0,a.numVerts)}}(n,s),r=(e=(h=o.blurRender).gl).canvas.width,a=e.canvas.height,l=Math.floor(r*h.blurFactor),i=Math.floor(a*h.blurFactor),e.bindVertexArray(h.quadVao),e.disable(e.DEPTH_TEST),e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.STENCIL_TEST),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,h.initialTex),e.bindFramebuffer(e.FRAMEBUFFER,h.blurFbos[0].fbo),e.viewport(0,0,l,i),e.useProgram(h.horizShader.program),e.uniform1i(h.horizShader.locs.u_texture,0),e.drawArrays(e.TRIANGLE_FAN,0,4),e.bindTexture(e.TEXTURE_2D,h.blurFbos[0].tex),e.bindFramebuffer(e.FRAMEBUFFER,h.blurFbos[1].fbo),e.viewport(0,0,l,i),e.useProgram(h.vertShader.program),e.uniform1i(h.vertShader.locs.u_texture,0),e.drawArrays(e.TRIANGLE_FAN,0,4),e.enable(e.BLEND),e.viewport(0,0,r,a),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindTexture(e.TEXTURE_2D,h.blurFbos[1].tex),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,h.initialTex),e.useProgram(h.overlayShader.program),e.uniform1i(h.overlayShader.locs.u_texture,0),e.drawArrays(e.TRIANGLE_FAN,0,4)}for(let l of(a.enable(a.DEPTH_TEST),(0,T.uploadAllLines)(o.lineRender),(0,B.uploadAllTris)(o.triRender),(0,x.uploadAllText)(o.modelFontBuf),!function(e,t,o,r){let a=e.gl,n=e.shader.locs,l=e.cubeGeom;if(!e.shader.ready)return;a.useProgram(e.shader.program);let i=o.mulVec3Proj(r);a.uniform3f(n.u_camPos,i.x,i.y,i.z),a.uniform1i(n.u_accessSampler,0),a.enable(a.BLEND),a.enable(a.CULL_FACE),a.activeTexture(a.TEXTURE0),a.bindVertexArray(l.vao);let s=[],c=[];t.cubes.forEach(function e(t){t.subs?t.subs.forEach(e):t.opacity<.8&&t.opacity>0?c.push(t):t.opacity>0&&s.push(t)});let d=[...s,...c],m=s.length,f=e.blockUbo.localBufs[0],p=e.blockAccessUbo.localBufs[0];{(0,u.resetFloatBufferMap)(e.blockUbo),(0,u.ensureFloatBufferSize)(f,d.length);let t=f.buf;for(let e of d){let o=f.usedEls*f.strideFloats;t[o+0]=e.x,t[o+1]=e.y,t[o+2]=e.z,t[o+4]=e.dx,t[o+5]=e.dy,t[o+6]=e.dz,t[o+8]=e.cx,t[o+9]=e.cy,t[o+10]=e.cz,t.set(e.localMtx??new A.Mat4f,o+12);let r="w"===e.t?$.Colors.Weights:"i"===e.t?$.Colors.Intermediates:$.Colors.Aggregates;new w.Vec4(r.x,r.y,r.z,e.opacity).writeToBuf(t,o+28),t[o+32]=e.highlight,f.usedEls+=1}(0,u.uploadFloatBuffer)(a,e.blockUbo)}{(0,u.resetFloatBufferMap)(e.blockAccessUbo),(0,u.ensureFloatBufferSize)(p,d.length);let t=p.buf;for(let e of d){let o=p.usedEls*p.strideFloats;if(e.access&&!0!==e.access.disable){t.set(e.access.mat.slice(0,8),o);let r=e.access.channel;t[o+8]="r"===r?0:"g"===r?1:"b"===r?2:3,t[o+9]=e.access.scale}else t[o+9]=0;p.usedEls+=1}(0,u.uploadFloatBuffer)(a,e.blockAccessUbo)}let h=!0,g=0;for(let t of d){g===m&&a.depthMask(!1),a.bindBufferRange(a.UNIFORM_BUFFER,H.UboBindings.Block,e.blockUbo.buf,g*f.strideBytes,f.strideBytes);let o=!!t.access&&!0!==t.access.disable;(h||o)&&(a.bindBufferRange(a.UNIFORM_BUFFER,H.UboBindings.BlockAccess,e.blockAccessUbo.buf,g*p.strideBytes,p.strideBytes),a.bindTexture(a.TEXTURE_2D,o&&t.access?t.access.src.texture:e.dummyTexture),h=o),a.drawArrays(l.type,0,l.numVerts),g++}a.depthMask(!0)}(n,t,i,c),o.sharedRender.activePhase=H.RenderPhase.Opaque,e.examples))if(l.enabled&&l.layout){let{modelMtx:e,viewMtx:t}=r,{camPos:a}=(0,_.cameraToMatrixView)(r);var g=e.mul(A.Mat4f.fromTranslation(l.offset));(0,H.writeModelViewUbo)(o.sharedRender,g,t),function(e,t,o,r){if(!e.instancedShader.ready)return;let a=e.gl,n=e.instancedShader.locs,l=e.blockAccessUbo.localBufs[0];a.useProgram(e.instancedShader.program);let i=o.invert().mulVec3Proj(r);if(a.uniform3f(n.u_camPos,i.x,i.y,i.z),a.uniform1i(n.u_accessSampler,0),a.enable(a.BLEND),a.enable(a.CULL_FACE),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,e.dummyTexture),a.bindVertexArray(e.instancedVao),e.instancedDataStale){e.instancedDataStale=!1;{(0,u.resetFloatBufferMap)(e.instancedFloatBuf);let o=e.instancedFloatBuf.localBufs[0];(0,u.ensureFloatBufferSize)(o,t.cubes.length);let r=o.buf;for(let e of t.cubes){if(e.small)continue;let t=o.usedEls*o.strideFloats;r[t+0]=e.x,r[t+1]=e.y,r[t+2]=e.z,r[t+4]=e.dx,r[t+5]=e.dy,r[t+6]=e.dz,r[t+8]=e.cx,r[t+9]=e.cy,r[t+10]=e.cz,r.set(e.localMtx??new A.Mat4f,t+12);let a="w"===e.t?$.Colors.Weights:"i"===e.t?$.Colors.Intermediates:$.Colors.Aggregates;new w.Vec4(a.x,a.y,a.z,e.opacity).writeToBuf(r,t+28),r[t+32]=e.highlight,o.usedEls+=1}(0,u.uploadFloatBuffer)(a,e.instancedFloatBuf),e.instancedNumBlocks=o.usedEls}(0,u.resetFloatBufferMap)(e.blockAccessUbo),(0,u.ensureFloatBufferSize)(l,1),l.buf[9]=0,l.usedEls+=1,(0,u.uploadFloatBuffer)(a,e.blockAccessUbo)}a.bindBufferRange(a.UNIFORM_BUFFER,H.UboBindings.BlockAccess,e.blockAccessUbo.buf,0,l.strideBytes),a.drawArraysInstanced(e.cubeGeom.type,0,e.cubeGeom.numVerts,e.instancedNumBlocks),a.depthMask(!0)}(l.blockRender,l.layout,g,a)}for(let e of((0,H.writeModelViewUbo)(o.sharedRender,i,s),(0,Y.renderAllThreads)(o.threadRender),a.polygonOffset(-1,-2),[H.RenderPhase.Opaque,H.RenderPhase.Arrows,H.RenderPhase.Overlay,H.RenderPhase.Overlay2D])){if(e===H.RenderPhase.Overlay2D){let e=l.x,t=l.y;a.clear(a.DEPTH_BUFFER_BIT),(0,H.writeModelViewUbo)(o.sharedRender,new A.Mat4f,A.Mat4f.fromOrtho(0,e,t,0,-1,1))}e===H.RenderPhase.Overlay||e===H.RenderPhase.Overlay2D?a.enable(a.POLYGON_OFFSET_FILL):a.disable(a.POLYGON_OFFSET_FILL),(0,B.renderAllTris)(o.triRender,e),(0,x.renderAllText)(o.modelFontBuf,e),(0,T.renderAllLines)(o.lineRender,e)}a.disable(a.POLYGON_OFFSET_FILL)}(t),function(e,t){if(!e.ctx.ext.disjointTimerQuery)return;let o=e.queries.get(t);o&&o.hasRun&&o.hasStarted&&(e.ctx.gl.endQuery(e.TIME_ELAPSED_EXT),o.hasStarted=!1)}(t.render.queryManager,"render"),t.render.gl.flush(),t.render.lastJsMs=performance.now()-r}({time:e,dt:t,markDirty:this.markDirty},this.progState),this.progState.htmlSubs.notify()}}e.s(["LayerView",0,function(){let[e,t]=(0,a.useState)(null),[o,n]=(0,a.useState)(null),[l,i]=(0,a.useState)(null),[s,c]=(0,a.useState)(null),u=(0,ec.useScreenLayout)(),d=(0,a.useContext)(ed.KeyboardManagerContext);(0,ed.useGlobalKeyboard)(ed.KeyboardOrder.MainPage,e=>{if(!l?.progState)return;let t=e.key.toLowerCase(),o=l.progState.walkthrough,r=l.progState.movement;" "===e.key&&(o.time>=o.phaseLength?((0,eu.jumpPhase)(o,1),o.time=0):o.running=!o.running,l.markDirty()),("Backspace"===e.key||"Delete"===e.key)&&(o.running=!1,o.time=0,l.markDirty()),("ArrowLeft"===e.key||"a"===t)&&(r.action=es.Left,l.markDirty()),("ArrowRight"===e.key||"d"===t)&&(r.action=es.Right,l.markDirty()),("ArrowUp"===e.key||"w"===t)&&(r.action=es.Up,l.markDirty()),("ArrowDown"===e.key||"s"===t)&&(r.action=es.Down,l.markDirty()),("PageUp"===e.key||"q"===t)&&(r.action=es.In,l.markDirty()),("PageDown"===e.key||"e"===t)&&(r.action=es.Out,l.markDirty()),"r"===t&&(r.action=es.Expand,l.markDirty()),"f"===t&&(r.action=es.Focus,l.markDirty())," "===e.key&&e.preventDefault()}),(0,a.useEffect)(()=>(document.addEventListener("keydown",d.handleKey),()=>{document.removeEventListener("keydown",d.handleKey)}),[d]),(0,a.useEffect)(()=>{},[]),(0,a.useEffect)(()=>{let e=!1;return async function(){let t=await (0,x.fetchFontAtlasData)();e||c(t)}(),()=>{e=!0}},[]),(0,a.useEffect)(()=>{if(e&&s){let t=new em(e,null,s),o=new ResizeObserver(()=>{t.canvasSizeDirty=!0,t.markDirty()}),r=e=>e.preventDefault();return i(t),o.observe(e),e.addEventListener("wheel",r,{passive:!1}),()=>{e.removeEventListener("wheel",r),t.destroy(),o.disconnect()}}i(null)},[e,s]),(0,a.useEffect)(()=>{l?.setData({dataAndModel:o})},[l,o]),(0,a.useLayoutEffect)(()=>{l&&(l.progState.pageLayout=u,l.markDirty())},[l,u]),l&&(g.default.sidebar,y.ProgramStateContext.Provider,l.progState,y.WalkthroughSidebar);let m=(0,r.jsxs)("div",{className:g.default.canvasWrap,children:[(0,r.jsx)("canvas",{className:g.default.canvas,ref:t}),l&&!l.progState.render&&(0,r.jsxs)("div",{className:"absolute flex flex-col items-center w-full h-full justify-center",children:[(0,r.jsx)("div",{className:"text-2xl",children:"This application requires a WebGL2 capable browser."}),(0,r.jsx)("div",{className:"text-lg mt-2",children:"Please try the latest version of Chrome or Firefox."})]}),l&&(0,r.jsx)(y.ProgramStateContext.Provider,{value:l.progState,children:(0,r.jsx)(ei,{})})]});return(0,r.jsx)("div",{className:g.default.view,children:m})}],69454)},163,e=>{e.v({arrow:"MovementControls-module-scss-module__bRvSgq__arrow",control:"MovementControls-module-scss-module__bRvSgq__control",controls:"MovementControls-module-scss-module__bRvSgq__controls"})}]);

//# sourceMappingURL=1ist51q4yeyx-.js.map