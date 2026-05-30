import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // Initialize Gemini AI securely
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined. AI features will be simulated.");
  }

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiAvailable: !!ai });
  });

  // Evaluate the Joint Peace Textbook draft
  app.post("/api/evaluate", async (req, res) => {
    const { studentName, partnerName, title, text, citations } = req.body;

    if (!title || !text) {
      return res.status(400).json({ error: "제목과 본문은 필수 입력 사항입니다." });
    }

    const citationList = Array.isArray(citations) ? citations.join(", ") : "없음";

    const prompt = `
당신은 평화적 관점과 역사적 객관성을 가르치는 역사·지리 교사 및 교육 전문가입니다.
중·고등학생들이 설계한 [한·일 평화 공동 교과서 - 독도 서술 제안서]를 평가하고, 건설적이며 고무적인 피드백을 제공해 주세요.

[제안서 정보]
- 작성자: ${studentName || "한국 학생"} & ${partnerName || "일본 학생"}
- 단원 제목: "${title}"
- 공동 집필 본문 (10줄 이내):
"${text}"
- 제시된 역사적 근거 (최소 2개 조건): ${citationList}

[작성 조건 분석 기준]
1. 최소 2개 이상의 역사적 근거(사료)를 올바르게 활용했는가? (근거 자료: 세종실록지리지, 신증동국여지승람, 만기요람, 대한제국 칙령 제41호, 은주시청합기, 조선국 교제시말 내탐서, 태정관 지령, 팔도총도, 삼국접양지도 등)
2. 일방적인 비난이나 감정적 표현을 배제하고 사실(Fact) 중심의 객관적 서술을 하고 있는가?
3. 미래지향적인 평화 공동체 또는 상호 협력의 관점을 보여주고 있는가?
4. 분량이 적절한가? (너무 길거나 너무 짧지 않은가, 10줄 내외 여부)

[답변 작성 형식 및 어조]
- 한국어(Korean)로 친절하고 격려하는 어조(존댓말)로 작성해 주세요.
- 다음의 요소들이 반드시 서술에 포함되게 4개의 영역으로 나누어 구조화된 JSON 형태로 응답해 주세요:
  1. "score": 100점 만점 기준 점수 (정수형)
  2. "strengths": 잘한 점 (팩트 기반의 객관적 서술, 좋은 사료 인용, 평화적 어조 등 분석)
  3. "improvements": 아쉬운 점 혹은 조금 더 보완하면 좋을 지점 (예: 보완 가능한 사료 추천 및 서술 윤색 조언)
  4. "teacherComment": 학생들에게 보내는 따뜻한 총평 한마디

주어진 조건을 충족하기 위해, 반드시 아래 JSON 구조로만 응답해야 하며 백틱(\`\`\`) 마크다운 표기는 사용하지 말고 순수 JSON 문자열만 즉시 출력해 주세요.

JSON 출력 형식 예시:
{
  "score": 85,
  "strengths": "...',
  "improvements": "...',
  "teacherComment": "..."
}
`;

    if (!ai) {
      // Return simulated fallback feedback if no API key is available
      return res.json({
        score: 90,
        strengths: "삼국접양지도와 태정관 지령 등 의미 있는 사료들을 잘 융합하여 서술했습니다. 특히 감정적 배제와 사실 중심의 전개가 매우 탄탄하게 이루어졌습니다.",
        improvements: "수업에서 배운 '세종실록지리지(1454년)'의 육안 관측성 의의를 한 문장 더 추가한다면 지리적 대표 조항으로서 훨씬 풍성하고 설득력 있는 글이 될 것입니다.",
        teacherComment: `멋진 제안서입니다, ${studentName || "학생"}님! 한일 양국 학생들이 함께 머리를 맞대고 갈등을 넘어 평화적인 미래를 그리는 모습이 매우 인상적입니다. 앞으로도 훌륭한 주권 수호의 파수꾼이자 평화의 전도사가 되어 주세요!`
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const responseText = response.text || "{}";
      const feedbackData = JSON.parse(responseText.trim());
      res.json(feedbackData);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: "AI 피드백 생성 도중 오류가 발생했습니다.",
        details: error.message,
        // fallback
        score: 80,
        strengths: "객관적인 톤을 유지하며 역사를 성찰하는 자세가 뛰어납니다.",
        improvements: "제시한 사료들의 년도를 조금 더 명확하게 구체화해 보길 권장합니다.",
        teacherComment: "수고하셨습니다. 시스템 지연으로 완전한 피드백 대신 기본 검토 의견을 드립니다. 수정을 거쳐 최종 완성본을 만들어 보세요!"
      });
    }
  });

  // Serve static files / Vite HMR
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
