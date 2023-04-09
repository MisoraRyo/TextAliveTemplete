/////////////////////////////////////////////////////////////////////////
///// IMPORT
import './main.css'

import { Player } from "textalive-app-api";

import * as THREE from 'three'
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'


window.onload = function(){
/////////////////////////////////////////////////////////////////////////
///// TextAlive-Api
///// 
///// 
///// 
/////////////////////////////////////////////////////////////////////////


let nowChar = "";
let nowWord = "";
let nowPhrase = "";
//終了処理をする
let endTime = 0;
let voiceEndTime = 0;
//最大声量
let MaxVocal = 0;
let SongVocal = 0; //0~1の値



//TextAlive_APi初期化
const player = new Player({
    app: { 
      token: "★★★★★",//Token　★★★★★取得したトークンを追加ください！！！★★★★
      parameters: [
      ]
     },
    mediaElement: document.querySelector("#media"),
    vocalAmplitudeEnabled : true,/*歌声の声量*/
    valenceArousalEnabled : true,/*感情値*/
});

//デバック時のみ
player.volume = 10;
//場面構成
let SEGMENTS=[];
let nowSegment = 0;//曲のいまのセグメントを管理するグローバル変数
//文字
let update_text;/*改行付きで文字を形成する*/


// リスナの登録 / Register listeners
player.addListener({

    onAppReady: (app) => {
      if (!app.managed) {
  
        //↓実行可能
        // みはるかす / ねこむら（cat nap） feat. 初音ミク
        player.createFromSongUrl("https://piapro.jp/t/QtjE/20220207164031", {
           video: {
            // 音楽地図訂正履歴: https://songle.jp/songs/2245018/history
            beatId: 4083470,
            chordId: 2222187,
            repetitiveSegmentId: 2248075,
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FQtjE%2F20220207164031
            lyricId: 53748,
            lyricDiffId: 7084
           },
        });
       
       // fear / 201 feat. 初音ミク
       /*
        player.createFromSongUrl("https://piapro.jp/t/GqT2/20220129182012", {
           video: {
            // 音楽地図訂正履歴: https://songle.jp/songs/2245019/history
            beatId: 4083475,
            chordId: 2222294,
            repetitiveSegmentId: 2248170,
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FGqT2%2F20220129182012
            lyricId: 53749,
            lyricDiffId: 7085
           },
         });
        */
  
      } else {
        console.log("No app.managed"); 
      }
    },
  
    onFontsLoad: (e) =>{
      console.log("font", e);
    },
  
    onTextLoad: (body) => {
      console.log("onTextLoad",body);
    },
  
    onVideoReady: (video)=> {/* 楽曲情報が取れたら呼ばれる */
  
      if (!player.app.managed) {
        //document.querySelector("#message").className = "active";
      }
        //ビート・コード進行・繰り返し区間（サビ候補）・ビート、コード進行、繰り返し区間のリビジョンID（バージョン番号）
        //セグメント_繰り返し区間（サビ候補）
        let Segments = player.data.songMap.segments;
        let NosortSegments =[];
        for(let i=0; i<Segments.length; i++){
          if(Segments[i].chorus){
            Array.from(Segments[i].segments, (z)=>{
              z.chorus = true;
              z.section = i;
              NosortSegments.push(z);
            })
          }else{
            Array.from(Segments[i].segments, (z)=>{
              z.chorus = false;
              z.section = i;
              NosortSegments.push(z);
            })
          }
        }
        //時間に降順にして配列情報を渡す オブジェクトの昇順ソート
        SEGMENTS = NosortSegments.sort(function(a, b) {return (a.startTime < b.startTime) ? -1 : 1;});
        //console.log("サビの区間情報：",SEGMENTS);
        console.log("最大声量："+player.getMaxVocalAmplitude())
        MaxVocal = player.getMaxVocalAmplitude();
  
        //終了処理のために取得するグローバル変数
        //voiceEndTime = player.video.data.endTime;
        voiceEndTime = player.video.data.duration * .95
        endTime = player.video.data.duration;
        console.log("終了時間 endTime:" + voiceEndTime);
        console.log("終了時間 duration:" + endTime);
        //console.log("FPS:" + player.fps);
  
  
        //segmento bar の設置
        /*SEGMENTS.forEach((value, index) => {
          const elementwidth =  ( value.endTime - value.startTime ) / endTime * 100;
          const elementposition = ( value.startTime / endTime ) * 100;
          let element = document.createElement('div');
          element.className = `segment-bar element${value.section}`;
          element.style.width = `${elementwidth}%`;
          element.style.left =  `${elementposition}%`;
          document.getElementById('segment-area').appendChild(element)
        });
        */
  
    },
  
    onTimerReady() {/* 再生コントロールができるようになったら呼ばれる */
      //loadingのテキストの書き換え
      //document.getElementById("loading-txt").innerHTML = '<span class="initial-info-box-mini">【 Yellow Object 】</span><br>CLICK START!';
      //
      document.getElementById("Play-Btn").addEventListener("click", () => function(p){  
        if (p.isPlaying){ 
      
        }else{
            //再生
            p.requestPlay();
        }

      }(player));

      //停止ボタンのスイッチング
      document.getElementById("Stop-Btn").addEventListener("click", () => function(p){ 
        if (p.isPlaying){
            p.requestStop();
        }else{ 
            
        }
      }(player));
    },
  
    //再生時に呼ばれる
    onPlay: () => {  
      console.log("player.onPlay");
    },
  
    onPause: () => {
      console.log("player.onPause");
      //＊初期起動時にpostion値が入るバグ回避
      player.requestStop();//onStopを呼ぶ 
    },
  
    onSeek: () => {
      console.log("player.onSeek");
    },
  
    //再生が止まったときに呼ばれる
    onStop: () => {
      console.log("player.onStop");
    },
  
    //再生時に回転する 再生位置の情報が更新されたら呼ばれる */
    onTimeUpdate: (position) =>{
      //console.log(position);

      /* 歌詞＆フレーズ　*/
      let Char = player.video.findChar(position - 100, { loose: true });
      let Word = player.video.findWord( position - 100, { loose: true });
      let Phrase = player.video.findPhrase( position - 100, { loose: true });
      
      if(nowChar != Char.text){
            nowChar = Char.text;
            console.log(nowChar);
      }

      
      if(Word){
        if(nowWord != Word.text){
            nowWord = Word.text;
            console.log(nowWord);
        }
      }
      
  
      //フレーズを表示する
      
      if(Phrase) {
        if(nowPhrase != Phrase.text){
            nowPhrase = Phrase.text
            console.log(nowPhrase);
        }

      }//End if(phrase)
      
  

      //ボーカルの声量を取得する
      SongVocal = player.getVocalAmplitude(position)/ MaxVocal;
      console.log(SongVocal);

      //声量を100%で表示する
      //positionbarElement.style.width = Math.floor( position ) / endTime * 100 + "%";

  
    }// End onTimeUpdate
  
});//END player.addListener
  


/////////////////////////////////////////////////////////////////////////
///// Three.js
///// 
///// 
///// 
/////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader()
const loader = new GLTFLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
dracoLoader.setDecoderConfig({ type: 'js' })
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color('#000')

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG

let PixelRation = 1;//初期値
PixelRation = Math.min(window.devicePixelRatio, 2.0);
console.log("window.devicePixelRatio & 計算値 =>",window.devicePixelRatio, PixelRation);

const renderer = new THREE.WebGLRenderer({
  canvas:document.getElementById("MyCanvas"),
  alpha:true,
  antialias: true,
  preserveDrawingBuffer: true,//bloomのautoClearと併用
});
renderer.setPixelRatio(Math.min(PixelRation, 2.0)) //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen

//Webgl_Lose
document.getElementById("MyCanvas").addEventListener('webglcontextlost', function(e) {
    alert( e + " エラーが発生しました。再リロードいたします！");
    window.location.reload();
  }, false);

//GPU表示
let rendererName;
try {
  let gl = document.createElement("canvas").getContext("experimental-webgl");
  //ドライバー情報を取得
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  if (!ext) {
    rendererName = "";
  } else {
    rendererName = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
  }
} catch (e) {
  // WebGL未対応の場合
  gl = null;
  rendererName = "";
  //デバック用
  // ドライバの種類を出力
  document.getElementById('gpu-text').innerHTML = "WebGL未対応";
}finally{
  //デバック用
  // ドライバの種類を出力
  document.getElementById('gpu-text').innerHTML = rendererName + " pixelRation:" + window.devicePixelRatio;
}

/////////////////////////////////////////////////////////////////////////
// stats

const stats = new Stats();
stats
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
Object.assign(stats.dom.style, {'position': 'fixed','height': 'max-content',
  'left': 'auto','right': '0',
  'top': '0','bottom': 'auto'
});

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0.0, 0.0, 0.0);
scene.add(camera)

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)


