const Groq = require("groq-sdk");

async function searchRealJobs(query, location) {
  try {
    const params = new URLSearchParams({
      api_key: process.env.SERP_API_KEY,
      engine: "google_jobs",
      q: query,
      location: location || "India",
      hl: "en",
      gl: "in"
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const text = await response.text();
    
    // Check if response is HTML (error page)
    if (text.trim().startsWith('<')) {
      console.warn('SerpAPI returned HTML — falling back to AI generation');
      return [];
    }

    const data = JSON.parse(text);
    
    if (data.error) {
      console.warn('SerpAPI error:', data.error);
      return [];
    }

    return data.jobs_results || [];
  } catch (err) {
    console.warn('SerpAPI failed:', err.message);
    return [];
  }
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
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Step 1 — Try SerpAPI for real jobs
    const searchQuery = `${stream} ${skillsList} internship freelance`;
    const realJobs = await searchRealJobs(searchQuery, location || "India");

    let prompt;

    if (realJobs.length > 0) {
      console.log(`✅ Using ${realJobs.length} real jobs from SerpAPI`);
      console.log('First job data:', JSON.stringify(realJobs[0], null, 2));
      
      const jobsContext = realJobs.slice(0, 15).map((job, i) => {
        const applyLink = "https://www.google.com/search?q=" + encodeURIComponent(job.title + " " + job.company_name + " job apply");
        return `Job ${i + 1}:
Title: ${job.title}
Company: ${job.company_name}
Location: ${job.location}
Description: ${job.description?.slice(0, 300)}
Link: ${applyLink}`;
      }).join("\n\n");

      prompt = `You are a job matching assistant for Findit.in.

Here are real job listings:
${jobsContext}

User Profile:
Skills: ${skillsList}
Job Stream: ${stream}
Location: ${location || "India"}
Work Type: ${workTypeData}
Expected Pay: ${payData}
Experience: ${qualData}

Format the TOP 10 most relevant jobs as a JSON array with these fields:
{"uid":"job_001","jobTitle":"exact title","source":"company name","snippet":"2-3 sentence description","link":"use exact Link provided","platformSource":"Google","salaryOrStipend":"Not mentioned","experienceRequired":"Fresher","postedBy":"company name","matchScore":85,"createdAt":"2026-06-01"}

Return ONLY the JSON array, nothing else.`;

    } else {
      console.log('⚠️ SerpAPI unavailable — using AI generation');
      
      prompt = `You are a job scout for Findit.in. Generate 10 realistic freelance or internship job listings for:
Skills: ${skillsList}
Job Stream: ${stream}
Location: ${location || "India (remote preferred)"}
Work Type: ${workTypeData}
Expected Pay: ${payData}
Experience: ${qualData}

For each job, use this Google search URL as the link:
https://www.google.com/search?q=[job+title]+[company]+apply+now

Return ONLY a JSON array with these fields:
{"uid":"job_001","jobTitle":"title","source":"company","snippet":"description","link":"google search url","platformSource":"Internshala","salaryOrStipend":"amount","experienceRequired":"Fresher","postedBy":"company","matchScore":85,"createdAt":"2026-06-01"}

Only return the JSON array, nothing else.`;
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4000,
      messages: [
        { role: "system", content: "You are a helpful job matching assistant. Always respond with valid JSON only, no markdown, no extra text." },
        { role: "user", content: prompt }
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
