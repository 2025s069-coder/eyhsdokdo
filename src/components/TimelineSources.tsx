import { useState } from "react";
import { HISTORICAL_SOURCES } from "../data";
import { HistoricalSource } from "../types";
import { Search, Globe, Landmark, Map, HelpCircle, ChevronRight, BookOpen } from "lucide-react";

export default function TimelineSources() {
  const [filterType, setFilterType] = useState<"all" | "Korea" | "Japan" | "map">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>("sejong");

  // Filter sources
  const filteredSources = HISTORICAL_SOURCES.filter((src) => {
    const matchesFilter =
      filterType === "all" ||
      (filterType === "Korea" && src.origin === "Korea" && src.type !== "map") ||
      (filterType === "Japan" && src.origin === "Japan" && src.type !== "map") ||
      (filterType === "map" && src.type === "map");

    const matchesSearch =
      src.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.significance.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  }).sort((a, b) => a.year - b.year);

  const selectedSource = HISTORICAL_SOURCES.find((src) => src.id === selectedSourceId);

  return (
    <div id="timeline-sources" className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-2">
            <BookOpen className="w-3.5 h-3.5" /> 사료 대조 검증
          </span>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            동서고금 문헌·지도 아카이브 심층 탐독
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            역사는 기록의 과학입니다. 양국 고문서와 공인 규정 지도를 다각도로 교차 분석해 보세요.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="source-search-input"
            type="text"
            placeholder="사료 검색 (예: 태정관, 칙령)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
        <button
          id="btn-filter-all"
          onClick={() => setFilterType("all")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
            filterType === "all"
              ? "bg-indigo-600 text-white"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          전체 사료 ({HISTORICAL_SOURCES.length})
        </button>
        <button
          id="btn-filter-korea"
          onClick={() => setFilterType("Korea")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
            filterType === "Korea"
              ? "bg-emerald-600 text-white"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          대한민국 측 고문서
        </button>
        <button
          id="btn-filter-japan"
          onClick={() => setFilterType("Japan")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
            filterType === "Japan"
              ? "bg-amber-600 text-white"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          일본 측 관찬 고문서
        </button>
        <button
          id="btn-filter-map"
          onClick={() => setFilterType("map")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
            filterType === "map"
              ? "bg-sky-600 text-white"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          역사적 동해 고지도
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Hand Chronicles List */}
        <div className="lg:col-span-5 space-y-3.5 max-h-[460px] overflow-y-auto pr-2 divide-y divide-slate-100">
          {filteredSources.length > 0 ? (
            filteredSources.map((src) => {
              const isSelected = selectedSourceId === src.id;
              const isKorea = src.origin === "Korea";
              const isMap = src.type === "map";

              return (
                <div
                  id={`source-card-${src.id}`}
                  key={src.id}
                  onClick={() => setSelectedSourceId(src.id)}
                  className={`pt-3.5 first:pt-0 cursor-pointer group transition ${
                    isSelected ? "text-indigo-600" : "text-slate-600"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl border transition ${
                      isSelected
                        ? isKorea
                          ? "bg-emerald-50/50 border-emerald-200"
                          : isMap
                          ? "bg-sky-50/50 border-sky-200"
                          : "bg-amber-50/50 border-amber-200"
                        : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        {src.year}년
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isMap
                            ? "bg-sky-100 text-sky-700"
                            : isKorea
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isMap ? "역사 고지도" : isKorea ? "조선·대제국" : "일본 에도/메이지"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition truncate pr-2">
                        {src.title}
                      </h4>
                      <ChevronRight className={`w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition ${
                        isSelected ? "text-indigo-500 translate-x-0.5" : ""
                      }`} />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              정치한 검색 조건과 매칭되는 사료가 없습니다.
            </div>
          )}
        </div>

        {/* Right Hand Inspector Detail View */}
        <div className="lg:col-span-7">
          {selectedSource ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    {selectedSource.type === "map" ? (
                      <Map className="w-5 h-5 text-sky-600" />
                    ) : selectedSource.origin === "Korea" ? (
                      <Landmark className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Globe className="w-5 h-5 text-amber-600" />
                    )}
                    <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      {selectedSource.title}
                    </h4>
                  </div>
                  <span className="font-mono font-bold text-sm text-slate-500">
                    기록 시기: 서기 {selectedSource.year}년
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">사료 개요</span>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {selectedSource.description}
                  </p>
                </div>

                {selectedSource.quote && (
                  <div className="bg-white border-l-4 border-slate-300 rounded-r-xl p-4 italic text-slate-800 text-sm leading-relaxed my-3 font-medium">
                    " {selectedSource.quote} "
                  </div>
                )}

                <div className="bg-slate-100 rounded-xl p-4 mt-2">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">
                    교과서 필독 의의 및 반박 파워
                  </span>
                  <p className="text-slate-700 text-sm leading-relaxed font-normal">
                    {selectedSource.significance}
                  </p>
                </div>
              </div>

              {/* Decorative dynamic badge */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> 1차 사료(Primary Source) 검증 필
                </span>
                <span className="font-semibold text-slate-500">
                  {selectedSource.origin === "Korea" ? "대한민국 관할" : "일본 주권 배제 증거"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-12 bg-slate-50 rounded-2xl h-full border border-slate-100 text-slate-400">
              상기 좌측 크로니클 리스트에서 사료를 선택하여 정사(正史)를 검안해 보십시오.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
