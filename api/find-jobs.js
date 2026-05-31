const Anthropic = require("@anthropic-ai/sdk");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    fullName,
    skills,
    preferredJobStream,
    location,
    preferredWorkType,
    expectedPay,
    qualificationExperience,
    uid,
  } = req.body;

  if (!skills || !preferredJobStream) {
    return res.status(400).json({ error: "Missing required profile fields" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const skillsList = Array.isArray(skills) ? skills.join(", ") : skills;

  const prompt = `You are a job scout for Findit.in, a platform that helps Indian students and freelancers find jobs.

Search the web and find 10 real, active freelance or internship job postings that match this user profile:

Name: ${fullName}
Skills: ${skillsList}
Job Stream: ${preferredJobStream}
Location: ${location || "India (remote preferred)"}
Work Type: ${preferredWorkType || "remote"}
Expected Pay: ${expectedPay || "any"}
Experience/Qualification: ${qualificationExperience || "fresher"}

Search platforms like LinkedIn, Internshala, Naukri, Twitter/X, Reddit, Discord job boards, Google, Upwork, and any other relevant job sites.

Return ONLY a valid JSON array with exactly 10 job objects. No explanation, no markdown, no extra text — just the raw JSON array.

Each job object must follow this exact schema:
{
  "uid": "job_001",
  "jobTitle": "actual job title",
  "source": "platform or company name",
  "snippet": "2-3 sentence description of the job",
  "link": "actual URL to the job post",
  "platformSource": "LinkedIn or Discord or Reddit or Twitter/X or Internshala or Naukri or Google or Upwork or Other",
  "salaryOrStipend": "salary range or Not mentioned",
  "experienceRequired": "experience needed or Fresher",
  "postedBy": "person or company name or Not clear",
  "matchScore": a number between 60 and 99 based on how well this job matches the user skills and stream,
  "createdAt": "today's date in YYYY-MM-DD format"
}

Make uid values like job_001, job_002 etc.
Make matchScore higher for jobs that closely match the skills: ${skillsList} and stream: ${preferredJobStream}.
Only return the JSON array, nothing else.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 8,
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock) {
      return res.status(500).json({ error: "No response from AI" });
    }

    let rawText = textBlock.text.trim();
    rawText = rawText.replace(/```json|```/g, "").trim();

    const jobs = JSON.parse(rawText);

    return res.status(200).json({ success: true, jobs, uid });
  } catch (err) {
    console.error("find-jobs error:", err);
    return res.status(500).json({ error: err.message });
  }
};