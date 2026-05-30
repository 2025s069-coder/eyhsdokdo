import { useState } from "react";
import { HelpCircle, Eye, EyeOff, Sparkles, MapPin } from "lucide-react";

export default function HorizonCalculator() {
  const [observerType, setObserverType] = useState<"ulleung" | "oki">("ulleung");
  // Default heights: Ulleungdo high grounds (Seokpo/Nari: 300m), Oki Islands (coastal average: 50m)
  const [observerHeight, setObserverHeight] = useState<number>(
    observerType === "ulleung" ? 300 : 50
  );

  const DOKDO_HEIGHT = 168.5; // Seodo highest point in m
  const DOKDO_DONGDO_HEIGHT = 98.6; // Dongdo height

  // Actual distances
  const distance = observerType === "ulleung" ? 87.4 : 157.5;
  const name = observerType === "ulleung" ? "울릉도" : "일본 오키섬";

  // Geometric calculations: d_horizon ≈ 3.57 * sqrt(h)
  const d1 = 3.57 * Math.sqrt(observerHeight);
  const d2 = 3.57 * Math.sqrt(DOKDO_HEIGHT);
  const maxVisibleDistance = d1 + d2;
  const isVisible = distance <= maxVisibleDistance;

  // Curvature drop formula: h_drop = d^2 / (2 * R) where R ≈ 6371km
  // h_drop ≈ 0.0785 * d^2 in meters
  // To verify if Dokdo's top is visible, we calculate the portion of Dokdo below the horizon.
  // The observer is at observerHeight. Horizon distance is d1.
  // The remaining distance to Dokdo is d_rem = distance - d1.
  // If d_rem < 0, then the observer can see down to sea level.
  // If d_rem > 0, the height of Dokdo hidden by earth curvature is:
  const remainingDist = Math.max(0, distance - d1);
  const hiddenHeight = 0.0785 * Math.pow(remainingDist, 2);
  const visiblePortion = Math.max(0, DOKDO_HEIGHT - hiddenHeight);
  const visiblePercent = Math.min(100, Math.max(0, (visiblePortion / DOKDO_HEIGHT) * 100));

  const handleToggle = (type: "ulleung" | "oki") => {
    setObserverType(type);
    setObserverHeight(type === "ulleung" ? 300 : 50);
  };

  return (
    <div id="horizon-calculator" className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 과학적 지리 검증
          </span>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            독도의 영토 인지 및 육안 관측성 시뮬레이터
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            지구 곡률과 고도 설정을 대조해 관측 가능 여부를 수학적으로 진단해 보세요.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl self-start">
          <button
            id="tab-btn-ulleung"
            onClick={() => handleToggle("ulleung")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              observerType === "ulleung"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            울릉도 기점
          </button>
          <button
            id="tab-btn-oki"
            onClick={() => handleToggle("oki")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              observerType === "oki"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            오키섬 기점
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Control & Stat Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="height-slider" className="text-sm font-bold text-slate-700 block">
                관측자 지대 고도: <span className="text-blue-600 text-base">{observerHeight}m</span>
              </label>
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-slate-400 cursor-pointer" />
                <div className="absolute right-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg p-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-lg z-10 font-normal leading-relaxed">
                  울릉도 Nari분지/석포고지대는 약 300~350m, 최고 성인봉은 984m에 해당합니다. 반면 오키섬 거주 지역과 포구 지대는 대략 10~100m 사이의 고도입니다.
                </div>
              </div>
            </div>

            <input
              id="height-slider"
              type="range"
              min="10"
              max="1000"
              step="10"
              value={observerHeight}
              onChange={(e) => setObserverHeight(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2 focus:outline-none"
            />
            <div className="flex justify-between text-slate-400 text-xs font-mono">
              <span>바닷가 (10m)</span>
              <span>성인봉 정상 (984m - 울릉 최고봉)</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs text-slate-400 font-medium">독도까지의 실제 거리</p>
                <p className="text-lg font-bold text-slate-800 font-mono mt-0.5">{distance} km</p>
              </div>
              <div className="w-1 px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-slate-100 text-slate-600">
                실제거리
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs text-slate-400 font-medium">기하학적 최대 관측 한계 거리</p>
                <p className="text-lg font-bold text-slate-800 font-mono mt-0.5">{maxVisibleDistance.toFixed(1)} km</p>
              </div>
              <div className="text-xs font-bold font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                D = 3.57×(√H_obs + √H_dok)
              </div>
            </div>

            {isVisible ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg text-white">
                  <Eye className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-800 text-sm">관측 성공 (또렷이 보임)</h4>
                  <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">
                    독도가 해수면 위 <span className="font-bold">{visiblePortion.toFixed(1)}m</span> ({visiblePercent.toFixed(0)}%) 노출되어 맑은 날 맨눈으로 수평선에 또렷이 보입니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 bg-rose-500 rounded-lg text-white">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">관측 불가능 (수평선 아래 침강)</h4>
                  <p className="text-xs text-rose-600 mt-0.5 leading-relaxed">
                    지구의 곡률 때문에 독도가 수평선 아래로 완전히 가려져 있어 ({hiddenHeight.toFixed(0)}m 침강) 수평선 위로 결코 보이지 않습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Curved Earth Visual Rendering */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-inner font-sans border border-slate-800">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 text-xs font-mono text-blue-300 uppercase tracking-widest bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-800/50">
              <MapPin className="w-3 h-3 text-blue-400" /> {name} → 독도 시점 기하 모형
            </span>
          </div>

          {/* Curved ocean illustration */}
          <div className="h-44 md:h-52 relative my-4 flex items-end">
            {/* The Earth curves down between are point and right */}
            <div className="absolute inset-0 border-b border-dashed border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">지대 고도: {observerHeight}m</span>
              <span className="text-[10px] font-mono text-slate-500">거리: {distance}km</span>
              <span className="text-[10px] font-mono text-slate-500">독도 높이: {DOKDO_HEIGHT}m</span>
            </div>

            {/* Simulated Ocean Curved Arc */}
            <svg viewBox="0 0 540 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity="0" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Sky background */}
              <rect width="540" height="180" fill="url(#skyGrad)" />

              {/* Curved Ocean Surface Arc */}
              {/* Path starts at (40, 150) goes up to peak at (270, 130) then down to (490, 150) */}
              <path
                d="M 10 160 Q 270 115 480 160 L 480 200 L 10 200 Z"
                fill="url(#oceanGrad)"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />

              {/* Observer Land Tower (on the left) */}
              {/* Scale observer height visually: 10 pixels min, 65 pixels max */}
              {(() => {
                const heightPixels = Math.max(10, Math.min(55, observerHeight * 0.05 + 10));
                const observerY = 153 - heightPixels;
                return (
                  <g>
                    {/* Land Hill */}
                    <path d="M 0 160 Q 40 155 70 151 L 70 190 L 0 190 Z" fill="#334155" />
                    {/* Observer Tower/Peak */}
                    <line x1="45" y1="154" x2="45" y2={observerY} stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                    {/* Observer Eye Pulsing */}
                    <circle cx="45" cy={observerY} r="7" fill="#f59e0b" className="animate-pulse" />
                    <text x="45" y={observerY - 12} textAnchor="middle" fill="#f59e0b" className="text-[10px] font-bold font-mono">
                      눈 (OBS)
                    </text>
                  </g>
                );
              })()}

              {/* Target: Dokdo (on the right) */}
              <g>
                {/* Dokdo Mountain shape */}
                {/* If hidden height is greater than Dokdo's peak, we submerge it visually */}
                {(() => {
                  const visibleHeightRatio = visiblePercent / 100;
                  const maxPeakHeight = 35; // pixels
                  const renderedHeight = maxPeakHeight * visibleHeightRatio;
                  const mountainBaseY = 152;
                  const mountainTopY = mountainBaseY - renderedHeight;

                  return (
                    <g>
                      {/* Dokdo Seodo (Peak) */}
                      <polygon
                        points={`420,${mountainBaseY} 440,${mountainTopY} 460,${mountainBaseY}`}
                        fill={isVisible ? "#e2e8f0" : "#475569"}
                        stroke={isVisible ? "#0ea5e9" : "#64748b"}
                        strokeWidth="1"
                      />
                      {/* Dongdo (Smaller Peak) */}
                      <polygon
                        points={`450,${mountainBaseY} 465,${mountainBaseY - renderedHeight * 0.58} 480,${mountainBaseY}`}
                        fill={isVisible ? "#cbd5e1" : "#334155"}
                        stroke={isVisible ? "#38bdf8" : "#475569"}
                        strokeWidth="0.8"
                      />
                      <text x="450" y="170" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-semibold">
                        독도
                      </text>
                    </g>
                  );
                })()}
              </g>

              {/* Observer line of sight ray */}
              {(() => {
                const heightPixels = Math.max(10, Math.min(55, observerHeight * 0.05 + 10));
                const observerY = 153 - heightPixels;
                const mountainBaseY = 152;
                const maxPeakHeight = 35;
                const visibleHeightRatio = visiblePercent / 100;
                const renderedHeight = maxPeakHeight * visibleHeightRatio;
                const mountainTopY = mountainBaseY - renderedHeight;

                // Ray line from observer to Dokdo peak
                // If visible, the ray has solid green indicator, else red interrupted
                return (
                  <g>
                    {isVisible ? (
                      <>
                        {/* Line of Sight Ray */}
                        <line
                          x1="45"
                          y1={observerY}
                          x2="440"
                          y2={mountainTopY}
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeDasharray="4,4"
                        />
                        <text x="240" y="85" textAnchor="middle" fill="#10b981" className="text-[10px] bg-slate-900 rounded px-1 font-mono font-bold">
                          시선 도달 (직선 관측)
                        </text>
                      </>
                    ) : (
                      <>
                        {/* Blocked Line of Sight Ray hitting the curved bulge representing the Earth's horizon */}
                        <line
                          x1="45"
                          y1={observerY}
                          x2="270"
                          y2="122"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                          strokeDasharray="3,3"
                        />
                        <path d="M 270 122 L 273 125 M 270 125 L 273 122" stroke="#ef4444" strokeWidth="2" />
                        <text x="240" y="85" textAnchor="middle" fill="#f87171" className="text-[10px] font-mono">
                          지구 곡률에 수평선 차단
                        </text>
                      </>
                    )}
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-xs font-mono leading-relaxed text-slate-300">
            {observerType === "ulleung" ? (
              <p>
                💡 <span className="text-emerald-400 font-bold">울릉도 증명:</span> 울릉도 고지대({observerHeight}m)에서 수평선 너머 독도({DOKDO_HEIGHT}m)를 볼 수 있는 직선 거리는 기하학적으로 최대 <span className="text-emerald-400 font-bold">{maxVisibleDistance.toFixed(1)}km</span>입니다. 울릉도-독도 간 거리가 단 <strong>87.4km</strong>이기 때문에, 울릉도 조상들은 역사 시작부터 독도를 영토로 쉽게 지각해 온 것입니다.
              </p>
            ) : (
              <p>
                ⚠️ <span className="text-rose-400 font-bold">오키섬 증명:</span> 오키섬에서 독도까지 거리는 무려 <strong>157.5km</strong>인 반면, 고지대({observerHeight}m)에서 기하학적으로 최대로 도달 가능한 거리는 <span className="text-rose-400 font-bold">{maxVisibleDistance.toFixed(1)}km</span>에 불과합니다. 따라서 에도시대 오키섬 어민들은 날씨가 아무리 맑아도 독도를 물리적으로 관측할 수 없었습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
