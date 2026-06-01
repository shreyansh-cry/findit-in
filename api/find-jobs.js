const Groq = require("groq-sdk");

async function searchRealJobs(query, location) {
  const params = new URLSearchParams({
    api_key: process.env.SERP_API_KEY,
    engine: "google_jobs",
    q: query,
    location: location || "India",
    hl: "en",
    gl: "in"
  });

  const response = await fetch(`https://serpapi.com/search?${params}`);
  const data = await response.json();
  return data.jobs_results || [];
}

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

  try {
    // Step 1 — Search real jobs using SerpAPI
    const searchQuery = `${stream} ${skillsList} internship freelance`;
    const realJobs = await searchRealJobs(searchQuery, location || "India");

    console.log(`✅ SerpAPI found ${realJobs.length} real jobs`);

    // Step 2 — Use Groq to format and score the real jobs
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const jobsContext = realJobs.slice(0, 15).map((job, i) => `
Job ${i + 1}:
Title: ${job.title}
Company: ${job.company_name}
Location: ${job.location}
Description: ${job.description?.slice(0, 300)}
Link: ${job.related_links?.[0]?.link || job.share_link || "https://www.google.com/search?q=" + encodeURIComponent(job.title + " " + job.company_name)}
`).join("\n");

    const prompt = `You are a job matching assistant for Findit.in.

Here are real job listings found online:
${jobsContext}

User Profile:
Name: ${fullName || "User"}
Skills: ${skillsList}
Job Stream: ${stream}
Location: ${location || "India"}
Work Type: ${workTypeData}
Expected Pay: ${payData}
Experience: ${qualData}

Format the TOP 10 most relevant jobs as a JSON array. Each object must have these exact fields:
{"uid":"job_001","jobTitle":"exact title from listing","source":"company name","snippet":"2-3 sentence description","link":"actual job URL","platformSource":"LinkedIn or Internshala or Naukri or Google or Other","salaryOrStipend":"salary if mentioned or Not mentioned","experienceRequired":"experience needed or Fresher","postedBy":"company name","matchScore": number between 60-99 based on skill match,"createdAt":"2026-06-01"}

Return ONLY the JSON array, no markdown, no explanation.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: "You are a helpful job matching assistant. Always respond with valid JSON only, no markdown, no extra text."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    let rawText = response.choices[0].message.content.trim();
    rawText = rawText.replace(/```json|```/g, "").trim();
    const jobs = JSON.parse(rawText);

    return res.status(200).json({ success: true, jobs, uid });

  } catch (err) {
    console.error("find-jobs error:", err);
    return res.status(500).json({ error: err.message });
  }
};
