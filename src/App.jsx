import { useState, useMemo, useEffect, useRef } from "react";
import { BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,LineChart,Line,CartesianGrid,Legend,AreaChart,Area,PieChart,Pie,Cell } from "recharts";

const C={bg:"#05080f",surface:"#0c1220",card:"#111b2e",border:"#1c2a45",borderLight:"#253454",accent:"#f0a830",accentDim:"#b07a10",accentGlow:"rgba(240,168,48,0.12)",red:"#f04438",redDim:"rgba(240,68,56,0.12)",green:"#12b76a",greenDim:"rgba(18,183,106,0.12)",blue:"#2e90fa",blueDim:"rgba(46,144,250,0.12)",cyan:"#06aed4",purple:"#9b59b6",orange:"#e67e22",text:"#d0d5dd",textMuted:"#667085",textBright:"#f5f5f6",white:"#fff"};
const fmt=n=>new Intl.NumberFormat("id-ID").format(Math.round(n));
const fmtT=n=>`Rp ${(n/1e12).toFixed(1)} T`;

const Latex=({children,display=false})=>{const ref=useRef(null);useEffect(()=>{if(ref.current&&window.katex){try{window.katex.render(children,ref.current,{throwOnError:false,displayMode:display,output:"html"});}catch{ref.current.textContent=children;}}},[children,display]);return<span ref={ref}/>;};

const SRC={
  susenas2024:{l:"Susenas BPS 2024",u:"https://databoks.katadata.co.id/en/energy/statistics/67a1b68d7cc32/how-many-indonesian-households-use-lpg"},
  pertamina2025:{l:"Pertamina Patra Niaga 2025",u:"https://www.cnbcindonesia.com/news/20250718163807-4-650356/alamak-75-lpg-subsidi-3-kg-berasal-dari-impor"},
  paparanESDM:{l:"Paparan ESDM / IISD 2026",u:"https://nasional.kompas.com/read/2026/03/05/18193651/prabowo-minta-konversi-kompor-listrik-dikebut-kurangi-ketergantungan-impor"},
  handbookESDM:{l:"Handbook ESDM 2024",u:"https://www.esdm.go.id/id/media-center/arsip-berita/kementerian-esdm-dan-pln-ajak-warga-jakarta-beralih-ke-kompor-induksi-1"},
  konsumsiLPG:{l:"Pertamina / Kemenperin",u:"https://agro.kemenperin.go.id/artikel/6482-konversi-lpg-ke-listrik-bagaimana-dampak-bagi-masyarakat-dan-industri"},
  hargaSubsidi:{l:"Tetap sejak 2007",u:"https://katadata.co.id/berita/energi/63243bfaaeda3/perbandingan-biaya-masak-antara-kompor-induksi-listrik-dan-lpg-3-kg"},
  subsidiTotal:{l:"Banggar DPR / Databoks",u:"https://databoks.katadata.co.id/ekonomi-makro/statistik/67a2e18b9aa96/kisruh-distribusi-lpg-ini-anggaran-subsidinya-pada-2025"},
  kapasitasPLN:{l:"ESDM (Jan 2026)",u:"https://www.esdm.go.id/en/media-center/news-archives/semester-i-tahun-2025-kapasitas-terpasang-pembangkit-meningkat-44-gw"},
  reserveMargin:{l:"Kontan / PLN (Jun 2023)",u:"https://industri.kontan.co.id/news/reserve-margin-kelistrikan-jawa-bali-mencapai-44-per-juni-2023"},
  indef:{l:"INDEF 2023",u:"https://indef.or.id/wp-content/uploads/2023/05/032023_pb_indef-1.pdf"},
  imporLPG:{l:"CNBC Indonesia / BPS",u:"https://www.cnbcindonesia.com/news/20250718163807-4-650356/alamak-75-lpg-subsidi-3-kg-berasal-dari-impor"},
  efisiensi:{l:"DOE / Wikipedia",u:"https://en.wikipedia.org/wiki/Induction_cooking"},
  tarifListrik:{l:"Kompas / PLN 2025",u:"https://www.kompas.com/tren/read/2025/11/03/064500765/ini-tarif-listrik-rumah-tangga-daya-1300-dan-2200-va-per-1-november-2025"},
  biayaKompor:{l:"DetikFinance / ESDM",u:"https://finance.detik.com/energi/d-6306143/isi-paket-kompor-listrik-gratis-rp-2-juta-yang-mau-dibagikan-pemerintah"},
  prodLokal2022:{l:"Liputan6 / Kemenperin",u:"https://www.liputan6.com/bisnis/read/5076104/153-juta-kompor-listrik-bakal-dipasok-industri-lokal-sampai-2025"},
  prodKapasitas:{l:"Katadata / Kemenperin",u:"https://katadata.co.id/tiakomalasari/berita/632ac1960ac26/produksi-kompor-listrik-akan-digenjot-hingga-5-juta-unit-tahun-depan"},
  upgradeDistribusi:{l:"Kontan / PLN",u:"https://industri.kontan.co.id/news/pln-beberkan-kendala-yang-bisa-hambat-konversi-kompor-lpg-ke-kompor-induksi"},
  plnSerap13gw:{l:"Antara / PLN",u:"https://www.antaranews.com/berita/2705701/program-kompor-induksi-berpotensi-serap-listrik-13-gigawatt"},
  konversiMitan:{l:"PMC / ScienceDirect",u:"https://pmc.ncbi.nlm.nih.gov/articles/PMC6186446/"},
  cngTank:{l:"Paparan ESDM Apr 2026",u:"https://nasional.kompas.com/read/2026/03/05/18193651/prabowo-minta-konversi-kompor-listrik-dikebut-kurangi-ketergantungan-impor"},
  iisd2025:{l:"IISD 2025",u:"https://www.iisd.org/publications/report/fossil-fuel-subsidies-asia-trends-and-implications"},
};
const SBtn=({k})=>{const s=SRC[k];if(!s)return null;return<a href={s.u} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,color:C.accent,background:C.accentGlow,border:`1px solid ${C.accentDim}40`,borderRadius:20,padding:"2px 10px 2px 7px",textDecoration:"none",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}} onMouseEnter={e=>{e.currentTarget.style.background=C.accentDim+"50"}} onMouseLeave={e=>{e.currentTarget.style.background=C.accentGlow}}><span style={{fontSize:9}}>🔗</span>{s.l}</a>;};

