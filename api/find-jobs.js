const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    fullName, skills, preferredJobStream, jobStream,
    location, preferredWorkType, workType,
    expectedPay, stipend, qualificationExperience, qualification, uid,
  } = req.body;

  const stream = preferredJobStream || jobStream;
  const skillsData = skills;
  const workTypeData = preferredWorkType || workType || "remote";
  const payData = expectedPay || stipend || "any";
  const qualData = qualificationExperience || qualification || "fresher";

  if (!skillsData || skillsData.length === 0 || !stream) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const skillsList = Array.isArray(skillsData) ? skillsData.join(", ") : skillsData;

  const prompt = `You are a job scout for Findit.in. Generate 10 realistic freelance or internship job listings for this profile:
Name: ${fullName || "User"}
Skills: ${skillsList}
Job Stream: ${stream}
Location: ${location || "India (remote preferred)"}
Work Type: ${workTypeData}
Expected Pay: ${payData}
Experience: ${qualData}

Return ONLY a valid JSON array with exactly 10 objects. No markdown, no explanation, just raw JSON.
Each object must have these exact fields:
{"uid":"job_001","jobTitle":"title","source":"company","snippet":"2-3 sentence description","link":"https://internshala.com","platformSource":"Internshala","salaryOrStipend":"amount","experienceRequired":"Fresher","postedBy":"company name","matchScore":85,"createdAt":"2026-06-01"}

Only return the JSON array, nothing else.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text().trim();
    rawText = rawText.replace(/```json|```/g, "").trim();
    const jobs = JSON.parse(rawText);
    return res.status(200).json({ success: true, jobs, uid });
  } catch (err) {
    console.error("find-jobs error:", err);
    return res.status(500).json({ error: err.message });
  }
};