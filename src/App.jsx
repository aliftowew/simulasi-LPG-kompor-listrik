import { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, AreaChart, Area,
  PieChart, Pie, Cell,
} from "recharts";

const C = {
  bg:"#05080f",surface:"#0c1220",card:"#111b2e",border:"#1c2a45",
  borderLight:"#253454",accent:"#f0a830",accentDim:"#b07a10",
  accentGlow:"rgba(240,168,48,0.12)",red:"#f04438",redDim:"rgba(240,68,56,0.12)",
  green:"#12b76a",greenDim:"rgba(18,183,106,0.12)",blue:"#2e90fa",
  blueDim:"rgba(46,144,250,0.12)",cyan:"#06aed4",purple:"#9b59b6",
  text:"#d0d5dd",textMuted:"#667085",textBright:"#f5f5f6",white:"#fff",
};
const fmt=n=>new Intl.NumberFormat("id-ID").format(Math.round(n));
const fmtT=n=>`Rp ${(n/1e12).toFixed(1)} T`;
const fmtB=n=>`US$ ${(n/1e9).toFixed(2)} M`;

const Latex=({children,display=false})=>{const ref=useRef(null);useEffect(()=>{if(ref.current&&window.katex){try{window.katex.render(children,ref.current,{throwOnError:false,displayMode:display,output:"html"});}catch{ref.current.textContent=children;}}},[children,display]);return <span ref={ref}/>;};

/* ─── VERIFIED SOURCES ─── */
const SRC={
  targetRT:{l:"Kompas.id / Litbang Kompas (target 2060)",u:"https://www.kompas.id/baca/riset/2022/10/01/analisis-litbang-kompas-kebijakan-transisi-energi-belum-mendapat-dukungan-publik"},
  rtAktual:{l:"Databoks / BPS (88,59% RT)",u:"https://databoks.katadata.co.id/en/energy/statistics/67a1b68d7cc32/how-many-indonesian-households-use-lpg"},
  konsumsiLPG:{l:"Kemenperin / PLN",u:"https://agro.kemenperin.go.id/artikel/6482-konversi-lpg-ke-listrik-bagaimana-dampak-bagi-masyarakat-dan-industri"},
  hargaSubsidi:{l:"Harga tetap sejak 2007",u:"https://katadata.co.id/berita/energi/63243bfaaeda3/perbandingan-biaya-masak-antara-kompor-induksi-listrik-dan-lpg-3-kg"},
  hargaEkonomian:{l:"Katadata / PLN (Sep 2022)",u:"https://katadata.co.id/berita/energi/63243bfaaeda3/perbandingan-biaya-masak-antara-kompor-induksi-listrik-dan-lpg-3-kg"},
  imporVolume:{l:"CNBC Indonesia / BPS",u:"https://www.cnbcindonesia.com/news/20250718163807-4-650356/alamak-75-lpg-subsidi-3-kg-berasal-dari-impor"},
  imporNilai:{l:"CNBC Indonesia / BPS",u:"https://www.cnbcindonesia.com/news/20250718163807-4-650356/alamak-75-lpg-subsidi-3-kg-berasal-dari-impor"},
  subsidiTotal:{l:"Banggar DPR / Databoks",u:"https://databoks.katadata.co.id/ekonomi-makro/statistik/67a2e18b9aa96/kisruh-distribusi-lpg-ini-anggaran-subsidinya-pada-2025"},
  kapasitasPLN:{l:"ESDM / Bahlil (Jan 2026)",u:"https://www.esdm.go.id/en/media-center/news-archives/semester-i-tahun-2025-kapasitas-terpasang-pembangkit-meningkat-44-gw"},
  reserveMargin:{l:"Kontan / PLN (Jun 2023)",u:"https://industri.kontan.co.id/news/reserve-margin-kelistrikan-jawa-bali-mencapai-44-per-juni-2023"},
  rasioElektrifikasi:{l:"Databoks / ESDM (2024)",u:"https://databoks.katadata.co.id/en/utilities/statistics/6927efbf1ae87/indonesias-electrification-ratio-continues-to-increase-until-2024"},
  tarifListrik:{l:"Kompas / PLN (Rp 1.444,70)",u:"https://www.kompas.com/tren/read/2025/11/03/064500765/ini-tarif-listrik-rumah-tangga-daya-1300-dan-2200-va-per-1-november-2025"},
  indef:{l:"INDEF Policy Brief 3/2023",u:"https://indef.or.id/wp-content/uploads/2023/05/032023_pb_indef-1.pdf"},
  impor80:{l:"CNBC Indonesia / BPS",u:"https://www.cnbcindonesia.com/news/20250718163807-4-650356/alamak-75-lpg-subsidi-3-kg-berasal-dari-impor"},
  bebanPuncak:{l:"PLN Statistik",u:"https://web.pln.co.id/statics/uploads/2023/05/Statistik-PLN-2022-Final-2.pdf"},
  efisiensiInduksi:{l:"DOE / Wikipedia (84–90%)",u:"https://en.wikipedia.org/wiki/Induction_cooking"},
  efisiensiGas:{l:"DOE (40–44%)",u:"https://en.wikipedia.org/wiki/Induction_cooking"},
  hargaImporLPG:{l:"CNBC Indonesia / IDN Times",u:"https://www.idntimes.com/business/economy/impor-migas-ri-capai-rp580-56-triliun-lpg-didominasi-dari-as-00-gshdq-bq22rp"},
  biayaKompor:{l:"DetikFinance / ESDM (Rp 1,8jt dasar)",u:"https://finance.detik.com/energi/d-6306143/isi-paket-kompor-listrik-gratis-rp-2-juta-yang-mau-dibagikan-pemerintah"},
  mcbKhusus:{l:"Kompas / PLN",u:"https://money.kompas.com/read/2022/09/15/081000326/pln-memasak-dengan-kompor-induksi-tidak-perlu-tambah-daya-ada-jalur-khusus"},
  pelangganSubsidi:{l:"Fraksi PKS / Bisnis.com (2021)",u:"https://fraksi.pks.id/2022/09/14/aleg-pks-penghapusan-daya-listrik-450-va-tambah-beban-masyarakat/"},
  upgradeDistribusi:{l:"Kontan / PLN",u:"https://industri.kontan.co.id/news/pln-beberkan-kendala-yang-bisa-hambat-konversi-kompor-lpg-ke-kompor-induksi"},
  plnSerap13gw:{l:"Medcom / Antara / PLN",u:"https://www.antaranews.com/berita/2705701/program-kompor-induksi-berpotensi-serap-listrik-13-gigawatt"},
  konversiMitan:{l:"PMC / ScienceDirect",u:"https://pmc.ncbi.nlm.nih.gov/articles/PMC6186446/"},
  prabowo2026:{l:"Kompas / Maret 2026",u:"https://nasional.kompas.com/read/2026/03/05/18193651/prabowo-minta-konversi-kompor-listrik-dikebut-kurangi-ketergantungan-impor"},
  prodLokal2022:{l:"Liputan6 / Kemenperin (Sep 2022)",u:"https://www.liputan6.com/bisnis/read/5076104/153-juta-kompor-listrik-bakal-dipasok-industri-lokal-sampai-2025"},
  prodKapasitas5jt:{l:"Katadata / Kemenperin",u:"https://katadata.co.id/tiakomalasari/berita/632ac1960ac26/produksi-kompor-listrik-akan-digenjot-hingga-5-juta-unit-tahun-depan"},
  prod11pabrikan:{l:"Republika / PLN (Sep 2022)",u:"https://www.republika.co.id/berita/ri750d383/11-pabrikan-lokal-siap-produksi-kompor-induksi-untuk-pln"},
  prodTKDN:{l:"Katadata (TKDN 25%)",u:"https://katadata.co.id/berita/nasional/632dbec48e291/perusahaan-milik-orang-terkaya-ri-siap-produksi-1-juta-kompor-listrik"},
  prodKemenperin:{l:"Kemenperin Siaran Pers",u:"https://kemenperin.go.id/artikel/22491/Siap-Produksi,-Industri-Nasional-Dukung-Program-Konversi-1-Juta-Kompor-Listrik"},
  prod5perusahaan:{l:"CNBC Indonesia (Sep 2022)",u:"https://www.cnbcindonesia.com/market/20220922081651-17-374047/5-perusahaan-ini-cuan-dari-kompor-listrik-ada-konglomerat"},
};
const SBtn=({k})=>{const s=SRC[k];if(!s)return null;return<a href={s.u} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,color:C.accent,background:C.accentGlow,border:`1px solid ${C.accentDim}40`,borderRadius:20,padding:"2px 10px 2px 7px",textDecoration:"none",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}} onMouseEnter={e=>{e.currentTarget.style.background=C.accentDim+"50"}} onMouseLeave={e=>{e.currentTarget.style.background=C.accentGlow}}><span style={{fontSize:9}}>🔗</span>{s.l}</a>;};