/////////////////////////////////////////////////////////////////////////
///// CREATE Helper
const size = 1000;
const divisions = 100;

const gridHelperA = new THREE.GridHelper( size, divisions );
gridHelperA.position.set(0.0, 10.0, 0);
scene.add( gridHelperA );
const gridHelperB = new THREE.GridHelper( size, divisions );
gridHelperB.position.set(0.0, -10.0, 0);
scene.add( gridHelperB );

const axesHelper = new THREE.AxesHelper(180);
scene.add(axesHelper);


/////////////////////////////////////////////////////////////////////////
//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits(){
    controls.enableDamping = true
    /*controls.enableDamping = true
    controls.dampingFactor = 0.04
    controls.minDistance = 35
    controls.maxDistance = 60
    controls.enableRotate = true
    controls.enableZoom = true
    controls.maxPolarAngle = Math.PI /2.5*/
}

setOrbitControlsLimits();

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION

const clock = new THREE.Clock();

function rendeLoop() {

    stats.begin();//stats計測
    const delta = clock.getDelta();//animation programs
    //const elapsedTime = clock.getElapsedTime();
    //controls.update() // update orbit controls




    renderer.render(scene, camera) // render the scene using the camera

    requestAnimationFrame(rendeLoop) //loop the render function
    stats.end();//stats計測
}

rendeLoop() //start rendering




/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setPixelRatio(Math.min(PixelRation, 2.0)) //set pixel ratio
    renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen  
})



}//End Windows.onload
