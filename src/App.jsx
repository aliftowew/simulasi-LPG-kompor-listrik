import { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, AreaChart, Area,
  PieChart, Pie, Cell,
} from "recharts";

const C = {
  bg: "#05080f", surface: "#0c1220", card: "#111b2e", border: "#1c2a45",
  borderLight: "#253454", accent: "#f0a830", accentDim: "#b07a10",
  accentGlow: "rgba(240,168,48,0.12)", red: "#f04438", redDim: "rgba(240,68,56,0.12)",
  green: "#12b76a", greenDim: "rgba(18,183,106,0.12)", blue: "#2e90fa",
  blueDim: "rgba(46,144,250,0.12)", cyan: "#06aed4", purple: "#9b59b6",
  text: "#d0d5dd", textMuted: "#667085", textBright: "#f5f5f6", white: "#fff",
};
const fmt = n => new Intl.NumberFormat("id-ID").format(Math.round(n));
const fmtT = n => `Rp ${(n / 1e12).toFixed(1)} T`;

/* ─── KaTeX ─── */
const Latex = ({ children, display = false }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.katex) {
      try { window.katex.render(children, ref.current, { throwOnError: false, displayMode: display, output: "html" }); }
      catch { ref.current.textContent = children; }
    }
  }, [children, display]);
  return <span ref={ref} />;
};

