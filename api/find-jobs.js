const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    fullName,
    skills,
    preferredJobStream,
    jobStream,
    location,
    preferredWorkType,
    workType,
    expectedPay,
    stipend,
    qualificationExperience,
    qualification,
    uid,
  } = req.body;

  const stream = preferredJobStream || jobStream;
  const skillsData = skills;
  const workTypeData = preferredWorkType || workType || "remote";
  const payData = expectedPay || stipend || "any";
  const qualData = qualificationExperience || qualification || "fresher";

  if (!skillsData || skillsData.length === 0 || !stream) {
    return res.status(400).json({ error: "Missing required fields: skills and job stream" });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const skillsList = Array.isArray(skillsData) ? skillsData.join(", ") : skillsData;

  const prompt = `You are a job scout for Findit.in, a platform that helps Indian students and freelancers find jobs.

Find 10 realistic freelance or internship job postings that match this user profile:

Name: ${fullName || "User"}
Skills: ${skillsList}
Job Stream: ${stream}
Location: ${location || "India (remote preferred)"}
Work Type: ${workTypeData}
Expected Pay: ${payData}
Experience/Qualification: ${qualData}

Based on your knowledge of job platforms like LinkedIn, Internshala, Naukri, Upwork, Reddit, and freelance boards, generate 10 realistic job listings that would match this profile.

Return ONLY a valid JSON array with exactly 10 job objects. No explanation, no markdown, no extra text — just the raw JSON array.

Each job object must follow this exact schema:
{
  "uid": "job_001",
  "jobTitle": "actual job title",
  "source": "platform or company name",
  "snippet": "2-3 sentence description of the job",
  "link": "https://internshala.com or https://linkedin.com or any real platform URL",
  "platformSource": "LinkedIn or Discord or Reddit or Twitter/X or Internshala or Naukri or Google or Upwork or Other",
  "salaryOrStipend": "salary range or Not mentioned",
  "experienceRequired": "experience needed or Fresher",
  "postedBy": "person or company name or Not clear",
  "matchScore": a number between 60 and 99 based on how well this job matches the user skills and stream,
  "createdAt": "2026-06-01"
}

Make uid values like job_001, job_002 etc.
Make matchScore higher for jobs that closely match the skills: ${skillsList} and stream: ${stream}.
Only return the JSON array, nothing else.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
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