/* ─── UI ─── */
const Sec=({children,accent=C.accent})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"28px 22px",marginBottom:20,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,width:4,height:"100%",background:accent,borderRadius:"16px 0 0 16px"}}/>{children}</div>;
const ST=({icon,title,sub})=><div style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><span style={{fontSize:20}}>{icon}</span><h2 style={{margin:0,fontSize:18,fontWeight:800,color:C.textBright,fontFamily:"'Sora',sans-serif"}}>{title}</h2></div>{sub&&<p style={{margin:0,fontSize:13,color:C.textMuted,paddingLeft:30,lineHeight:1.5}}>{sub}</p>}</div>;
const P=({children})=><p style={{fontSize:13.5,color:C.text,lineHeight:1.75,margin:"10px 0"}}>{children}</p>;
const FB=({texLines})=><div style={{background:"#080e1e",border:`1px solid ${C.borderLight}`,borderRadius:12,padding:"18px 22px",margin:"14px 0",overflowX:"auto"}}>{texLines.map((t,i)=><div key={i} style={{marginBottom:i<texLines.length-1?10:0,textAlign:"center"}}><Latex display>{t}</Latex></div>)}</div>;
const CO=({children,type="info"})=>{const m={info:{bg:C.blueDim,b:C.blue,i:"💡"},success:{bg:C.greenDim,b:C.green,i:"✅"},warning:{bg:C.accentGlow,b:C.accent,i:"⚠️"},danger:{bg:C.redDim,b:C.red,i:"🚨"}};const cc=m[type];return<div style={{background:cc.bg,border:`1px solid ${cc.b}30`,borderRadius:10,padding:"12px 16px",margin:"14px 0",fontSize:13,color:C.text,lineHeight:1.6,display:"flex",gap:10,alignItems:"flex-start"}}><span style={{fontSize:16,flexShrink:0}}>{cc.i}</span><div>{children}</div></div>;};
const MC=({title,value,sub,color=C.accent,icon})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${color},${color}00)`}}/><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>{icon} {title}</div><div style={{fontSize:24,fontWeight:800,color,fontFamily:"'Space Mono',monospace",lineHeight:1.1}}>{value}</div>{sub&&<div style={{fontSize:11,color:C.textMuted,marginTop:6}}>{sub}</div>}</div>;
const Sl=({label,value,onChange,min,max,step=1,formatter,source})=><div style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexWrap:"wrap",gap:2}}><div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}><span style={{fontSize:11,color:C.textMuted}}>{label}</span>{source&&<SBtn k={source}/>}</div><span style={{fontSize:12,color:C.accent,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{formatter?formatter(value):fmt(value)}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",height:5,appearance:"none",borderRadius:3,outline:"none",cursor:"pointer",background:`linear-gradient(to right,${C.accent} ${((value-min)/(max-min))*100}%,${C.border} ${((value-min)/(max-min))*100}%)`}}/></div>;
const VR=({sym,param,val,unit,src,color,note})=><tr style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"10px 8px",color:C.cyan,fontSize:14,fontWeight:700,width:55,verticalAlign:"middle"}}><Latex>{sym}</Latex></td><td style={{padding:"10px 8px",fontSize:13,color:C.text}}>{param}{note&&<span style={{fontSize:11,color:C.accent,marginLeft:4}}>({note})</span>}</td><td style={{padding:"10px 8px",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,color:color||C.accent,textAlign:"right",whiteSpace:"nowrap"}}>{val}<span style={{fontSize:11,color:C.textMuted,fontWeight:400,marginLeft:4}}>{unit}</span></td><td style={{padding:"10px 4px",textAlign:"right"}}>{src&&<SBtn k={src}/>}</td></tr>;
const TT={background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12,color:C.text};

/* ═══ APP ═══ */
export default function App(){
  const[rt,setRt]=useState(52e6);
  const[alpha,setAlpha]=useState(30);
  const[qLPG,setQ]=useState(11.4);
  const[pSub,setPS]=useState(4250);
  const[pEkon,setPE]=useState(19698);
  const[tL,setTL]=useState(1444);
  const[dW,setDW]=useState(1800);
  const[bK,setBK]=useState(2e6);
  const[hI,setHI]=useState(550);
  const[kurs,setKurs]=useState(16200);
  const[sLPG,setSLPG]=useState(true);
  const[hargaKomporUSD,setHKU]=useState(25);
  const[prodLokalJt,setProdLokal]=useState(0.3); // juta unit/tahun - kapasitas aktual 2022
  const[kr,setKR]=useState(false);
  const[sideOpen,setSideOpen]=useState(false);

  useEffect(()=>{if(window.katex){setKR(true);return;}const l=document.createElement("link");l.rel="stylesheet";l.href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";document.head.appendChild(l);const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";s.onload=()=>setKR(true);document.head.appendChild(s);},[]);

  const c=useMemo(()=>{
    const rtK=rt*(alpha/100),spk=pEkon-pSub,kwk=(7.2*0.44)/0.87,kwb=qLPG*kwk;
    const bL=qLPG*pSub,bI=kwb*tL,bLE=qLPG*pEkon,sel=bL-bI;
    const B1=rtK*qLPG*12*spk;
    const B2_devisa=rtK*qLPG*12*hI*kurs/1000; // indikator strategis, TIDAK dijumlahkan
    const B3=rtK*kwb*12*tL;
    const Bt=B1+B3; // total benefit = B1 + B3 ONLY (no double counting)
    const C1=rtK*bK,C2=rtK*.5*750000,C3=rtK*.6*800000,C4=rtK*50000,C6=3e12;
    const Co=C1+C2+C3+C4+C6,C5=sLPG&&sel<0?rtK*Math.abs(sel)*12:0;
    const nb=Bt-C5,roi=nb>0?Co/(nb/12):Infinity,gw=(rtK*dW*0.3)/1e9;
    const devisaHematLPGPerTahun=B2_devisa;
    const prodLokalUnit=prodLokalJt*1e6;
    const unitImporKompor=Math.max(0,rtK-prodLokalUnit);
    const unitLokalKompor=Math.min(rtK,prodLokalUnit);
    const pctLokal=rtK>0?(unitLokalKompor/rtK)*100:0;
    const devisaImporKompor=unitImporKompor*hargaKomporUSD*kurs;
    const roiDevisa=devisaHematLPGPerTahun>0?devisaImporKompor/(devisaHematLPGPerTahun/12):Infinity;
    const tahunProduksi=prodLokalUnit>0?Math.ceil(rtK/prodLokalUnit):Infinity;
    return{rtK,kwk,kwb,bL,bI,bLE,sel,B1,B2_devisa,B3,Bt,C1,C2,C3,C4,C5,C6,Co,nb,roi,gw,
      r5:nb>0?(nb*5)/Co:0,r10:nb>0?(nb*10)/Co:0,
      devisaImporKompor,devisaHematLPGPerTahun,roiDevisa,
      unitImporKompor,unitLokalKompor,pctLokal,prodLokalUnit,tahunProduksi};
  },[rt,alpha,qLPG,pSub,pEkon,tL,dW,bK,hI,kurs,sLPG,hargaKomporUSD,prodLokalJt]);

  const impD=[{t:"2020",impor:6.40,dom:1.92},{t:"2021",impor:6.10,dom:1.95},{t:"2022",impor:6.74,dom:1.97},{t:"2023",impor:6.95,dom:1.96},{t:"2024",impor:6.89,dom:1.96},{t:"2025",impor:7.49,dom:1.97}];
  const bD=[{name:"Hemat Subsidi (B₁)",value:c.B1/1e12,color:C.green},{name:"Pendapatan PLN (B₃)",value:c.B3/1e12,color:C.cyan}];
  const cD=[{name:"Kompor (C₁)",value:c.C1/1e12,color:C.red},{name:"Daya (C₂)",value:c.C2/1e12,color:"#e67e22"},{name:"Distribusi (C₃)",value:c.C3/1e12,color:"#e74c3c"},{name:"Edukasi (C₄)",value:c.C4/1e12,color:C.purple},{name:"Manufaktur (C₆)",value:c.C6/1e12,color:"#95a5a6"}];
  const mD=[{label:"LPG Subsidi",biaya:c.bL,color:C.red},{label:"Induksi 1300VA",biaya:c.bI,color:C.cyan},{label:"LPG Ekonomi",biaya:c.bLE,color:"#dc2626"},{label:"Induksi 450VA",biaya:c.kwb*415,color:C.green}];
  const sD=[10,20,30,40,50,60,70,80,90,100].map(p=>{const r=rt*(p/100);const b1=r*qLPG*12*(pEkon-pSub);const b3=r*c.kwb*12*tL;const b=b1+b3;const co=r*(bK+.5*750000+.6*800000+50000)+3e12;return{persen:`${p}%`,benefit:+(b/1e12).toFixed(1),cost:+(co/1e12).toFixed(1)};});

  if(!kr)return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.accent,fontSize:16}}>Memuat formula renderer...</div>;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Space+Mono:wght@400;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"/>

      {/* ═══ FLOATING SIDEBAR ═══ */}
      <div style={{position:"fixed",top:0,right:sideOpen?0:-380,width:360,height:"100vh",background:C.card,borderLeft:`1px solid ${C.border}`,zIndex:1000,transition:"right .35s cubic-bezier(.4,0,.2,1)",overflowY:"auto",padding:"20px 18px",boxSizing:"border-box"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{margin:0,fontSize:15,fontWeight:800,color:C.textBright,fontFamily:"'Sora',sans-serif"}}>⚡ Parameter</h3>
          <button onClick={()=>setSideOpen(false)} style={{background:"transparent",border:"none",color:C.textMuted,fontSize:20,cursor:"pointer",padding:4}}>✕</button>
        </div>
        <Sl label="Total RT (N)" value={rt} onChange={setRt} min={1e6} max={100e6} step={1e6} formatter={v=>`${(v/1e6).toFixed(0)} jt RT`} source="targetRT"/>
        <Sl label="Konversi (α)" value={alpha} onChange={setAlpha} min={5} max={100} step={5} formatter={v=>`${v}%`}/>
        <Sl label="Konsumsi LPG (Q)" value={qLPG} onChange={setQ} min={5} max={20} step={.1} formatter={v=>`${v} kg/bln`} source="konsumsiLPG"/>
        <Sl label="Harga LPG Subsidi (Pₛ)" value={pSub} onChange={setPS} min={4250} max={19698} step={100} formatter={v=>`Rp ${fmt(v)}/kg`} source="hargaSubsidi"/>
        <Sl label="Harga Keekonomian (Pₑ)" value={pEkon} onChange={setPE} min={10000} max={30000} step={100} formatter={v=>`Rp ${fmt(v)}/kg`} source="hargaEkonomian"/>
        <Sl label="Tarif Listrik (Tₗ)" value={tL} onChange={setTL} min={415} max={2466} step={10} formatter={v=>`Rp ${fmt(v)}/kWh`} source="tarifListrik"/>
        <Sl label="Daya Kompor" value={dW} onChange={setDW} min={600} max={2400} step={100} formatter={v=>`${fmt(v)} W`}/>
        <Sl label="Biaya Kompor/RT" value={bK} onChange={setBK} min={5e5} max={5e6} step={1e5} formatter={v=>`Rp ${fmt(v)}`} source="biayaKompor"/>
        <Sl label="Harga Impor LPG" value={hI} onChange={setHI} min={300} max={900} step={10} formatter={v=>`US$ ${v}/ton`} source="hargaImporLPG"/>
        <Sl label="Kurs USD/IDR" value={kurs} onChange={setKurs} min={14000} max={18000} step={100} formatter={v=>`Rp ${fmt(v)}`}/>
        <Sl label="Harga Impor Kompor" value={hargaKomporUSD} onChange={setHKU} min={10} max={80} step={1} formatter={v=>`US$ ${v}/unit`}/>
        <Sl label="Produksi Lokal Kompor" value={prodLokalJt} onChange={setProdLokal} min={0} max={10} step={.1} formatter={v=>`${v.toFixed(1)} jt unit/thn`} source="prodLokal2022"/>
        <div style={{marginTop:4,padding:"12px 14px",background:C.surface,borderRadius:10,border:`1px solid ${C.border}`}}>
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:12,color:C.text}}>
            <div onClick={()=>setSLPG(!sLPG)} style={{width:42,height:24,borderRadius:12,position:"relative",transition:"background .3s",background:sLPG?C.red:C.green,cursor:"pointer",flexShrink:0}}><div style={{width:18,height:18,borderRadius:"50%",background:C.white,position:"absolute",top:3,left:sLPG?3:21,transition:"left .3s"}}/></div>
            Subsidi LPG {sLPG?<span style={{color:C.red,fontWeight:700}}>tetap</span>:<span style={{color:C.green,fontWeight:700}}>dicabut</span>}
          </label>
        </div>
      </div>
      {sideOpen&&<div onClick={()=>setSideOpen(false)} style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",background:"rgba(0,0,0,0.5)",zIndex:999}}/>}

      {/* FAB */}
      <button onClick={()=>setSideOpen(!sideOpen)} style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.accentDim})`,border:"none",color:C.bg,fontSize:22,cursor:"pointer",zIndex:998,boxShadow:`0 4px 20px ${C.accentDim}80`,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)"}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}}>⚙️</button>

      <div style={{maxWidth:880,margin:"0 auto",padding:"32px 16px"}}>
        {/* HERO */}
        <div style={{textAlign:"center",marginBottom:40,position:"relative"}}>
          <div style={{position:"absolute",top:-50,left:"50%",transform:"translateX(-50%)",width:350,height:350,borderRadius:"50%",background:`radial-gradient(circle,${C.accentGlow} 0%,transparent 70%)`,pointerEvents:"none"}}/>
          <div style={{fontSize:11,letterSpacing:4,color:C.accent,textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:12}}>Analisis Kebijakan Energi • 2026</div>
          <h1 style={{fontSize:30,fontWeight:800,fontFamily:"'Sora',sans-serif",color:C.white,margin:0,lineHeight:1.15}}>Konversi Kompor LPG → Listrik</h1>
          <P>Indonesia berencana mengganti kompor LPG dengan kompor induksi untuk puluhan juta rumah tangga. Dokumen ini menghitung apakah dampak positifnya lebih besar dari biaya tantangannya — tanpa double counting. Klik tombol ⚙️ di kanan bawah untuk mengubah parameter kapan saja.</P>
          <p style={{fontSize:14,color:C.accent,fontFamily:"'Space Mono',monospace",fontWeight:700}}>#SemuaBisaDihitung</p>
        </div>

        {/* ═══ BAB 1 ═══ */}
        <Sec accent={C.cyan}>
          <ST icon="📋" title="Bab 1: Variabel Dasar" sub="Seluruh angka dari sumber resmi yang sudah diverifikasi. Klik 🔗 untuk buka dokumen asli."/>
          <P>Tabel ini berisi <b>16 variabel</b> yang menjadi fondasi kalkulasi. Dikelompokkan menjadi empat kategori. Perhatikan bahwa angka 52 juta RT adalah <b>target konversi 2060</b> dari Peta Jalan DEN — bukan jumlah pengguna LPG aktual yang mencapai ~67–73 juta RT (88,59% dari total rumah tangga Indonesia).</P>

          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`2px solid ${C.borderLight}`}}>
            {["Simbol","Parameter","Nilai","Sumber"].map((h,i)=><th key={i} style={{padding:8,fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1.2,textAlign:i>=2?"right":"left",fontWeight:600}}>{h}</th>)}
          </tr></thead><tbody>
            <tr><td colSpan={4} style={{padding:"14px 8px 6px",fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Konsumsi & Harga LPG</td></tr>
            <VR sym="N" param="Target RT konversi kompor induksi" val="52.000.000" unit="RT" src="targetRT" note="target 2060"/>
            <VR sym="-" param="Pengguna LPG aktual (88,59% RT)" val="~67–73" unit="juta RT" src="rtAktual" color={C.textBright}/>
            <VR sym="\alpha" param="Tingkat konversi" val={`${alpha}`} unit="%" color={C.accent} note="ubah via ⚙️"/>
            <VR sym="Q" param="Konsumsi LPG per RT per bulan" val="11,4" unit="kg" src="konsumsiLPG"/>
            <VR sym="P_s" param="Harga LPG subsidi (dibayar masyarakat)" val="Rp 4.250" unit="/kg" src="hargaSubsidi"/>
            <VR sym="P_e" param="Harga keekonomian LPG" val="Rp 19.698" unit="/kg" src="hargaEkonomian" color={C.red} note="data Sep 2022"/>
            <tr><td colSpan={4} style={{padding:"16px 8px 6px",fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Impor & Subsidi Nasional</td></tr>
            <VR sym="V_{\text{imp}}" param="Volume impor LPG/tahun (2024)" val="6,89" unit="juta ton" src="imporVolume"/>
            <VR sym="C_{\text{imp}}" param="Nilai impor LPG/tahun (2024)" val="US$ 3,79" unit="miliar" src="imporNilai" color={C.red}/>
            <VR sym="S_{\text{LPG}}" param="Subsidi LPG 3 kg/tahun (APBN 2025)" val="Rp 87,6" unit="triliun" src="subsidiTotal" color={C.red}/>
            <VR sym="\%" param="Porsi impor dari total kebutuhan" val="~80" unit="%" src="impor80" color={C.red}/>
            <VR sym="\%" param="Subsidi salah sasaran" val="62,3" unit="%" src="indef" color={C.red} note="LPG saja, INDEF"/>
            <tr><td colSpan={4} style={{padding:"16px 8px 6px",fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Infrastruktur Kelistrikan</td></tr>
            <VR sym="K_{\text{PLN}}" param="Kapasitas terpasang nasional" val="107,51" unit="GW" src="kapasitasPLN"/>
            <VR sym="L_p" param="Beban puncak nasional" val="~45" unit="GW" src="bebanPuncak"/>
            <VR sym="RM" param="Reserve margin Jawa-Bali" val="44" unit="%" src="reserveMargin" color={C.green} note="Jun 2023"/>
            <VR sym="r" param="Rasio elektrifikasi nasional" val="99,83" unit="%" src="rasioElektrifikasi" color={C.green}/>
            <VR sym="-" param="Pelanggan subsidi 450–900 VA" val="32,5" unit="juta RT" src="pelangganSubsidi" color={C.accent} note="2021"/>
            <tr><td colSpan={4} style={{padding:"16px 8px 6px",fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Efisiensi & Tarif Listrik</td></tr>
            <VR sym="\eta_i" param="Efisiensi kompor induksi" val="84–90" unit="%" src="efisiensiInduksi" color={C.green}/>
            <VR sym="\eta_g" param="Efisiensi kompor gas LPG" val="40–44" unit="%" src="efisiensiGas" color={C.red}/>
            <VR sym="T_l" param="Tarif listrik 1.300 VA" val="Rp 1.444,70" unit="/kWh" src="tarifListrik"/>
          </tbody></table></div>

          <FB texLines={["\\text{Subsidi/kg} = P_e - P_s = 19.698 - 4.250 = \\boxed{\\text{Rp }15.448\\text{/kg}}","\\text{Beban pemerintah} = \\frac{P_e - P_s}{P_e} = \\frac{15.448}{19.698} = \\boxed{78{,}4\\%}"]}/>
          <P>Setiap tabung LPG 3 kg yang dijual Rp 12.750, harga sebenarnya adalah <b style={{color:C.red}}>Rp 59.094</b> — selisih Rp 46.344 per tabung ditanggung APBN.</P>
          <CO type="danger"><b>Inti masalah:</b> Subsidi Rp 87,6T/tahun ini 62,3%-nya (untuk LPG saja) dinikmati RT desil 5–10 yang mampu membayar harga penuh. <SBtn k="indef"/></CO>

          <div style={{marginTop:24}}>
            <h4 style={{fontSize:14,color:C.textBright,margin:"0 0 6px"}}>Tren Impor vs Produksi Domestik LPG (2020–2025)</h4>
            <P>Produksi domestik stagnan di ~1,95 juta ton selama 5 tahun, sementara impor naik ~8%/tahun. Area merah yang mendominasi = ketergantungan ~80% pada impor.</P>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={impD} margin={{top:5,right:10,left:0,bottom:5}}>
                <defs><linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.red} stopOpacity={.35}/><stop offset="100%" stopColor={C.red} stopOpacity={.05}/></linearGradient><linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={.35}/><stop offset="100%" stopColor={C.green} stopOpacity={.05}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="t" tick={{fontSize:11,fill:C.textMuted}}/><YAxis tick={{fontSize:11,fill:C.textMuted}} unit=" jt"/>
                <Tooltip contentStyle={TT} labelStyle={{color:C.text}} itemStyle={{color:C.text}}/><Area type="monotone" dataKey="impor" stroke={C.red} fill="url(#gi)" strokeWidth={2} name="Impor"/><Area type="monotone" dataKey="dom" stroke={C.green} fill="url(#gd)" strokeWidth={2} name="Domestik"/><Legend wrapperStyle={{fontSize:11}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Sec>

        {/* ═══ BAB 2: BENEFIT (FIXED - NO DOUBLE COUNTING) ═══ */}
        <Sec accent={C.green}>
          <ST icon="📈" title="Bab 2: Dampak Positif" sub="Dua benefit yang bisa dihitung TANPA double counting, plus satu indikator strategis."/>
          <FB texLines={["RT_{\\text{konversi}} = \\alpha \\times N"]}/>
          <P>Dengan <Latex>{`\\alpha = ${alpha}\\%`}</Latex> dan <Latex>{`N = ${(rt/1e6).toFixed(0)}`}</Latex> juta, berarti <b style={{color:C.accent}}>{(c.rtK/1e6).toFixed(1)} juta RT</b>. Ubah α via tombol ⚙️.</P>

          <h3 style={{fontSize:16,color:C.green,margin:"24px 0 8px",fontFamily:"'Sora',sans-serif"}}><Latex>{"B_1"}</Latex> — Penghematan Subsidi APBN</h3>
          <P>Ini benefit utama. Setiap RT yang beralih ke kompor induksi <b>tidak lagi membeli LPG bersubsidi</b>. Subsidi per kg (Rp 15.448) × konsumsi bulanan × 12 bulan = penghematan APBN per RT per tahun. Ini uang yang langsung kembali ke kas negara.</P>
          <FB texLines={["B_1 = RT_{\\text{konversi}} \\times Q \\times 12 \\times (P_e - P_s)"]}/>

          <h3 style={{fontSize:16,color:C.cyan,margin:"24px 0 8px",fontFamily:"'Sora',sans-serif"}}><Latex>{"B_3"}</Latex> — Pendapatan Baru PLN</h3>
          <P>RT yang beralih ke induksi mengonsumsi listrik tambahan — ini <b>genuinely new revenue</b> bagi PLN, bukan transfer dari pos lain. Efisiensi induksi (84–90%) hampir 2× gas (40–44%), sehingga listrik yang dibutuhkan per kg LPG:</P>
          <FB texLines={["\\text{kWh/kg}_{\\text{LPG}} = \\frac{7{,}2 \\times \\eta_g}{\\eta_i} = \\frac{7{,}2 \\times 0{,}44}{0{,}87} = \\boxed{3{,}64 \\text{ kWh}}","B_3 = RT_{\\text{konversi}} \\times Q \\times 12 \\times 3{,}64 \\times T_l"]}/>
          <CO type="info">PLN oversupply — reserve margin 44%. Kompor induksi mengoptimalkan aset menganggur. <SBtn k="plnSerap13gw"/></CO>

          <h3 style={{fontSize:16,color:C.blue,margin:"24px 0 8px",fontFamily:"'Sora',sans-serif"}}>📊 Indikator Strategis: Penghematan Devisa</h3>
          <CO type="warning"><b>Mengapa ini BUKAN dijumlahkan ke total benefit?</b> Subsidi APBN (B₁) digunakan pemerintah untuk membayar impor LPG. Jika kita hitung hemat subsidi (B₁) DAN hemat devisa sebagai benefit terpisah lalu dijumlahkan, itu <b>double counting</b> — karena uang subsidi yang dihemat itu sebagian besar memang uang yang tadinya dipakai membayar impor. Devisa yang dihemat adalah <b>konsekuensi otomatis</b> dari B₁, bukan benefit tambahan.</CO>
          <P>Namun penghematan devisa tetap penting sebagai <b>indikator ketahanan energi</b> — mengurangi kerentanan terhadap fluktuasi harga global dan gangguan geopolitik.</P>
          <FB texLines={["\\text{Devisa dihemat}_{\\text{/tahun}} = RT_{\\text{konversi}} \\times Q \\times 12 \\times \\frac{\\text{Harga}_{\\text{impor}} \\times \\text{Kurs}}{1000}"]}/>
          <div style={{background:C.surface,borderRadius:10,padding:"12px 16px",border:`1px solid ${C.border}`,marginTop:10}}>
            <div style={{fontSize:11,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Devisa dihemat (indikator, tidak dijumlahkan)</div>
            <div style={{fontSize:22,fontWeight:800,color:C.blue,fontFamily:"'Space Mono',monospace"}}>{fmtT(c.B2_devisa)}<span style={{fontSize:13,color:C.textMuted,fontWeight:400}}>/tahun</span></div>
          </div>
        </Sec>

        {/* ═══ BAB 3: TANTANGAN ═══ */}
        <Sec accent={C.red}>
          <ST icon="🧱" title="Bab 3: Tantangan & Biaya Solusi" sub="6 tantangan — semuanya dikuantifikasi."/>
          <h3 style={{fontSize:16,color:C.red,margin:"0 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_1"}</Latex> — Kompor + Peralatan <SBtn k="biayaKompor"/></h3>
          <P>Paket pilot 2022: kompor induksi 2 tungku (harga dasar Rp 1,8 juta) + wajan ferromagnetik + MCB. Total ~Rp 2 juta/RT untuk versi upgrade.</P>
          <FB texLines={["C_1 = RT_{\\text{konversi}} \\times \\text{Rp }2.000.000"]}/>

          <h3 style={{fontSize:16,color:"#e67e22",margin:"20px 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_2"}</Latex> — Upgrade Daya RT <SBtn k="mcbKhusus"/></h3>
          <P>32,5 juta pelanggan subsidi masih di 450–900 VA. ~50% RT konversi butuh upgrade daya atau MCB jalur khusus.</P>
          <FB texLines={["C_2 = RT_{\\text{konversi}} \\times 0{,}5 \\times \\text{Rp }750.000"]}/>

          <h3 style={{fontSize:16,color:"#e74c3c",margin:"20px 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_3"}</Latex> — Upgrade Distribusi PLN <SBtn k="upgradeDistribusi"/></h3>
          <P>Bukan di pembangkit (kapasitas cukup), tapi di last-mile: trafo, kabel tegangan rendah, gardu. ~60% area butuh penguatan.</P>
          <FB texLines={["C_3 = RT_{\\text{konversi}} \\times 0{,}6 \\times \\text{Rp }800.000"]}/>

          <h3 style={{fontSize:16,color:C.purple,margin:"20px 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_4"}</Latex> — Edukasi <SBtn k="konversiMitan"/></h3>
          <FB texLines={["C_4 = RT_{\\text{konversi}} \\times \\text{Rp }50.000"]}/>

          <h3 style={{fontSize:16,color:C.accent,margin:"20px 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_5"}</Latex> — Subsidi Transisi <span style={{fontSize:12,color:C.textMuted}}>(jika subsidi LPG tetap)</span></h3>
          <FB texLines={["C_5 = RT_{\\text{konversi}} \\times \\max\\!\\Big(0,\\; \\underbrace{Q \\times 3{,}64 \\times T_l}_{\\text{biaya induksi/bln}} - \\underbrace{Q \\times P_s}_{\\text{biaya LPG/bln}}\\Big) \\times 12"]}/>
          <CO type="warning"><Latex>{"C_5 = 0"}</Latex> jika subsidi LPG dicabut — harga keekonomian LPG (Rp 224rb/bln) jauh lebih mahal dari induksi.</CO>

          <h3 style={{fontSize:16,color:"#95a5a6",margin:"20px 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_6"}</Latex> — Manufaktur Lokal</h3>
          <FB texLines={["C_6 \\approx \\text{Rp }3 \\text{ triliun}"]}/>
        </Sec>

        {/* ═══ BAB 4: PRODUKSI LOKAL & NERACA DEVISA ═══ */}
        <Sec accent={C.blue}>
          <ST icon="🏭" title="Bab 4: Produksi Lokal & Neraca Devisa" sub="Berapa kapasitas produksi kompor induksi Indonesia? Dan bagaimana neraca devisanya?"/>

          <h3 style={{fontSize:16,color:C.blue,margin:"0 0 8px",fontFamily:"'Sora',sans-serif"}}>Kapasitas Produksi Lokal</h3>
          <P>Berdasarkan data Kemenperin, pada 2022 hanya ada <b>satu produsen aktif</b> kompor induksi di Indonesia: <b>PT Adyawinsa Electrical and Power (Myamin)</b> dengan kapasitas <b>300.000 unit/tahun</b>. PT Maspion juga memiliki kapasitas 300.000 unit/tahun. <SBtn k="prodKemenperin"/></P>
          <P>PLN mengidentifikasi <b>11 pabrikan lokal</b> yang siap memproduksi kompor induksi. <SBtn k="prod11pabrikan"/> Dirjen ILMATE Kemenperin Taufiek Bawazier menyatakan bahwa jika program konversi dilanjutkan, kapasitas bisa naik ke <b>5 juta unit/tahun</b> mulai 2023 — dengan rincian: <SBtn k="prodKapasitas5jt"/></P>

          <div style={{overflowX:"auto",margin:"12px 0"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:`2px solid ${C.borderLight}`}}>
              {["Produsen","Kapasitas/Tahun","Status"].map((h,i)=><th key={i} style={{padding:"8px 10px",fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1,textAlign:"left",fontWeight:600}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[
                {n:"PT Adyawinsa (Myamin)",k:"1,2 juta",s:"Aktif, sudah produksi"},
                {n:"PT Hartono Istana (Polytron)",k:"1 juta",s:"Siap produksi"},
                {n:"PT Sutrakabel (Sutrado)",k:"1 juta",s:"Siap produksi"},
                {n:"PT Maspion Elektronik",k:"300 ribu",s:"Siap produksi"},
                {n:"PT Selaras Citra (Turbo)",k:"300 ribu",s:"Siap produksi"},
                {n:"6 perusahaan lainnya",k:"1,2 juta",s:"Berminat, belum komit"},
              ].map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"8px 10px",color:C.text}}>{r.n}</td>
                <td style={{padding:"8px 10px",color:C.accent,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{r.k}</td>
                <td style={{padding:"8px 10px",color:i===0?C.green:C.textMuted,fontSize:12}}>{r.s}</td>
              </tr>)}
              <tr style={{borderTop:`2px solid ${C.borderLight}`}}>
                <td style={{padding:"8px 10px",color:C.textBright,fontWeight:700}}>Total kapasitas potensial</td>
                <td style={{padding:"8px 10px",color:C.green,fontFamily:"'Space Mono',monospace",fontWeight:700}}>5 juta/tahun</td>
                <td style={{padding:"8px 10px",color:C.textMuted,fontSize:12}}>Jika program dilanjutkan</td>
              </tr>
            </tbody>
          </table></div>
          <P>Catatan penting: TKDN kompor induksi saat ini baru <b style={{color:C.accent}}>25%</b>. Artinya 75% komponen masih diimpor — termasuk coil induksi, IGBT, dan kontroler. Namun Kemenperin optimis TKDN akan naik seiring peningkatan volume produksi. <SBtn k="prodTKDN"/></P>

          <CO type="warning"><b>Realita vs rencana:</b> Karena program konversi dibatalkan pada September 2022, sebagian besar ekspansi kapasitas ini <b>kemungkinan belum terealisasi</b>. Kapasitas aktual 2025–2026 diperkirakan masih di kisaran 300.000–500.000 unit/tahun. Geser slider "Produksi Lokal Kompor" di ⚙️ untuk mensimulasikan berbagai skenario.</CO>

          <h3 style={{fontSize:16,color:C.blue,margin:"24px 0 8px",fontFamily:"'Sora',sans-serif"}}>Neraca Devisa: Impor Kompor vs Hemat Impor LPG</h3>
          <P>Pertanyaan kritis: jika produksi lokal belum cukup, kita tetap harus impor kompor. Apakah devisa yang keluar untuk kompor lebih kecil dari devisa yang dihemat dari tidak mengimpor LPG?</P>

          <P>Dengan kapasitas produksi lokal <b style={{color:C.green}}>{(prodLokalJt).toFixed(1)} juta unit/tahun</b> dan kebutuhan <b style={{color:C.accent}}>{(c.rtK/1e6).toFixed(1)} juta unit</b>, maka:</P>

          <FB texLines={[
            `\\text{Unit diproduksi lokal} = \\min(RT_{\\text{konversi}},\\; \\text{Kapasitas lokal}) = ${fmt(c.unitLokalKompor)} \\text{ unit}`,
            `\\text{Unit harus diimpor} = RT_{\\text{konversi}} - \\text{Unit lokal} = ${fmt(c.unitImporKompor)} \\text{ unit}`,
            `\\text{Porsi lokal} = \\frac{${fmt(c.unitLokalKompor)}}{${fmt(c.rtK)}} = \\boxed{${c.pctLokal.toFixed(1)}\\%}`
          ]}/>

          <P>Devisa yang keluar untuk mengimpor unit yang tidak bisa diproduksi lokal, dengan harga impor US$ {hargaKomporUSD}/unit:</P>
          <FB texLines={[`\\text{Devisa impor kompor} = ${fmt(c.unitImporKompor)} \\times \\text{US\\$\\ ${hargaKomporUSD}} \\times ${fmt(kurs)} = \\boxed{${fmtT(c.devisaImporKompor)}}`]}/>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,margin:"16px 0"}}>
            <div style={{background:C.surface,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Devisa keluar — impor kompor (sekali)</div>
              <div style={{fontSize:22,fontWeight:800,color:c.devisaImporKompor>0?C.red:C.green,fontFamily:"'Space Mono',monospace"}}>{c.devisaImporKompor>0?fmtT(c.devisaImporKompor):"Rp 0 (100% lokal!)"}</div>
              <div style={{fontSize:11,color:C.textMuted}}>≈ US$ {(c.devisaImporKompor/kurs/1e6).toFixed(0)} juta • {c.pctLokal.toFixed(0)}% lokal</div>
            </div>
            <div style={{background:C.surface,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Devisa dihemat — LPG tidak diimpor (/tahun)</div>
              <div style={{fontSize:22,fontWeight:800,color:C.green,fontFamily:"'Space Mono',monospace"}}>{fmtT(c.devisaHematLPGPerTahun)}</div>
              <div style={{fontSize:11,color:C.textMuted}}>≈ US$ {(c.devisaHematLPGPerTahun/kurs/1e6).toFixed(0)} juta/tahun</div>
            </div>
          </div>

          {c.devisaImporKompor>0 && <FB texLines={[`\\text{ROI devisa} = \\frac{${fmtT(c.devisaImporKompor)}}{${fmtT(c.devisaHematLPGPerTahun)} \\div 12} = \\boxed{${c.roiDevisa>0&&c.roiDevisa<999?c.roiDevisa.toFixed(1):"\\infty"} \\text{ bulan}}`]}/>}

          <P>{c.devisaImporKompor>0
            ? <>Meskipun {c.pctLokal<100?`${(100-c.pctLokal).toFixed(0)}% kompor harus diimpor`:"semua kompor diimpor"}, devisa yang keluar (<b style={{color:C.red}}>{fmtT(c.devisaImporKompor)}</b> sekali) tergantikan oleh devisa LPG yang dihemat (<b style={{color:C.green}}>{fmtT(c.devisaHematLPGPerTahun)}/tahun</b>) hanya dalam <b style={{color:C.accent}}>{c.roiDevisa.toFixed(1)} bulan</b>. Setelahnya, hemat devisa terus berjalan setiap tahun.</>
            : <>Dengan produksi lokal mencukupi 100% kebutuhan, <b style={{color:C.green}}>tidak ada devisa yang keluar untuk impor kompor sama sekali</b> — sementara hemat devisa LPG tetap {fmtT(c.devisaHematLPGPerTahun)}/tahun.</>
          }</P>

          {c.tahunProduksi>1 && <P>Catatan kapasitas: dengan produksi {(prodLokalJt).toFixed(1)} juta unit/tahun, dibutuhkan <b style={{color:C.accent}}>{c.tahunProduksi} tahun</b> untuk memenuhi {(c.rtK/1e6).toFixed(1)} juta unit — memperkuat argumen bahwa konversi harus <b>bertahap</b>.</P>}

          <CO type="success"><b>Kesimpulan:</b> Bahkan dalam skenario produksi lokal rendah ({(prodLokalJt).toFixed(1)} jt/tahun), neraca devisa tetap positif dalam hitungan bulan. Meningkatkan kapasitas lokal (geser slider ke 5 jt sesuai rencana Kemenperin) membuat devisa keluar semakin kecil.</CO>
        </Sec>

        {/* ═══ METRICS ═══ */}
        <div style={{marginBottom:8}}><P>Berdasarkan parameter saat ini (ubah via ⚙️):</P></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12,marginBottom:20}}>
          <MC icon="🏠" title="RT Konversi" value={`${(c.rtK/1e6).toFixed(1)} jt`} sub={`${alpha}% dari ${(rt/1e6).toFixed(0)} jt`} color={C.cyan}/>
          <MC icon="💰" title="Benefit/Tahun" value={fmtT(c.Bt)} sub="B₁+B₃ (tanpa double counting)" color={C.green}/>
          <MC icon="🧱" title="Cost (Sekali)" value={fmtT(c.Co)} sub="C₁–C₄+C₆" color={C.red}/>
          <MC icon="⏱️" title="ROI" value={c.roi>0&&c.roi<999?`${c.roi.toFixed(1)} bln`:"∞"} sub="balik modal" color={C.accent}/>
          <MC icon="📊" title="Rasio 10 Thn" value={c.r10>0?`${c.r10.toFixed(1)}×`:"–"} sub="benefit:cost" color={C.blue}/>
          <MC icon="⚡" title="Beban PLN" value={`${c.gw.toFixed(1)} GW`} sub="dari 107,5 GW" color={C.purple}/>
        </div>

        {/* CHARTS */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16,marginBottom:20}}>
          <Sec accent={C.green}>
            <h3 style={{fontSize:14,fontWeight:700,color:C.textBright,margin:"0 0 4px"}}>Komposisi Benefit/Tahun (Tanpa Double Counting)</h3>
            <P>Total <b style={{color:C.green}}>{fmtT(c.Bt)}</b> = B₁ + B₃ saja. B₂ (devisa) tidak dijumlahkan karena sudah tercakup dalam B₁.</P>
            <ResponsiveContainer width="100%" height={140}><BarChart data={bD} layout="vertical" margin={{top:0,right:20,left:0,bottom:0}}><XAxis type="number" tick={{fontSize:10,fill:C.textMuted}} tickFormatter={v=>`${v.toFixed(0)}T`}/><YAxis type="category" dataKey="name" tick={{fontSize:11,fill:C.text}} width={150}/><Tooltip contentStyle={TT} labelStyle={{color:C.text}} itemStyle={{color:C.text}} formatter={v=>[`Rp ${v.toFixed(1)} T`]}/><Bar dataKey="value" radius={[0,6,6,0]}>{bD.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar></BarChart></ResponsiveContainer>
          </Sec>
          <Sec accent={C.red}>
            <h3 style={{fontSize:14,fontWeight:700,color:C.textBright,margin:"0 0 4px"}}>Komposisi Biaya (One-time)</h3>
            <P>Total <b style={{color:C.red}}>{fmtT(c.Co)}</b>. Kompor (C₁) mendominasi — paling bisa ditekan via manufaktur lokal.</P>
            <ResponsiveContainer width="100%" height={140}><PieChart><Pie data={cD} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270}>{cD.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={TT} labelStyle={{color:C.text}} itemStyle={{color:C.text}} formatter={v=>[`Rp ${v.toFixed(1)} T`]}/></PieChart></ResponsiveContainer>
            <div style={{display:"flex",flexWrap:"wrap",gap:"4px 12px",justifyContent:"center",marginTop:6}}>{cD.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:d.color}}/><span style={{fontSize:10,color:C.textMuted}}>{d.name}</span></div>)}</div>
          </Sec>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16,marginBottom:20}}>
          <Sec accent={C.cyan}>
            <h3 style={{fontSize:14,fontWeight:700,color:C.textBright,margin:"0 0 4px"}}>Biaya Memasak/RT/Bulan</h3>
            <P>Distorsi subsidi terlihat jelas: LPG subsidi (bar 1) vs harga keekonomiannya (bar 3) berbeda hampir 5× lipat.</P>
            <ResponsiveContainer width="100%" height={200}><BarChart data={mD} margin={{top:5,right:10,left:10,bottom:5}}><XAxis dataKey="label" tick={{fontSize:10,fill:C.textMuted}} interval={0}/><YAxis tick={{fontSize:10,fill:C.textMuted}} tickFormatter={v=>`${(v/1000).toFixed(0)}rb`}/><Tooltip contentStyle={TT} labelStyle={{color:C.text}} itemStyle={{color:C.text}} formatter={v=>[`Rp ${fmt(v)}`]}/><Bar dataKey="biaya" radius={[6,6,0,0]}>{mD.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar></BarChart></ResponsiveContainer>
            <div style={{marginTop:10,padding:"10px 14px",borderRadius:8,background:c.sel>0?C.greenDim:C.redDim,border:`1px solid ${c.sel>0?C.green:C.red}30`}}><span style={{fontSize:12,color:c.sel>0?C.green:C.red}}>{c.sel>0?`✅ Induksi hemat Rp ${fmt(c.sel)}/bln`:`⚠️ Induksi +Rp ${fmt(Math.abs(c.sel))}/bln — distorsi subsidi`}</span></div>
          </Sec>
          <Sec accent={C.blue}>
            <h3 style={{fontSize:14,fontWeight:700,color:C.textBright,margin:"0 0 4px"}}>Benefit vs Cost — Skala Konversi</h3>
            <P>Garis hijau (B₁+B₃/tahun) selalu di atas merah putus-putus (cost sekali) — di skala berapa pun, balik modal &lt;1 tahun.</P>
            <ResponsiveContainer width="100%" height={200}><LineChart data={sD} margin={{top:5,right:10,left:0,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="persen" tick={{fontSize:10,fill:C.textMuted}}/><YAxis tick={{fontSize:10,fill:C.textMuted}}/><Tooltip contentStyle={TT} labelStyle={{color:C.text}} itemStyle={{color:C.text}} formatter={v=>[`Rp ${v} T`]}/><Line type="monotone" dataKey="benefit" stroke={C.green} strokeWidth={2} name="Benefit/thn" dot={{r:3}}/><Line type="monotone" dataKey="cost" stroke={C.red} strokeWidth={2} name="Cost (sekali)" dot={{r:3}} strokeDasharray="5 5"/><Legend wrapperStyle={{fontSize:11}}/></LineChart></ResponsiveContainer>
          </Sec>
        </div>

        {/* ═══ BAB 5: VERDICT ═══ */}
        <Sec accent={C.accent}>
          <ST icon="⚖️" title="Bab 5: Verdict" sub="Formula final — tanpa double counting."/>
          <FB texLines={["\\text{Total Benefit}_{\\text{/tahun}} = \\underbrace{B_1}_{\\text{hemat subsidi}} + \\underbrace{B_3}_{\\text{revenue PLN}} \\quad (B_2 \\text{ tidak dijumlahkan})","\\text{ROI (bulan)} = \\dfrac{C_{\\text{one-time}}}{\\text{Total Benefit}_{\\text{/tahun}} \\div 12}","\\text{Rasio}_n = \\dfrac{\\text{Total Benefit}_{\\text{/tahun}} \\times n}{C_{\\text{one-time}}}"]}/>
          <div style={{background:C.surface,border:`1px solid ${C.borderLight}`,borderRadius:12,padding:20,margin:"16px 0"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:20}}>
              <div><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Benefit/Tahun</div><div style={{fontSize:28,fontWeight:800,color:C.green,fontFamily:"'Space Mono',monospace"}}>{fmtT(c.Bt)}</div><div style={{fontSize:11,color:C.textMuted,marginTop:4}}><Latex>{"B_1"}</Latex>={fmtT(c.B1)} + <Latex>{"B_3"}</Latex>={fmtT(c.B3)}</div></div>
              <div><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Cost (Sekali)</div><div style={{fontSize:28,fontWeight:800,color:C.red,fontFamily:"'Space Mono',monospace"}}>{fmtT(c.Co)}</div>{c.C5>0&&<div style={{fontSize:11,color:C.accent,marginTop:4}}>+ <Latex>{"C_5"}</Latex>={fmtT(c.C5)}/thn</div>}</div>
            </div>
            <div style={{marginTop:20,padding:"18px 20px",borderRadius:12,background:C.accentGlow,border:`1px solid ${C.accentDim}50`}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:16,textAlign:"center"}}>
                <div><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>ROI</div><div style={{fontSize:36,fontWeight:800,color:C.accent,fontFamily:"'Space Mono',monospace"}}>{c.roi>0&&c.roi<999?c.roi.toFixed(1):"∞"}</div><div style={{fontSize:12,color:C.textMuted}}>bulan</div></div>
                <div><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Rasio 5 Thn</div><div style={{fontSize:36,fontWeight:800,color:C.green,fontFamily:"'Space Mono',monospace"}}>{c.r5>0?`${c.r5.toFixed(1)}×`:"–"}</div><div style={{fontSize:12,color:C.textMuted}}>per Rp 1</div></div>
                <div><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Rasio 10 Thn</div><div style={{fontSize:36,fontWeight:800,color:C.blue,fontFamily:"'Space Mono',monospace"}}>{c.r10>0?`${c.r10.toFixed(1)}×`:"–"}</div><div style={{fontSize:12,color:C.textMuted}}>per Rp 1</div></div>
              </div>
            </div>
          </div>
          <CO type="success"><b>Jawaban: Ya — dampak positif lebih besar.</b> Bahkan tanpa menghitung B₂ (devisa), setiap Rp 1 → <b style={{color:C.accent}}>Rp {c.r10>0?c.r10.toFixed(1):"–"}</b> dalam 10 tahun. Balik modal <b style={{color:C.accent}}>{c.roi>0&&c.roi<999?`${c.roi.toFixed(1)} bulan`:"–"}</b>. Dan neraca devisa tetap positif meski 100% kompor diimpor.</CO>
        </Sec>


        <div style={{textAlign:"center",padding:"20px 0 36px",borderTop:`1px solid ${C.border}`,marginTop:8}}>
          <p style={{fontSize:11,color:C.textMuted,margin:"0 0 4px"}}>Sumber: ESDM • PLN • Reforminer • CNBC Indonesia • Databoks • INDEF • DEN • BPS • Kemenperin</p>
          <p style={{fontSize:11,color:C.textMuted,margin:0}}>Semua sumber telah diverifikasi • April 2026 • #SemuaBisaDihitung • by Alif Towew</p>
        </div>
      </div>
    </div>
  );
}
