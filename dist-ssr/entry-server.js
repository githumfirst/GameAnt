import { jsx, jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router";
import { useParams, useNavigate, Link, Routes, Route } from "react-router-dom";
import { ArrowLeft, Info, Minimize2, Maximize2, Play, Smartphone, User, Calendar, X, Edit3, Lock, Check, MessageSquare, Send, Trash2, FileText, PenTool, Search, Sparkles, Eye, ChevronLeft, ChevronRight, FileCode2, Gamepad, Globe, Gamepad2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
const GamePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const iframeRef = React.useRef(null);
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);
  useEffect(() => {
    fetch("/data/games.json").then((res) => res.json()).then((data) => {
      const foundGame = data.find((g) => g.id === id);
      if (foundGame) {
        setGame(foundGame);
      } else {
        console.error("Game not found");
        navigate("/");
      }
    }).catch((err) => console.error("Failed to load games:", err));
  }, [id, navigate]);
  const handleStartGame = () => {
    setIsStarted(true);
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.focus();
      }
    }, 100);
  };
  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock("portrait").catch((err) => {
            console.log("Orientation lock not supported or failed:", err);
          });
        }
      } catch (err) {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
          try {
            window.screen.orientation.unlock();
          } catch (e) {
          }
        }
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };
  const scrollToInfo = () => {
    const infoSection = document.getElementById("game-info");
    if (infoSection) {
      infoSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  if (!game) return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-900 flex items-center justify-center text-white", children: "Loading..." });
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-900 flex flex-col text-slate-100 font-sans", children: [
    !isFullScreen && /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 p-4 flex justify-between items-center text-white border-b border-slate-800", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate("/"),
          className: "flex items-center gap-2 hover:text-brand-accent transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { size: 20 }),
            "Back to Hub"
          ]
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "text-lg font-bold hidden sm:block text-brand-accent", children: game.title }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: scrollToInfo,
          className: "flex items-center gap-2 hover:text-brand-accent transition-colors mr-4",
          children: [
            /* @__PURE__ */ jsx(Info, { size: 20 }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Game Info" })
          ]
        }
      ),
      (game.type === "html" || game.type === "Unique") && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: toggleFullScreen,
          className: "flex items-center gap-2 hover:text-brand-accent transition-colors",
          children: [
            isFullScreen ? /* @__PURE__ */ jsx(Minimize2, { size: 20 }) : /* @__PURE__ */ jsx(Maximize2, { size: 20 }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Full Screen" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `relative w-full bg-black ${isFullScreen ? "h-screen" : "aspect-video max-h-[80vh] mx-auto max-w-7xl"}`, children: [
      game.type === "html" || game.type === "Unique" ? (
        // HTML5 Game Iframe
        /* @__PURE__ */ jsxs("div", { className: "w-full h-full relative group/game", children: [
          /* @__PURE__ */ jsx(
            "iframe",
            {
              ref: iframeRef,
              src: game.url,
              title: game.title,
              className: "w-full h-full border-0",
              allowFullScreen: true,
              allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            }
          ),
          !isStarted && game.id === "guardian" && /* @__PURE__ */ jsxs(
            "div",
            {
              onClick: handleStartGame,
              className: "absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm cursor-pointer group-hover/game:bg-slate-900/80 transition-all duration-300",
              children: [
                /* @__PURE__ */ jsx("div", { className: "bg-brand-accent p-6 rounded-full mb-4 shadow-2xl shadow-brand-accent/50 transform group-hover/game:scale-110 transition-transform duration-300", children: /* @__PURE__ */ jsx(Play, { fill: "currentColor", size: 48, className: "text-white ml-1" }) }),
                /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Ready to Sortie?" }),
                /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Click to focus and start the game" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-8 flex gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("kbd", { className: "bg-slate-700 px-1 rounded", children: "Shift" }),
                    " Boost"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("kbd", { className: "bg-slate-700 px-1 rounded", children: "Space" }),
                    " Fire"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("kbd", { className: "bg-slate-700 px-1 rounded", children: "Arrows" }),
                    " Fly"
                  ] })
                ] })
              ]
            }
          )
        ] })
      ) : (
        // Android Game "Download" Call-to-Action
        /* @__PURE__ */ jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center bg-slate-800 text-center p-8 relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-20 bg-cover bg-center blur-sm", style: { backgroundImage: `url(${game.thumbnail})` } }),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10 max-w-lg bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl", children: [
            /* @__PURE__ */ jsx("img", { src: game.thumbnail, alt: game.title, className: "w-24 h-24 rounded-2xl mx-auto mb-6 shadow-lg" }),
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-2", children: game.title }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-300 mb-8", children: game.description }),
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: game.url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/25",
                children: [
                  /* @__PURE__ */ jsx(Smartphone, { size: 24 }),
                  "Download on Play Store"
                ]
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-slate-500", children: "Android Device Required" })
          ] })
        ] })
      ),
      !isFullScreen && (game.type === "html" || game.type === "Unique") && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: toggleFullScreen,
          className: "absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full sm:hidden z-50 backdrop-blur-md border border-white/20",
          children: /* @__PURE__ */ jsx(Maximize2, { size: 24 })
        }
      )
    ] }),
    !isFullScreen && /* @__PURE__ */ jsxs("div", { id: "game-info", className: "max-w-4xl mx-auto w-full px-6 py-12 space-y-12", children: [
      /* @__PURE__ */ jsx("div", { className: "w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 border border-slate-700 border-dashed", children: /* @__PURE__ */ jsx("span", { children: "Advertisement Space" }) }),
      /* @__PURE__ */ jsxs("section", { className: "prose prose-invert max-w-none", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-bold text-white mb-6 border-b border-slate-800 pb-4", children: [
          "About ",
          game.title
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-8 mb-8", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("p", { className: "text-slate-300 text-lg leading-relaxed whitespace-pre-wrap", children: game.long_description || game.description }) }),
          /* @__PURE__ */ jsxs("div", { className: "w-full md:w-64 bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-slate-400 uppercase tracking-wider mb-4", children: "Game Info" }),
            /* @__PURE__ */ jsxs("ul", { className: "space-y-3 text-sm", children: [
              /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(User, { size: 16, className: "text-brand-accent" }),
                /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: game.author || "GameAnt Studio" })
              ] }),
              /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Calendar, { size: 16, className: "text-brand-accent" }),
                /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: game.last_updated || "2024" })
              ] }),
              /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Smartphone, { size: 16, className: "text-brand-accent" }),
                /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: game.type === "html" || game.type === "Unique" ? "Browser (HTML5)" : "Android App" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxs("section", { className: "bg-slate-800/50 p-6 rounded-xl border border-slate-700/50", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-white mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1 h-6 bg-brand-accent rounded-full inline-block" }),
            "How to Play"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap", children: game.instructions || "Follow the on-screen instructions to play." }),
          game.controls && /* @__PURE__ */ jsxs("div", { className: "mt-4 bg-slate-900 p-4 rounded-lg", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-slate-400 mb-2", children: "Controls" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-300 font-mono text-sm whitespace-pre-wrap", children: game.controls })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "bg-slate-800/50 p-6 rounded-xl border border-slate-700/50", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-white mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1 h-6 bg-brand-highlight rounded-full inline-block" }),
            "Game Features"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: (game.features || ["Fun gameplay", "Challenging levels", "High score tracking"]).map((feature, idx) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-slate-300", children: [
            /* @__PURE__ */ jsx("div", { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" }),
            feature
          ] }, idx)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 border border-slate-700 border-dashed", children: /* @__PURE__ */ jsx("span", { children: "Advertisement Space" }) })
    ] })
  ] });
};
const __vite_glob_0_0 = '---\r\ntitle: "윈도우즈 비밀번호 분실시 조치방법 그리고 원리(bitlocker & tpm)"\r\nwriter: "NolGaeMi"\r\ndate: "2026-03-23"\r\n---\r\n\r\n### 비번 잃어버렸을때 걱정 할 필요 없습니다.\r\n\r\nCMD창에서 몇단계를 거치면 간단하게 해결 됩니다.\r\n\r\n1단계: 윈도우즈 우측 하단의 reboot(재시작)을 Shift키를 누른 상태에서 클릭합니다.\r\n\r\n2단계: 안전모드에서 "Trouble Shooting(문제 해결)"을 클릭합니다.\r\n\r\n3단계: "Advanced options(고급옵션)"을 클릭합니다.\r\n\r\n4단계: "Command Prompt(명령 프롬프트)"를 클릭합니다.\r\n\r\n5단계: 아래 내용을 입력하고 엔터를 칩니다.\r\n\r\n```\r\ncopy c:\\windows\\system32\\utilman.exe c:\\windows\\system32\\utilman.bak\r\n\r\ncopy c:\\windows\\system32\\cmd.exe c:\\windows\\system32\\utilman.exe\r\n```\r\n6단계 overwrite, type Yes or No(덮어쓰기, Yes 선택)\r\n\r\n7단계: 재부팅후 로그인 화면에서 우측 하단의 유틸리티 아이콘을 클릭하면 CMD창이 뜹니다.\r\n\r\n8단계: 아래와 같이 암호를 재입력 합니다.\r\n\r\n```\r\nnet user nolgaemi  1234\r\n```\r\n위에서 nolgaemi는 사용자 이름, 1234는 새로운 비밀번호 입니다.\r\n\r\n9단계: cmd를 X를 클릭해서 끄고, 새로운 비번을 입력하면 로그인이 됩니다. 또는 재부팅후 새로운 비밀번호로 로그인 합니다.\r\n\r\n이렇게 해서 윈도우즈 비밀번호를 잃어버렸을때 새로운 비번을 설정할 수 있습니다.\r\n\r\n### 그런데 이게 무슨 원리 일까요?\r\n\r\nshift +  reboot로 재시작한것은 utilman.exe를 실행한 것입니다. 제한적인 기능밖에 못해요.그런데, 여기서, cmd.exe를 utilman.exe로 교체하면, 이제 utilman.exe는 admin이 된거에요.**엄청난 보안 구멍**이 발생한거에요. 복구하라고 만들어놓은 파이프라인에 엄청난 보안 이슈가 생긴거죠. 이걸 알고, MS에서는 bitlocker를 내놓았어요. \r\n\r\n```\r\nnet user nolgaemi  1234\r\n```\r\n\r\n위에서 nolgaemi는 사용자 이름, 1234는 새로운 비밀번호 입니다.\r\n\r\n위와 같이 변경은 복구모드가 아니라, cmd.exe를 실행한 것입니다. 그래서, MS에서는 bitlocker를 내놓은거에요. 하지만, bitlocker도 뚫을 방법이 있습니다. 지금 windows 11으로 강제 업그레이드를 할때에도 **tpm(Trusted Platform Module: 신뢰할수 있는 플랫폼 모듈, cpu안에 물리 보안칩)**을 우회하는 방법을 사용하거든요. 역시 **편의성과 보안**은 반비례 하죠. 그러니까, 윈도우즈 노트북을 누가 훔쳐가면, 암호가 걸려있어도, 거의 뚫을수 있죠. 실물을 빼기지 않는게 가장 중요합니다. \r\n\r\n\r\n\r\n**오늘도 좋은거 배웠어요! 하루 하루가 배움의 연속입니다!**\r\n\r\n\r\nContact Us: WeListenToCustomer@gmail.com\r\n';
const __vite_glob_0_1 = '---\r\ntitle: "Tetris3D: 공간의 한계를 넘는 코드 여행"\r\nwriter: "임페리얼 파파"\r\ndate: "2026-03-06"\r\n---\r\n\r\n> *평면의 테트리스는 이미 충분히 어렵다. 그런데 거기에 축을 하나 더 추가하면 어떻게 될까?*\r\n\r\n---\r\n\r\n## 시작하며\r\n\r\n2D 테트리스는 수십 년간 사랑받아온 고전이지만, 항상 한 가지 의문이 있었습니다.\r\n\r\n**"Z축이 생기면 얼마나 더 어려워질까?"**\r\n\r\n그 답을 코드로 직접 구현한 것이 **Tetris3D**입니다. 블록이 X, Y뿐 아니라 Z축으로도 회전하고, 3D 공간에서의 거리감과 입체감을 실시간으로 파악하며 쌓아야 합니다. 이 devlog는 그 개발 과정에서 마주친 기술적 선택들과 앞으로의 방향을 기록한 것입니다.\r\n\r\n---\r\n\r\n## ⚙️ 기술 스택: 왜 Three.js인가?\r\n\r\n웹 브라우저에서 3D 게임을 만들 때 가장 먼저 마주치는 선택지는 **WebGL**입니다. 강력하지만, 직접 다루려면 셰이더(Shader) 작성과 복잡한 행렬 연산이 필수라 진입 장벽이 높습니다.\r\n\r\n**[Three.js](https://threejs.org/)** 는 이 복잡함을 직관적인 객체 지향 API로 감싸줍니다. 덕분에 "어떤 블록을 어디에 놓을지"라는 **게임 로직**에 집중할 수 있었습니다.\r\n\r\n### Three.js의 세계관 이해하기\r\n```\r\nScene    →  모든 물체가 배치되는 \'우주 공간\'\r\nCamera   →  우리가 보는 시점 (PerspectiveCamera: 원근감 구현)\r\nRenderer →  Scene + Camera 정보를 실제 픽셀로 그려주는 엔진\r\n```\r\n\r\nHTML의 `<canvas>` 위에서 정점(Vertex)들을 정의하고, 이를 수학적으로 투영(Projection)하는 과정 전체를 Three.js가 대신 처리해 줍니다.\r\n\r\n### 핵심 최적화: `InstancedMesh`\r\n\r\n이 프로젝트에서 가장 중요한 성능 결정은 **InstancedMesh** 사용이었습니다.\r\n\r\n| 방식 | 특징 |\r\n|------|------|\r\n| 개별 Mesh | 블록마다 별도 드로우 콜 → 블록 수 증가 시 프레임 드롭 |\r\n| **InstancedMesh** | **단 한 번의 드로우 콜로 수백 개 블록 렌더링** |\r\n\r\n결과적으로 모바일에서도 안정적인 **60fps**를 유지할 수 있었습니다.\r\n\r\n---\r\n\r\n## 🎮 게임플레이: 3차원이 주는 두뇌 자극\r\n\r\n단순히 "테트리스를 3D로"가 아니라, **공간 지각 능력을 게임의 핵심 재미로** 삼았습니다.\r\n\r\n### 다차원 로테이션\r\nX, Y, Z 세 축으로 블록을 회전시키며 맞춰야 합니다. 기존 테트리스보다 훨씬 높은 전략적 사고가 요구되며, 처음 3D 회전을 "이해하는 순간"의 쾌감이 이 게임의 가장 큰 보상입니다.\r\n\r\n### Ghost Piece 시스템\r\n3D 공간에서 거리감을 파악하는 것은 생각보다 어렵습니다. **유령 블록(Ghost Piece)** 은 블록이 떨어질 위치를 미리 보여주어 이 불편함을 자연스럽게 해소합니다.\r\n\r\n### 절차적 사운드 (Procedural Audio)\r\n고정된 `.mp3` 파일 대신 **Web Audio API (`AudioContext`)** 를 이용해 효과음을 실시간 생성합니다.\r\n\r\n- ✅ 파일 용량 절감\r\n- ✅ 상황에 따른 즉각적인 반응성\r\n- ✅ 네트워크 없이도 완전한 사운드 경험\r\n\r\n---\r\n\r\n## 🔧 개선이 필요한 것들\r\n\r\n솔직하게 현재 버전의 한계를 짚어봅니다.\r\n\r\n### 1. 데스크탑 키 가이드 부재\r\n\r\n현재 코드(Line ~1200)의 키 매핑은 다음과 같습니다:\r\n```\r\nQ  →  X축 회전\r\nW  →  Y축 회전  \r\nE  →  Z축 회전\r\nA / D  →  카메라 궤도 회전\r\n```\r\n\r\n모바일은 버튼이 UI에 표시되어 있어 직관적이지만, **데스크탑 사용자는 이 키 매핑을 알 방법이 없습니다.** 처음 접하는 유저는 대부분 방향키만 눌러보다가 이탈할 것입니다.\r\n\r\n**→ 개선 방향:** 화면 하단에 키 가이드 오버레이 추가, 또는 더 직관적인 키(숫자패드, `R/T/Y` 등)로 리매핑\r\n\r\n---\r\n\r\n### 2. 코드 모듈화 (가장 시급한 기술 부채)\r\n\r\n현재 상태: **약 1,400줄의 코드가 `index.html` 한 파일에 집중**\r\n\r\n초기 프로토타이핑엔 유리하지만, 이대로 기능을 추가하면 유지보수 불가능한 스파게티 코드가 됩니다.\r\n```\r\n현재:  index.html (1,400+ lines)\r\n\r\n목표 구조:\r\n├── styles.css       → 스타일 분리\r\n├── Renderer.js      → Three.js 설정 및 렌더링 로직\r\n├── Logic.js         → 테트리스 알고리즘 (충돌 체크, 줄 삭제)\r\n└── Audio.js         → 사운드 및 BGM 시스템\r\n```\r\n\r\n---\r\n\r\n## 🗺️ 로드맵\r\n\r\n- [ ] 데스크탑 키 가이드 UI 추가\r\n- [ ] 코드 모듈화 (파일 분리 리팩토링)\r\n- [ ] 실시간 멀티플레이어 모드 검토\r\n\r\n---\r\n\r\n## 마치며\r\n\r\n3D 게임 개발이라고 하면 막연히 어렵게 느껴지지만, Three.js와 같은 훌륭한 라이브러리 덕분에 생각보다 빠르게 프로토타입을 만들 수 있었습니다. 이 글이 웹 기반 3D 게임 개발에 관심 있는 분들께 작은 출발점이 되길 바랍니다.\r\n\r\n코드는 언제나 개선 중입니다. 피드백과 PR은 언제든 환영합니다! 🙌\r\n\r\n---\r\n\r\n*made with Three.js · Web Audio API · vanilla JavaScript*';
const __vite_glob_0_2 = '---\r\ntitle: "바이브코딩으로 게임 만들기 - 솔직한 현직 개발자 후기"\r\nwriter: "NolGaeMi"\r\ndate: "2026-03-06"\r\n---\r\n\r\n# 바이브코딩으로 게임 만들기\r\n\r\n바이브코딩으로 게임을 만들때는 딱 한가지를 기억해야 한다! \r\n\r\n만들려는 게임이 됐건 무엇이 됐건 간에 어떤 플랫폼 혹은 어떤 워크프레임을 쓸것인지 대략은 알고 있어야 한다는 것이다.\r\n\r\n가령 크로스플랫폼 게임을 만들려면, HTML, CSS, JavaScript를 사용해야 한다는 것을 알고 있어야 한다. 왜 HTML이 크로스플랫폼에 적합할까? 그것은 HTML이 브라우저가 이해할 수 있는 언어이기 때문이다. 브라우저는 우리가 인터넷을 볼때, 핸드폰이 됐건, 데스트톱이 됐건, 노트북이 됐건 무조건 설치되어있던지 혹은 설치 할 수 있다. 항상 쓰는 에지, 크롬, 사파리 등이 그것이다. 다시 말해 어디나 있어서 크로스플랫폼이다.\r\n\r\n참고로 크로스프랫폼은 웹, 앱, 데스크탑 등 다양한 플랫폼에서 동작하는 앱을 만들 수 있는 기술이다. 핸드폰이건, 태블릿이건, 컴퓨터이건 상관없이 동작하는 앱을 만들 수 있다는 것이다.\r\n\r\n자 그럼 만약, 위의 내용, 즉 큰그림을 모르고 바이브 코딩을 한다면 어떻게 될까? 만약 운이 좋다면, 아니면 아주 비싸고 좋은 A.I를 쓴다면 위의 내용을 모른다고 해도 아마 잘 만들어 줄것이다. 하지만, 일반적으로 우리가 쓰는 chatGPT, Gemini, Claude 등은, 아직은 실수를 한다. 때로는 전혀 다른 기술을 전혀 다른 장치에 사용해서 엉뚱한 결과를 내놓는다. 가령, 우리같은 사용자가 위의 내용을 모른체 요구 했다가는 "수정과 디버깅"의 늪에 빠지게 될것이다. \r\n\r\n하지만 걱정하지 말자. 우리가 여기서 하려는 것이 바로 그것이니까! 실전에서 알게된 쉽고 빠른 바이브 코딩 비법. \r\n\r\n\r\n행운을 빈니다! 홧팅😄\r\n\r\n## 어떤걸 알게 되냐면,\r\n- **큰 그림**: 어떤 플랫폼, 혹은 워크프레임을 쓸것인지 개념 잡기.\r\n- **밑바탕 이해하기**: 간단한 HTML, 파이썬, 자바스크립트 정도의 문법 이해하기\r\n- **유용한 팁**:  실전에서 알게된 유용한 팁\r\n\r\n\r\n\r\n연락하기 : WeListenToCustomer@gmail.com\r\n';
const __vite_glob_0_3 = `---\r
title: "I Built Games with Vibe Coding — Here's My Honest Dev Review"\r
writer: "NolGaeMi"\r
date: "2026-03-06"\r
---\r
\r
# Welcome to Our Developer Log\r
\r
Hey everyone! Welcome to GameAnt's PlayGround DevLog!\r
\r
So I'm a developer, and I've been on this wild ride trying to figure out how to build apps and games in this crazy A.I. era. \r
\r
Here's the thing — I've already built five games without writing a single line of code. Like, not even one. How is that even possible? And honestly, is it even okay to do that as a developer? Does it count? I don't really have a solid answer for that, but what I do have are some useful tips I picked up along the way, and I really want to share them with you.\r
\r
Okay so, real talk — vibe coding isn't just gonna magically spit out an amazing app for you. Unless you're incredibly lucky, you'll need at least a little bit of background knowledge in CS. Like, just enough to know what's going on.\r
\r
But don't stress about that yet! That's literally why we're here.\r
So here's the one thing you really need to nail when it comes to vibe coding: get the big picture of what you're trying to build.\r
What do I mean by that? Say you want to build your dream 3D game — something people can play on their phone, tablet, and computer. How would you even describe that to an A.I.? Well, the big picture here is knowing that you're dealing with HTML, CSS, and JavaScript.\r
\r
I'm NOT saying you need to actually learn all that stuff yourself. That's the A.I.'s job, not yours. What I am saying is — if you go in completely blind with no idea of the big picture, the A.I. might go off in a totally random direction using the wrong tools. And then you're stuck in this never-ending hamster wheel of asking, the A.I. messing up, fixing, asking again, messing up again... you get it.\r
\r
And then you end up thinking, "Okay yeah, vibe coding is a total scam. This is not for me."\r
\r
Nope. You can do this. We can do this — together. I'll walk you through it as we go. I'm not trying to be some kind of guru or instructor here. Honestly, I'm figuring this out alongside you in this wild, overwhelming A.I. world.\r
So — good luck to both of us! 😄\r
\r
## What is this for?\r
- **the big picture**: What platform or framework to use for a specific type of app or game.\r
- **Behind the scene**: A look at how we build our HTML5 and Android games using A.I.\r
- **Tips & Tricks**:  Languages, platforms, frameworks, and other tools you can use to develop your own apps and games.\r
\r
Stay tuned for more updates!\r
\r
Contact Us: WeListenToCustomer@gmail.com\r
`;
function BoardWriteModal({ isOpen, onClose, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !password.trim() || !content.trim()) {
      alert("모든 항목(제목, 닉네임, 비밀번호, 내용)을 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    const newPostObj = {
      id: Date.now(),
      title: title.trim(),
      author: author.trim(),
      content: content.trim(),
      password: password.trim(),
      created_at: (/* @__PURE__ */ new Date()).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      })
    };
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          content: content.trim(),
          password: password.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.id) {
          newPostObj.id = data.id;
        }
      }
    } catch (e2) {
      console.log("Saving post locally");
    }
    onPostCreated(newPostObj);
    setTitle("");
    setAuthor("");
    setPassword("");
    setContent("");
    setSubmitting(false);
    onClose();
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute top-5 right-5 text-slate-400 hover:text-white transition-colors",
        children: /* @__PURE__ */ jsx(X, { size: 20 })
      }
    ),
    /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-bold text-white mb-6 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Edit3, { className: "text-brand-accent", size: 24 }),
      "자유 게시판 새 글 작성"
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-400 mb-1", children: "글 제목" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "제목을 입력하세요",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            className: "w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent",
            maxLength: 100
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-400 mb-1", children: "작성자 (닉네임)" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-3 h-4 w-4 text-slate-500" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "닉네임",
                value: author,
                onChange: (e) => setAuthor(e.target.value),
                className: "w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent",
                maxLength: 20
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-400 mb-1", children: "비밀번호 (삭제용)" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-slate-500" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "password",
                placeholder: "비밀번호",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent",
                maxLength: 20
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-400 mb-1", children: "내용" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            rows: 6,
            placeholder: "자유롭게 글을 적어보세요...",
            value: content,
            onChange: (e) => setContent(e.target.value),
            className: "w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors font-medium",
            children: "취소"
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: submitting,
            className: "px-6 py-2.5 bg-brand-accent hover:bg-brand-highlight text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-brand-accent/30",
            children: [
              /* @__PURE__ */ jsx(Check, { size: 18 }),
              "글 등록하기"
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [author, setAuthor] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, commentId: null, password: "" });
  const [deleteError, setDeleteError] = useState("");
  const storageKey = `comments_${postId}`;
  const loadComments = async () => {
    try {
      const res = await fetch(`/api/comments?post_id=${encodeURIComponent(postId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.comments && data.comments.length > 0) {
          setComments(data.comments);
          localStorage.setItem(storageKey, JSON.stringify(data.comments));
          return;
        }
      }
    } catch (e) {
      console.log("Using local comments fallback");
    }
    const local = localStorage.getItem(storageKey);
    if (local) {
      try {
        setComments(JSON.parse(local));
      } catch (e) {
        setComments([]);
      }
    }
  };
  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !password.trim() || !content.trim()) {
      alert("닉네임, 비밀번호, 댓글 내용을 모두 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    const newCommentObj = {
      id: Date.now(),
      post_id: postId,
      author: author.trim(),
      content: content.trim(),
      password: password.trim(),
      created_at: (/* @__PURE__ */ new Date()).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          author: author.trim(),
          content: content.trim(),
          password: password.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.id) {
          newCommentObj.id = data.id;
        }
      }
    } catch (e2) {
      console.log("Saving locally");
    }
    const updated = [...comments, newCommentObj];
    setComments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setContent("");
    setSubmitting(false);
  };
  const handleDelete = async () => {
    if (!deleteModal.password.trim()) {
      setDeleteError("비밀번호를 입력해 주세요.");
      return;
    }
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deleteModal.commentId,
          password: deleteModal.password.trim()
        })
      });
      if (res.status === 403) {
        setDeleteError("비밀번호가 일치하지 않습니다.");
        return;
      }
    } catch (e) {
      const target = comments.find((c) => c.id === deleteModal.commentId);
      if (target && target.password && target.password !== deleteModal.password.trim()) {
        setDeleteError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }
    const updated = comments.filter((c) => c.id !== deleteModal.commentId);
    setComments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setDeleteModal({ open: false, commentId: null, password: "" });
    setDeleteError("");
  };
  return /* @__PURE__ */ jsxs("section", { className: "mt-12 border-t border-slate-700/60 pt-10", children: [
    /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-bold text-white mb-6 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(MessageSquare, { className: "text-brand-accent", size: 24 }),
      "댓글 (",
      comments.length,
      ")"
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "bg-slate-800/60 rounded-2xl border border-slate-700/60 p-5 mb-8 shadow-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-3 h-4 w-4 text-slate-500" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "닉네임",
              value: author,
              onChange: (e) => setAuthor(e.target.value),
              className: "w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent",
              maxLength: 20
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-slate-500" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              placeholder: "비밀번호 (수정/삭제용)",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              className: "w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent",
              maxLength: 20
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(
        "textarea",
        {
          rows: 3,
          placeholder: "타인을 배려하는 따뜻한 댓글을 남겨주세요.",
          value: content,
          onChange: (e) => setContent(e.target.value),
          className: "w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "submit",
          disabled: submitting,
          className: "bg-brand-accent hover:bg-brand-highlight text-white font-bold py-2 px-6 rounded-lg text-sm flex items-center gap-2 transition-all shadow-md",
          children: [
            /* @__PURE__ */ jsx(Send, { size: 16 }),
            "댓글 등록"
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: comments.length > 0 ? comments.map((comment) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/40 rounded-xl border border-slate-700/40 p-4 transition-all hover:border-slate-600/60", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-brand-accent text-sm", children: comment.author }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500", children: comment.created_at })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setDeleteModal({ open: true, commentId: comment.id, password: "" });
              setDeleteError("");
            },
            className: "text-slate-500 hover:text-red-400 transition-colors p-1",
            title: "댓글 삭제",
            children: /* @__PURE__ */ jsx(Trash2, { size: 14 })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-300 text-sm whitespace-pre-wrap leading-relaxed", children: comment.content })
    ] }, comment.id)) : /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-slate-500 text-sm", children: "아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!" }) }),
    deleteModal.open && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-lg font-bold text-white mb-2", children: "댓글 삭제" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mb-4", children: "댓글 작성 시 설정한 비밀번호를 입력하세요." }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          placeholder: "비밀번호",
          value: deleteModal.password,
          onChange: (e) => setDeleteModal({ ...deleteModal, password: e.target.value }),
          className: "w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white mb-2 focus:outline-none focus:ring-2 focus:ring-brand-accent"
        }
      ),
      deleteError && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mb-3", children: deleteError }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setDeleteModal({ open: false, commentId: null, password: "" }),
            className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors",
            children: "취소"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDelete,
            className: "px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors",
            children: "삭제하기"
          }
        )
      ] })
    ] }) })
  ] });
}
const rawMarkdownFiles$1 = /* @__PURE__ */ Object.assign({ "../content/devlog/password_forgot_kor.md": __vite_glob_0_0, "../content/devlog/tetris.md": __vite_glob_0_1, "../content/devlog/vive-coding_korean.md": __vite_glob_0_2, "../content/devlog/welcome.md": __vite_glob_0_3 });
function getCommentCount(postId) {
  try {
    const local = localStorage.getItem(`comments_${postId}`);
    if (local) {
      const parsed = JSON.parse(local);
      return parsed.length || 0;
    }
  } catch (e) {
  }
  return 0;
}
function getViewCount$1(postId, defaultViews = 15) {
  try {
    const local = localStorage.getItem(`views_${postId}`);
    if (local) {
      return parseInt(local, 10) || defaultViews;
    }
  } catch (e) {
  }
  return defaultViews;
}
function incrementViewCount$1(postId, currentViews = 15) {
  const newViews = getViewCount$1(postId, currentViews) + 1;
  try {
    localStorage.setItem(`views_${postId}`, newViews.toString());
  } catch (e) {
  }
  return newViews;
}
function parsePreservedPosts() {
  const loadedPosts = [];
  for (const path in rawMarkdownFiles$1) {
    const content = rawMarkdownFiles$1[path];
    if (typeof content !== "string") continue;
    try {
      const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
      const match = content.match(frontmatterRegex);
      let data = {};
      let markdownContent = content;
      if (match) {
        const yamlString = match[1];
        markdownContent = match[2];
        yamlString.split("\n").forEach((line) => {
          const [key, ...valueParts] = line.split(":");
          if (key && valueParts.length > 0) {
            let val = valueParts.join(":").trim();
            val = val.replace(/^["'](.*)["']$/, "$1");
            data[key.trim()] = val;
          }
        });
      }
      const fileName = path.split("/").pop();
      const slug = fileName.replace(".md", "");
      loadedPosts.push({
        id: `article-${slug}`,
        slug,
        isSSG: true,
        title: data.title || "Untitled",
        writer: data.writer || "Anonymous",
        date: data.date || "Unknown Date",
        content: markdownContent,
        views: getViewCount$1(`article-${slug}`, 15)
      });
    } catch (err) {
      console.error("Error parsing preserved markdown:", path, err);
    }
  }
  loadedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return loadedPosts;
}
function DevLogList() {
  const [staticPosts] = useState(() => parsePreservedPosts());
  const [communityPosts, setCommunityPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, postId: null, password: "" });
  const [deleteError, setDeleteError] = useState("");
  const postsPerPage = 10;
  const loadCommunityPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.posts && data.posts.length > 0) {
          const formatted = data.posts.map((p) => ({
            id: `community-${p.id}`,
            rawId: p.id,
            isSSG: false,
            title: p.title,
            writer: p.author,
            views: getViewCount$1(`community-${p.id}`, p.views || 1),
            comment_count: p.comment_count || getCommentCount(`community-${p.id}`),
            date: p.created_at ? p.created_at.substring(0, 10) : "Recent",
            content: p.content
          }));
          setCommunityPosts(formatted);
          localStorage.setItem("community_posts", JSON.stringify(formatted));
          return;
        }
      }
    } catch (e) {
      console.log("Using local community posts fallback");
    }
    const local = localStorage.getItem("community_posts");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const updated = parsed.map((p) => {
          const cleanId = String(p.id).replace(/^community-/, "");
          return {
            ...p,
            id: `community-${cleanId}`,
            rawId: cleanId,
            views: getViewCount$1(`community-${cleanId}`, p.views || 1),
            comment_count: getCommentCount(`community-${cleanId}`)
          };
        });
        setCommunityPosts(updated);
      } catch (e) {
        setCommunityPosts([]);
      }
    }
  };
  useEffect(() => {
    loadCommunityPosts();
  }, []);
  const handlePostCreated = (newPost) => {
    const cleanId = String(newPost.id || Date.now()).replace(/^community-/, "");
    const formatted = {
      id: `community-${cleanId}`,
      rawId: cleanId,
      isSSG: false,
      title: newPost.title,
      writer: newPost.author,
      password: newPost.password,
      views: 1,
      comment_count: 0,
      date: newPost.created_at ? newPost.created_at.substring(0, 10) : "Recent",
      content: newPost.content
    };
    const updated = [formatted, ...communityPosts.filter((p) => p.id !== formatted.id)];
    setCommunityPosts(updated);
    localStorage.setItem("community_posts", JSON.stringify(updated));
    setTimeout(() => {
      loadCommunityPosts();
    }, 500);
  };
  const handleOpenPost = (post) => {
    const newViews = incrementViewCount$1(post.id, post.views || 1);
    const updatedPost = { ...post, views: newViews };
    if (post.isSSG) {
      setSelectedPost(updatedPost);
    } else {
      setCommunityPosts((prev) => prev.map((p) => p.id === post.id ? updatedPost : p));
      setSelectedPost(updatedPost);
      try {
        if (post.rawId) {
          fetch(`/api/posts/${post.rawId}`).catch(() => {
          });
        }
      } catch (e) {
      }
    }
  };
  const handleDeletePost = async () => {
    if (!deleteModal.password.trim()) {
      setDeleteError("비밀번호를 입력해 주세요.");
      return;
    }
    const target = communityPosts.find((p) => p.id === deleteModal.postId);
    const rawId = target ? target.rawId || String(deleteModal.postId).replace(/^community-/, "") : deleteModal.postId;
    try {
      const res = await fetch(`/api/posts/${rawId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deleteModal.password.trim() })
      });
      if (res.status === 403) {
        setDeleteError("비밀번호가 일치하지 않습니다.");
        return;
      }
    } catch (e) {
      if (target && target.password && target.password !== deleteModal.password.trim()) {
        setDeleteError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }
    const updated = communityPosts.filter((p) => p.id !== deleteModal.postId);
    setCommunityPosts(updated);
    localStorage.setItem("community_posts", JSON.stringify(updated));
    if (selectedPost && selectedPost.id === deleteModal.postId) {
      setSelectedPost(null);
    }
    setDeleteModal({ open: false, postId: null, password: "" });
    setDeleteError("");
  };
  const allUnifiedPosts = [...staticPosts, ...communityPosts];
  const filteredPosts = allUnifiedPosts.filter(
    (post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.writer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-900 text-white font-sans selection:bg-brand-accent selection:text-white pb-20 pt-6 px-4 lg:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-4xl font-extrabold tracking-tight text-white flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(FileText, { className: "text-brand-accent", size: 36 }),
            "ant@IT 통합 게시판"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-slate-400 text-sm", children: "IT 정보, 기술 지식, 개발 가이드 및 자유 커뮤니티 공간" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 w-full md:w-auto", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setIsWriteModalOpen(true),
            className: "bg-brand-accent hover:bg-brand-highlight text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-accent/30 w-full md:w-auto text-base transform hover:scale-105",
            children: [
              /* @__PURE__ */ jsx(PenTool, { size: 18 }),
              "글쓰기"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-sm font-semibold text-slate-300", children: [
          "전체 게시글 ",
          /* @__PURE__ */ jsx("span", { className: "text-brand-highlight font-bold font-mono", children: filteredPosts.length }),
          " 개"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:w-72", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-slate-500" }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "제목 또는 작성자 검색...",
              className: "block w-full pl-9 pr-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent",
              value: searchTerm,
              onChange: (e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-slate-700/50", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-800/80", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-20", children: "구분" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider", children: "제목" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-36", children: "작성자" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider w-24", children: "조회수" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-32", children: "작성일" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-700/50 bg-slate-800/30", children: currentPosts.length > 0 ? currentPosts.map((post) => {
          const cCount = getCommentCount(post.id);
          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-700/40 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-5 py-4 whitespace-nowrap text-xs", children: post.isSSG ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20", children: [
              /* @__PURE__ */ jsx(Sparkles, { size: 10 }),
              " 아티클"
            ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: [
              /* @__PURE__ */ jsx(MessageSquare, { size: 10 }),
              " 게시글"
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              post.isSSG ? /* @__PURE__ */ jsx(Link, { to: `/devlog/${post.slug}`, className: "text-white hover:text-brand-accent transition-colors block", children: post.title }) : /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleOpenPost(post),
                  className: "text-white hover:text-brand-accent transition-colors text-left font-semibold block",
                  children: post.title
                }
              ),
              cCount > 0 && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-brand-accent/20 text-brand-highlight border border-brand-accent/30 shadow-sm", children: [
                /* @__PURE__ */ jsx(MessageSquare, { size: 10 }),
                cCount
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-xs text-slate-400", children: post.writer }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap text-xs text-slate-400 text-center", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-slate-400 font-mono", children: [
              /* @__PURE__ */ jsx(Eye, { size: 12, className: "text-slate-500" }),
              post.views || 1
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-xs text-slate-400", children: post.date })
          ] }, post.id);
        }) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "5", className: "px-6 py-12 text-center text-slate-500 text-sm", children: "게시글이 없습니다. [글쓰기] 버튼을 눌러 첫 번째 글을 등록해 보세요!" }) }) })
      ] }) }) }),
      totalPages > 1 && /* @__PURE__ */ jsx("div", { className: "mt-8 flex items-center justify-between border-t border-slate-800 pt-6", children: /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex sm:flex-1 sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-400", children: [
          "Showing ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: indexOfFirstPost + 1 }),
          " to ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: Math.min(indexOfLastPost, filteredPosts.length) }),
          " of ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: filteredPosts.length }),
          " results"
        ] }) }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("nav", { className: "isolate inline-flex -space-x-px rounded-md shadow-sm", "aria-label": "Pagination", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => paginate(currentPage - 1),
              disabled: currentPage === 1,
              className: `relative inline-flex items-center rounded-l-md px-2 py-2 border border-slate-700 ${currentPage === 1 ? "bg-slate-800/50 text-slate-600 cursor-not-allowed" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`,
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
            }
          ),
          Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => paginate(number),
              className: `relative inline-flex items-center px-4 py-2 text-sm font-medium border border-slate-700 ${currentPage === number ? "z-10 bg-brand-accent text-white border-brand-accent" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`,
              children: number
            },
            number
          )),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => paginate(currentPage + 1),
              disabled: currentPage === totalPages,
              className: `relative inline-flex items-center rounded-r-md px-2 py-2 border border-slate-700 ${currentPage === totalPages ? "bg-slate-800/50 text-slate-600 cursor-not-allowed" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`,
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
            }
          )
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      BoardWriteModal,
      {
        isOpen: isWriteModalOpen,
        onClose: () => setIsWriteModalOpen(false),
        onPostCreated: handlePostCreated
      }
    ),
    selectedPost && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSelectedPost(null),
          className: "absolute top-5 right-5 text-slate-400 hover:text-white transition-colors",
          children: /* @__PURE__ */ jsx(X, { size: 20 })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex justify-between items-start mb-4 pr-8", children: /* @__PURE__ */ jsxs("div", { children: [
        selectedPost.isSSG ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2", children: [
          /* @__PURE__ */ jsx(Sparkles, { size: 12 }),
          " 기술 아티클"
        ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2", children: [
          /* @__PURE__ */ jsx(MessageSquare, { size: 12 }),
          " 자유 게시글"
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-white leading-tight", children: selectedPost.title })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-xs text-slate-400 border-b border-slate-700/60 pb-4 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "작성자: ",
            /* @__PURE__ */ jsx("strong", { className: "text-white", children: selectedPost.writer })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-slate-400", children: [
            /* @__PURE__ */ jsx(Eye, { size: 12 }),
            " ",
            selectedPost.views || 1
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { children: selectedPost.date }),
          !selectedPost.isSSG && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setDeleteModal({ open: true, postId: selectedPost.id, password: "" }),
              className: "text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1",
              children: [
                /* @__PURE__ */ jsx(Trash2, { size: 12 }),
                " 삭제"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-slate-200 text-sm whitespace-pre-wrap leading-relaxed mb-10 bg-slate-900/50 p-4 rounded-xl border border-slate-700/40", children: selectedPost.content }),
      /* @__PURE__ */ jsx(CommentSection, { postId: selectedPost.id })
    ] }) }),
    deleteModal.open && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-lg font-bold text-white mb-2", children: "게시글 삭제" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mb-4", children: "게시글 작성 시 설정한 비밀번호를 입력하세요." }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          placeholder: "비밀번호",
          value: deleteModal.password,
          onChange: (e) => setDeleteModal({ ...deleteModal, password: e.target.value }),
          className: "w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white mb-2 focus:outline-none focus:ring-2 focus:ring-brand-accent"
        }
      ),
      deleteError && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mb-3", children: deleteError }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setDeleteModal({ open: false, postId: null, password: "" }),
            className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors",
            children: "취소"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDeletePost,
            className: "px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors",
            children: "삭제하기"
          }
        )
      ] })
    ] }) })
  ] });
}
const rawMarkdownFiles = /* @__PURE__ */ Object.assign({ "../content/devlog/password_forgot_kor.md": __vite_glob_0_0, "../content/devlog/tetris.md": __vite_glob_0_1, "../content/devlog/vive-coding_korean.md": __vite_glob_0_2, "../content/devlog/welcome.md": __vite_glob_0_3 });
function getViewCount(slug) {
  try {
    const local = localStorage.getItem(`views_article-${slug}`);
    if (local) return parseInt(local, 10) || 15;
  } catch (e) {
  }
  return 15;
}
function incrementViewCount(slug) {
  const current = getViewCount(slug);
  const newViews = current + 1;
  try {
    localStorage.setItem(`views_article-${slug}`, newViews.toString());
  } catch (e) {
  }
  return newViews;
}
function getPostBySlug(slug) {
  if (!slug) return null;
  const decodedSlug = decodeURIComponent(slug);
  const targetPath = `../content/devlog/${decodedSlug}.md`;
  const content = rawMarkdownFiles[targetPath];
  if (!content || typeof content !== "string") return null;
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  let data = {};
  let markdownContent = content;
  if (match) {
    const yamlString = match[1];
    markdownContent = match[2];
    yamlString.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        let val = valueParts.join(":").trim();
        val = val.replace(/^["'](.*)["']$/, "$1");
        data[key.trim()] = val;
      }
    });
  }
  return {
    title: data.title || "Untitled",
    writer: data.writer || "Anonymous",
    date: data.date || "Unknown Date",
    content: markdownContent,
    views: getViewCount(slug)
  };
}
function DevLogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(() => getPostBySlug(slug));
  const [loading, setLoading] = useState(!post);
  const [error, setError] = useState(!post);
  useEffect(() => {
    const fetched = getPostBySlug(slug);
    if (fetched) {
      const newViews = incrementViewCount(slug);
      setPost({ ...fetched, views: newViews });
      setError(false);
    } else {
      setError(true);
    }
    setLoading(false);
  }, [slug]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-900 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent" }) });
  }
  if (error || !post) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-4", children: "Post Not Found" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 mb-8", children: "The devlog post you're looking for doesn't exist." }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate("/devlog"),
          className: "bg-brand-accent hover:bg-brand-highlight text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 transition-all shadow-lg",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { size: 16 }),
            " Let's go back"
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-900 text-white font-sans selection:bg-brand-accent selection:text-white py-12 px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "inline-flex items-center text-sm font-medium text-slate-400 hover:text-brand-accent transition-colors mb-8 group", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { size: 16, className: "mr-2 transform group-hover:-translate-x-1 transition-transform" }),
      "Back to IT Log List"
    ] }),
    /* @__PURE__ */ jsxs("article", { className: "bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxs("header", { className: "mb-10 text-center border-b border-slate-700/50 pb-8", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl md:text-2xl font-extrabold tracking-tight text-white mb-6 leading-tight", children: post.title }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(User, { size: 16, className: "text-brand-accent" }),
            /* @__PURE__ */ jsx("span", { children: post.writer })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Eye, { size: 16, className: "text-brand-accent" }),
            /* @__PURE__ */ jsxs("span", { children: [
              post.views || 1,
              " 회 읽음"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Calendar, { size: 16, className: "text-brand-accent" }),
            /* @__PURE__ */ jsx("span", { children: post.date })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "prose prose-invert prose-slate max-w-none prose-a:text-brand-accent hover:prose-a:text-brand-highlight prose-img:rounded-xl", children: /* @__PURE__ */ jsx(ReactMarkdown, { children: post.content }) }),
      /* @__PURE__ */ jsx(CommentSection, { postId: `article-${slug}` })
    ] })
  ] }) });
}
const initialGames = [
  {
    id: "ai-uprising",
    title: "Soldiers's War",
    thumbnail: "/thumbnails/game1.jpg",
    url: "https://aiuprising.pages.dev/",
    type: "html",
    description: "Survive the AI uprising in this intense strategy survival game.",
    long_description: "Soldiers places you in a world where artificial intelligence has taken over. You must use your wits and resources to survive against an ever-evolving enemy. Build defenses, manage resources, and outsmart the AI to reclaim humanity's future.",
    instructions: "Use your mouse or touch controls to interact with the game world. Follow on-screen prompts to build and defend.",
    controls: "Mouse: Interact. Touch: Tap to interact.",
    features: [
      "Intense survival gameplay",
      "Strategy and resource management",
      "Futuristic setting",
      "Challenging AI opponents"
    ],
    author: "NolGaeMi",
    last_updated: "2026-02-17"
  },
  {
    id: "block-game",
    title: "Block Game",
    thumbnail: "/thumbnails/game2.jpg",
    url: "https://blockgame-e2h.pages.dev/",
    type: "html",
    description: "A classic puzzle game where you match blocks to clear the board.",
    long_description: "Block Game is a timeless puzzle experience. Arrange falling blocks to create complete lines and clear the board. As you progress, the speed increases, testing your reflexes and spatial awareness. Aim for the high score!",
    instructions: "Rotate and move falling blocks to fit them into the grid. Complete horizontal lines to clear them.",
    controls: "Arrow Keys: Move/Rotate. Touch: Swipe/Tap.",
    features: [
      "Classic puzzle mechanics",
      "Endless gameplay",
      "High score tracking",
      "Simple yet addictive"
    ],
    author: "NolGaeMi",
    last_updated: "2026-02-15"
  },
  {
    id: "nolgaemi-apps",
    title: "Nolgaemi Apps Collection",
    thumbnail: "/thumbnails/nolgaemi_apps.png",
    url: "https://play.google.com/store/search?q=nolgaemiproduction&c=apps&hl=en",
    type: "android",
    isNew: true,
    description: "Google Play 스토어의 Nolgaemi Production 공식 앱 모음 공간입니다.",
    long_description: "Nolgaemi Production에서 개발하고 출시한 다양한 모바일 스마트폰 앱과 게임들을 구글 플레이스토어 한곳에서 모두 확인해 보세요. 생산성, 언어 학습, 습관 형성 등 다양하고 유용한 앱들을 만나보실 수 있습니다.",
    instructions: "카드 클릭 시 Google Play 스토어의 Nolgaemi Production 개발자 페이지로 이동합니다.",
    controls: "클릭 시 Google Play Store 이동",
    features: [
      "Google Play 공식 출시 앱 컬렉션",
      "생산성 및 에듀테인먼트 모바일 앱 모음",
      "Nolgaemi Production 개발자 페이지 직접 연결"
    ],
    author: "NolGaeMi",
    last_updated: "2026-08-01"
  },
  {
    id: "mission-success",
    title: "Mission Success (미션 성공)",
    thumbnail: "/thumbnails/mission_success.png",
    url: "https://play.google.com/store/apps/details?id=com.nolgaemi.missionsuccess&hl=en",
    type: "android",
    isNew: true,
    description: "목표 달성과 습관 형성을 도와주는 스마트한 미션 관리 앱입니다.",
    long_description: "Mission Success는 매일의 습관과 목표를 체계적으로 관리하여 성공으로 이끌어주는 생산성 앱입니다. 간편한 체크리스트와 목표 달성률 트래킹으로 자신만의 긍정적인 라이프스타일을 완성해 보세요.",
    instructions: "클릭 시 Google Play 스토어 다운로드 페이지로 연결됩니다.",
    controls: "Google Play Store 다운로드",
    features: [
      "직관적인 일일 미션 및 습관 체크리스트",
      "목표 달성 트래킹 및 통계",
      "깔끔한 다크 모드 인터페이스"
    ],
    author: "NolGaeMi",
    last_updated: "2026-08-01"
  },
  {
    id: "eng-friend",
    title: "EngFriend (영어친구)",
    thumbnail: "/thumbnails/eng_friend.png",
    url: "https://play.google.com/store/apps/details?id=com.engfriend.eng_friend&hl=en",
    type: "android",
    isNew: true,
    description: "일상 회화와 영어 표현을 쉽고 재미있게 도와주는 스마트 영어 학습 앱입니다.",
    long_description: "EngFriend(영어친구)는 언제 어디서나 부담 없이 영어를 익힐 수 있는 학습 앱입니다. 생생한 예문과 핵심 표현 정리로 영어 실력을 차근차근 키워보세요.",
    instructions: "클릭 시 Google Play 스토어 다운로드 페이지로 연결됩니다.",
    controls: "Google Play Store 다운로드",
    features: [
      "실생활 핵심 영어 표현 학습",
      "친근하고 직관적인 인터페이스",
      "모바일 맞춤형 일일 학습 카운터"
    ],
    author: "NolGaeMi",
    last_updated: "2026-08-01"
  },
  {
    id: "just-note-it",
    title: "Just Note It (메모잇)",
    thumbnail: "/thumbnails/just_note_it.png",
    url: "https://play.google.com/store/apps/details?id=com.nolgaemi.justnoteit&hl=en",
    type: "android",
    isNew: true,
    description: "빠르고 직관적인 스마트 메모 & 아이디어 정리 앱입니다.",
    long_description: "Just Note It(메모잇)은 떠오르는 영감과 중요한 일정을 놓치지 않고 즉시 기록할 수 있는 깔끔한 메모 앱입니다. 빠르고 간편한 메모 작성과 손쉬운 정리 기능을 제공합니다.",
    instructions: "클릭 시 Google Play 스토어 다운로드 페이지로 연결됩니다.",
    controls: "Google Play Store 다운로드",
    features: [
      "초고속 텍스트 메모 및 아이디어 기록",
      "심플하고 가벼운 메모 관리",
      "모바일 환경에 최적화된 UX"
    ],
    author: "NolGaeMi",
    last_updated: "2026-08-01"
  },
  {
    id: "guardian",
    title: "Guardians of the Sky",
    thumbnail: "/thumbnails/game5.jpeg",
    url: "https://guardiansofthesky.pages.dev/",
    type: "html",
    isNew: true,
    description: "An intense jet simulation where you, once an ordinary person, become the chosen pilot and humanity's last hope to defend Earth's skies against an alien fleet.",
    long_description: "One peaceful day, unidentified alien aircraft attacked major cities around the globe, igniting a massive war. Humanity's elite flight squadron, the 'Guardians of the Sky', was pushed to the brink of extinction by the aliens' overwhelming technology. At the moment of global despair, the secret prototype 'Zero' awakened, responding only to your biological signature. You, who lived an ordinary life until yesterday, must now sortie as the only pilot capable of saving Earth.",
    instructions: "Master the controls of the 'Zero' prototype and engage in intense aerial dogfights. Follow the radar to locate alien targets and clear the skies.",
    controls: "Speed Up: Left Shift | Brake: Left Control | Turn: Arrow Keys | Pitch: Up/Down Arrows | Fire: Spacebar",
    features: [
      "Immersive 3D Jet Simulation Combat",
      "Thwart the Alien Invasion with Your Jet",
      "Dynamic Dogfighting mechanics",
      "Fully realized 3D environment"
    ],
    author: "NolGaeMi",
    last_updated: "2026-02-24"
  },
  {
    id: "imperialpapalotto",
    title: "임페리얼 파파 로또 대박",
    thumbnail: "/thumbnails/game6.jpg",
    url: "https://lotto.funbtstube.workers.dev/",
    type: "Unique",
    isNew: true,
    description: "당신의 운명을 바꿀 단 한 번의 클릭! 임페리얼 파파가 전하는 특별한 행운의 번호로 1등 당첨의 꿈에 도전하세요.",
    long_description: "평범한 일상 속에서 찾아오는 짜릿한 역전의 기회! '임페리얼 파파 로또 대박'은 정교한 알고리즘을 통해 최적의 로또 번호를 생성해 드립니다. 분석과 운이 만나는 지점에서 당신만의 당첨 번호를 확인하고, 대박의 주인공이 되는 설렘을 만끽해 보세요. 오늘 당신의 손끝에서 새로운 인생이 시작될 수 있습니다.",
    instructions: "화면 중앙의 '번호 생성' 버튼을 클릭하여 행운의 6개 번호를 확인하세요. 생성된 번호를 저장하거나 실제 로또 구매에 참고할 수 있습니다.",
    controls: "번호 생성: 마우스 왼쪽 클릭 또는 터치 | 결과 확인: 화면 스크롤",
    features: [
      "빠르고 간편한 자동 번호 생성 시스템",
      "행운을 부르는 세련된 인터페이스",
      "실시간 번호 조합 최적화 알고리즘",
      "모바일 및 PC 완벽 호환"
    ],
    author: "임페리얼 파파",
    last_updated: "2026-02-28"
  },
  {
    id: "tetris-3d",
    title: "3D 테트리스",
    thumbnail: "/thumbnails/game7.jpg",
    url: "https://tetris3d.pages.dev/",
    type: "html",
    isNew: true,
    description: "몰입감 넘치는 3D 공간에서 즐기는 테트리스 게임입니다. X, Y, Z축 회전을 통해 블록을 배치하고 레이어를 클리어하세요.",
    long_description: "TETRIS 3D CUBE EDITION은 클래식한 테트리스를 3차원으로 확장한 혁신적인 퍼즐 게임입니다. 5x5 그리드 기반의 3D 공간에서 다양한 각도로 뷰를 회전하며 공간 지각 능력을 발휘해 보세요. 모바일과 데스크탑 모두에서 완벽하게 즐길 수 있습니다.",
    instructions: "화면 하단의 화살표 버튼이나 방향키로 블록을 이동하고, X/Y/Z 버튼으로 각 축을 따라 회전시키세요. 카메라 회전 버튼(◁, ▷)을 사용해 조절할 수 있습니다. 드롭 버튼이나 스페이스 바로 블록을 빠르게 내릴 수 있습니다.",
    controls: "이동: 방향키 또는 화면 화살표 | 회전: q, w, e 키 또는 모바일 버튼 | 하드 드롭: Space 또는 드롭 버튼 | 카메라 회전: ◁, ▷ 버튼 | 홀드: 홀드 버튼",
    features: [
      "레이어 클리어 방식의 3D 테트리스",
      "자유로운 3D 시점 전환",
      "모바일 터치 최적화 UI",
      "Next/Hold 프리뷰 시스템",
      "실시간 리더보드 지원"
    ],
    author: "임페리얼 파파",
    last_updated: "2026-03-08"
  },
  {
    id: "forest-friends",
    title: "숲속 친구들 (Forest Friends)",
    thumbnail: "/thumbnails/game8.jpg",
    url: "https://hyuna.pages.dev/",
    type: "html",
    isNew: true,
    description: "모두를 위한 따뜻한 감성의 인터랙티브 웹 동화. (A warm, interactive storybook for everyone.)",
    long_description: "'숲속 친구들(Forest Friends)'은 모두를 위해 만들어진 따뜻한 감성의 인터랙티브 웹 동화입니다. 최신 React 기술과 부드러운 애니메이션을 결합하여, 생동감 넘치는 요정 숲의 이야기를 웹 위에서 그대로 펼쳐냅니다. 별도의 설치 없이 PC, 스마트폰, 태블릿 등 어떤 기기에서도 브라우저만 열면 바로 즐길 수 있습니다. 특히 한국어/영어 이중 언어 지원과 원어민 발음의 음성 읽어주기(TTS) 기능을 갖추어, 동화 감상은 물론 자연스러운 언어 학습 효과까지 기대할 수 있는 프리미엄 에듀테인먼트 플랫폼입니다.",
    instructions: "1. 앱 접속하기: 인터넷이 연결된 기기에서 앱 주소로 접속합니다.\n2. 언어 선택하기: 화면 우측 상단의 🌐 버튼(한국어/English)을 눌러 선택하세요.\n3. 동화책 읽기: [이전] (◀) / [다음] (▶) 버튼으로 페이지를 넘길 수 있습니다.",
    controls: "[터치 및 마우스] 🌐: 언어 전환 | ◀ / ▶: 페이지 이동 | 🔊 / ⏸️ / ⏹️: 음성 제어",
    features: [
      "완벽한 이중 언어 지원 (Bilingual Support)",
      "브라우저 내장 음성 읽어주기 (Native TTS API)",
      "감성적인 SVG 일러스트와 부드러운 애니메이션",
      "100% 반응형 웹 디자인"
    ],
    author: "임페리얼파파",
    last_updated: "2026-03-14"
  }
];
function Home() {
  const [games, setGames] = useState(initialGames || []);
  const [mainTab, setMainTab] = useState("itlog");
  const [gameFilter, setGameFilter] = useState("all");
  const [visitorStats, setVisitorStats] = useState({ total: 1280, today: 35 });
  const navigate = useNavigate();
  useEffect(() => {
    fetch("/data/games.json").then((res) => res.json()).then((data) => setGames(data)).catch((err) => console.error("Failed to load games:", err));
    const loadVisitors = async () => {
      try {
        const res = await fetch("/api/visitors");
        if (res.ok) {
          const data = await res.json();
          if (data.total) {
            setVisitorStats({ total: data.total, today: data.today });
            localStorage.setItem("visitor_stats", JSON.stringify({ total: data.total, today: data.today }));
            return;
          }
        }
      } catch (e) {
      }
      try {
        const local = localStorage.getItem("visitor_stats");
        const lastVisit = localStorage.getItem("last_visit_date");
        const todayStr = (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
        let stats = local ? JSON.parse(local) : { total: 1280, today: 35 };
        if (lastVisit !== todayStr) {
          stats.total += 1;
          stats.today = (lastVisit ? stats.today : 35) + 1;
          localStorage.setItem("last_visit_date", todayStr);
          localStorage.setItem("visitor_stats", JSON.stringify(stats));
        }
        setVisitorStats(stats);
      } catch (e) {
      }
    };
    loadVisitors();
  }, []);
  const handlePlay = (game) => {
    navigate(`/play/${game.id}`);
  };
  const filteredGames = games.filter((game) => {
    if (gameFilter === "all") return true;
    if (gameFilter === "android") return game.type === "android";
    if (gameFilter === "unique") return game.type === "Unique";
    return true;
  });
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-900 text-white font-sans selection:bg-brand-accent selection:text-white pb-20", children: [
    /* @__PURE__ */ jsxs("header", { className: "relative overflow-hidden bg-slate-900 py-16 sm:py-24", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80", children: /* @__PURE__ */ jsx("div", { className: "relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-accent to-brand-highlight opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" }) }),
      /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-6 text-center lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-2xl", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-5xl font-extrabold tracking-tight text-white sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-brand-highlight to-brand-accent mb-4", children: "ant@IT" }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-lg leading-8 text-slate-300", children: "IT 정보, 개발 지식, 코딩, AI 지식을 의미있게" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 inline-flex items-center gap-4 px-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
            "오늘 방문자 ",
            /* @__PURE__ */ jsx("strong", { className: "text-emerald-400 font-mono", children: visitorStats.today }),
            " 명"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: "|" }),
          /* @__PURE__ */ jsxs("span", { className: "text-slate-400", children: [
            "누적 방문자 ",
            /* @__PURE__ */ jsx("strong", { className: "text-brand-highlight font-mono", children: visitorStats.total.toLocaleString() }),
            " 명"
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4 mb-10 border-b border-slate-800 pb-8 px-6", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setMainTab("itlog"),
          className: `px-8 py-3.5 rounded-2xl font-extrabold text-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2.5 ${mainTab === "itlog" ? "bg-brand-accent text-white shadow-xl shadow-brand-accent/40 ring-2 ring-brand-highlight" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"}`,
          children: [
            /* @__PURE__ */ jsx(FileCode2, { size: 24 }),
            "IT Log (IT 기술)"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setMainTab("game"),
          className: `px-8 py-3.5 rounded-2xl font-extrabold text-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2.5 ${mainTab === "game" ? "bg-brand-accent text-white shadow-xl shadow-brand-accent/40 ring-2 ring-brand-highlight" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"}`,
          children: [
            /* @__PURE__ */ jsx(Gamepad, { size: 24 }),
            "Game (게임)"
          ]
        }
      )
    ] }),
    mainTab === "itlog" ? (
      /* IT Log Tab View (Default Main View) */
      /* @__PURE__ */ jsx("main", { className: "mx-auto max-w-7xl px-6 lg:px-8", children: /* @__PURE__ */ jsx(DevLogList, {}) })
    ) : (
      /* Game Tab View */
      /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-7xl px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-3 mb-10 flex-wrap", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setGameFilter("all"),
              className: `px-6 py-2.5 rounded-full font-bold text-base transition-all duration-300 ${gameFilter === "all" ? "bg-brand-accent text-white ring-2 ring-brand-highlight shadow-md" : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"}`,
              children: "ALL"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setGameFilter("android"),
              className: `px-6 py-2.5 rounded-full font-bold text-base transition-all duration-300 ${gameFilter === "android" ? "bg-brand-accent text-white ring-2 ring-brand-highlight shadow-md" : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"}`,
              children: "Mobile"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setGameFilter("unique"),
              className: `px-6 py-2.5 rounded-full font-bold text-base transition-all duration-300 ${gameFilter === "unique" ? "bg-brand-accent text-white ring-2 ring-brand-highlight shadow-md" : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"}`,
              children: "Unique(잼난것)"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8", children: filteredGames.map((game) => /* @__PURE__ */ jsxs("div", { className: "group relative bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-brand-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_theme(colors.brand.accent)] hover:-translate-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200 lg:aspect-none group-hover:opacity-100 lg:h-48 relative", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: game.thumbnail,
                alt: game.title,
                className: "h-full w-full object-cover object-center lg:h-full lg:w-full transition-transform duration-500 group-hover:scale-110"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm", children: /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handlePlay(game),
                className: "bg-brand-accent hover:bg-brand-highlight text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-brand-accent/20 text-sm",
                children: [
                  /* @__PURE__ */ jsx(Play, { fill: "currentColor", size: 16 }),
                  "Play Now"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "absolute top-2 right-2 flex flex-col gap-2 items-end", children: [
              game.isNew && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-brand-highlight px-2.5 py-1 text-xs font-bold text-white shadow-lg shadow-brand-highlight/40 ring-1 ring-white/20 animate-pulse", children: "NEW" }),
              /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset backdrop-blur-md ${game.type === "android" ? "bg-green-500/10 text-green-400 ring-green-500/20" : game.type === "Unique" ? "bg-amber-500/10 text-amber-400 ring-amber-500/20" : "bg-blue-500/10 text-blue-400 ring-blue-500/20"}`, children: [
                game.type === "android" ? /* @__PURE__ */ jsx(Smartphone, { size: 10 }) : /* @__PURE__ */ jsx(Globe, { size: 10 }),
                game.type === "android" ? "Android" : game.type === "Unique" ? "Unique" : "Desktop/Mobile"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex justify-between items-start", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white group-hover:text-brand-accent transition-colors", children: /* @__PURE__ */ jsxs("a", { href: "#", onClick: (e) => {
                e.preventDefault();
                handlePlay(game);
              }, children: [
                /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "absolute inset-0" }),
                game.title
              ] }) }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-400 line-clamp-2", children: game.description })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2 text-[10px] text-slate-500 font-mono", children: [
              /* @__PURE__ */ jsx(Gamepad2, { size: 12 }),
              /* @__PURE__ */ jsx("span", { children: game.type === "android" ? "Store Download" : "Instant Play" })
            ] })
          ] })
        ] }, game.id)) })
      ] })
    ),
    /* @__PURE__ */ jsx("footer", { className: "mt-20 border-t border-slate-800 py-10", children: /* @__PURE__ */ jsxs("div", { className: "text-center text-slate-500 text-sm flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ant@IT. All rights reserved."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsx("a", { href: "/about.html", target: "_blank", className: "hover:text-brand-accent transition-colors", children: "About Us" }),
        /* @__PURE__ */ jsx("a", { href: "/privacy.html", target: "_blank", className: "hover:text-brand-accent transition-colors", children: "Privacy Policy" }),
        /* @__PURE__ */ jsx("a", { href: "/terms.html", target: "_blank", className: "hover:text-brand-accent transition-colors", children: "Terms of Service" }),
        /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Contact Us: WeListenToCustomer@gmail.com" })
      ] })
    ] }) })
  ] });
}
function App() {
  return /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(Home, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/play/:id", element: /* @__PURE__ */ jsx(GamePlayer, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/devlog", element: /* @__PURE__ */ jsx(Home, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/devlog/:slug", element: /* @__PURE__ */ jsx(DevLogDetail, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/post/:id", element: /* @__PURE__ */ jsx(Home, {}) })
  ] });
}
function render(url) {
  const html = ReactDOMServer.renderToString(
    /* @__PURE__ */ jsx(React.StrictMode, { children: /* @__PURE__ */ jsx(StaticRouter, { location: url, children: /* @__PURE__ */ jsx(App, {}) }) })
  );
  return { html };
}
export {
  render
};
