/* Azriel's last lines become the next map. One graph, no swapped posters.
 * main.js owns visibility, measurements and the only animation scheduler. */
(() => {
  "use strict";
  const tau = Math.PI * 2;
  const clamp = n => Math.max(0, Math.min(1, n));
  const mix = (a,b,t) => a+(b-a)*t;
  const range = (n,a,b) => { const t=clamp((n-a)/(b-a)); return t*t*(3-2*t); };
  const resolve = (y,top,height,viewport) => clamp((y+viewport*.87-top)/(height*.78));
  const sample = (points,t) => {
    const position=t*(points.length-1), index=Math.min(points.length-2,Math.floor(position));
    return [mix(points[index][0],points[index+1][0],position-index),mix(points[index][1],points[index+1][1],position-index)];
  };
  const createModel = mobile => {
    const count=mobile?10:17, samples=mobile?44:72;
    const angles=[-.8,-.38,.1,.46,1.55,2.4,2.75,3.18];
    const lines=Array.from({length:count+2},(_,line) => {
      const route=line>=count, angle=angles[line%8];
      const source=Array.from({length:6},(_,depth) => {
        const distance=38+depth*42,turn=angle+Math.sin(depth*.55+line%8)*.19;
        return [(line%8<4?400:530)+Math.cos(turn)*distance*1.28, (line%8<4?310:395)+Math.sin(turn)*distance*.88];
      });
      const destination=route
        ? line===count?[[65,492],[205,419],[318,433],[421,307],[561,330],[663,238],[820,176]]
          : [[137,130],[288,216],[421,307],[513,470],[706,521],[894,456]]
        : null;
      const points=Array.from({length:samples},(_,index) => {
        const t=index/(samples-1),a=t*tau;
        const radius=(38+Math.pow(line/Math.max(1,count-1),1.24)*395)*(1+.18*Math.sin(a*3+line*.06)+.055*Math.cos(a*7));
        const target=route?sample(destination,t):[555+Math.cos(a)*radius*1.3+Math.sin(a*2)*32,360+Math.sin(a)*radius*.77+line*1.7];
        return {from:sample(source,t),to:target,position:[0,0]};
      });
      return {points,route,delay:(line%5)*.023};
    });
    return {lines,samples};
  };
  const bake = fog => {
    const canvas=document.createElement("canvas");
    canvas.width=128;canvas.height=256;
    const ctx=canvas.getContext?.("2d");
    if(!ctx)return null;
    const g=fog?ctx.createRadialGradient(80,140,0,80,140,110):ctx.createLinearGradient(0,0,0,256);
    if(fog){g.addColorStop(0,"#e5e0d4");g.addColorStop(1,"#e5e0d400");}
    else {
      for(const [at,color] of [[0,"#111310"],[.18,"#111310"],[.36,"#45483e"],[.58,"#afb1a0"],[.78,"#e5e0d4"],[1,"#e5e0d4"]]) g.addColorStop(at,color);
    }
    ctx.fillStyle=g;ctx.fillRect(0,0,128,256);return canvas;
  };
  const create = scene => {
    const ctx=scene.context;
    let width=1,height=1,mobile=false,model=null,paper=null,fog=null;
    let target=0,visual=0,light=0,phase=0,snap=true,paused=false,reduced=false;
    return {
      animate:false,
      resize(w,h) {
        width=w;height=h;mobile=w<801;
        // Geometry/paint are prepared on first nearby render, not page startup.
        model=null;snap=true;
      },
      prepare() {
        if(!model){model=createModel(mobile);paper ||= bake(false);fog ||= bake(true);}
      },
      scroll(y,anchors,reduce,pause,viewport) {
        const next=resolve(y,scene.top,height,viewport);
        const changed=next!==target, modeChanged=reduced!==reduce||paused!==pause;
        target=next;reduced=reduce;paused=pause;
        if(changed||modeChanged||snap)scene.dirty=true;
        if(snap||reduced||(paused&&changed))visual=light=target;
        if(changed||modeChanged)this.animate=true;
      },
      render(delta) {
        this.prepare();
        const dt=paused||reduced?0:Math.min(.05,delta);
        if(snap||reduced)visual=light=target;
        else {
          visual=mix(visual,target,1-Math.exp(-(mobile?24:18)*dt));
          light=mix(light,target,1-Math.exp(-(mobile?21:15)*dt));
        }
        if(Math.abs(visual-target)<.0001)visual=target;
        if(Math.abs(light-target)<.0001)light=target;
        const calm=1-range(visual,.32,.88);
        phase+=dt*calm;
        this.animate=Math.abs(visual-target)+Math.abs(light-target)>.0001||(visual>0&&calm>.001);
        snap=false;
        ctx.clearRect(0,0,width,height);
        if(paper)ctx.drawImage(paper,0,0,width,height);
        const luminance=range(light,.12,.85);
        if(fog){
          ctx.save();ctx.globalAlpha=Math.sin(luminance*Math.PI)*.27;
          ctx.drawImage(fog,width*(.18-luminance*.2),-height*.16,width*1.1,height*1.15);ctx.restore();
        }
        const scale=Math.min(width/960,height/720)*(mobile?1.52:.78);
        const placement=reduced?1:range(visual,.1,.83);
        ctx.save();ctx.translate(width*(mobile?.78:.73),height*mix(.28,.53,placement));ctx.scale(scale,scale);ctx.translate(-530,-360);
        const ink=range(light,.26,.82), r=Math.round(mix(204,62,ink)),g=Math.round(mix(190,78,ink)),b=Math.round(mix(157,64,ink));
        for(let index=0;index<model.lines.length;index++){
          const line=model.lines[index],morph=reduced?1:range(visual,.12+line.delay,.79+line.delay);
          ctx.beginPath();
          for(let i=0;i<line.points.length;i++){
            const point=line.points[i],out=point.position;
            out[0]=mix(point.from[0],point.to[0],morph);out[1]=mix(point.from[1],point.to[1],morph);
            if(i)ctx.lineTo(out[0],out[1]);else ctx.moveTo(out[0],out[1]);
          }
          ctx.strokeStyle=line.route?`rgba(166,82,57,${mix(.35,.48,ink)})`:`rgba(${r},${g},${b},${index%4===0?.26:.12})`;
          ctx.lineWidth=line.route?1.35:index%4===0?.9:.6;ctx.stroke();
          if(line.route||index%3===0){
            for(let i=0;i<line.points.length;i+=Math.floor(model.samples/5)){
              const point=line.points[i].position;
              const pulse=reduced?0:(.5+.5*Math.sin(phase*.7-i*.1-index))*calm;
              ctx.beginPath();ctx.arc(point[0],point[1],line.route?2.4:1.4+pulse*.8,0,tau);
              ctx.fillStyle=`rgba(${r},${g},${b},${line.route?.62:(.22+pulse*.2)*(1-morph*.7)})`;ctx.fill();
            }
          }
        }
        ctx.restore();
      },
      inspect:()=>({target,visual,light,phase,points:model?.lines.reduce((n,l)=>n+l.points.length,0)||0,projected:model?.lines.flatMap(l=>l.points.map(p=>p.position.slice()))||[]})
    };
  };
  window.PortfolioBridge=Object.freeze({create,resolve});
})();
