
import { chromium } from "playwright";
import fs from "fs";

const now = new Date();
const baliNow = new Date(now.toLocaleString("en-US",{timeZone:"Asia/Makassar"}));
const y=baliNow.getFullYear(), m=baliNow.getMonth()+1, d=baliNow.getDate();
const hari=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][baliNow.getDay()];
const bulan=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][m-1];
const target=`${String(d).padStart(2,"0")}-${String(m).padStart(2,"0")}-${y}`;
const url=`https://www.kalenderbali.org/index.php?bulan=${m}&tahun=${y}&tanggal=${d}`;

const clean=s=>s.replace(/\u00a0/g," ").replace(/\s+/g," ").trim();

function parseWewaran(text){
  let x=text.match(/(Redite|Soma|Anggara|Buda|Wraspati|Wrespati|Sukra|Saniscara)\s+(Umanis|Paing|Pon|Wage|Keliwon)\s+([A-Za-z]+)/i);
  if(!x) throw new Error("Wewaran/Wuku tidak ditemukan");
  return {saptawara:x[1],pancawara:x[2],wuku:x[3]};
}

function parseRerahinan(text){
  const i=text.indexOf("DAFTAR RERAINAN");
  if(i<0) throw new Error("DAFTAR RERAINAN tidak ditemukan");
  let block=text.slice(i+"DAFTAR RERAINAN".length);
  for(const mark of ["HARI-HARI PENTING","HARI PERINGATAN","ALA-AYUNING DEWASA","BAHAN RENUNGAN"]){
    const j=block.indexOf(mark); if(j>=0) block=block.slice(0,j);
  }
  const out=[];
  const re=/(\d{2}-\d{2}-\d{4})\.\s*([^\n\r•]+)/g;
  let z;
  while((z=re.exec(block))){
    if(z[1]===target) out.push(clean(z[2]));
  }
  return [...new Set(out.filter(Boolean))];
}

const browser=await chromium.launch({headless:true});
let title, body;
try{
  const page=await browser.newPage({
    locale:"id-ID",
    timezoneId:"Asia/Makassar",
    userAgent:"Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/131 Safari/537.36"
  });
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForTimeout(7000);
  title=await page.title();
  body=await page.locator("body").innerText();
} finally {
  await browser.close();
}

const flat=clean(body);
if(/Please wait while your request is being verified|One moment, please|Just a moment/i.test(flat))
  throw new Error("KalenderBali memblokir GitHub Actions");
if(!flat.includes("DAFTAR RERAINAN"))
  throw new Error("Struktur halaman KalenderBali berubah");

const {saptawara,pancawara,wuku}=parseWewaran(`${title}\n${flat}`);
const rerahinan=parseRerahinan(body);
const dateText=`${hari}, ${d} ${bulan} ${y}`;
const base=`${dateText}. ${saptawara} ${pancawara} ${wuku}`;
const display=rerahinan.length ? `${base} (${rerahinan.join(", ")})` : base;

fs.writeFileSync("today.txt",display+"\n","utf8");
fs.writeFileSync("today.json",JSON.stringify({
  source:"KalenderBali.org",source_url:url,timezone:"Asia/Makassar",
  generated_at:new Date().toISOString(),date:dateText,
  saptawara,pancawara,wuku,rerahinan,display
},null,2)+"\n","utf8");

console.log(display);