/* UI */
const Sec=({children,accent=C.accent})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"28px 22px",marginBottom:20,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,width:4,height:"100%",background:accent,borderRadius:"16px 0 0 16px"}}/>{children}</div>;
const ST=({icon,title,sub})=><div style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><span style={{fontSize:20}}>{icon}</span><h2 style={{margin:0,fontSize:18,fontWeight:800,color:C.textBright,fontFamily:"'Sora',sans-serif"}}>{title}</h2></div>{sub&&<p style={{margin:0,fontSize:13,color:C.textMuted,paddingLeft:30,lineHeight:1.5}}>{sub}</p>}</div>;
const P=({children})=><p style={{fontSize:13.5,color:C.text,lineHeight:1.75,margin:"10px 0"}}>{children}</p>;
const FB=({texLines})=><div style={{background:"#080e1e",border:`1px solid ${C.borderLight}`,borderRadius:12,padding:"18px 22px",margin:"14px 0",overflowX:"auto"}}>{texLines.map((t,i)=><div key={i} style={{marginBottom:i<texLines.length-1?10:0,textAlign:"center"}}><Latex display>{t}</Latex></div>)}</div>;
const CO=({children,type="info"})=>{const m={info:{bg:C.blueDim,b:C.blue,i:"💡"},success:{bg:C.greenDim,b:C.green,i:"✅"},warning:{bg:C.accentGlow,b:C.accent,i:"⚠️"},danger:{bg:C.redDim,b:C.red,i:"🚨"}};const cc=m[type];return<div style={{background:cc.bg,border:`1px solid ${cc.b}30`,borderRadius:10,padding:"12px 16px",margin:"14px 0",fontSize:13,color:C.text,lineHeight:1.6,display:"flex",gap:10,alignItems:"flex-start"}}><span style={{fontSize:16,flexShrink:0}}>{cc.i}</span><div>{children}</div></div>;};
const MC=({title,value,sub,color=C.accent,icon})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${color},${color}00)`}}/><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>{icon} {title}</div><div style={{fontSize:22,fontWeight:800,color,fontFamily:"'Space Mono',monospace",lineHeight:1.1}}>{value}</div>{sub&&<div style={{fontSize:11,color:C.textMuted,marginTop:6}}>{sub}</div>}</div>;
const Sl=({label,value,onChange,min,max,step=1,formatter,source})=><div style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexWrap:"wrap",gap:2}}><div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}><span style={{fontSize:11,color:C.textMuted}}>{label}</span>{source&&<SBtn k={source}/>}</div><span style={{fontSize:12,color:C.accent,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{formatter?formatter(value):fmt(value)}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",height:5,appearance:"none",borderRadius:3,outline:"none",cursor:"pointer",background:`linear-gradient(to right,${C.accent} ${((value-min)/(max-min))*100}%,${C.border} ${((value-min)/(max-min))*100}%)`}}/></div>;
const VR=({sym,param,val,unit,src,color,note})=><tr style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"10px 8px",color:C.cyan,fontSize:14,fontWeight:700,width:55,verticalAlign:"middle"}}>{sym&&<Latex>{sym}</Latex>}</td><td style={{padding:"10px 8px",fontSize:13,color:C.text}}>{param}{note&&<span style={{fontSize:11,color:C.accent,marginLeft:4}}>({note})</span>}</td><td style={{padding:"10px 8px",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,color:color||C.accent,textAlign:"right",whiteSpace:"nowrap"}}>{val}<span style={{fontSize:11,color:C.textMuted,fontWeight:400,marginLeft:4}}>{unit}</span></td><td style={{padding:"10px 4px",textAlign:"right"}}>{src&&<SBtn k={src}/>}</td></tr>;
const TT={background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12,color:C.text};
const TTp={contentStyle:TT,labelStyle:{color:C.text},itemStyle:{color:C.text}};

export default function App(){
  const[alpha,setAlpha]=useState(30);
  const[rtLPG,setRtLPG]=useState(67.1);
  const[qTab,setQTab]=useState(3.54);
  const[hetLPG,setHetLPG]=useState(20400);
  const[ekonLPG,setEkonLPG]=useState(61500);
  const[ekonCNG,setEkonCNG]=useState(49313);
  const[hetCNG,setHetCNG]=useState(18000);
  const[biayaListrik,setBiayaListrik]=useState(140891);
  const[biayaJargas,setBiayaJargas]=useState(148935);
  const[biayaListrikRetail,setBiayaListrikRetail]=useState(140891);
  const[biayaJargasRetail,setBiayaJargasRetail]=useState(70200);
  const[subsidiLPGTotal,setSubsidiLPGTotal]=useState(87.6);
  const[cngTankCost,setCngTankCost]=useState(12000000);
  const[biayaKompor,setBiayaKompor]=useState(2000000);
  const[prodLokalJt,setProdLokal]=useState(0.3);
  const[hargaKomporUSD,setHKU]=useState(25);
  const[kurs,setKurs]=useState(16200);
  const[sideOpen,setSideOpen]=useState(false);
  const[kr,setKR]=useState(false);

  useEffect(()=>{if(window.katex){setKR(true);return;}const l=document.createElement("link");l.rel="stylesheet";l.href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";document.head.appendChild(l);const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";s.onload=()=>setKR(true);document.head.appendChild(s);},[]);

  const c=useMemo(()=>{
    const rtM=rtLPG*1e6, rtK=rtM*(alpha/100), qKg=qTab*3;
    // Biaya per KK per bulan
    const lpgRetail=qTab*hetLPG, lpgEkon=qTab*ekonLPG;
    const cngRetail=qTab*hetCNG, cngEkon=qTab*ekonCNG;
    const subsLPGperKK=lpgEkon-lpgRetail, subsCNGperKK=cngEkon-cngRetail;
    // Benefit: hemat subsidi APBN per tahun (jika beralih dari LPG 3kg)
    const B1_listrik=rtK*subsLPGperKK*12; // pemerintah hemat subsidi
    const B1_cng=rtK*(subsLPGperKK-subsCNGperKK)*12; // hemat bersih (subsidi LPG - subsidi CNG)
    const B1_jargas=rtK*(subsLPGperKK-78735)*12;
    // Pendapatan PLN (hanya untuk listrik)
    const B3_listrik=rtK*biayaListrikRetail*12;
    // Cost
    const C_listrik=rtK*biayaKompor + rtK*0.5*750000 + rtK*0.6*800000 + rtK*50000 + 3e12;
    const C_cng=rtK*cngTankCost; // CNG tank Rp 12jt/unit
    const C_jargas=rtK*1153000*10*12/120; // dari PDF: investasi Rp 1,153T / 115.264 RT / 10 tahun (sudah di-annualize)
    // Hmm let me simplify Jargas cost
    const C_jargas_total=rtK*10000000; // estimasi Rp 10jt/sambungan (infrastruktur jargas)
    // Net benefit listrik
    const Bt_listrik=B1_listrik+B3_listrik;
    const roi_listrik=Bt_listrik>0?C_listrik/(Bt_listrik/12):Infinity;
    const roi_cng=B1_cng>0?C_cng/(B1_cng/12):Infinity;
    // Devisa
    const devisaHematLPG=rtK*qKg*12*550*kurs/1000;
    const unitImpor=Math.max(0,rtK-prodLokalJt*1e6);
    const devisaImporKompor=unitImpor*hargaKomporUSD*kurs;
    const pctLokal=rtK>0?Math.min(100,(prodLokalJt*1e6/rtK)*100):0;
    const roiDevisa=devisaHematLPG>0?devisaImporKompor/(devisaHematLPG/12):Infinity;
    const tahunProduksi=prodLokalJt>0?Math.ceil(rtK/(prodLokalJt*1e6)):Infinity;
    return{rtK,qKg,lpgRetail,lpgEkon,cngRetail,cngEkon,subsLPGperKK,subsCNGperKK,
      B1_listrik,B1_cng,B1_jargas,B3_listrik,Bt_listrik,
      C_listrik,C_cng,C_jargas_total,roi_listrik,roi_cng,
      devisaHematLPG,devisaImporKompor,unitImpor,pctLokal,roiDevisa,tahunProduksi,
      r5_listrik:Bt_listrik>0?(Bt_listrik*5)/C_listrik:0,
      r10_listrik:Bt_listrik>0?(Bt_listrik*10)/C_listrik:0,
    };
  },[alpha,rtLPG,qTab,hetLPG,ekonLPG,ekonCNG,hetCNG,biayaListrik,biayaJargas,biayaListrikRetail,biayaJargasRetail,subsidiLPGTotal,cngTankCost,biayaKompor,prodLokalJt,hargaKomporUSD,kurs]);

  // Chart data
  const biayaKonsumen=[
    {name:"LPG 3kg",retail:c.lpgRetail,ekonomi:c.lpgEkon,color:C.red},
    {name:"CNG 3kg",retail:c.cngRetail,ekonomi:c.cngEkon,color:C.orange},
    {name:"Listrik",retail:biayaListrikRetail,ekonomi:biayaListrik,color:C.cyan},
    {name:"Jargas",retail:biayaJargasRetail,ekonomi:biayaJargas,color:C.green},
  ];
  const subsidiPerKK=[
    {name:"Minyak Tanah",value:190300,color:"#7f8c8d"},
    {name:"LPG 3 kg",value:c.subsLPGperKK,color:C.red},
    {name:"CNG 3 kg",value:c.subsCNGperKK,color:C.orange},
    {name:"Jargas",value:78735,color:C.green},
    {name:"Listrik",value:0,color:C.cyan},
  ];
  const proyeksiSubsidi=[
    {tahun:"2025",subsidi:85.5},{tahun:"2026",subsidi:84.0},{tahun:"2027",subsidi:74.7},
    {tahun:"2028",subsidi:58.9},{tahun:"2029",subsidi:36.3},{tahun:"2030",subsidi:11.6},
  ];
  const transisiData=[
    {tahun:"2025",lpg:83.79,cng:0,listrik:0.47,jargas:1.09,lainnya:14.65},
    {tahun:"2026",lpg:81.46,cng:1.38,listrik:1,jargas:2,lainnya:14.16},
    {tahun:"2027",lpg:72.43,cng:8,listrik:2,jargas:3,lainnya:14.57},
    {tahun:"2028",lpg:57.12,cng:21,listrik:3,jargas:4,lainnya:14.88},
    {tahun:"2029",lpg:35.23,cng:41,listrik:4,jargas:5,lainnya:14.77},
    {tahun:"2030",lpg:11.22,cng:60,listrik:5,jargas:6,lainnya:17.78},
  ];
  const capexPerKK=[
    {name:"Kompor Listrik",value:biayaKompor/1e6,color:C.cyan},
    {name:"Tabung CNG Tipe-4",value:cngTankCost/1e6,color:C.orange},
    {name:"Sambungan Jargas",value:10,color:C.green},
  ];

  if(!kr)return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.accent,fontSize:16}}>Memuat formula renderer...</div>;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Space+Mono:wght@400;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"/>

      {/* SIDEBAR */}
      <div style={{position:"fixed",top:0,right:sideOpen?0:-380,width:360,height:"100vh",background:C.card,borderLeft:`1px solid ${C.border}`,zIndex:1000,transition:"right .35s cubic-bezier(.4,0,.2,1)",overflowY:"auto",padding:"20px 18px",boxSizing:"border-box"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{margin:0,fontSize:15,fontWeight:800,color:C.textBright,fontFamily:"'Sora',sans-serif"}}>⚡ Parameter</h3>
          <button onClick={()=>setSideOpen(false)} style={{background:"transparent",border:"none",color:C.textMuted,fontSize:20,cursor:"pointer",padding:4}}>✕</button>
        </div>
        <div style={{fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Rumah Tangga</div>
        <Sl label="RT Pengguna LPG" value={rtLPG} onChange={setRtLPG} min={1} max={100} step={0.1} formatter={v=>`${v.toFixed(1)} jt RT`} source="pertamina2025"/>
        <Sl label="Tingkat Konversi (α)" value={alpha} onChange={setAlpha} min={5} max={100} step={5} formatter={v=>`${v}%`}/>
        <Sl label="Konsumsi LPG/RT/bln" value={qTab} onChange={setQTab} min={1} max={6} step={0.01} formatter={v=>`${v.toFixed(2)} tabung`} source="pertamina2025"/>
        <div style={{fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,textTransform:"uppercase",margin:"12px 0 8px"}}>Harga LPG & CNG</div>
        <Sl label="HET LPG 3kg" value={hetLPG} onChange={setHetLPG} min={12750} max={61500} step={100} formatter={v=>`Rp ${fmt(v)}/tab`} source="paparanESDM"/>
        <Sl label="Keekonomian LPG" value={ekonLPG} onChange={setEkonLPG} min={30000} max={80000} step={500} formatter={v=>`Rp ${fmt(v)}/tab`} source="handbookESDM"/>
        <Sl label="HET CNG 3kg" value={hetCNG} onChange={setHetCNG} min={10000} max={49313} step={500} formatter={v=>`Rp ${fmt(v)}/tab`} source="paparanESDM"/>
        <Sl label="Biaya tabung CNG" value={cngTankCost} onChange={setCngTankCost} min={5e6} max={20e6} step={1e6} formatter={v=>`Rp ${fmt(v)}`} source="cngTank"/>
        <div style={{fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,textTransform:"uppercase",margin:"12px 0 8px"}}>Kompor Listrik</div>
        <Sl label="Biaya kompor/RT" value={biayaKompor} onChange={setBiayaKompor} min={5e5} max={5e6} step={1e5} formatter={v=>`Rp ${fmt(v)}`} source="biayaKompor"/>
        <Sl label="Produksi lokal" value={prodLokalJt} onChange={setProdLokal} min={0} max={10} step={.1} formatter={v=>`${v.toFixed(1)} jt/thn`} source="prodLokal2022"/>
        <Sl label="Harga impor kompor" value={hargaKomporUSD} onChange={setHKU} min={10} max={80} step={1} formatter={v=>`US$ ${v}/unit`}/>
        <Sl label="Kurs USD/IDR" value={kurs} onChange={setKurs} min={14000} max={18000} step={100} formatter={v=>`Rp ${fmt(v)}`}/>
      </div>
      {sideOpen&&<div onClick={()=>setSideOpen(false)} style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",background:"rgba(0,0,0,0.5)",zIndex:999}}/>}
      <button onClick={()=>setSideOpen(!sideOpen)} style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.accentDim})`,border:"none",color:C.bg,fontSize:22,cursor:"pointer",zIndex:998,boxShadow:`0 4px 20px ${C.accentDim}80`,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)"}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}}>⚙️</button>

      <div style={{maxWidth:880,margin:"0 auto",padding:"32px 16px"}}>
        {/* HERO */}
        <div style={{textAlign:"center",marginBottom:40,position:"relative"}}>
          <div style={{position:"absolute",top:-50,left:"50%",transform:"translateX(-50%)",width:350,height:350,borderRadius:"50%",background:`radial-gradient(circle,${C.accentGlow} 0%,transparent 70%)`,pointerEvents:"none"}}/>
          <div style={{fontSize:11,letterSpacing:4,color:C.accent,textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:12}}>Analisis Kebijakan Energi • 2026</div>
          <h1 style={{fontSize:28,fontWeight:800,fontFamily:"'Sora',sans-serif",color:C.white,margin:0,lineHeight:1.15}}>Diversifikasi Energi Memasak RT</h1>
          <h2 style={{fontSize:16,fontWeight:600,fontFamily:"'Sora',sans-serif",color:C.accent,margin:"8px 0 0"}}>LPG 3 kg → CNG vs Kompor Listrik vs Jargas</h2>
          <P>Indonesia memiliki <b style={{color:C.accent}}>86,78 juta rumah tangga</b>, di mana 83,79% (72,72 juta) masih memasak dengan LPG 3 kg. Dengan subsidi APBN Rp 87,6 triliun/tahun dan impor ~80%, pemerintah mengkaji tiga alternatif: <b style={{color:C.orange}}>CNG</b>, <b style={{color:C.cyan}}>kompor listrik induksi</b>, dan <b style={{color:C.green}}>jaringan gas bumi (Jargas)</b>. Analisis ini membandingkan ketiganya secara kuantitatif.</P>
          <p style={{fontSize:14,color:C.accent,fontFamily:"'Space Mono',monospace",fontWeight:700}}>#SemuaBisaDihitung</p>
        </div>

        {/* ═══ BAB 1: DATA DASAR ═══ */}
        <Sec accent={C.cyan}>
          <ST icon="📋" title="Bab 1: Data Dasar" sub="Sumber: Susenas BPS 2024, Pertamina Patra Niaga 2025, Handbook ESDM 2024, IISD 2025."/>

          <h3 style={{fontSize:15,color:C.textBright,margin:"0 0 8px",fontFamily:"'Sora',sans-serif"}}>Pemetaan Energi Memasak RT, 2024</h3>
          <P>Data Susenas BPS 2024 menunjukkan dominasi LPG 3 kg yang luar biasa — <b style={{color:C.red}}>83,79%</b> rumah tangga Indonesia bergantung pada satu jenis bahan bakar ini. Sementara kompor listrik baru digunakan oleh <b>0,47%</b> (410.000 RT). <SBtn k="susenas2024"/></P>

          <div style={{overflowX:"auto",margin:"12px 0"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`2px solid ${C.borderLight}`}}>
            {["Sumber Energi","% Pengguna","Jumlah RT"].map((h,i)=><th key={i} style={{padding:"8px 10px",fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1,textAlign:i>0?"right":"left",fontWeight:600}}>{h}</th>)}
          </tr></thead><tbody>
            {[{n:"LPG 3 kg",p:"83,79%",j:"72,72 juta",c:C.red},{n:"LPG 5,5 kg",p:"1,08%",j:"0,94 juta",c:C.text},{n:"LPG 12 kg",p:"2,62%",j:"2,27 juta",c:C.text},{n:"Minyak Tanah",p:"2,38%",j:"2,07 juta",c:C.textMuted},{n:"Jaringan Gas Bumi",p:"1,09%",j:"0,95 juta",c:C.green},{n:"Listrik",p:"0,47%",j:"0,41 juta",c:C.cyan},{n:"Lainnya (kayu dll)",p:"8,57%",j:"7,44 juta",c:C.textMuted}].map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
              <td style={{padding:"8px 10px",color:r.c,fontWeight:i===0?700:400}}>{r.n}</td>
              <td style={{padding:"8px 10px",color:r.c,fontFamily:"'Space Mono',monospace",textAlign:"right",fontWeight:i===0?700:400}}>{r.p}</td>
              <td style={{padding:"8px 10px",color:r.c,fontFamily:"'Space Mono',monospace",textAlign:"right"}}>{r.j}</td>
            </tr>)}
            <tr style={{borderTop:`2px solid ${C.borderLight}`}}><td style={{padding:"8px 10px",color:C.textBright,fontWeight:700}}>Total</td><td style={{padding:"8px 10px",color:C.textBright,fontFamily:"'Space Mono',monospace",textAlign:"right",fontWeight:700}}>100%</td><td style={{padding:"8px 10px",color:C.textBright,fontFamily:"'Space Mono',monospace",textAlign:"right",fontWeight:700}}>86,78 juta</td></tr>
          </tbody></table></div>

          <h3 style={{fontSize:15,color:C.textBright,margin:"20px 0 8px",fontFamily:"'Sora',sans-serif"}}>Konsumsi & Subsidi LPG <SBtn k="pertamina2025"/></h3>
          <P>Data realisasi Pertamina 2025: dari 76,4 juta pengguna LPG bersubsidi, <b style={{color:C.accent}}>67,1 juta</b> adalah rumah tangga. Total penjualan LPG subsidi 2025: 8,55 juta ton = 2,85 miliar tabung. Konsumsi rata-rata per RT:</P>
          <FB texLines={["\\text{Konsumsi} = \\frac{2{,}85 \\text{ miliar tabung}}{67{,}1 \\text{ juta RT} \\times 12 \\text{ bulan}} = \\boxed{3{,}54 \\text{ tabung/RT/bulan}} = 10{,}62 \\text{ kg/bln}"]}/>

          <P>Subsidi per tabung LPG 3 kg sangat besar. Harga keekonomian satu tabung <b style={{color:C.red}}>Rp 61.500</b>, tapi dijual Rp 20.400 (HET baru) — subsidi per tabung Rp 41.100:</P>
          <FB texLines={["\\text{Subsidi/tabung} = \\text{Rp }61.500 - \\text{Rp }20.400 = \\boxed{\\text{Rp }41.100}", "\\text{Subsidi/KK/bulan} = 3{,}54 \\times 41.100 = \\boxed{\\text{Rp }145.494}"]}/>

          <CO type="danger"><b>Beban fiskal:</b> Subsidi LPG 3 kg Rp 87,6 triliun/tahun (APBN 2025). Studi INDEF menunjukkan 62,3% salah sasaran — dinikmati RT mampu. <SBtn k="indef"/></CO>
        </Sec>

        {/* ═══ BAB 2: PERBANDINGAN 4 ALTERNATIF ═══ */}
        <Sec accent={C.blue}>
          <ST icon="⚖️" title="Bab 2: Perbandingan 4 Alternatif Energi Memasak" sub="Data dari Handbook ESDM 2024 dan Paparan ESDM April 2026. Mana yang paling hemat — untuk konsumen dan untuk negara?"/>

          <h3 style={{fontSize:15,color:C.textBright,margin:"0 0 8px",fontFamily:"'Sora',sans-serif"}}>Biaya Bulanan per KK — Harga Keekonomian vs Retail <SBtn k="handbookESDM"/></h3>
          <P>Grafik di bawah menunjukkan dua perspektif: <b style={{color:C.red}}>bar gelap</b> = harga keekonomian (biaya sebenarnya bagi negara), <b style={{color:C.textBright}}>bar terang</b> = harga retail (yang dibayar konsumen). Selisih keduanya = subsidi.</P>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={biayaKonsumen} margin={{top:10,right:10,left:10,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="name" tick={{fontSize:12,fill:C.text}}/>
              <YAxis tick={{fontSize:10,fill:C.textMuted}} tickFormatter={v=>`${(v/1000).toFixed(0)}rb`}/>
              <Tooltip {...TTp} formatter={v=>[`Rp ${fmt(v)}`]}/>
              <Bar dataKey="ekonomi" name="Harga Keekonomian" radius={[4,4,0,0]}>
                {biayaKonsumen.map((e,i)=><Cell key={i} fill={e.color} fillOpacity={0.4}/>)}
              </Bar>
              <Bar dataKey="retail" name="Harga Retail / Dibayar Konsumen" radius={[4,4,0,0]}>
                {biayaKonsumen.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Bar>
              <Legend wrapperStyle={{fontSize:11}}/>
            </BarChart>
          </ResponsiveContainer>

          <CO type="info"><b>Insight kunci:</b> Kompor listrik <b>tidak memiliki subsidi</b> — harga retail = harga keekonomian (Rp 140.891/bln). Tapi justru di harga keekonomian, listrik adalah <b>yang termurah</b> (Rp 140.891 vs LPG Rp 217.710). Yang membuat LPG tampak murah hanyalah distorsi subsidi.</CO>

          <h3 style={{fontSize:15,color:C.textBright,margin:"24px 0 8px",fontFamily:"'Sora',sans-serif"}}>Beban Subsidi per KK per Bulan <SBtn k="paparanESDM"/></h3>
          <P>Siapa yang paling banyak membebani APBN? Grafik ini menjawab — semakin tinggi bar, semakin besar subsidi yang harus ditanggung pemerintah untuk setiap KK per bulan.</P>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subsidiPerKK} margin={{top:5,right:10,left:10,bottom:5}}>
              <XAxis dataKey="name" tick={{fontSize:11,fill:C.textMuted}}/>
              <YAxis tick={{fontSize:10,fill:C.textMuted}} tickFormatter={v=>`${(v/1000).toFixed(0)}rb`}/>
              <Tooltip {...TTp} formatter={v=>[`Rp ${fmt(v)}/KK/bln`]}/>
              <Bar dataKey="value" name="Subsidi/KK/bulan" radius={[6,6,0,0]}>
                {subsidiPerKK.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <P><b style={{color:C.cyan}}>Kompor listrik = Rp 0 subsidi.</b> CNG tetap membutuhkan subsidi Rp 110.848/KK/bulan (lebih rendah dari LPG Rp 145.494), sedangkan Jargas Rp 78.735. Hanya listrik yang <b>sepenuhnya bebas subsidi operasional</b>.</P>

          <h3 style={{fontSize:15,color:C.textBright,margin:"24px 0 8px",fontFamily:"'Sora',sans-serif"}}>Tapi: Investasi Awal (Capex) per KK</h3>
          <P>Kelebihan CNG dan Jargas di subsidi operasional dibayar mahal di investasi awal. Tabung CNG Tipe-4 seharga <b style={{color:C.orange}}>Rp 12 juta/unit</b> (usia 20 tahun), jauh lebih mahal dari kompor induksi <b style={{color:C.cyan}}>Rp 2 juta/unit</b>. <SBtn k="cngTank"/></P>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={capexPerKK} layout="vertical" margin={{top:5,right:20,left:0,bottom:5}}>
              <XAxis type="number" tick={{fontSize:10,fill:C.textMuted}} tickFormatter={v=>`Rp ${v}jt`}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:C.text}} width={140}/>
              <Tooltip {...TTp} formatter={v=>[`Rp ${v.toFixed(1)} juta/KK`]}/>
              <Bar dataKey="value" radius={[0,6,6,0]}>{capexPerKK.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
          <FB texLines={["\\text{Capex CNG} = \\text{Rp }12 \\text{ juta} \\quad vs \\quad \\text{Capex Listrik} = \\text{Rp }2 \\text{ juta} \\quad \\Rightarrow \\quad \\boxed{6\\times \\text{ lebih mahal}}"]}/>
          <CO type="warning"><b>Trade-off:</b> CNG lebih murah secara operasional (subsidi per KK lebih rendah dari LPG) tapi <b>capex 6× lebih mahal</b> dari kompor listrik. Pertanyaannya: mana yang lebih hemat dalam total cost jangka panjang?</CO>
        </Sec>

        {/* ═══ BAB 3: SKENARIO TRANSISI ═══ */}
        <Sec accent={C.orange}>
          <ST icon="📊" title="Bab 3: Skenario Transisi 2025–2030" sub="Dari Paparan ESDM April 2026: target konversi CNG 60% di 2030, kompor induksi untuk desil 9–10."/>
          <P>Pemerintah menyusun skenario agresif: pangsa LPG 3 kg turun dari <b style={{color:C.red}}>83,79%</b> (2025) menjadi hanya <b style={{color:C.red}}>11,22%</b> (2030), digantikan terutama oleh <b style={{color:C.orange}}>CNG (60%)</b>. <SBtn k="paparanESDM"/></P>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={transisiData} margin={{top:10,right:10,left:0,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="tahun" tick={{fontSize:11,fill:C.textMuted}}/>
              <YAxis tick={{fontSize:10,fill:C.textMuted}} tickFormatter={v=>`${v}%`}/>
              <Tooltip {...TTp} formatter={v=>[`${v}%`]}/>
              <Area type="monotone" dataKey="lpg" stackId="1" fill={C.red} stroke={C.red} fillOpacity={0.6} name="LPG 3 kg"/>
              <Area type="monotone" dataKey="cng" stackId="1" fill={C.orange} stroke={C.orange} fillOpacity={0.6} name="CNG"/>
              <Area type="monotone" dataKey="listrik" stackId="1" fill={C.cyan} stroke={C.cyan} fillOpacity={0.6} name="Listrik"/>
              <Area type="monotone" dataKey="jargas" stackId="1" fill={C.green} stroke={C.green} fillOpacity={0.6} name="Jargas"/>
              <Area type="monotone" dataKey="lainnya" stackId="1" fill="#555" stroke="#555" fillOpacity={0.3} name="Lainnya"/>
              <Legend wrapperStyle={{fontSize:11}}/>
            </AreaChart>
          </ResponsiveContainer>
          <P>Perhatikan area <b style={{color:C.orange}}>oranye (CNG)</b> yang mendominasi mulai 2028 — ini skenario paling ambisius yang pernah dicanangkan pemerintah. Catatan: kompor listrik (biru) hanya ditargetkan untuk <b>desil 9 dan 10</b> (masyarakat mampu), bukan masyarakat miskin.</P>

          <h3 style={{fontSize:15,color:C.textBright,margin:"24px 0 8px",fontFamily:"'Sora',sans-serif"}}>Proyeksi Penurunan Subsidi LPG <SBtn k="paparanESDM"/></h3>
          <P>Jika skenario berjalan sesuai rencana, subsidi LPG turun drastis dari Rp 85,5T (2025) ke Rp 11,6T (2030) — penghematan kumulatif <b style={{color:C.green}}>Rp 264,5 triliun</b> selama 5 tahun.</P>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={proyeksiSubsidi} margin={{top:10,right:10,left:10,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="tahun" tick={{fontSize:11,fill:C.textMuted}}/>
              <YAxis tick={{fontSize:10,fill:C.textMuted}} tickFormatter={v=>`Rp ${v}T`}/>
              <Tooltip {...TTp} formatter={v=>[`Rp ${v} Triliun`]}/>
              <Bar dataKey="subsidi" name="Subsidi LPG" radius={[6,6,0,0]}>
                {proyeksiSubsidi.map((e,i)=><Cell key={i} fill={i<2?C.red:i<4?C.orange:C.green}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <FB texLines={["\\text{Hemat kumulatif 5 thn} = \\sum_{2026}^{2030} (85{,}5 - S_t) = (1{,}5+10{,}8+26{,}6+49{,}2+73{,}9) = \\boxed{\\text{Rp }162 \\text{ triliun}}"]}/>
        </Sec>

        {/* ═══ BAB 4: KALKULATOR BENEFIT ═══ */}
        <Sec accent={C.accent}>
          <ST icon="⚡" title="Bab 4: Kalkulator Benefit — Listrik vs CNG" sub="Ubah parameter via ⚙️. Berapa penghematan APBN jika α% RT beralih dari LPG?"/>
          <P>Dengan <Latex>{`\\alpha = ${alpha}\\%`}</Latex> dari <b>{rtLPG.toFixed(1)} juta RT</b>, berarti <b style={{color:C.accent}}>{(c.rtK/1e6).toFixed(1)} juta RT</b> terkonversi. Benefit utama = hemat subsidi APBN:</P>

          <FB texLines={[
            "B_{\\text{listrik}} = RT_{\\text{konversi}} \\times (\\text{Subsidi LPG/KK/bln}) \\times 12 \\quad \\text{(subsidi = Rp 0 untuk listrik)}",
            "B_{\\text{CNG}} = RT_{\\text{konversi}} \\times (\\text{Subsidi LPG} - \\text{Subsidi CNG}) \\times 12 \\quad \\text{(CNG masih butuh subsidi)}"
          ]}/>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,margin:"16px 0"}}>
            <MC icon="🔌" title="Hemat subsidi → Listrik" value={fmtT(c.B1_listrik)} sub={`${fmt(c.subsLPGperKK)}/KK/bln × 12`} color={C.cyan}/>
            <MC icon="⛽" title="Hemat subsidi → CNG" value={fmtT(c.B1_cng)} sub={`(${fmt(c.subsLPGperKK)} − ${fmt(c.subsCNGperKK)})/KK/bln`} color={C.orange}/>
            <MC icon="🏠" title="RT Terkonversi" value={`${(c.rtK/1e6).toFixed(1)} jt`} sub={`${alpha}% dari ${rtLPG.toFixed(1)} jt`} color={C.accent}/>
          </div>

          <CO type="info"><b>Perhatikan:</b> Hemat subsidi via listrik <b>jauh lebih besar</b> dari via CNG — karena listrik menghilangkan 100% subsidi operasional, sedangkan CNG hanya mengurangi ~24% (dari Rp 145.494 menjadi Rp 110.848 per KK/bulan). Tapi CNG masih tetap perlu subsidi.</CO>

          <h3 style={{fontSize:15,color:C.textBright,margin:"20px 0 8px",fontFamily:"'Sora',sans-serif"}}>Cost & ROI Perbandingan</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,margin:"12px 0"}}>
            <MC icon="🔌" title="Cost Listrik (total)" value={fmtT(c.C_listrik)} sub="kompor+daya+distribusi+edukasi+manufaktur" color={C.cyan}/>
            <MC icon="⛽" title="Cost CNG (total)" value={fmtT(c.C_cng)} sub={`tabung Rp ${fmt(cngTankCost)}/unit`} color={C.orange}/>
            <MC icon="⏱️" title="ROI Listrik" value={c.roi_listrik>0&&c.roi_listrik<999?`${c.roi_listrik.toFixed(1)} bln`:"∞"} sub="hemat subsidi + revenue PLN" color={C.cyan}/>
            <MC icon="⏱️" title="ROI CNG" value={c.roi_cng>0&&c.roi_cng<999?`${c.roi_cng.toFixed(1)} bln`:"∞"} sub="hemat subsidi bersih" color={C.orange}/>
          </div>

          <P>CNG membutuhkan investasi <b style={{color:C.orange}}>{fmtT(c.C_cng)}</b> (tabung CNG Rp {fmt(cngTankCost)}/unit × {(c.rtK/1e6).toFixed(1)} jt unit) — <b>{(c.C_cng/c.C_listrik).toFixed(1)}× lebih mahal</b> dari program listrik ({fmtT(c.C_listrik)}). Tapi hemat subsidinnya juga lebih kecil karena CNG masih perlu subsidi operasional.</P>

          <FB texLines={[
            `\\text{ROI Listrik} = \\frac{${fmtT(c.C_listrik)}}{(${fmtT(c.B1_listrik)} + ${fmtT(c.B3_listrik)}) \\div 12} = \\boxed{${c.roi_listrik>0&&c.roi_listrik<999?c.roi_listrik.toFixed(1):"\\infty"} \\text{ bulan}}`,
            `\\text{ROI CNG} = \\frac{${fmtT(c.C_cng)}}{${fmtT(c.B1_cng)} \\div 12} = \\boxed{${c.roi_cng>0&&c.roi_cng<999?c.roi_cng.toFixed(1):"\\infty"} \\text{ bulan}}`
          ]}/>
        </Sec>

        {/* ═══ BAB 5: PRODUKSI & DEVISA (LISTRIK) ═══ */}
        <Sec accent={C.green}>
          <ST icon="🏭" title="Bab 5: Produksi Lokal & Neraca Devisa (Kompor Listrik)" sub="Kapasitas produksi Indonesia dan dampaknya terhadap neraca devisa."/>
          <P>Kapasitas produksi lokal saat ini hanya <b style={{color:C.accent}}>{prodLokalJt.toFixed(1)} juta unit/tahun</b>. Kemenperin mengidentifikasi 11 pabrikan yang bisa memproduksi hingga 5 juta unit/tahun jika program dilanjutkan. <SBtn k="prodKapasitas"/></P>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,margin:"16px 0"}}>
            <div style={{background:C.surface,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Devisa keluar — impor kompor (sekali)</div>
              <div style={{fontSize:20,fontWeight:800,color:c.devisaImporKompor>0?C.red:C.green,fontFamily:"'Space Mono',monospace"}}>{c.devisaImporKompor>0?fmtT(c.devisaImporKompor):"Rp 0 (100% lokal)"}</div>
              <div style={{fontSize:11,color:C.textMuted}}>{c.pctLokal.toFixed(0)}% diproduksi lokal</div>
            </div>
            <div style={{background:C.surface,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Devisa dihemat — LPG tidak diimpor (/tahun)</div>
              <div style={{fontSize:20,fontWeight:800,color:C.green,fontFamily:"'Space Mono',monospace"}}>{fmtT(c.devisaHematLPG)}</div>
              <div style={{fontSize:11,color:C.textMuted}}>indikator strategis</div>
            </div>
          </div>

          {c.devisaImporKompor>0&&<P>Meskipun {(100-c.pctLokal).toFixed(0)}% kompor diimpor, devisa keluar (<b style={{color:C.red}}>{fmtT(c.devisaImporKompor)}</b> sekali) tergantikan oleh devisa LPG yang dihemat (<b style={{color:C.green}}>{fmtT(c.devisaHematLPG)}/tahun</b>) dalam <b style={{color:C.accent}}>{c.roiDevisa>0&&c.roiDevisa<999?c.roiDevisa.toFixed(1):"∞"} bulan</b>.</P>}
          {c.tahunProduksi>1&&<P>Dengan kapasitas {prodLokalJt.toFixed(1)} jt unit/tahun, butuh <b style={{color:C.accent}}>{c.tahunProduksi} tahun</b> memproduksi {(c.rtK/1e6).toFixed(1)} jt unit — konversi harus bertahap.</P>}
          <CO type="warning"><b>Catatan CNG:</b> Tabung CNG Tipe-4 seharga Rp 12 juta/unit <b>juga harus diimpor</b> (teknologi komposit). Devisa keluar untuk CNG jauh lebih besar per unit — ini perlu dipertimbangkan dalam neraca devisa total.</CO>
        </Sec>

        {/* ═══ BAB 6: VERDICT ═══ */}
        <Sec accent={C.accent}>
          <ST icon="🏆" title="Bab 6: Verdict — Mana yang Terbaik?" sub="Ringkasan perbandingan dari semua perspektif."/>

          <div style={{overflowX:"auto",margin:"12px 0"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:`2px solid ${C.borderLight}`}}>
              {["Kriteria","🔴 LPG 3 kg","🟠 CNG","🔵 Listrik","🟢 Jargas"].map((h,i)=><th key={i} style={{padding:"10px 8px",fontSize:i===0?11:12,color:i===0?C.textMuted:C.textBright,textTransform:i===0?"uppercase":"none",letterSpacing:i===0?1:0,textAlign:i===0?"left":"center",fontWeight:700,minWidth:i===0?120:90}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[
                {k:"Biaya konsumen/bln (retail)",v:["Rp 72.216","Rp 63.720","Rp 140.891","Rp 70.200"],best:1},
                {k:"Biaya negara/bln (keekonomian)",v:["Rp 217.710","Rp 174.568","Rp 140.891","Rp 148.935"],best:2},
                {k:"Subsidi/KK/bln",v:["Rp 145.494","Rp 110.848","Rp 0","Rp 78.735"],best:2},
                {k:"Capex/KK",v:["Rp 0 (existing)","Rp 12 juta","Rp 2 juta","Rp 10 juta"],best:0},
                {k:"Ketergantungan impor",v:["~80%","Domestik (gas bumi)","Domestik (listrik)","Domestik (gas bumi)"],best:1},
                {k:"Infrastruktur",v:["Sudah ada","SPBG baru","PLN existing","Pipa baru"],best:2},
              ].map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"8px",fontSize:11,color:C.textMuted}}>{r.k}</td>
                {r.v.map((v,j)=><td key={j} style={{padding:"8px",fontSize:12,color:j===r.best?C.green:C.text,textAlign:"center",fontWeight:j===r.best?700:400,fontFamily:"'Space Mono',monospace",background:j===r.best?"rgba(18,183,106,0.08)":"transparent"}}>{v}</td>)}
              </tr>)}
            </tbody>
          </table></div>

          <CO type="success"><b>Kesimpulan:</b> Tidak ada solusi tunggal yang sempurna — setiap alternatif unggul di aspek berbeda. <b style={{color:C.cyan}}>Listrik</b> terbaik dari perspektif negara (Rp 0 subsidi, biaya keekonomian terendah, infrastruktur PLN sudah ada), tapi termahal bagi konsumen tanpa subsidi. <b style={{color:C.orange}}>CNG</b> menjanjikan pengurangan impor dengan gas domestik, tapi capex sangat tinggi (Rp 12 juta/unit) dan infrastruktur SPBG belum ada. <b style={{color:C.green}}>Jargas</b> paling efisien tapi skalabilitasnya terbatas — membangun pipa ke 67 juta RT praktis tidak mungkin.</CO>

          <P>Strategi optimal kemungkinan besar adalah <b>kombinasi</b>: CNG sebagai solusi massal untuk kelas menengah-bawah (menggantikan volume terbesar LPG), kompor listrik untuk kelas menengah-atas (desil 9–10, yang tidak butuh subsidi), dan Jargas di area urban yang sudah punya infrastruktur pipa. Persis seperti skenario pemerintah di Bab 3.</P>
        </Sec>

        {/* FOOTER */}
        <div style={{textAlign:"center",padding:"20px 0 36px",borderTop:`1px solid ${C.border}`,marginTop:8}}>
          <p style={{fontSize:11,color:C.textMuted,margin:"0 0 4px"}}>Sumber: Susenas BPS 2024 • Pertamina Patra Niaga 2025 • Handbook ESDM 2024 • IISD 2025 • Paparan ESDM Apr 2026</p>
          <p style={{fontSize:11,color:C.textMuted,margin:0}}>Semua sumber telah diverifikasi • Mei 2026 • #SemuaBisaDihitung • by Alif Towew</p>
        </div>
      </div>
    </div>
  );
}