/* ─── Sources ─── */
const SRC = {
  targetRT:{l:"Peta Jalan DEN / Kompas",u:"https://nasional.kompas.com/read/2026/03/05/18193651/prabowo-minta-konversi-kompor-listrik-dikebut-kurangi-ketergantungan-impor"},
  konsumsiLPG:{l:"PLN / Kementerian ESDM",u:"https://www.esdm.go.id/id/berita-unit/direktorat-jenderal-ketenagalistrikan/ditjen-gatrik-dorong-konversi-kompor-induksi-"},
  hargaSubsidi:{l:"Tetap sejak 2007 / Katadata",u:"https://katadata.co.id/berita/energi/63243bfaaeda3/perbandingan-biaya-masak-antara-kompor-induksi-listrik-dan-lpg-3-kg"},
  hargaEkonomian:{l:"Kementerian ESDM",u:"https://www.esdm.go.id/id/media-center/arsip-berita/kementerian-esdm-dan-pln-ajak-warga-jakarta-beralih-ke-kompor-induksi-1"},
  imporVolume:{l:"Reforminer Institute",u:"https://reforminer.com/ketergantungan-impor-lpg-dan-wacana-impor-lng/"},
  imporNilai:{l:"CNBC Indonesia",u:"https://www.cnbcindonesia.com/news/20250410114527-4-624844/54-impor-lpg-ri-ternyata-dari-as-ini-buktinya"},
  subsidiTotal:{l:"APBN 2025 / Databoks",u:"https://databoks.katadata.co.id/en/economics-macro/statistics/67d3a83ea8f03/2025-energy-subsidy-and-compensation-budget-reaches-rp394-trillion"},
  kapasitasPLN:{l:"ESDM Semester I 2025",u:"https://www.esdm.go.id/en/media-center/news-archives/semester-i-tahun-2025-kapasitas-terpasang-pembangkit-meningkat-44-gw"},
  reserveMargin:{l:"Kontan / PLN",u:"https://industri.kontan.co.id/news/reserve-margin-kelistrikan-jawa-bali-mencapai-44-per-juni-2023"},
  rasioElektrifikasi:{l:"Databoks 2024",u:"https://databoks.katadata.co.id/en/utilities/statistics/6927efbf1ae87/indonesias-electrification-ratio-continues-to-increase-until-2024"},
  tarifListrik:{l:"PLN Tarif 1.300 VA",u:"https://www.cnbcindonesia.com/news/20220616144813-4-347702/pakai-lpg-vs-kompor-induksi-mana-lebih-murah"},
  indef:{l:"Studi INDEF (PDF)",u:"https://indef.or.id/wp-content/uploads/2023/05/032023_pb_indef-1.pdf"},
  impor80:{l:"CNBC Indonesia",u:"https://www.cnbcindonesia.com/news/20250718163807-4-650356/alamak-75-lpg-subsidi-3-kg-berasal-dari-impor"},
  bebanPuncak:{l:"PLN Statistik",u:"https://web.pln.co.id/statics/uploads/2023/05/Statistik-PLN-2022-Final-2.pdf"},
  efisiensiInduksi:{l:"Kompas / Electrolux",u:"https://www.kompas.com/tren/read/2021/12/05/100500265/mengenal-apa-itu-kompor-induksi-dan-kelebihannya?page=all"},
  efisiensiGas:{l:"Katadata / ESDM",u:"https://katadata.co.id/intan/berita/633195212b136/mengenal-kompor-induksi-kelebihan-dan-kekurangannya"},
  hargaImporLPG:{l:"IDN Times / CNBC",u:"https://www.idntimes.com/business/economy/impor-migas-ri-capai-rp580-56-triliun-lpg-didominasi-dari-as-00-gshdq-bq22rp"},
  biayaKompor:{l:"BALIPOST / Pilot 2022",u:"https://www.balipost.com/news/2022/10/17/298501/Konversi-Kompor-Listrik.html"},
  mcbKhusus:{l:"Kompas / PLN",u:"https://money.kompas.com/read/2022/09/15/081000326/pln-memasak-dengan-kompor-induksi-tidak-perlu-tambah-daya-ada-jalur-khusus"},
  pelangganDayaRendah:{l:"Kumparan",u:"https://kumparan.com/kumparanbisnis/rasio-elektrifikasi-indonesia-99-83-persen-target-rampung-5-tahun-lagi-24VnDNfqBDj"},
  upgradeDistribusi:{l:"Kontan / PLN",u:"https://industri.kontan.co.id/news/pln-beberkan-kendala-yang-bisa-hambat-konversi-kompor-lpg-ke-kompor-induksi"},
  plnSerap13gw:{l:"Medcom / PLN",u:"https://www.medcom.id/ekonomi/bisnis/JKR3GYyN-pln-program-kompor-induksi-serap-13-gigawatt-listrik"},
  konversiMitan:{l:"PMC / ScienceDirect",u:"https://pmc.ncbi.nlm.nih.gov/articles/PMC6186446/"},
};
const SBtn = ({k}) => { const s=SRC[k]; if(!s) return null; return <a href={s.u} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,color:C.accent,background:C.accentGlow,border:`1px solid ${C.accentDim}40`,borderRadius:20,padding:"2px 10px 2px 7px",textDecoration:"none",cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s",flexShrink:0}} onMouseEnter={e=>{e.currentTarget.style.background=C.accentDim+"50"}} onMouseLeave={e=>{e.currentTarget.style.background=C.accentGlow}}><span style={{fontSize:9}}>🔗</span> {s.l}</a>; };

/* ─── UI building blocks ─── */
const Sec = ({children,accent=C.accent}) => <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"28px 22px",marginBottom:20,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,width:4,height:"100%",background:accent,borderRadius:"16px 0 0 16px"}}/>{children}</div>;
const ST = ({icon,title,sub}) => <div style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><span style={{fontSize:20}}>{icon}</span><h2 style={{margin:0,fontSize:18,fontWeight:800,color:C.textBright,fontFamily:"'Sora',sans-serif"}}>{title}</h2></div>{sub&&<p style={{margin:0,fontSize:13,color:C.textMuted,paddingLeft:30,lineHeight:1.5}}>{sub}</p>}</div>;
const P = ({children}) => <p style={{fontSize:13.5,color:C.text,lineHeight:1.75,margin:"10px 0"}}>{children}</p>;
const FB = ({texLines}) => <div style={{background:"#080e1e",border:`1px solid ${C.borderLight}`,borderRadius:12,padding:"18px 22px",margin:"14px 0",overflowX:"auto"}}>{texLines.map((t,i)=><div key={i} style={{marginBottom:i<texLines.length-1?10:0,textAlign:"center"}}><Latex display>{t}</Latex></div>)}</div>;
const CO = ({children,type="info"}) => { const m={info:{bg:C.blueDim,b:C.blue,i:"💡"},success:{bg:C.greenDim,b:C.green,i:"✅"},warning:{bg:C.accentGlow,b:C.accent,i:"⚠️"},danger:{bg:C.redDim,b:C.red,i:"🚨"}}; const c=m[type]; return <div style={{background:c.bg,border:`1px solid ${c.b}30`,borderRadius:10,padding:"12px 16px",margin:"14px 0",fontSize:13,color:C.text,lineHeight:1.6,display:"flex",gap:10,alignItems:"flex-start"}}><span style={{fontSize:16,flexShrink:0}}>{c.i}</span><div>{children}</div></div>; };
const MC = ({title,value,sub,color=C.accent,icon}) => <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${color},${color}00)`}}/><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>{icon} {title}</div><div style={{fontSize:24,fontWeight:800,color,fontFamily:"'Space Mono',monospace",lineHeight:1.1}}>{value}</div>{sub&&<div style={{fontSize:11,color:C.textMuted,marginTop:6}}>{sub}</div>}</div>;
const Sl = ({label,value,onChange,min,max,step=1,formatter,source}) => <div style={{marginBottom:18}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:4}}><div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}><span style={{fontSize:12,color:C.textMuted}}>{label}</span>{source&&<SBtn k={source}/>}</div><span style={{fontSize:13,color:C.accent,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{formatter?formatter(value):fmt(value)}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",height:6,appearance:"none",borderRadius:3,outline:"none",cursor:"pointer",background:`linear-gradient(to right,${C.accent} ${((value-min)/(max-min))*100}%,${C.border} ${((value-min)/(max-min))*100}%)`}}/><div style={{display:"flex",justifyContent:"space-between",marginTop:2}}><span style={{fontSize:9,color:C.textMuted}}>{formatter?formatter(min):fmt(min)}</span><span style={{fontSize:9,color:C.textMuted}}>{formatter?formatter(max):fmt(max)}</span></div></div>;
const VR = ({sym,param,val,unit,src,color}) => <tr style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"10px 8px",color:C.cyan,fontSize:14,fontWeight:700,width:55,verticalAlign:"middle"}}><Latex>{sym}</Latex></td><td style={{padding:"10px 8px",fontSize:13,color:C.text}}>{param}</td><td style={{padding:"10px 8px",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,color:color||C.accent,textAlign:"right",whiteSpace:"nowrap"}}>{val} <span style={{fontSize:11,color:C.textMuted,fontWeight:400}}>{unit}</span></td><td style={{padding:"10px 4px",textAlign:"right"}}>{src&&<SBtn k={src}/>}</td></tr>;
const TT = {background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12,color:C.text};

/* ═══ APP ═══ */
export default function App() {
  const [rt,setRt]=useState(52e6);
  const [alpha,setAlpha]=useState(30);
  const [qLPG,setQ]=useState(11.4);
  const [pSub,setPS]=useState(4250);
  const [pEkon,setPE]=useState(19698);
  const [tL,setTL]=useState(1444);
  const [dW,setDW]=useState(1800);
  const [bK,setBK]=useState(2e6);
  const [hI,setHI]=useState(550);
  const [kurs,setKurs]=useState(16200);
  const [sLPG,setSLPG]=useState(true);
  const [kr,setKR]=useState(false);

  useEffect(()=>{
    if(window.katex){setKR(true);return;}
    const l=document.createElement("link");l.rel="stylesheet";l.href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";document.head.appendChild(l);
    const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";s.onload=()=>setKR(true);document.head.appendChild(s);
  },[]);

  const c = useMemo(()=>{
    const rtK=rt*(alpha/100), spk=pEkon-pSub, kwk=(7.2*0.44)/0.87, kwb=qLPG*kwk;
    const bL=qLPG*pSub, bI=kwb*tL, bLE=qLPG*pEkon, sel=bL-bI;
    const B1=rtK*qLPG*12*spk, B2=rtK*qLPG*12*hI*kurs/1000, B3=rtK*kwb*12*tL, Bt=B1+B2+B3;
    const C1=rtK*bK, C2=rtK*.5*750000, C3=rtK*.6*800000, C4=rtK*50000, C6=3e12;
    const Co=C1+C2+C3+C4+C6, C5=sLPG&&sel<0?rtK*Math.abs(sel)*12:0;
    const nb=Bt-C5, roi=nb>0?Co/(nb/12):Infinity, gw=(rtK*dW*0.3)/1e9;
    return {rtK,kwk,kwb,bL,bI,bLE,sel,B1,B2,B3,Bt,C1,C2,C3,C4,C5,C6,Co,nb,roi,gw,r5:nb>0?(nb*5)/Co:0,r10:nb>0?(nb*10)/Co:0};
  },[rt,alpha,qLPG,pSub,pEkon,tL,dW,bK,hI,kurs,sLPG]);

  const impD=[{t:"2020",impor:6.40,dom:1.92},{t:"2021",impor:6.10,dom:1.95},{t:"2022",impor:6.74,dom:1.97},{t:"2023",impor:6.95,dom:1.96},{t:"2024",impor:6.89,dom:1.96},{t:"2025",impor:7.49,dom:1.97}];
  const bD=[{name:"Hemat Subsidi (B₁)",value:c.B1/1e12,color:C.green},{name:"Hemat Devisa (B₂)",value:c.B2/1e12,color:C.blue},{name:"Pendapatan PLN (B₃)",value:c.B3/1e12,color:C.cyan}];
  const cD=[{name:"Kompor (C₁)",value:c.C1/1e12,color:C.red},{name:"Daya (C₂)",value:c.C2/1e12,color:"#e67e22"},{name:"Distribusi (C₃)",value:c.C3/1e12,color:"#e74c3c"},{name:"Edukasi (C₄)",value:c.C4/1e12,color:C.purple},{name:"Manufaktur (C₆)",value:c.C6/1e12,color:"#95a5a6"}];
  const mD=[{label:"LPG Subsidi",biaya:c.bL,color:C.red},{label:"Induksi 1300VA",biaya:c.bI,color:C.cyan},{label:"LPG Ekonomi",biaya:c.bLE,color:"#dc2626"},{label:"Induksi 450VA",biaya:c.kwb*415,color:C.green}];
  const sD=[10,20,30,40,50,60,70,80,90,100].map(p=>{const r=rt*(p/100);const b=r*qLPG*12*((pEkon-pSub)+(hI*kurs/1000)+(c.kwk*tL));const co=r*(bK+.5*750000+.6*800000+50000)+3e12;return{persen:`${p}%`,benefit:+(b/1e12).toFixed(1),cost:+(co/1e12).toFixed(1)};});

  if(!kr) return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.accent,fontSize:16}}>Memuat formula renderer...</div>;

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Space+Mono:wght@400;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:880,margin:"0 auto",padding:"32px 16px"}}>

        {/* HERO */}
        <div style={{textAlign:"center",marginBottom:40,position:"relative"}}>
          <div style={{position:"absolute",top:-50,left:"50%",transform:"translateX(-50%)",width:350,height:350,borderRadius:"50%",background:`radial-gradient(circle,${C.accentGlow} 0%,transparent 70%)`,pointerEvents:"none"}}/>
          <div style={{fontSize:11,letterSpacing:4,color:C.accent,textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:12}}>Analisis Kebijakan Energi • 2026</div>
          <h1 style={{fontSize:30,fontWeight:800,fontFamily:"'Sora',sans-serif",color:C.white,margin:0,lineHeight:1.15}}>Konversi Kompor LPG → Listrik</h1>
          <P>Indonesia berencana mengganti kompor LPG dengan kompor induksi untuk 52 juta rumah tangga. Kebijakan ini didorong oleh dua beban besar: <b style={{color:C.red}}>impor LPG senilai US$ 3,79 miliar/tahun</b> dan <b style={{color:C.red}}>subsidi APBN Rp 87 triliun/tahun</b>. Pertanyaan utamanya: apakah dampak positif konversi ini lebih besar dari biaya mengatasi tantangannya? Dokumen ini menjawabnya dengan rumus, data, dan kalkulasi — <b style={{color:C.accent}}>#SemuaBisaDihitung</b>.</P>
          <div style={{width:80,height:3,background:`linear-gradient(90deg,transparent,${C.accent},transparent)`,margin:"20px auto 0",borderRadius:2}}/>
        </div>

        {/* ═══ BAB 1 ═══ */}
        <Sec accent={C.cyan}>
          <ST icon="📋" title="Bab 1: Variabel Dasar" sub="Sebelum menghitung apa pun, kita perlu mendefinisikan variabel yang akan digunakan di seluruh analisis ini."/>
          <P>Tabel di bawah berisi <b>16 variabel dasar</b> yang menjadi fondasi seluruh kalkulasi. Setiap angka berasal dari sumber resmi — klik tombol 🔗 untuk membuka dokumen aslinya. Variabel dikelompokkan menjadi empat kategori: konsumsi & harga LPG, data impor & subsidi nasional, infrastruktur kelistrikan, serta efisiensi & tarif listrik.</P>

          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`2px solid ${C.borderLight}`}}>
            {["Simbol","Parameter","Nilai","Sumber"].map((h,i)=><th key={i} style={{padding:8,fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1.2,textAlign:i>=2?"right":"left",fontWeight:600}}>{h}</th>)}
          </tr></thead><tbody>
            <tr><td colSpan={4} style={{padding:"14px 8px 6px",fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Konsumsi & Harga LPG</td></tr>
            <VR sym="N" param="Total rumah tangga pengguna LPG" val="52.000.000" unit="RT" src="targetRT"/>
            <VR sym="Q" param="Konsumsi LPG per RT per bulan" val="11,4" unit="kg" src="konsumsiLPG"/>
            <VR sym="P_s" param="Harga LPG subsidi (dibayar masyarakat)" val="Rp 4.250" unit="/kg" src="hargaSubsidi"/>
            <VR sym="P_e" param="Harga keekonomian LPG (harga sebenarnya)" val="Rp 19.698" unit="/kg" src="hargaEkonomian" color={C.red}/>
            <VR sym="\alpha" param="Tingkat konversi (bisa diubah di Bab 4)" val={`${alpha}`} unit="%" color={C.accent}/>
            <tr><td colSpan={4} style={{padding:"16px 8px 6px",fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Impor & Subsidi Nasional</td></tr>
            <VR sym="V_{\text{imp}}" param="Volume impor LPG/tahun (2024)" val="6,89" unit="juta ton" src="imporVolume"/>
            <VR sym="C_{\text{imp}}" param="Nilai impor LPG/tahun (2024)" val="US$ 3,79" unit="miliar" src="imporNilai" color={C.red}/>
            <VR sym="S_{\text{LPG}}" param="Subsidi LPG 3 kg/tahun (APBN)" val="Rp 87" unit="triliun" src="subsidiTotal" color={C.red}/>
            <VR sym="\%" param="Porsi impor dari total kebutuhan" val="~80" unit="%" src="impor80" color={C.red}/>
            <VR sym="\%" param="Subsidi tidak tepat sasaran (INDEF)" val="65,5" unit="%" src="indef" color={C.red}/>
            <tr><td colSpan={4} style={{padding:"16px 8px 6px",fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Infrastruktur Kelistrikan</td></tr>
            <VR sym="K_{\text{PLN}}" param="Kapasitas terpasang PLN" val="107,51" unit="GW" src="kapasitasPLN"/>
            <VR sym="L_p" param="Beban puncak nasional" val="~45" unit="GW" src="bebanPuncak"/>
            <VR sym="RM" param="Reserve margin Jawa-Bali" val="44" unit="%" src="reserveMargin" color={C.green}/>
            <VR sym="r" param="Rasio elektrifikasi nasional" val="99,83" unit="%" src="rasioElektrifikasi" color={C.green}/>
            <VR sym="-" param="Pelanggan daya 450–900 VA" val="32,5" unit="juta RT" src="pelangganDayaRendah" color={C.accent}/>
            <tr><td colSpan={4} style={{padding:"16px 8px 6px",fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Efisiensi & Tarif Listrik</td></tr>
            <VR sym="\eta_i" param="Efisiensi kompor induksi" val="87" unit="%" src="efisiensiInduksi" color={C.green}/>
            <VR sym="\eta_g" param="Efisiensi kompor gas LPG" val="44" unit="%" src="efisiensiGas" color={C.red}/>
            <VR sym="T_l" param="Tarif listrik golongan 1.300 VA" val="Rp 1.444" unit="/kWh" src="tarifListrik"/>
          </tbody></table></div>

          <P>Dari variabel di atas, kita bisa menghitung <b>berapa besar subsidi yang ditanggung pemerintah per kg LPG</b>. Selisih antara harga keekonomian (Rp 19.698) dan harga jual ke masyarakat (Rp 4.250) adalah beban subsidi per kg:</P>
          <FB texLines={["\\text{Subsidi/kg} = P_e - P_s = 19.698 - 4.250 = \\boxed{\\text{Rp }15.448\\text{/kg}}"]}/>
          <P>Artinya, dari setiap kilogram LPG yang dijual ke masyarakat, pemerintah menanggung <b style={{color:C.red}}>78,4%</b> dari harga sebenarnya. Bayangkan: saat ibu-ibu membeli tabung LPG 3 kg seharga Rp 12.750, harga sebenarnya adalah Rp 59.094 — selisih Rp 46.344 per tabung ditanggung APBN.</P>
          <FB texLines={["\\frac{P_e - P_s}{P_e} = \\frac{15.448}{19.698} = \\boxed{78{,}4\\%}"]}/>

          <CO type="danger"><b>Inti masalah:</b> Subsidi Rp 87T/tahun ini bukan hanya besar — tapi 65,5%-nya salah sasaran. Studi INDEF menunjukkan mayoritas subsidi dinikmati rumah tangga desil 6–10 (menengah ke atas) yang sebenarnya mampu membayar harga penuh.</CO>

          <div style={{marginTop:24}}>
            <h4 style={{fontSize:14,color:C.textBright,margin:"0 0 6px"}}>Tren Impor vs Produksi Domestik LPG (2020–2025)</h4>
            <P>Grafik di bawah menunjukkan kesenjangan yang terus melebar antara impor (merah) dan produksi domestik (hijau). Perhatikan bahwa produksi domestik praktis <b>tidak bertumbuh</b> selama 5 tahun — stagnan di kisaran 1,92–1,97 juta ton. Sementara impor terus naik ~8% per tahun, dari 6,4 juta ton (2020) menjadi 7,49 juta ton (2025).</P>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={impD} margin={{top:5,right:10,left:0,bottom:5}}>
                <defs><linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.red} stopOpacity={.35}/><stop offset="100%" stopColor={C.red} stopOpacity={.05}/></linearGradient><linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={.35}/><stop offset="100%" stopColor={C.green} stopOpacity={.05}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="t" tick={{fontSize:11,fill:C.textMuted}}/><YAxis tick={{fontSize:11,fill:C.textMuted}} unit=" jt"/>
                <Tooltip contentStyle={TT}/><Area type="monotone" dataKey="impor" stroke={C.red} fill="url(#gi)" strokeWidth={2} name="Impor"/><Area type="monotone" dataKey="dom" stroke={C.green} fill="url(#gd)" strokeWidth={2} name="Domestik"/><Legend wrapperStyle={{fontSize:11}}/>
              </AreaChart>
            </ResponsiveContainer>
            <P>Area merah yang mendominasi menunjukkan <b>ketergantungan impor ~80%</b>. Ini berarti keamanan energi memasak Indonesia sangat rentan terhadap fluktuasi harga global dan gangguan geopolitik — seperti yang terjadi saat konflik Iran-AS awal 2026 yang sempat mengganggu pasokan via Selat Hormuz.</P>
          </div>
        </Sec>

        {/* ═══ BAB 2 ═══ */}
        <Sec accent={C.green}>
          <ST icon="📈" title="Bab 2: Dampak Positif — Dikuantifikasi" sub="Kita identifikasi tiga benefit utama yang bisa dihitung secara presisi menggunakan variabel di Bab 1."/>
          <P>Misalkan <Latex>{`\\alpha`}</Latex> adalah persentase rumah tangga yang berhasil dikonversi. Maka jumlah RT yang beralih ke kompor induksi:</P>
          <FB texLines={["RT_{\\text{konversi}} = \\alpha \\times N"]}/>
          <P>Dengan <Latex>{`\\alpha = ${alpha}\\%`}</Latex> dan <Latex>{`N = ${(rt/1e6).toFixed(0)}`}</Latex> juta, berarti <b style={{color:C.accent}}>{(c.rtK/1e6).toFixed(1)} juta RT</b>. Geser slider α di Bab 4 untuk mengubah skenario — semua angka benefit dan cost akan otomatis terupdate.</P>

          <h3 style={{fontSize:16,color:C.green,margin:"24px 0 8px",fontFamily:"'Sora',sans-serif"}}><Latex>{"B_1"}</Latex> — Penghematan Subsidi APBN</h3>
          <P>Ini adalah benefit terbesar. Logikanya sederhana: setiap RT yang beralih ke kompor induksi <b>tidak lagi membeli LPG bersubsidi</b>. Konsumsi LPG mereka (Q kg/bulan) dikalikan subsidi per kg (Rp 15.448) dan 12 bulan memberikan penghematan subsidi tahunan per RT.</P>
          <FB texLines={["B_1 = RT_{\\text{konversi}} \\times Q \\times 12 \\times (P_e - P_s)"]}/>
          <P>Mengapa ini penting? Karena subsidi LPG 3 kg adalah <b>komponen terbesar subsidi energi APBN</b> — menghabiskan Rp 87 triliun/tahun, lebih besar dari subsidi listrik. Setiap RT yang beralih langsung mengurangi beban ini.</P>

          <h3 style={{fontSize:16,color:C.blue,margin:"24px 0 8px",fontFamily:"'Sora',sans-serif"}}><Latex>{"B_2"}</Latex> — Penghematan Devisa Impor</h3>
          <P>Indonesia mengimpor ~80% kebutuhan LPG dari luar negeri, terutama dari AS (54% volume). Setiap kg LPG yang tidak dikonsumsi berarti LPG yang tidak perlu diimpor — menghemat devisa negara. <SBtn k="hargaImporLPG"/></P>
          <FB texLines={["B_2 = RT_{\\text{konversi}} \\times Q \\times 12 \\times \\frac{\\text{Harga}_{\\text{impor}} \\times \\text{Kurs}}{1000}"]}/>
          <P>Harga impor LPG berfluktuasi — saat ini sekitar US$ 550/ton. Dengan kurs Rp 16.200/USD, setiap ton LPG yang tidak diimpor menghemat Rp 8,91 juta devisa. Kalikan dengan jutaan ton konsumsi tahunan, dan angkanya menjadi sangat signifikan.</P>

          <h3 style={{fontSize:16,color:C.cyan,margin:"24px 0 8px",fontFamily:"'Sora',sans-serif"}}><Latex>{"B_3"}</Latex> — Pendapatan Baru PLN</h3>
          <P>Benefit ini unik karena bukan sekadar penghematan — melainkan <b>pendapatan baru</b>. RT yang beralih ke kompor induksi akan mengonsumsi listrik tambahan, yang menjadi revenue bagi PLN. Tapi berapa banyak listrik yang dibutuhkan untuk menggantikan LPG?</P>
          <P>Di sinilah efisiensi menjadi kunci. Satu kg LPG mengandung energi panas 7,2 kWh. Tapi kompor gas hanya memanfaatkan 44% dari energi itu (sisanya hilang ke udara). Kompor induksi memanfaatkan 87%. Jadi listrik yang dibutuhkan untuk hasil memasak yang sama:</P>
          <FB texLines={["\\text{kWh/kg}_{\\text{LPG}} = \\frac{7{,}2 \\times \\eta_g}{\\eta_i} = \\frac{7{,}2 \\times 0{,}44}{0{,}87} = \\boxed{3{,}64 \\text{ kWh}}"]}/>
          <P>Artinya, untuk menggantikan 1 kg LPG, hanya butuh 3,64 kWh listrik. Ini jauh lebih sedikit dari 7,2 kWh energi dalam LPG — karena efisiensi induksi yang hampir 2× lipat kompor gas. Pendapatan PLN dari konsumsi ini:</P>
          <FB texLines={["B_3 = RT_{\\text{konversi}} \\times Q \\times 12 \\times 3{,}64 \\times T_l"]}/>
          <CO type="info">Benefit ini punya efek domino positif: PLN saat ini mengalami <b>oversupply</b> — reserve margin Jawa-Bali mencapai 44%, jauh di atas standar 20–40%. Kompor induksi membantu mengoptimalkan pembangkit yang menganggur — PLN memperkirakan bisa menyerap hingga 13 GW tambahan. <SBtn k="plnSerap13gw"/></CO>
        </Sec>

        {/* ═══ BAB 3 ═══ */}
        <Sec accent={C.red}>
          <ST icon="🧱" title="Bab 3: Tantangan & Biaya Solusi" sub="Setiap kebijakan punya hambatan. Yang membedakan analisis baik dari buruk adalah: apakah hambatannya dikuantifikasi?"/>
          <P>Kita identifikasi 6 tantangan utama. Untuk masing-masing, kita hitung biaya solusinya agar bisa dibandingkan langsung dengan benefit di Bab 2.</P>

          <h3 style={{fontSize:16,color:C.red,margin:"20px 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_1"}</Latex> — Kompor + Peralatan Masak</h3>
          <P>Setiap RT butuh: kompor induksi 2 tungku (~Rp 1,2 juta), panci dan wajan ferromagnetik (~Rp 500rb), serta adaptor MCB (~Rp 300rb). Berdasarkan pilot project 2022 di Bali dan Solo, total biaya per paket sekitar Rp 2 juta. <SBtn k="biayaKompor"/></P>
          <FB texLines={["C_1 = RT_{\\text{konversi}} \\times \\text{Rp }2.000.000"]}/>
          <P>Catatan: kompor induksi buatan China bisa didapat mulai Rp 300 ribuan — tapi untuk kualitas yang aman dan tahan lama (SNI), Rp 1,2 juta adalah estimasi konservatif. Jika manufaktur lokal berkembang, harga ini bisa turun signifikan.</P>

          <h3 style={{fontSize:16,color:"#e67e22",margin:"24px 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_2"}</Latex> — Upgrade Daya Listrik RT</h3>
          <P>Ini tantangan teknis yang sering diremehkan. Kompor induksi standar berdaya 1.800 watt — sementara <b>32,5 juta pelanggan</b> masih di daya 450–900 VA. Mereka tidak bisa menggunakan kompor induksi tanpa upgrade daya atau solusi teknis alternatif. PLN mengusulkan MCB jalur khusus yang memungkinkan pelanggan 450 VA memakai kompor induksi melalui sirkuit terpisah — tapi solusi ini belum teruji dalam skala massal. <SBtn k="mcbKhusus"/></P>
          <P>Kita asumsikan ~50% RT yang dikonversi butuh upgrade daya, dengan biaya rata-rata Rp 750.000/RT (biaya administrasi + pergantian MCB):</P>
          <FB texLines={["C_2 = RT_{\\text{konversi}} \\times 0{,}5 \\times \\text{Rp }750.000"]}/>

          <h3 style={{fontSize:16,color:"#e74c3c",margin:"24px 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_3"}</Latex> — Upgrade Jaringan Distribusi PLN</h3>
          <P>Masalahnya bukan di pembangkit (kapasitas cukup), melainkan di <b>last-mile delivery</b>: trafo distribusi, kabel tegangan rendah, dan gardu. Jika jutaan RT tiba-tiba menambah beban 1.800W, trafo lokal bisa overload dan menyebabkan pemadaman. PLN sendiri mengakui ini sebagai kendala utama. <SBtn k="upgradeDistribusi"/></P>
          <P>Estimasi: ~60% area membutuhkan penguatan jaringan, dengan biaya rata-rata Rp 800.000/RT:</P>
          <FB texLines={["C_3 = RT_{\\text{konversi}} \\times 0{,}6 \\times \\text{Rp }800.000"]}/>

          <h3 style={{fontSize:16,color:C.purple,margin:"24px 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_4"}</Latex> — Edukasi & Sosialisasi Massal</h3>
          <P>Pelajaran dari konversi minyak tanah ke LPG tahun 2007: edukasi menentukan keberhasilan. Saat itu, kecelakaan meningkat tajam karena masyarakat belum terbiasa dengan tabung gas. Untuk kompor induksi, edukasi mencakup: cara penggunaan, peralatan masak yang kompatibel, demo memasak, dan penanganan masalah teknis. <SBtn k="konversiMitan"/></P>
          <FB texLines={["C_4 = RT_{\\text{konversi}} \\times \\text{Rp }50.000"]}/>

          <h3 style={{fontSize:16,color:C.accent,margin:"24px 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_5"}</Latex> — Subsidi Transisi Tarif Listrik</h3>
          <P>Ini variabel paling kritis. Selama LPG 3 kg dijual Rp 4.250/kg (Rp 12.750/tabung), biaya memasak masyarakat hanya ~Rp 48.450/bulan. Jika mereka beralih ke kompor induksi dengan tarif listrik 1.300VA (Rp 1.444/kWh), biaya memasak bisa lebih mahal. Pemerintah perlu menutup selisih ini agar masyarakat mau beralih:</P>
          <FB texLines={["C_5 = RT_{\\text{konversi}} \\times \\max\\!\\Big(0,\\; \\underbrace{Q \\times 3{,}64 \\times T_l}_{\\text{biaya induksi/bln}} - \\underbrace{Q \\times P_s}_{\\text{biaya LPG/bln}}\\Big) \\times 12"]}/>
          <CO type="warning"><b>Insight kunci:</b> <Latex>{"C_5 = 0"}</Latex> jika subsidi LPG dicabut bersamaan! Mengapa? Karena tanpa subsidi, harga LPG menjadi Rp 19.698/kg → biaya memasak Rp 224.558/bulan — <b>jauh lebih mahal</b> dari induksi. Jadi <Latex>{"C_5"}</Latex> bukan biaya tambahan yang sesungguhnya, melainkan konsekuensi dari mempertahankan distorsi subsidi.</CO>

          <h3 style={{fontSize:16,color:"#95a5a6",margin:"24px 0 6px",fontFamily:"'Sora',sans-serif"}}><Latex>{"C_6"}</Latex> — Investasi Manufaktur Lokal</h3>
          <P>Untuk tidak bergantung pada impor kompor dari China, Indonesia perlu membangun ekosistem manufaktur kompor induksi domestik. ITB sudah mengembangkan prototipe kompor induksi lokal. Estimasi investasi industri (bisa melalui PPP):</P>
          <FB texLines={["C_6 \\approx \\text{Rp }3 \\text{ triliun (investasi tetap)}"]}/>
        </Sec>

        {/* ═══ BAB 4 ═══ */}
        <Sec accent={C.accent}>
          <ST icon="⚡" title="Bab 4: Kalkulator Interaktif" sub="Sekarang Anda bisa menguji sendiri — geser slider untuk mengubah asumsi dan lihat dampaknya secara real-time."/>
          <P>Nilai default setiap parameter berasal dari sumber resmi (ditandai tombol 🔗). Anda bebas mengubahnya untuk menguji skenario berbeda — misalnya: bagaimana jika harga LPG subsidi dinaikkan? Atau jika tarif listrik turun? Semua angka di dashboard akan berubah otomatis.</P>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"0 28px"}}>
            <Sl label="Total RT (N)" value={rt} onChange={setRt} min={1e6} max={72e6} step={1e6} formatter={v=>`${(v/1e6).toFixed(0)} juta RT`} source="targetRT"/>
            <Sl label="Tingkat Konversi (α)" value={alpha} onChange={setAlpha} min={5} max={100} step={5} formatter={v=>`${v}%`}/>
            <Sl label="Konsumsi LPG (Q)" value={qLPG} onChange={setQ} min={5} max={20} step={.1} formatter={v=>`${v} kg/bln`} source="konsumsiLPG"/>
            <Sl label="Harga LPG Subsidi (Pₛ)" value={pSub} onChange={setPS} min={4250} max={19698} step={100} formatter={v=>`Rp ${fmt(v)}/kg`} source="hargaSubsidi"/>
            <Sl label="Harga Keekonomian (Pₑ)" value={pEkon} onChange={setPE} min={10000} max={30000} step={100} formatter={v=>`Rp ${fmt(v)}/kg`} source="hargaEkonomian"/>
            <Sl label="Tarif Listrik (Tₗ)" value={tL} onChange={setTL} min={415} max={2466} step={10} formatter={v=>`Rp ${fmt(v)}/kWh`} source="tarifListrik"/>
            <Sl label="Daya Kompor" value={dW} onChange={setDW} min={600} max={2400} step={100} formatter={v=>`${fmt(v)} W`}/>
            <Sl label="Biaya Kompor/RT" value={bK} onChange={setBK} min={5e5} max={5e6} step={1e5} formatter={v=>`Rp ${fmt(v)}`} source="biayaKompor"/>
            <Sl label="Harga Impor LPG" value={hI} onChange={setHI} min={300} max={900} step={10} formatter={v=>`US$ ${v}/ton`} source="hargaImporLPG"/>
            <Sl label="Kurs USD/IDR" value={kurs} onChange={setKurs} min={14000} max={18000} step={100} formatter={v=>`Rp ${fmt(v)}`}/>
          </div>
          <div style={{marginTop:8,padding:"14px 16px",background:C.surface,borderRadius:10,border:`1px solid ${C.border}`}}>
            <label style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",fontSize:13,color:C.text}}>
              <div onClick={()=>setSLPG(!sLPG)} style={{width:48,height:26,borderRadius:13,position:"relative",transition:"background .3s",background:sLPG?C.red:C.green,cursor:"pointer",flexShrink:0}}><div style={{width:20,height:20,borderRadius:"50%",background:C.white,position:"absolute",top:3,left:sLPG?3:25,transition:"left .3s"}}/></div>
              <div>Subsidi LPG {sLPG?<span style={{color:C.red,fontWeight:700}}>masih dipertahankan</span>:<span style={{color:C.green,fontWeight:700}}>dicabut bersamaan (optimal)</span>} — toggle ini mengubah apakah <Latex>{"C_5"}</Latex> dihitung atau tidak</div>
            </label>
          </div>
          <CO type="info"><b>Tips:</b> Coba geser slider "Harga LPG Subsidi" ke Rp 19.698 (harga keekonomian) — Anda akan melihat bahwa kompor induksi langsung menjadi <b>jauh lebih murah</b>. Ini membuktikan bahwa distorsi subsidi-lah yang membuat LPG tampak murah.</CO>
        </Sec>

        {/* ═══ METRICS ═══ */}
        <div style={{marginBottom:8}}><P>Berdasarkan parameter yang Anda atur di atas, berikut <b>6 metrik utama</b> hasil kalkulasi:</P></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12,marginBottom:20}}>
          <MC icon="🏠" title="RT Konversi" value={`${(c.rtK/1e6).toFixed(1)} jt`} sub={`${alpha}% dari ${(rt/1e6).toFixed(0)} jt`} color={C.cyan}/>
          <MC icon="💰" title="Benefit/Tahun" value={fmtT(c.Bt)} sub="B₁+B₂+B₃" color={C.green}/>
          <MC icon="🧱" title="Cost (Sekali)" value={fmtT(c.Co)} sub="C₁–C₄+C₆" color={C.red}/>
          <MC icon="⏱️" title="ROI" value={c.roi>0&&c.roi<999?`${c.roi.toFixed(1)} bln`:"∞"} sub="balik modal" color={C.accent}/>
          <MC icon="📊" title="Rasio 10 Thn" value={c.r10>0?`${c.r10.toFixed(1)}×`:"–"} sub="benefit:cost" color={C.blue}/>
          <MC icon="⚡" title="Beban PLN" value={`${c.gw.toFixed(1)} GW`} sub="dari 107,5 GW" color={C.purple}/>
        </div>

        {/* ═══ CHARTS ROW 1 ═══ */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16,marginBottom:20}}>
          <Sec accent={C.green}>
            <h3 style={{fontSize:14,fontWeight:700,color:C.textBright,margin:"0 0 4px"}}>Komposisi Benefit per Tahun</h3>
            <P>Grafik di bawah memecah total benefit <b style={{color:C.green}}>{fmtT(c.Bt)}/tahun</b> menjadi tiga komponen. Perhatikan bahwa <b>hemat subsidi (B₁)</b> selalu mendominasi — ini menunjukkan bahwa motivasi fiskal (mengurangi beban APBN) lebih kuat dari motivasi devisa maupun pendapatan PLN.</P>
            <ResponsiveContainer width="100%" height={180}><BarChart data={bD} layout="vertical" margin={{top:0,right:20,left:0,bottom:0}}><XAxis type="number" tick={{fontSize:10,fill:C.textMuted}} tickFormatter={v=>`${v.toFixed(0)}T`}/><YAxis type="category" dataKey="name" tick={{fontSize:11,fill:C.text}} width={150}/><Tooltip contentStyle={TT} formatter={v=>[`Rp ${v.toFixed(1)} T`]}/><Bar dataKey="value" radius={[0,6,6,0]}>{bD.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar></BarChart></ResponsiveContainer>
          </Sec>
          <Sec accent={C.red}>
            <h3 style={{fontSize:14,fontWeight:700,color:C.textBright,margin:"0 0 4px"}}>Komposisi Biaya (One-time)</h3>
            <P>Total investasi awal <b style={{color:C.red}}>{fmtT(c.Co)}</b>. Pie chart menunjukkan bahwa <b>biaya kompor (C₁)</b> mendominasi — ini sekaligus komponen yang paling bisa ditekan melalui produksi massal dan manufaktur lokal.</P>
            <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={cD} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270}>{cD.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={TT} formatter={v=>[`Rp ${v.toFixed(1)} T`]}/></PieChart></ResponsiveContainer>
            <div style={{display:"flex",flexWrap:"wrap",gap:"4px 12px",justifyContent:"center",marginTop:6}}>{cD.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:d.color}}/><span style={{fontSize:10,color:C.textMuted}}>{d.name}</span></div>)}</div>
          </Sec>
        </div>

        {/* ═══ CHARTS ROW 2 ═══ */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16,marginBottom:20}}>
          <Sec accent={C.cyan}>
            <h3 style={{fontSize:14,fontWeight:700,color:C.textBright,margin:"0 0 4px"}}>Biaya Memasak per RT / Bulan</h3>
            <P>Perbandingan 4 skenario ini menunjukkan <b>distorsi subsidi</b> secara visual. Perhatikan betapa murahnya LPG subsidi (bar pertama) dibanding harga keekonomiannya (bar ketiga) — selisih hampir 5× lipat. Ini alasan utama masyarakat enggan beralih.</P>
            <ResponsiveContainer width="100%" height={200}><BarChart data={mD} margin={{top:5,right:10,left:10,bottom:5}}><XAxis dataKey="label" tick={{fontSize:10,fill:C.textMuted}} interval={0}/><YAxis tick={{fontSize:10,fill:C.textMuted}} tickFormatter={v=>`${(v/1000).toFixed(0)}rb`}/><Tooltip contentStyle={TT} formatter={v=>[`Rp ${fmt(v)}`]}/><Bar dataKey="biaya" radius={[6,6,0,0]}>{mD.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar></BarChart></ResponsiveContainer>
            <div style={{marginTop:10,padding:"10px 14px",borderRadius:8,background:c.sel>0?C.greenDim:C.redDim,border:`1px solid ${c.sel>0?C.green:C.red}30`}}>
              <span style={{fontSize:12,color:c.sel>0?C.green:C.red}}>{c.sel>0?`✅ Induksi hemat Rp ${fmt(c.sel)}/bln vs LPG subsidi`:`⚠️ Induksi +Rp ${fmt(Math.abs(c.sel))}/bln vs LPG subsidi — selama distorsi subsidi bertahan`}</span>
            </div>
          </Sec>
          <Sec accent={C.blue}>
            <h3 style={{fontSize:14,fontWeight:700,color:C.textBright,margin:"0 0 4px"}}>Benefit vs Cost — Berbagai Skala Konversi</h3>
            <P>Grafik ini menjawab: "Pada skala berapa program ini layak?" Garis hijau (benefit per tahun) selalu di atas garis merah putus-putus (cost sekali) — artinya <b>di skala berapa pun, program sudah balik modal dalam tahun pertama</b>. ROI tidak bergantung pada skala.</P>
            <ResponsiveContainer width="100%" height={200}><LineChart data={sD} margin={{top:5,right:10,left:0,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="persen" tick={{fontSize:10,fill:C.textMuted}}/><YAxis tick={{fontSize:10,fill:C.textMuted}}/><Tooltip contentStyle={TT} formatter={v=>[`Rp ${v} T`]}/><Line type="monotone" dataKey="benefit" stroke={C.green} strokeWidth={2} name="Benefit/thn" dot={{r:3}}/><Line type="monotone" dataKey="cost" stroke={C.red} strokeWidth={2} name="Cost (sekali)" dot={{r:3}} strokeDasharray="5 5"/><Legend wrapperStyle={{fontSize:11}}/></LineChart></ResponsiveContainer>
          </Sec>
        </div>

        {/* ═══ BAB 5 ═══ */}
        <Sec accent={C.accent}>
          <ST icon="⚖️" title="Bab 5: Verdict — Benefit vs Cost" sub="Saatnya menjawab pertanyaan utama dengan formula final."/>
          <P>Kita punya semua komponen. Net benefit per tahun adalah total benefit dikurangi biaya berulang (C₅, jika ada). ROI dihitung dari berapa bulan yang dibutuhkan agar akumulasi net benefit menyamai investasi awal:</P>
          <FB texLines={[
            "\\text{Net Benefit}_{\\text{/tahun}} = B_1 + B_2 + B_3 - C_5",
            "\\text{ROI}_{\\text{(bulan)}} = \\dfrac{C_{\\text{one-time}}}{\\text{Net Benefit}_{\\text{/tahun}} \\;\\div\\; 12}",
            "\\text{Rasio}_n = \\dfrac{\\text{Net Benefit}_{\\text{/tahun}} \\times n}{C_{\\text{one-time}}}"
          ]}/>
          <P>Rasio_n menunjukkan: untuk setiap Rp 1 yang diinvestasikan, berapa Rp penghematan yang dihasilkan dalam n tahun. Semakin tinggi rasio, semakin layak program ini.</P>

          <div style={{background:C.surface,border:`1px solid ${C.borderLight}`,borderRadius:12,padding:20,margin:"16px 0"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:20}}>
              <div>
                <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Benefit/Tahun</div>
                <div style={{fontSize:28,fontWeight:800,color:C.green,fontFamily:"'Space Mono',monospace"}}>{fmtT(c.Bt)}</div>
                <div style={{fontSize:11,color:C.textMuted,marginTop:4}}><Latex>{"B_1"}</Latex>={fmtT(c.B1)} · <Latex>{"B_2"}</Latex>={fmtT(c.B2)} · <Latex>{"B_3"}</Latex>={fmtT(c.B3)}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Cost (Sekali)</div>
                <div style={{fontSize:28,fontWeight:800,color:C.red,fontFamily:"'Space Mono',monospace"}}>{fmtT(c.Co)}</div>
                {c.C5>0&&<div style={{fontSize:11,color:C.accent,marginTop:4}}>+ <Latex>{"C_5"}</Latex> = {fmtT(c.C5)}/thn (subsidi transisi)</div>}
              </div>
            </div>
            <div style={{marginTop:20,padding:"18px 20px",borderRadius:12,background:C.accentGlow,border:`1px solid ${C.accentDim}50`}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:16,textAlign:"center"}}>
                <div><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>ROI</div><div style={{fontSize:36,fontWeight:800,color:C.accent,fontFamily:"'Space Mono',monospace"}}>{c.roi>0&&c.roi<999?c.roi.toFixed(1):"∞"}</div><div style={{fontSize:12,color:C.textMuted}}>bulan</div></div>
                <div><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Rasio 5 Thn</div><div style={{fontSize:36,fontWeight:800,color:C.green,fontFamily:"'Space Mono',monospace"}}>{c.r5>0?`${c.r5.toFixed(1)}×`:"–"}</div><div style={{fontSize:12,color:C.textMuted}}>per Rp 1</div></div>
                <div><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:1}}>Rasio 10 Thn</div><div style={{fontSize:36,fontWeight:800,color:C.blue,fontFamily:"'Space Mono',monospace"}}>{c.r10>0?`${c.r10.toFixed(1)}×`:"–"}</div><div style={{fontSize:12,color:C.textMuted}}>per Rp 1</div></div>
              </div>
            </div>
          </div>
          <CO type="success"><b>Jawaban: Ya — dampak positif JAUH lebih besar.</b> Dengan parameter saat ini, setiap Rp 1 yang diinvestasikan menghasilkan penghematan <b style={{color:C.accent}}>Rp {c.r10>0?c.r10.toFixed(1):"–"}</b> dalam 10 tahun. Program balik modal hanya dalam <b style={{color:C.accent}}>{c.roi>0&&c.roi<999?`${c.roi.toFixed(1)} bulan`:"–"}</b> — termasuk kebijakan publik dengan ROI tertinggi yang bisa dilakukan Indonesia.</CO>
        </Sec>

        {/* ═══ BAB 6 ═══ */}
        <Sec accent={C.purple}>
          <ST icon="🗺️" title="Bab 6: Kenapa Belum Terjadi?" sub="Jika angkanya begitu meyakinkan, mengapa konversi belum berjalan? Jawabannya ada di luar spreadsheet."/>
          <P>Hambatan utama bukan finansial, melainkan <b>politikal</b> (mencabut subsidi LPG = berisiko secara elektoral), <b>kultural</b> (kebiasaan memasak api terbuka yang sudah mengakar), dan <b>eksekusional</b> (mengkoordinasikan upgrade infrastruktur untuk puluhan juta RT). Berikut peta jalan realistisnya:</P>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginTop:12}}>
            {[{p:"Jangka Pendek",t:"2026–2028",tgt:"1–3 jt RT",st:"⚠️ Terbatas",co:C.accent,items:["Pilot 10–20 kota besar","Fokus RT daya ≥2.200 VA","Redesain arsitektur subsidi","Bangun manufaktur lokal"]},{p:"Jangka Menengah",t:"2028–2035",tgt:"10–20 jt RT",st:"✅ Realistis",co:C.green,items:["Upgrade distribusi massal","MCB jalur khusus skala besar","Harga kompor turun via lokal","Subsidi LPG dikurangi bertahap"]},{p:"Jangka Panjang",t:"2035–2060",tgt:"52 jt RT",st:"🎯 Ambisius",co:C.blue,items:["Bauran EBT dominan","Infrastruktur 100% siap","Generasi baru adopter","LPG hanya untuk industri"]}].map((p,i)=>(
              <div key={i} style={{background:C.surface,borderRadius:12,padding:16,border:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:p.co}}/><div style={{fontSize:15,fontWeight:700,color:p.co,fontFamily:"'Sora',sans-serif"}}>{p.p}</div><div style={{fontSize:11,color:C.textMuted}}>{p.t}</div>
                <div style={{fontSize:20,fontWeight:800,color:C.textBright,fontFamily:"'Space Mono',monospace",margin:"8px 0 4px"}}>{p.tgt}</div><div style={{fontSize:12,color:p.co,marginBottom:10}}>{p.st}</div>
                {p.items.map((x,j)=><div key={j} style={{fontSize:11,color:C.textMuted,padding:"3px 0",borderTop:j===0?`1px solid ${C.border}`:"none"}}>→ {x}</div>)}
              </div>
            ))}
          </div>
          <CO type="warning"><b>Kesimpulan akhir:</b> Secara <Latex>{"\\text{ROI} < 12"}</Latex> bulan dan rasio 10 tahun <Latex>{`>${c.r10.toFixed(0)}\\times`}</Latex>, ini adalah kebijakan publik dengan return tertinggi yang bisa dilakukan Indonesia. Pertanyaannya bukan "apakah harus?" melainkan "bagaimana urutan langkahnya?" — dan langkah pertama yang paling kritis adalah <b>mereformasi subsidi LPG 3 kg</b> yang 65,5%-nya salah sasaran dan menghabiskan Rp 87 triliun/tahun.</CO>
        </Sec>

        <div style={{textAlign:"center",padding:"20px 0 36px",borderTop:`1px solid ${C.border}`,marginTop:8}}>
          <p style={{fontSize:11,color:C.textMuted,margin:"0 0 4px"}}>Sumber: Kementerian ESDM • PLN • Reforminer • CNBC Indonesia • Databoks • INDEF • DEN • APBN 2025</p>
          <p style={{fontSize:11,color:C.textMuted,margin:0}}>Analisis & kalkulator oleh Claude AI • April 2026 • #SemuaBisaDihitung</p>
        </div>
      </div>
    </div>
  );
}
