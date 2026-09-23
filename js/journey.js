/* Persistent scenery. No listeners, RAFs or timers: main.js owns the clock.
 * Every morph uses the SAME vertex IDs, edge graph and projection space.
 * Geometry is decorative; all project information remains semantic HTML.
 */
(() => {
  "use strict";
  const tau = Math.PI * 2;
  const clamp = (n, a=0, b=1) => Math.min(b, Math.max(a,n));
  const mix = (a,b,t) => a+(b-a)*t;
  const smooth = (t) => { const n=clamp(t); return n*n*(3-2*n); };
  const range = (n,a,b) => smooth((n-a)/(b-a));
  // Exact critically damped response: constant targets agree at 30/60/120 Hz.
  // Velocity survives a reversal; there is no queue of scene animations.
  const follow = (channel,target,rate,dt,snap=false) => {
    if(snap){channel.value=target;channel.velocity=0;return target;}
    const error=channel.value-target, c=channel.velocity+rate*error, decay=Math.exp(-rate*dt);
    channel.value=target+(error+c*dt)*decay;
    channel.velocity=(channel.velocity-rate*c*dt)*decay;
    if(Math.abs(channel.value-target)<.0001&&Math.abs(channel.velocity)<.001){channel.value=target;channel.velocity=0;}
    return channel.value;
  };
  const channel=(value=0)=>({value,velocity:0});
  const random = (seed) => () => { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  const stroke = (ctx, points, color, width=1) => {
    ctx.beginPath(); points.forEach((p,i) => i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]));
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke();
  };
  const dot = (ctx,x,y,r,color) => { ctx.beginPath();ctx.arc(x,y,r,0,tau);ctx.fillStyle=color;ctx.fill(); };
  const glow = (ctx,x,y,r,color) => {
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  };
  const bakeVeil=(color)=>{
    const canvas=document.createElement("canvas"),context=canvas.getContext?.("2d");
    if(!context)return null;
    canvas.width=canvas.height=128;
    glow(context,64,64,64,color);return canvas;
  };
  // A folded surface, a surveying field, and a signal constellation share IDs.
  const createModel = (mobile) => {
    const rows=mobile ? 16 : 22, cols=mobile ? 24 : 32, rng=random(80291);
    const nodes=[], edges=[];
    for(let row=0;row<rows;row++) for(let col=0;col<cols;col++) {
      const u=row/(rows-1), v=col/(cols-1), a=u*tau, b=v*tau;
      const x=(v-.5)*950+Math.sin(u*5.7+v*2)*65, z=(u-.5)*650+Math.sin(v*7+u*2)*42;
      const ridge=Math.exp(-((x+120)**2/60000+(z-50)**2/85000));
      const terrain=Math.sin(x*.006+z*.003)*35+Math.cos(z*.007)*28+ridge*125;
      const radius=171+Math.cos(b)*70+Math.sin(a*2)*13;
      const cluster=v<.42?0:v<.72?1:2;
      const centers=[[-190,-90,-40],[90,105,65],[290,-120,110]];
      const sizes=[155,105,66], local=v<.42?v/.42:v<.72?(v-.42)/.3:(v-.72)/.28;
      const angle=local*tau+u*1.3, distance=Math.pow(u,.72)*sizes[cluster];
      const importance=rng(), active=importance>.82&&!(cluster===2&&u>.6);
      nodes.push({
        map:[x,terrain,z],
        geometry:[Math.cos(a)*radius,Math.sin(b)*94+Math.sin(a*2)*58,Math.sin(a)*radius],
        signal:[centers[cluster][0]+Math.cos(angle)*distance*1.2,centers[cluster][1]+Math.sin(angle)*distance*.75,centers[cluster][2]+(rng()-.5)*150],
        field:[x,terrain+160,z], leaf:rng(), phase:rng()*tau,
        projected:[0,0,0], row,col,cluster,importance,active,ridge,
        delay:u*.12+local*.075
      });
      const id=row*cols+col;
      if(col<cols-1) edges.push([id,id+1,row%5===0]);
      if(row<rows-1) edges.push([id,id+cols,col===Math.floor(cols*.62)]);
    }
    const routes=[
      Array.from({length:cols},(_,i)=>Math.min(rows-1,Math.floor(rows*.38+Math.sin(i*.22)*rows*.16))*cols+i),
      Array.from({length:rows},(_,i)=>i*cols+Math.floor(cols*.66+Math.sin(i*.4)*cols*.1)),
      Array.from({length:cols-5},(_,i)=>Math.floor(rows*.7+Math.sin(i*.27)*rows*.08)*cols+i)
    ];
    const reeds=Array.from({length:mobile?45:85},()=>({x:rng(),h:.08+rng()*.22,phase:rng()*tau}));
    const leaves=Array.from({length:mobile?18:35},()=>({x:rng(),y:rng(),depth:rng(),phase:rng()*tau}));
    const faces=[];
    // The occluder is a coarse skin, not a second full-resolution renderer.
    for(let r=0;r<rows-1;r+=3)for(let c=0;c<cols-1;c+=3){
      const nextR=Math.min(r+3,rows-1),nextC=Math.min(c+3,cols-1);
      faces.push({ids:[r*cols+c,r*cols+nextC,nextR*cols+nextC,nextR*cols+c]});
    }
    return {nodes,edges,routes,reeds,leaves,rows,cols,faces};
  };
  const resolve = (scroll, anchors, height) => {
    if(!anchors.length) return 0;
    const keys=[[0,0],[anchors[0].height*.42,0]];
    anchors.slice(1).forEach((a) => {
      // Focus belongs to the content, not a section boundary. No long plateaus.
      keys.push([Math.max(keys.at(-1)[0]+1,a.top+Math.min(a.height*.23,height*.32)-height*.12),a.value]);
    });
    for(let i=1;i<keys.length;i++) if(scroll<=keys[i][0]) {
      const prev=keys[i-1], next=keys[i];
      const span=next[0]-prev[0], t=clamp((scroll-prev[0])/span);
      const slope=j=>j<0||j>=keys.length-1?0:(keys[j+1][1]-keys[j][1])/(keys[j+1][0]-keys[j][0]);
      const tangent=j=>{const a=slope(j-1),b=slope(j);return a*b>0?2*a*b/(a+b):0;};
      // Monotone cubic interpolation keeps velocity through internal anchors.
      return (2*t*t*t-3*t*t+1)*prev[1]+(t*t*t-2*t*t+t)*span*tangent(i-1)
        +(-2*t*t*t+3*t*t)*next[1]+(t*t*t-t*t)*span*tangent(i);
    }
    return keys.at(-1)[1];
  };
  const create = (scene, {foreground, wake}) => {
    const ctx=scene.context, stage=scene.element;
    const fogTexture=bakeVeil("rgba(161,176,155,1)"),shadowTexture=bakeVeil("rgba(7,13,10,1)");
    let front;
    try { front=foreground?.getContext("2d",{alpha:true}); } catch { /* Main scenery and HTML remain available. */ }
    let width=1,height=1,mobile=false,model,phase=0,pose=0,targetPose=0,staticMode=false,paused=false;
    let intro=0,lastStyle="",lastLight="",requested=false,snapNext=true;
    const world=channel(),camera=channel(),environment=channel(),pointerX=channel(),pointerY=channel();
    const strokeGroups=new Map();
    const sprite=new Image();
    sprite.onload=()=>{scene.dirty=true;wake();};
    // Loaded on first render, not while the module is parsed or for case pages.
    const loadSprite=()=>{if(!requested){requested=true;sprite.src=stage.dataset.motionSprite||"assets/motion/leaf-flight.svg";}};
    const state={
      animate:true, energy:1,
      resize(w,h,ratio) {
        width=w;height=h;mobile=w<801;model=createModel(mobile);
        snapNext=true;
        if(front){foreground.width=Math.round(w*ratio);foreground.height=Math.round(h*ratio);front.setTransform(ratio,0,0,ratio,0,0);}
      },
      scroll(y,anchors,reduced,pause=false) {
        const next=resolve(y,anchors,height);
        const requestedPose=reduced?Math.round(next):next,changedTarget=requestedPose!==targetPose;
        if(staticMode!==reduced||paused!==pause||targetPose!==next)scene.dirty=true;
        staticMode=reduced;paused=pause;
        targetPose=requestedPose;
        // Pausing holds the last frame. Only a NEW paused scroll asks for a
        // different static composition; resuming continues the held approach.
        if(snapNext||reduced||(paused&&changedTarget)){
          pose=follow(world,targetPose,1,0,true);follow(camera,targetPose,1,0,true);follow(environment,targetPose,1,0,true);
        }
        this.animate=true; // render decides whether the quiet composition has settled.
        stage.dataset.scene=String(Math.round(targetPose));
      },
      render(delta,wind,pointer,quality=1,opening=false) {
        if(!model)return;
        const dt=staticMode||paused?0:clamp(delta,0,.05), snap=snapNext||staticMode;
        loadSprite();phase+=dt;if(opening)intro+=dt;else intro=4;
        pose=follow(world,targetPose,mobile?22:16,dt,snap);
        const cameraPose=follow(camera,targetPose,mobile?20:13,dt,snap);
        const lightPose=follow(environment,targetPose,mobile?17:10,dt,snap);
        const t=phase,p=pose,geom=range(p,.86,2.08),signal=range(p,1.94,3.08),dissolve=range(p,3.18,3.94),returning=range(lightPose,5.12,6);
        const nature=(1-range(p,.05,1.08))+returning*.5;
        const system=range(p,.22,.88)*(1-dissolve);
        const cameraX=follow(pointerX,staticMode?0:clamp(pointer.smoothX,-15,15)*.42,8,dt,snap);
        const cameraY=follow(pointerY,staticMode?0:clamp(pointer.smoothY,-10,10)*.38,8,dt,snap);
        const settling=Math.abs(p-targetPose)+Math.abs(cameraPose-targetPose)+Math.abs(lightPose-targetPose)>.0003;
        this.animate=settling||p<3.94||p>5.12;
        this.energy=mix(mix(1,.4,range(p,.5,2.8)),0,dissolve)+returning*.12;
        snapNext=false;
        const windForce=wind.force, gust=wind.gust;
        const travel=range(cameraPose,.95,2.03),signalTravel=range(cameraPose,2.04,2.98);
        const shift=mobile?.5:mix(mix(.29,.7,travel),.31,signalTravel);
        const drift=staticMode?0:Math.sin(t*.09)*2.5;
        const centerX=width*shift+drift,centerY=height*(mobile?.29:.49)+Math.sin(t*.065)*2*(staticMode?0:1);
        const scale=(mobile?Math.min(width/790,height/1100):Math.min(width/1580,height/940))*(1+travel*.22);
        // A bounded orbit cannot unleash accumulated revolutions during a morph.
        const yaw=-.23+travel*(-.35+Math.sin(t*.024)*.42)+signalTravel*.31+cameraX*.0015;
        const tilt=mix(-1.02,-.42,range(cameraPose,.78,2.16))+signalTravel*.21+cameraY*.002;
        const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(tilt),sx=Math.sin(tilt);
        const project=(x,y,z,out=[0,0,0])=>{
          const rx=x*cy+z*sy,rz=z*cy-x*sy,ry=y*cx-rz*sx,depth=y*sx+rz*cx;
          const f=1250/(1250+depth)*scale;
          out[0]=centerX+rx*f+cameraX*(1-depth/450);out[1]=centerY+ry*f+cameraY;out[2]=depth;return out;
        };
        ctx.clearRect(0,0,width,height);if(front)front.clearRect(0,0,width,height);
        const terrainOpacity=clamp(nature*(1-range(p,.52,1)) + returning*.55);
        const terrainScale=1+range(p,0,1)*.48+returning*.05;
        const cssWind=nature>.001?windForce:0,cssGust=nature>.001?gust:0;
        const styles=[terrainOpacity.toFixed(3),terrainScale.toFixed(3),(-range(p,0,1)*height*.16).toFixed(1),cameraX.toFixed(2),cameraY.toFixed(2),cssGust.toFixed(2),cssWind.toFixed(3),p.toFixed(3)].join("/");
        if(styles!==lastStyle){
          stage.style.setProperty("--terrain-opacity",terrainOpacity.toFixed(3));
          stage.style.setProperty("--terrain-scale",terrainScale.toFixed(3));
          stage.style.setProperty("--terrain-y",`${-range(p,0,1)*height*.16}px`);
          stage.style.setProperty("--camera-x",`${cameraX}px`);stage.style.setProperty("--camera-y",`${cameraY}px`);
          stage.style.setProperty("--gust-x",`${cssGust*12}px`);stage.style.setProperty("--wind",String(cssWind));
          stage.style.setProperty("--crossing",String(Math.sin(clamp(p)*Math.PI)));lastStyle=styles;
          stage.style.setProperty("--shade-left",String(clamp((1-system)+system*travel*(1-signalTravel))));
          stage.style.setProperty("--shade-right",String(clamp(system*(1-travel+signalTravel))));
        }
        // Static atmospheric light is a CSS plane; do not rerasterize a
        // viewport-sized radial gradient for every frame of the mesh.
        if(system>.001){
          model.nodes.forEach((node)=>{
            const a=node.map,b=node.geometry,c=node.signal;
            const fold=range(p,.79+node.delay,1.95+node.delay),unfold=range(p,1.88+node.delay,2.9+node.delay);
            let x=mix(mix(a[0],b[0],fold),c[0],unfold), y=mix(mix(a[1],b[1],fold),c[1],unfold), z=mix(mix(a[2],b[2],fold),c[2],unfold);
            x+=Math.sin(t*.18+node.phase)*signal*4;
            y+=Math.sin(t*.12+node.phase)*signal*5;
            // After signal, vertices become free, wind-carried fragments.
            x+=dissolve*(180+node.leaf*400);y-=dissolve*(100+node.leaf*180);z+=dissolve*node.leaf*120;
            project(x,y,z,node.projected);
          });
          // A dim opaque skin occludes the back of the sculpture; front edges
          // remain luminous. Faces retain IDs throughout the two transformations.
          const skin=range(p,1.15,1.87)*(1-range(p,2.05,2.7))*system;
          if(skin>.001){
            ctx.beginPath();
            model.faces.forEach(face=>{
              face.ids.forEach((id,i)=>{const point=model.nodes[id].projected;i?ctx.lineTo(point[0],point[1]):ctx.moveTo(point[0],point[1]);});ctx.closePath();
            });
            ctx.fillStyle=`rgba(15,21,18,${skin*.88})`;ctx.fill();
          }
          // Map contours are strips of the SAME mesh that later closes in 3D.
          strokeGroups.forEach(group=>{group.points.length=0;});
          model.edges.forEach(([a,b,seam],i)=>{
            if(quality<1&&i%3===0)return;
            const node=model.nodes[a];
            const retention=node.active||i%11===0?1:1-range(p,2.12,2.93);
            if(retention<.001)return;
            const pa=model.nodes[a].projected,pb=model.nodes[b].projected;
            const far=clamp((350-(pa[2]+pb[2])*.5)/700);
            const horizontal=b-a===1;
            const density=.35+node.ridge*.65;
            const alpha=system*((horizontal?.2:.025)*density+(geom*(1-signal))*.22);
            const occlusion=mix(1,.13+Math.pow(far,2)*1.3,skin);
            const visible=alpha*occlusion*mix(1,.55+Math.sin(t*.24+node.phase)*.18,signal)*retention;
            const broken=signal*.34;
            const endX=mix(pa[0],pb[0],1-broken),endY=mix(pa[1],pb[1],1-broken);
            const warm=seam&&node.col===Math.floor(model.cols*.62);
            const accent=range(p,1.3,1.95)*(1-range(p,2.3,2.94));
            const alphaBucket=Math.round((visible*(.4+far)+(warm?accent*.13*system:0))*48)/48;
            if(alphaBucket<=0)return;
            const weight=far>.62?1:0;
            const key=`${warm}/${weight}/${alphaBucket}`;
            if(!strokeGroups.has(key))strokeGroups.set(key,{points:[],color:warm?`rgba(173,111,86,${alphaBucket})`:`rgba(210,216,195,${alphaBucket})`,width:weight?.95:.55});
            strokeGroups.get(key).points.push(pa[0],pa[1],endX,endY);
          });
          // Batch same-depth edges: tens of strokes, not thousands of strokes.
          strokeGroups.forEach(group=>{
            if(!group.points.length)return;
            ctx.beginPath();for(let i=0;i<group.points.length;i+=4){ctx.moveTo(group.points[i],group.points[i+1]);ctx.lineTo(group.points[i+2],group.points[i+3]);}
            ctx.lineWidth=group.width;ctx.strokeStyle=group.color;ctx.stroke();
          });
          // Terrain shading, only a few transparent faces — not a flat grid.
          if(geom<.95&&signal<.1){
            ctx.beginPath();
            for(let r=1;r<model.rows-1;r+=3) for(let c=1;c<model.cols-2;c+=3){
              const id=r*model.cols+c,pts=[model.nodes[id].projected,model.nodes[id+2].projected,model.nodes[id+model.cols*2].projected];
              ctx.moveTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[1][0],pts[1][1]);ctx.lineTo(pts[2][0],pts[2][1]);ctx.closePath();
            }
            ctx.fillStyle=`rgba(175,188,154,${system*(1-geom)*.026})`;ctx.fill();
          }
          model.routes.forEach((ids,routeIndex)=>{
            const points=ids.map(id=>model.nodes[id].projected), alpha=system*(routeIndex===0?1:.37)*(1-range(p,2.38,3.5)*.65);
            stroke(ctx,points,routeIndex===0?`rgba(173,97,71,${alpha*.54})`:`rgba(213,215,189,${alpha*.28})`,routeIndex===0?1.65:.7);
            // A travelling drawn segment and node responses share a signal phase.
            const cycle=(t*(routeIndex===0?.048:.029)+routeIndex*.31)%1;
            const run=cycle*(ids.length-1), from=Math.floor(run), fraction=run-from;
            const a=points[from],b=points[Math.min(from+1,points.length-1)];
            const px=mix(a[0],b[0],fraction),py=mix(a[1],b[1],fraction);
            const pulseEnvelope=Math.sin(cycle*Math.PI)**2;
            stroke(ctx,[...points.slice(Math.max(0,from-3),from+1),[px,py]],`rgba(222,197,157,${alpha*pulseEnvelope*.8})`,1.8);
            glow(ctx,px,py,mobile?17:30,`rgba(193,108,70,${alpha*pulseEnvelope*.2})`);dot(ctx,px,py,2.8,`rgba(234,217,177,${alpha*pulseEnvelope})`);
            points.forEach((point,i)=>{
              if(i%5!==0)return;
              const response=.35+.65*Math.pow(Math.max(0,Math.cos(t*.6-i*.7-routeIndex)),10);
              dot(ctx,point[0],point[1],2,`rgba(222,217,185,${alpha*response})`);
              const rings=1-range(p,1.12,1.86);
              if(rings>.001){ctx.beginPath();ctx.arc(point[0],point[1],8+response*3,0,tau);ctx.lineWidth=.7;ctx.strokeStyle=`rgba(194,199,172,${alpha*rings*.25})`;ctx.stroke();}
            });
          });
          const axes=range(p,1.17,1.94)*(1-range(p,2.14,2.78));
          if(axes>.001){
            const origin=project(0,0,0),a=system*axes;
            [[390,0,0,"X"],[0,-330,0,"Y"],[0,0,360,"Z"]].forEach(axis=>{
              const end=project(axis[0],axis[1],axis[2]);ctx.setLineDash([2,8]);stroke(ctx,[origin,end],`rgba(221,220,203,${a*.24})`,.7);ctx.setLineDash([]);
              ctx.fillStyle=`rgba(223,222,200,${a*.7})`;ctx.font="12px ui-monospace,monospace";ctx.fillText(axis[3],end[0]+8,end[1]-6);
            });
            // A construction plane moves through the camera as the surface turns.
            const span=460+Math.sin(t*.08)*30;
            stroke(ctx,[project(-span,220,-span),project(span,220,-span),project(span,220,span)],`rgba(193,195,174,${a*.14})`,.8);
          }
          const signals=range(p,1.72,2.85);
          if(signals>.001){
            const a=system*signals;
            model.nodes.forEach((node,i)=>{
              if(!node.active)return;
              const [x,y,z]=node.projected;
              const proximity=pointer.engaged&&!mobile&&!staticMode?clamp(1-Math.hypot(x-(cameraX/15+.5)*width,y-(cameraY/10+.5)*height)/100):0;
              const carrier=t*(node.cluster===0?.39:.24)-node.row*.19-node.col*.075;
              const pulse=Math.max(proximity*.35,Math.pow(Math.max(0,Math.cos(carrier)),18)*(node.cluster===2?.18:1));
              const keyNode=node.importance>.975;
              dot(ctx,x,y,(keyNode?2.7:1.1+pulse*1.8)*clamp(1-z/900,.7,1.4),`rgba(221,205,170,${a*(keyNode?.65:.27+pulse*.65)})`);
            });
            // Interference sheet cuts across clusters rather than a brain icon.
            for(let band=0;band<(mobile?2:3);band++){
              const points=[];
              for(let i=0;i<65;i++){const x=i/64*width,envelope=Math.exp(-Math.pow((x-width*.31)/(width*.23),2));points.push([x,centerY+Math.sin(i*.13-t*.3+band*.18)*height*.045*envelope+(band-1)*11]);}
              stroke(ctx,points,`rgba(210,192,157,${a*(band===1?.14:.035)})`,band===1?1.1:.6);
            }
          }
          const labels=1-range(p,1.16,1.78);
          if(labels>.001){
            ctx.font="11px ui-monospace,monospace";ctx.fillStyle=`rgba(201,207,182,${system*labels*.55})`;
            [3,9,15].forEach((r,i)=>{const n=model.nodes[Math.min(model.nodes.length-1,r*model.cols+4)].projected;ctx.fillText(["SYNC / 01","ROUTE / 02","FIELD / 03"][i],n[0]+10,n[1]-15);});
          }
        }
        // Coherent field motion: one force drives grass, mist and airborne matter.
        if(nature>.01){
          model.reeds.forEach((reed,i)=>{
            const side=reed.x<.35||reed.x>.8;
            const emergence=side?1:range(p,.08,.36);
            if(emergence<.001)return;
            const x=reed.x*width,base=height*(1.03-reed.x*.025),h=height*reed.h*(mobile?.6:1);
            const bend=(18+reed.h*80)*windForce+Math.sin(t*.5+reed.phase)*10+gust*18;
            ctx.beginPath();ctx.moveTo(x,base);ctx.bezierCurveTo(x+bend*.2,base-h*.3,x+bend*.6,base-h*.9,x+bend,base-h);
            ctx.strokeStyle=`rgba(191,185,157,${nature*emergence*(i%4===0?.27:.13)})`;ctx.lineWidth=i%4===0?1.2:.65;ctx.stroke();
            if(i%3===0){ctx.beginPath();ctx.ellipse(x+bend+2,base-h-5,1.4,9,.4,0,tau);ctx.fillStyle=`rgba(204,192,153,${nature*emergence*.26})`;ctx.fill();}
          });
        }
        const matter=Math.max(nature,dissolve*(1-range(p,4,4.2)));
        if(matter>.01) model.leaves.forEach((leaf,i)=>{
          if(quality<1&&i%3===0)return;
          leaf.x=(leaf.x+dt*(.009+leaf.depth*.023)*windForce)%1.12;
          const x=(leaf.x-.06)*width+cameraX*leaf.depth,y=height*(leaf.y*.9+Math.sin(t*.25+leaf.phase)*.016);
          ctx.save();ctx.translate(x,y);ctx.rotate(leaf.phase+t*.18);ctx.scale(1,.55+Math.abs(Math.sin(t+leaf.phase))*.4);
          ctx.fillStyle=`rgba(216,202,161,${matter*(.2+leaf.depth*.28)})`;ctx.beginPath();ctx.ellipse(0,0,1+leaf.depth*3,1+leaf.depth,0,0,tau);ctx.fill();ctx.restore();
        });
        // One physical near-camera leaf at a time, not a shower of confetti.
        const passage=opening?clamp((intro-.85)/1.35):((t+2.1)%23)/4;
        const leafPresence=(1-range(p,.65,1.12))+returning*.45;
        if(front&&sprite.complete&&sprite.naturalWidth&&passage>0&&passage<1&&leafPresence>.001){
          const s=mobile?100:190, x=mix(-s,width+s,passage), y=height*(.66-Math.sin(passage*Math.PI)*.39);
          const index=Math.floor((t*10*(.6+windForce*.4))%16);
          front.save();front.globalAlpha=Math.sin(passage*Math.PI)*.7*leafPresence;front.translate(x,y);front.rotate(-.6+passage*1.7);
          front.drawImage(sprite,index*160,0,160,160,-s/2,-s/2,s,s);front.restore();
        }
        // Two spatial veils cross on different beats. Their soft masks occlude
        // the fold rather than announcing a full-screen fade between worlds.
        const foldVeil=range(lightPose,.92,1.45)*(1-range(lightPose,1.64,2.21));
        const signalVeil=range(lightPose,1.96,2.3)*(1-range(lightPose,2.54,3.16));
        const crossing=Math.sin(clamp(lightPose)*Math.PI)*.13;
        const veil=foldVeil*.16+signalVeil*.11+crossing;
        if(veil>.001){
          ctx.save();ctx.translate(width*(.16+range(lightPose,.6,3.2)*.65)+gust*12,height*(.64-range(lightPose,1,3)*.31));ctx.scale(1,mobile?.48:.32);
          const radius=width*(.44+foldVeil*.18);
          if(fogTexture){ctx.globalAlpha=veil;ctx.drawImage(fogTexture,-radius,-radius,radius*2,radius*2);}
          else glow(ctx,0,0,radius,`rgba(161,176,155,${veil})`);
          ctx.restore();
          if(front&&!staticMode&&!mobile){
            front.save();front.translate(width*(1.2-range(p,.9,2.9)*1.4),height*.6);front.rotate(-.4);front.scale(.28,1);
            const radius=height*.65;
            if(shadowTexture){front.globalAlpha=(foldVeil+signalVeil)*.25;front.drawImage(shadowTexture,-radius,-radius,radius*2,radius*2);}
            else glow(front,0,0,radius,`rgba(7,13,10,${(foldVeil+signalVeil)*.25})`);
            front.restore();
          }
        }
        const lightX=mix(72,29,range(lightPose,.6,3.2)).toFixed(1),lightY=(35+Math.sin(lightPose)*14).toFixed(1);
        if(`${lightX}/${lightY}`!==lastLight){
          stage.style.setProperty("--light-x",`${lightX}%`);stage.style.setProperty("--light-y",`${lightY}%`);lastLight=`${lightX}/${lightY}`;
        }
        if(!stage.classList.contains("is-rendered")){
          stage.classList.add("is-rendered");document.body.classList.add("journey-ready");
        }
      },
      // Read-only deterministic contract for the local geometry verifier.
      inspect:()=>({pose,targetPose,cameraPose:camera.value,lightPose:environment.value,velocity:world.velocity,phase,vertices:model?.nodes.length||0,projected:model?.nodes.map(n=>n.projected.slice())||[]})
    };
    return state;
  };
  window.PortfolioJourney=Object.freeze({create,resolve});
})();
