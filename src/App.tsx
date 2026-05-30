import { useState, useEffect } from "react";
import {
  Compass,
  MapPin,
  Calendar,
  Anchor,
  BookOpen,
  Award,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  Printer,
  Sparkles,
  Info,
  Scale,
  RefreshCw,
  FileText,
  User,
  Users
} from "lucide-react";
import { HISTORICAL_SOURCES, REFLECTION_QUESTIONS } from "./data";
import { EvaluationResponse } from "./types";
import HorizonCalculator from "./components/HorizonCalculator";
import TimelineSources from "./components/TimelineSources";

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"geography" | "sources" | "modern" | "workbook">("geography");

  // Workbook Form State (Local persistence)
  const [studentName, setStudentName] = useState(() => localStorage.getItem("dokdo_student_name") || "");
  const [partnerName, setPartnerName] = useState(() => localStorage.getItem("dokdo_partner_name") || "");
  const [proposalTitle, setProposalTitle] = useState(() => localStorage.getItem("dokdo_proposal_title") || "동해 평화의 섬, 공동의 성정");
  const [proposalText, setProposalText] = useState(() => localStorage.getItem("dokdo_proposal_text") || "");
  const [selectedCitations, setSelectedCitations] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("dokdo_citations") || "[]");
    } catch {
      return [];
    }
  });

  // Evaluation & Interactive State
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(() => {
    try {
      const saved = localStorage.getItem("dokdo_evaluation");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState("");

  // Reflection Answers
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("dokdo_answers") || "{}");
    } catch {
      return {};
    }
  });

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem("dokdo_student_name", studentName);
    localStorage.setItem("dokdo_partner_name", partnerName);
    localStorage.setItem("dokdo_proposal_title", proposalTitle);
    localStorage.setItem("dokdo_proposal_text", proposalText);
    localStorage.setItem("dokdo_citations", JSON.stringify(selectedCitations));
  }, [studentName, partnerName, proposalTitle, proposalText, selectedCitations]);

  useEffect(() => {
    localStorage.setItem("dokdo_answers", JSON.stringify(answers));
  }, [answers]);

  const handleCitationToggle = (id: string) => {
    setSelectedCitations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAnswerChange = (id: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [id]: text }));
  };

  const handleResetForm = () => {
    if (window.confirm("작성 중인 제안서와 답변 내용을 초기화하시겠습니까?")) {
      setStudentName("");
      setPartnerName("");
      setProposalTitle("동해 평화의 섬, 공동의 성정");
      setProposalText("");
      setSelectedCitations([]);
      setEvaluation(null);
      setAnswers({});
      localStorage.removeItem("dokdo_student_name");
      localStorage.removeItem("dokdo_partner_name");
      localStorage.removeItem("dokdo_proposal_title");
      localStorage.removeItem("dokdo_proposal_text");
      localStorage.removeItem("dokdo_citations");
      localStorage.removeItem("dokdo_evaluation");
      localStorage.removeItem("dokdo_answers");
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!proposalTitle.trim()) {
      alert("단원 제목을 입력해 주세요.");
      return;
    }
    if (!proposalText.trim() || proposalText.trim().length < 30) {
      alert("교과서 공동 집필 본문을 최소 30자 이상 진정성 있게 작성해 주세요.");
      return;
    }
    if (selectedCitations.length === 0) {
      alert("집필 근거로 활용한 역사 사료를 최소 1개(작성 조건 권장 2개) 이상 선택해 주세요.");
      return;
    }

    setIsEvaluating(true);
    setEvalError("");
    setEvaluation(null);

    const mappedCitations = HISTORICAL_SOURCES.filter((s) => selectedCitations.includes(s.id)).map(
      (s) => `${s.title} (${s.year}년)`
    );

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName,
          partnerName,
          title: proposalTitle,
          text: proposalText,
          citations: mappedCitations,
        }),
      });

      if (!response.ok) {
        throw new Error("서버 평정과정 도중 에러가 발생했습니다.");
      }

      const data: EvaluationResponse = await response.json();
      setEvaluation(data);
      localStorage.setItem("dokdo_evaluation", JSON.stringify(data));
    } catch (err: any) {
      console.error(err);
      setEvalError("AI 융합 검토 서비스를 로드하는 데 실패했습니다. 잠시 후 서버를 자동 복구합니다.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1A202C] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 pb-20 print:bg-white print:pb-0">
      {/* HEADER SECTION (NEXUS.STUDIO Geometric Alignment) */}
      <header className="sticky top-0 bg-white border-b border-[#E2E8F0] z-50 transition-all duration-200 print:hidden shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-extrabold text-lg tracking-wider">
              DΩ
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-1.5">
                NEXUS.DOKDO
              </h1>
              <p className="text-[10px] text-[#64748B] font-mono tracking-widest font-bold uppercase">
                Territorial Sovereignty Portal
              </p>
            </div>
          </div>

          {/* Nav items / Tabs */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              id="tab-nav-geography"
              onClick={() => setActiveTab("geography")}
              className={`text-sm font-semibold transition py-1 border-b-2 ${
                activeTab === "geography"
                  ? "border-[#0F172A] text-[#0F172A]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              1차시. 지리·영역 분석
            </button>
            <button
              id="tab-nav-sources"
              onClick={() => setActiveTab("sources")}
              className={`text-sm font-semibold transition py-1 border-b-2 ${
                activeTab === "sources"
                  ? "border-[#0F172A] text-[#0F172A]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              2차시. 역사 사료·지도
            </button>
            <button
              id="tab-nav-modern"
              onClick={() => setActiveTab("modern")}
              className={`text-sm font-semibold transition py-1 border-b-2 ${
                activeTab === "modern"
                  ? "border-[#0F172A] text-[#0F172A]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              3차시. 현대 분쟁·어업
            </button>
            <button
              id="tab-nav-workbook"
              onClick={() => setActiveTab("workbook")}
              className={`text-sm font-semibold px-4 py-2 bg-[#0F172A] text-white rounded-lg hover:bg-slate-800 transition shadow-sm flex items-center gap-2`}
            >
              <Award className="w-4 h-4 text-amber-400" /> 공동 교과서 활동지
            </button>
          </nav>

          {/* Quick Info & Action controls */}
          <div className="flex items-center gap-3">
            <button
              id="global-reset-btn"
              onClick={handleResetForm}
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono text-[#64748B] hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition"
              title="활동 기록 초기화"
            >
              <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> 리셋
            </button>
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              정비 완료
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE TAB DRAWER */}
      <div className="lg:hidden flex bg-white border-b border-[#E2E8F0] p-2 overflow-x-auto gap-2 print:hidden">
        <button
          onClick={() => setActiveTab("geography")}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeTab === "geography" ? "bg-[#0F172A] text-white" : "bg-slate-50 text-slate-600"
          }`}
        >
          1차시. 지리·영역
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeTab === "sources" ? "bg-[#0F172A] text-white" : "bg-slate-50 text-slate-600"
          }`}
        >
          2차시. 사료·지도
        </button>
        <button
          onClick={() => setActiveTab("modern")}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeTab === "modern" ? "bg-[#0F172A] text-white" : "bg-slate-50 text-slate-600"
          }`}
        >
          3차시. 현대 전개
        </button>
        <button
          onClick={() => setActiveTab("workbook")}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
            activeTab === "workbook" ? "bg-[#0F172A] text-white" : "bg-amber-50 text-amber-800 border border-amber-100"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" /> 4차시. 활동 실습실
        </button>
      </div>

      {/* HERO INTRODUCTION SECTION */}
      <section className="bg-white border-b border-[#E2E8F0] py-12 md:py-16 print:hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative text */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#EFF6FF] px-3.5 py-1.5 rounded-full text-xs font-extrabold text-[#3B82F6]">
                <Scale className="w-3.5 h-3.5" /> 융합 교육과정 보조교재 [중·고등 역사 및 지리]
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-none">
                독도 영토 주권 교육 <br className="hidden md:inline" />
                <span className="text-blue-600">종합 아카이브 플랫폼</span>
              </h2>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-2xl">
                대한민국 독도의 현대·중세적 국제법적 지위와 동해 해양 영토의 역사적 문맥을 규명합니다.
                감정적 대안을 넘어 명확한 일차 사료 고문서, 법적 조약, 기하학적 육안 관측성 수학적 데이터를 대조하여
                다각적 평화 공동 해결 방안을 모색합니다.
              </p>
            </div>

            {/* Geometric graphical Balance element */}
            <div className="lg:col-span-4 flex items-center justify-center p-6 bg-[#F1F5F9] rounded-3xl border border-[#E2E8F0] relative overflow-hidden h-52 lg:h-64 shadow-inner">
              <div className="absolute top-2 right-2 text-[9px] font-mono font-bold text-slate-400">
                PROJECTION: UTM KOREA
              </div>
              <div className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-[#2563EB] rounded-2xl rotate-45 flex items-center justify-center transition hover:rotate-90 duration-500 shadow-md">
                <div className="-rotate-45 text-white text-center font-mono">
                  <div className="text-xs font-bold tracking-widest">EAST SEA</div>
                  <div className="text-[10px] opacity-80 mt-1">N 37°14' / E 131°52'</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-slate-300/30 rounded-full blur-xl"></div>
            </div>
          </div>

          {/* Quick Bento Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-50 border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-bold text-[#64748B]">최단 육지 기준거리</span>
              <div>
                <span className="text-xl md:text-2xl font-black text-[#0F172A] font-mono">87.4</span>
                <span className="text-xs font-bold text-slate-500 ml-1">km (울릉도 기점)</span>
              </div>
            </div>
            <div className="bg-slate-50 border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-bold text-[#64748B]">동도·서도 총면적</span>
              <div>
                <span className="text-xl md:text-2xl font-black text-[#0F172A] font-mono">187,554</span>
                <span className="text-xs font-bold text-slate-500 ml-0.5">㎡</span>
              </div>
            </div>
            <div className="bg-slate-50 border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-bold text-[#64748B]">대한제국 칙령 반포</span>
              <div>
                <span className="text-xl md:text-2xl font-black text-rose-600 font-mono">1900</span>
                <span className="text-xs font-bold text-rose-500 ml-1">10월 25일</span>
              </div>
            </div>
            <div className="bg-slate-50 border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-bold text-[#64748B]">평화적 독도등대 고도</span>
              <div>
                <span className="text-xl md:text-2xl font-black text-blue-600 font-mono">106</span>
                <span className="text-xs font-bold text-blue-500 ml-0.5">m</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT GATEWAY */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* TABS CONTROLLER */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* TAB 1: GEOGRAPHY & TERRITORIAL SYSTEM */}
          {activeTab === "geography" && (
            <div id="section-geography" className="space-y-8 animate-fade-in">
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                    [1차시] 독도의 지리적 형세와 영역 보장
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    독도가 대한민국의 영토임을 명징하게 이해하는 첫걸음은 물리학적 도량, 지리학적 사실, 국제법 기준을 확립하는 데 있습니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Dongdo Specs */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-[#E2E8F0] relative overflow-hidden">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-3 inline-block">
                      동도 (East Island - 이사부길)
                    </span>
                    <h4 className="text-lg font-bold text-slate-800">지리경비 수호 거점</h4>
                    <ul className="text-xs text-slate-600 mt-2.5 space-y-2 font-medium">
                      <li>• <strong>면적:</strong> 73,297 ㎡</li>
                      <li>• <strong>주요 시설:</strong> 독도경비대, 주권 독도등대, 헬기착륙장, 우체통</li>
                      <li>• <strong>도로명 주소:</strong> 경북 울릉군 울릉읍 독도리 이사부길</li>
                      <li>• <strong>상징 지형:</strong> 한반도바위, 천장굴, 독립문바위</li>
                    </ul>
                    <div className="absolute bottom-2 right-2 text-slate-200/50 scale-150 pointer-events-none">
                      <Anchor className="w-12 h-12" />
                    </div>
                  </div>

                  {/* Seodo Specs */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-[#E2E8F0] relative overflow-hidden">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-3 inline-block">
                      서도 (West Island - 안용복길)
                    </span>
                    <h4 className="text-lg font-bold text-slate-800">민간 거주 생활 거점</h4>
                    <ul className="text-xs text-slate-600 mt-2.5 space-y-2 font-medium">
                      <li>• <strong>면적:</strong> 88,740 ㎡</li>
                      <li>• <strong>주요 시설:</strong> 주민숙소(상주 어민 거처), 식수 수원지 '물골'</li>
                      <li>• <strong>도로명 주소:</strong> 경북 울릉군 울릉읍 독도리 안용복길</li>
                      <li>• <strong>최고 고도:</strong> 168.5m (서도 대한봉 우뚝 솟음)</li>
                    </ul>
                    <div className="absolute bottom-2 right-2 text-slate-200/50 scale-150 pointer-events-none">
                      <Compass className="w-12 h-12" />
                    </div>
                  </div>

                  {/* Territory Elements */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-[#E2E8F0] relative overflow-hidden">
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md mb-3 inline-block">
                      국가 영역 (Territory) 3요소
                    </span>
                    <h4 className="text-lg font-bold text-slate-800">독도의 법적 주권 지위</h4>
                    <ul className="text-xs text-slate-600 mt-2.5 space-y-2">
                      <li>
                        <strong>영토 (Territory):</strong> 경북 울릉군 울릉읍 독도리 산1-96번지를 아우르는 확실한 주권 영역.
                      </li>
                      <li>
                        <strong>영해 (Territorial Sea):</strong> 영해기선으로부터 <strong>12해리</strong> 지정. 불법 영해 침입 철저 단속.
                      </li>
                      <li>
                        <strong>영공 (Airspace):</strong> 독도 직상공 전체 공역. 대한민국 영공 방공식별구역 (KADIZ) 배속.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CURVATURE CALCULATOR COMPONENT */}
              <HorizonCalculator />

              {/* LEGAL DEFINITION TABLE */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 space-y-6">
                <div>
                  <h4 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
                    국가 영역 개념의 도량 및 영합
                  </h4>
                  <p className="text-slate-500 text-xs mt-1">
                    아래 도표는 영토와 바다의 한계에서 독도가 점하는 법적 실효적 위상을 규정합니다.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">영역 구분</th>
                        <th className="py-3 px-4">법적 한계 설정</th>
                        <th className="py-3 px-4">독도에서의 실효적 작용 방식 및 실재</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      <tr>
                        <td className="py-4 px-4 font-bold text-slate-800">영토 (Territory)</td>
                        <td className="py-4 px-4 text-slate-600">주권이 미치는 지표 범위</td>
                        <td className="py-4 px-4 text-slate-600 font-medium">산 1-96번지 행정구역, 독도 국기 게양대, 독도평화호 상주 취항</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 font-bold text-slate-800">영해 (Territorial Sea)</td>
                        <td className="py-4 px-4 text-slate-600">외해 기선으로부터 최대 12해리</td>
                        <td className="py-4 px-4 text-slate-600 font-medium">독도 주변 12해리를 온전한 주권 해상으로 해경 함정이 상시 초계</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 font-bold text-slate-800">영공 (Airspace)</td>
                        <td className="py-4 px-4 text-slate-600">영토와 영해 합산의 직상공 공역</td>
                        <td className="py-4 px-4 text-slate-600 font-medium">방공식별구역(KADIZ) 편입, 대한민국 공군 F-15K 주기적 초계비행 수호</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 font-bold text-slate-800">배타적 경제수역 (EEZ)</td>
                        <td className="py-4 px-4 text-slate-600">영해 기선으로부터 200해리 제한</td>
                        <td className="py-4 px-4 text-slate-600 font-medium">해양 자원의 탐사·개발 및 수산 자원 보존의 경제적 독점적 권리 행사</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORICAL ARCHIVE */}
          {activeTab === "sources" && (
            <div id="section-sources" className="space-y-8 animate-fade-in">
              <TimelineSources />

              {/* CORE CHRONICLE DECORATIVE CARD AND CONCEPTS */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-slate-800 tracking-tight">
                    왜 일본 고문서가 독도 영유권의 핵심 반박 증거가 될까요?
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    역사의 아이러니는 객관적 사실에서 비롯됩니다. 일본의 국가 공무나 관찬, 최고 의결기관의 지시서(예: 은주시청합기, 조선국 교제시말 내탐서, 태정관 지령)에는 스스로의 국경 한계를 '오키섬'으로 정확히 제한하며 “죽도(울릉도)와 송도(독도)는 조선의 영토” 임을 명백히 선고하고 있습니다.
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    또한, 에도 막부가 1695년 자국의 돗토리번에 질의를 보낸 것에서 드러나듯이, 일본 정부조차도 옛날부터 독도를 공식적으로 번이나 영토의 범위에 소속시켰던 적이 단 한 번도 없었다는 것이 외교적 진실입니다.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50 space-y-4">
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                    INTERACTIVE INSIGHT: 1695년 돗토리번 답변서
                  </span>
                  <div className="border-l-2 border-amber-500 pl-4 space-y-1.5">
                    <p className="text-xs text-slate-400">에도 막부의 정식 외교 질의에 대한 돗토리번주의 비밀 수기 보고:</p>
                    <p className="text-sm italic font-semibold text-slate-800">
                      "죽도(울릉도)와 송도(독도)는 본 돗토리번의 영토에 소속되지 않습니다."
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    이 공식 회신 이후 에도 막부는 일본 어선의 울릉도·독도 조합 도해를 엄금하는 <strong>'도해 금지령(1696년 1월)'</strong>을 반포하여 분쟁을 완벽하게 마무리 지었습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MODERN HISTORY AND FISHERY AGREEMENT */}
          {activeTab === "modern" && (
            <div id="section-modern" className="space-y-8 animate-fade-in">
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 space-y-8">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                    [3차시] 현대 독도 갈등의 역동적 전개와 쟁점
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    제2차 세계대전 종전 이후 벌어진 어업 협정, 평화선 선포, 그리고 명시적 조약들의 시각화 타임라인입니다.
                  </p>
                </div>

                {/* Timeline Grid layout */}
                <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-8">
                  
                  {/* Timeline 1 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1.5 bg-emerald-500 w-4.5 h-4.5 rounded-full border-4 border-white"></span>
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        1946년 1월 29일
                      </span>
                      <h4 className="text-base font-bold text-slate-800">
                        연합국최고사령관 지령 (SCAPIN) 제677호 반포
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-4xl">
                        패전한 일본의 영토 점령 조치를 종식하고, 영유 주권 행사 범위를 한정하면서 <strong>"울릉도, 제주도, 그리고 독도(Liancourt Rocks)"</strong>를 일본의 령화 작용 범위에서 명백히 배제하여 대한민국 수역으로 온전하게 귀속시켰습니다.
                      </p>
                    </div>
                  </div>

                  {/* Timeline 2 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1.5 bg-amber-500 w-4.5 h-4.5 rounded-full border-4 border-white"></span>
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        1951년 9월 8일
                      </span>
                      <h4 className="text-base font-bold text-slate-800">
                        샌프란시스코 강화조약 체결의 명문 누락 공백
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-4xl">
                        제2차 세계대전을 끝맺는 역사적인 조약입니다. 수차례 이뤄진 연합국 공동 초안(1차~5차)에는 일본이 포기하고 반환해야 할 도서에 '독도'가 정밀 배치되어 있었으나, 막판 일본 정계의 극밀 로비 및 미국의 아시아 전략 수정 변동으로 최종 조약문에는 제주도, 거문도, 울릉도 등 주요 대표 도서만 축약 나열되며 독도가 직접 지명 언급에서 누락되는 공백이 촉발되었습니다. 일본은 이를 빌미로 오늘날까지 주권 공백이 있었다며 왜곡하고 있습니다.
                      </p>
                    </div>
                  </div>

                  {/* Timeline 3 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1.5 bg-blue-500 w-4.5 h-4.5 rounded-full border-4 border-white"></span>
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        1952년 1월
                      </span>
                      <h4 className="text-base font-bold text-slate-800">
                        이승만 평화선(Rhee Line) 선포 및 영해권 방어
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-4xl">
                        샌프란시스코 조약의 국경 처리 허점을 규명한 대한민국 정부는 인접해양 주권선(평화선)을 전격 실존 선언하였습니다. 선 내부 수역에 독도를 고수하고 수시로 밀어닥치는 일본 대규모 불법 어민 선단과 순시선을 조기 나포 및 퇴거 조치하여 영토를 단호하게 주도했습니다.
                      </p>
                    </div>
                  </div>

                  {/* Timeline 4 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1.5 bg-teal-500 w-4.5 h-4.5 rounded-full border-4 border-white"></span>
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                        1953~1956년
                      </span>
                      <h4 className="text-base font-bold text-slate-800">
                        독도의용수비대 자발적 결성과 숭고한 보루
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-4xl">
                        한국전쟁의 극심한 혼란기에 일본 순시선이 기습 정박해 푯말을 박으며 독도를 빼앗아가려 시도하자, 울릉도 청년 출신 전역 국가 유공자들이 홍순칠 대장을 구심점으로 자긍심 어린 <strong>'독도의용수비대'</strong>를 긴급 구성했습니다. 무기도 마땅치 않아 가짜 나무 대포 모형을 만들어 설치하는 처절한 환경에서도, 침탈에 맞선 실력 격퇴로 독도를 지켰고 소중한 어업권을 온몸으로 지켰습니다.
                      </p>
                    </div>
                  </div>

                  {/* Timeline 5 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1.5 bg-indigo-600 w-4.5 h-4.5 rounded-full border-4 border-white"></span>
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        1998년 9월
                      </span>
                      <h4 className="text-base font-bold text-slate-800">
                        신한일어업협정 체결과 '중간수역' 선언의 딜레마
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-4xl">
                        유엔해양법공식협약(UNCLOS)이 가동되면서 200해리 배타적 경제수역(EEZ)이 중첩되자 한일 양국은 대립했습니다. 해안 거리를 감안 시 자국의 독자적 영해 기점을 관철하지 못하고, 임시 합의 구역인 '중간수역' 안에 독도를 수용시키는 과도기적 전술 타결을 맺었습니다. 이는 국내적으로 영권의 위기감을 불러일으키며 큰 파문을 일으켰으며, 일본 정치계가 2005년 이 틈새를 왜곡 활용해 '다케시마의 날' 조례 제정 도발을 감행하게 하는 간접 계기가 되었습니다.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORKBOOK LAB (AI INTEGRATION) */}
          {activeTab === "workbook" && (
            <div id="section-workbook" className="space-y-8 animate-fade-in print:block">
              {/* Introduction & Rule guidance */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 space-y-4 print:border-none print:p-0">
                <div className="flex justify-between items-center print:hidden">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                    <Award className="w-3.5 h-3.5" /> 4차시 협력 종합 실습실
                  </span>
                  <button
                    id="action-print-syllabus"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl border border-slate-200 transition"
                  >
                    <Printer className="w-4 h-4" /> PDF 출력 / 성적 보고
                  </button>
                </div>
                
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">
                  한·일 평화 공동 독도 교과서 집필 및 성찰 보고서
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed print:hidden">
                  본 실습지는 한일 양국의 편협한 민족주주의적 감정 대결을 뛰어넘어, 객관적으로 역사를 탐구하고 미래지향적인 상생의 평화 단원을 직접 저술해 보는 지혜로운 공동 창작 실습 마당입니다. 
                  우측 아래 <strong>Gemini 학습 평가 전문가</strong>가 작성한 서술형 교과문을 실무적으로 진단하고 따뜻한 피드백과 가산점 평가를 전송합니다.
                </p>

                <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs tracking-wide leading-relaxed print:hidden">
                  <div>
                    <span className="font-bold text-[#0F172A] block mb-1">📝 필수 조건 1</span>
                    배운 한·일 고문서 사료 (세종실록, 태정관 지령, 삼국접양지도 등) 중 <strong>최소 2개 이상</strong>을 역사적 핵심 진실로 포함할 것.
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] block mb-1">🕊️ 필수 조건 2</span>
                    일방적인 상대국 폄하나 감정적 격동을 완벽히 배제하고, 철저히 <strong>사실(Fact) 중심의 객관적 서술</strong>을 고수할 것.
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] block mb-1">🌐 필수 조건 3</span>
                    단방향 분쟁이 아닌, <strong>미래지향적 평화 공동체</strong> 및 동아시아 협력 관점을 종문에 부각시킬 것 (공동 집필 10줄 이내).
                  </div>
                </div>
              </div>

              {/* TWO COLUMN GRID: Student write-up on LEFT, AI evaluation on RIGHT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left hand editor form and checklist */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Co-author identity */}
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 space-y-4">
                    <h4 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" /> 공동 집필 대표 모둠원 명의
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="student-name-input" className="block text-xs font-bold text-slate-500 mb-1.5">한국측 대표 학생 성명</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="student-name-input"
                            type="text"
                            placeholder="예: 김민우"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="text-sm pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl font-medium"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="partner-name-input" className="block text-xs font-bold text-slate-500 mb-1.5">일본측 연대 학생 성명</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="partner-name-input"
                            type="text"
                            placeholder="예: 하루토 (Haruto)"
                            value={partnerName}
                            onChange={(e) => setPartnerName(e.target.value)}
                            className="text-sm pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Textbook Formulation */}
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 space-y-4">
                    <h4 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" /> 공동 교과서 본문 작성 및 집필대
                    </h4>

                    {/* Textbook Title input */}
                    <div>
                      <label htmlFor="proposal-title-input" className="block text-xs font-bold text-slate-500 mb-1.5">집필할 단원 제목 (주권 장 설정)</label>
                      <input
                        id="proposal-title-input"
                        type="text"
                        placeholder="예: 평화와 기록으로 지키는 우리 동해의 보루, 독도"
                        value={proposalTitle}
                        onChange={(e) => setProposalTitle(e.target.value)}
                        className="text-sm font-bold px-3 py-2.5 w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"
                      />
                    </div>

                    {/* Historical source checklist map */}
                    <div>
                      <span className="block text-xs font-bold text-slate-500 mb-2">인용한 근거 사료 연대 선택 (필수 최소 2개 이상 추천)</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {HISTORICAL_SOURCES.map((src) => {
                          const isSelected = selectedCitations.includes(src.id);
                          return (
                            <button
                              id={`citation-select-[${src.id}]`}
                              key={src.id}
                              type="button"
                              onClick={() => handleCitationToggle(src.id)}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition border ${
                                isSelected
                                  ? "bg-blue-50 border-blue-400 text-blue-700"
                                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                              }`}
                            >
                              <span className="font-mono text-[9px] block text-slate-400 font-bold">{src.year}년 [{src.origin === "Korea" ? "한" : "일"}]</span>
                              <span className="truncate block font-bold">{src.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Textbook Text Area editor */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="proposal-text-textarea" className="block text-xs font-bold text-slate-500">
                          공동 집필 본문 (예시 서술 방향 참조, 10줄 이내 서술형)
                        </label>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          글자 수: {proposalText.length}자
                        </span>
                      </div>
                      <textarea
                        id="proposal-text-textarea"
                        rows={8}
                        value={proposalText}
                        onChange={(e) => setProposalText(e.target.value)}
                        placeholder="동해의 은은한 가치 독도는 역사 사료를 통해 확연한 권원이 규명됩니다. 조선의 『세종실록지리지(1454년)』는 날씨가 맑으면 보이는 육안 관측성에 기초해 우산과 무릉을 우리 영토로 기록했습니다. 한편, 일본 메이지 최고기관이 하달한 『태정관 지령(1877년)』에서도 '울릉도 외 한 섬(독도)은 일본 영토와 관계없음'을 온누리에 못 박았습니다. 전후 연합국 최고령령(SCAPIN 677호)도 독도를 반환받을 우리 국경선에 명백히 산정했습니다. 비록 신한일어업협정 등의 우여곡절이 존재하나, 앞으로 우리 양국 청소년들은 우정과 이성적 역사 교육 교류를 통하여 동해 바다를 평화로운 동행의 바다로 보전해 나갈 상호 연대를 다짐합니다."
                        className="text-sm px-3.5 py-3 w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl leading-relaxed font-normal"
                      ></textarea>
                    </div>

                    {/* Help Tips */}
                    <div className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>💡 작성 어조 팁:</strong> "일제의 만행" "불법 침략" "침탈 야욕" 같은 극단적 적대 표어 대신, 
                        "역사적 실증 사실" "공문서상의 배제" "상호 평화와 공존" 같은 이성적이고 차분한 학술 용어를 구사했을 때 AI 학습 평가 점수가 비약적으로 향상됩니다.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right hand AI Evaluation panel */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <h4 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider">
                          Gemini 융합 학습 평점국
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">
                        ACTIVE SERVICE
                      </span>
                    </div>

                    {/* AI Evaluate Actions */}
                    {!evaluation && !isEvaluating && (
                      <div className="text-center py-8 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 px-4">
                          <h5 className="text-sm font-bold text-slate-800">교과문 상호 진단 및 튜터 교차 평가</h5>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            사료의 정밀도, 객관성, 화해주의적 어조 및 분량 조건을 기준으로 서술문을 전문 검정합니다.
                          </p>
                        </div>
                        <button
                          id="ai-submit-evaluation-btn"
                          type="button"
                          onClick={handleSubmitEvaluation}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> 평정서 즉시 제출하기
                        </button>
                      </div>
                    )}

                    {/* Evaluating Loading State */}
                    {isEvaluating && (
                      <div className="text-center py-12 space-y-4">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-[#0F172A]">독도 평화교육위원회 평정단 심사 중</h5>
                          <p className="text-xs text-slate-400">
                            동아시아 역사 조화와 교과 서술 완결성을 엄밀히 채점하고 있습니다...
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Server evaluation error */}
                    {evalError && (
                      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center space-y-3">
                        <p className="text-xs text-red-600 font-medium leading-relaxed">{evalError}</p>
                        <button
                          id="eval-retry-btn"
                          type="button"
                          onClick={handleSubmitEvaluation}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition"
                        >
                          다시 시도하기
                        </button>
                      </div>
                    )}

                    {/* AI Evaluation Output Results */}
                    {evaluation && !isEvaluating && (
                      <div id="ai-evaluation-display" className="space-y-5 animate-fade-in">
                        {/* Grade and score widget */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">최종 평정 점수</span>
                            <span className="text-xs text-indigo-600 font-semibold">조건 충족 및 어조 완숙함 우수</span>
                          </div>
                          <div className="text-right">
                            <span className="text-3xl font-black text-indigo-900 font-mono">{evaluation.score}</span>
                            <span className="text-xs font-bold text-indigo-500"> / 100</span>
                          </div>
                        </div>

                        {/* Distinct strengths */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 단원 서술 강점 (Strengths)
                          </span>
                          <p className="text-slate-700 text-xs leading-relaxed bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl font-medium">
                            {evaluation.strengths}
                          </p>
                        </div>

                        {/* Recommended improvements */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> 한 단계 나아간 제언 (Improvements)
                          </span>
                          <p className="text-slate-700 text-xs leading-relaxed bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl font-medium">
                            {evaluation.improvements}
                          </p>
                        </div>

                        {/* Warm teacher comments */}
                        <div className="space-y-1 border-t border-slate-100 pt-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">지도 교사 총평</span>
                          <p className="text-slate-800 text-xs italic bg-slate-50 p-4 border border-slate-100 rounded-xl leading-relaxed font-normal">
                            "{evaluation.teacherComment}"
                          </p>
                        </div>

                        <button
                          id="action-re-input-btn"
                          type="button"
                          onClick={() => {
                            setEvaluation(null);
                            localStorage.removeItem("dokdo_evaluation");
                          }}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 print:hidden"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> 본고 수정 후 재도전하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* THREE CORE DISCUSSION & SELF STUDY NOTEBOOK QUESTIONS */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 space-y-6">
                <div>
                  <h4 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
                    [수업 활동지] 성찰 및 모둠 자율 토론 목록
                  </h4>
                  <p className="text-slate-500 text-xs mt-1">
                    아래 심층 정답란에 자신의 성향과 탐구 결과 사상을 조리 있게 기록해 종합 교육과정을 매듭지어 보세요.
                  </p>
                </div>

                <div className="space-y-6">
                  {REFLECTION_QUESTIONS.map((q) => {
                    const currentAnswer = answers[q.id] || "";
                    return (
                      <div
                        id={`discussion-notebook-wrap-${q.id}`}
                        key={q.id}
                        className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                            {q.num}
                          </span>
                          <h5 className="text-sm font-bold text-slate-800 leading-relaxed">
                            {q.text}
                          </h5>
                        </div>
                        <div>
                          <textarea
                            id={`answer-area-${q.id}`}
                            rows={4}
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder}
                            className="w-full text-xs p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-normal shadow-xs"
                          ></textarea>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* LOWER FOOTER SECTION (Styling matches design completely) */}
      <footer className="mt-20 border-t border-[#E2E8F0] bg-white h-20 flex items-center justify-between px-6 lg:px-12 print:hidden z-10">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between text-xs text-[#94A3B8] gap-2">
          <div>
            &copy; {new Date().getFullYear()} 대한민국 역사·지리 평화교육위원회. All rights reserved.
          </div>
          <div className="flex gap-4 font-semibold text-slate-600">
            <span>국토 수호 교육 지침</span>
            <span>&middot;</span>
            <span>지리·역사 공동 집필</span>
            <span>&middot;</span>
            <span>동아시아 미래 지성 포럼</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
