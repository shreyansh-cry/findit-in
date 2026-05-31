/**
 * ===================================================
 * FINDIT.IN — Google Apps Script Backend
 * ===================================================
 * 
 * This backend handles:
 * 1. Receiving user preferences from the Findit.in frontend
 * 2. Searching for real jobs using SerpApi (Google Jobs API)
 * 3. Filtering, ranking, and cleaning results with Gemini AI
 * 4. Returning structured JSON to the frontend
 * 
 * SETUP INSTRUCTIONS:
 * -------------------
 * 1. Go to https://script.google.com
 * 2. Create a new project and name it "Findit Backend"
 * 3. Paste this entire code into the Code.gs file
 * 4. Replace the two API key placeholders below with your real keys
 * 5. Click Deploy → New Deployment
 * 6. Choose "Web app"
 * 7. Set "Execute as" → Me
 * 8. Set "Who has access" → Anyone
 * 9. Click Deploy
 * 10. Copy the Web App URL
 * 11. Paste it into results.html where it says PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE
 * 
 * API KEYS NEEDED:
 * ----------------
 * - SerpApi: Get your key at https://serpapi.com (free tier: 100 searches/month)
 * - Gemini:  Get your key at https://aistudio.google.com/app/apikey
 */

// ⬇️ PASTE YOUR API KEYS BELOW ⬇️
const SERPAPI_KEY = "PASTE_SERPAPI_KEY_HERE";
const GEMINI_API_KEY = "PASTE_GEMINI_API_KEY_HERE";


// ================================
// MAIN ENTRY POINT — doPost(e)
// ================================

/**
 * Handles POST requests from the Findit.in frontend.
 * Receives user preferences, fetches jobs, filters with AI, returns JSON.
 */
function doPost(e) {
  try {
    // Parse the incoming JSON payload
    const requestData = JSON.parse(e.postData.contents);

    const name = requestData.name || "User";
    const category = requestData.category || "General";
    const skills = requestData.skills || "";
    const experience = requestData.experience || "Fresher";
    const jobType = requestData.jobType || "any";
    const location = requestData.location || "Remote";

    Logger.log(`📥 Request from ${name}: category=${category}, skills=${skills}, experience=${experience}, jobType=${jobType}, location=${location}`);

    // Step 1: Build the search query
    const searchQuery = buildSearchQuery(category, skills, experience, jobType, location);
    Logger.log(`🔍 Search query: "${searchQuery}"`);

    // Step 2: Fetch raw jobs from SerpApi
    const rawJobs = fetchJobsFromSerpApi(searchQuery, location);
    Logger.log(`📊 SerpApi returned ${rawJobs.length} raw job results`);

    if (rawJobs.length === 0) {
      // Return empty results if no jobs found
      return buildCorsResponse({ jobs: [] });
    }

    // Step 3: Send raw jobs to Gemini for filtering, ranking, and formatting
    const filteredJobs = filterWithGemini(rawJobs, {
      name, category, skills, experience, jobType, location
    });
    Logger.log(`✅ Gemini returned ${filteredJobs.length} filtered jobs`);

    // Return the filtered jobs
    return buildCorsResponse({ jobs: filteredJobs });

  } catch (error) {
    Logger.log(`❌ Error: ${error.message}`);
    return buildCorsResponse({
      error: error.message,
      jobs: []
    });
  }
}


/**
 * Handles GET requests (used by browser for preflight / testing).
 */
function doGet(e) {
  return buildCorsResponse({
    status: "ok",
    message: "Findit.in backend is running. Send a POST request with user preferences."
  });
}


// ================================
// STEP 1: BUILD SEARCH QUERY
// ================================

/**
 * Constructs an optimized search query from user preferences.
 */
function buildSearchQuery(category, skills, experience, jobType, location) {
  let queryParts = [];

  // Add category
  if (category && category !== "General") {
    queryParts.push(category);
  }

  // Add top skills (limit to first 3 for focused results)
  if (skills) {
    const skillList = skills.split(",").map(s => s.trim()).filter(Boolean);
    const topSkills = skillList.slice(0, 3).join(" ");
    if (topSkills) {
      queryParts.push(topSkills);
    }
  }

  // Add experience level keywords
  if (experience) {
    const expLower = experience.toLowerCase();
    if (expLower.includes("fresher") || expLower.includes("0") || expLower.includes("intern")) {
      queryParts.push("intern OR fresher OR entry level");
    } else if (expLower.includes("1") || expLower.includes("2")) {
      queryParts.push("junior");
    } else if (expLower.includes("3") || expLower.includes("4") || expLower.includes("5")) {
      queryParts.push("mid-level");
    }
  }

  // Add job type
  if (jobType && jobType !== "any") {
    queryParts.push(jobType);
  }

  // Fallback if query is empty
  if (queryParts.length === 0) {
    queryParts.push("jobs hiring now");
  }

  return queryParts.join(" ");
}


// ================================
// STEP 2: FETCH JOBS FROM SERPAPI
// ================================

/**
 * Calls SerpApi Google Jobs API and returns raw job listings.
 */
function fetchJobsFromSerpApi(query, location) {
  const url = "https://serpapi.com/search.json";

  const params = {
    engine: "google_jobs",
    q: query,
    location: location || "India",
    hl: "en",
    api_key: SERPAPI_KEY,
    num: "20"  // Request up to 20 results
  };

  // Build URL with query parameters
  const paramString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  const fullUrl = `${url}?${paramString}`;

  try {
    const response = UrlFetchApp.fetch(fullUrl, {
      method: "GET",
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      Logger.log(`⚠️ SerpApi returned status ${statusCode}: ${response.getContentText().substring(0, 200)}`);
      throw new Error(`SerpApi returned status ${statusCode}`);
    }

    const data = JSON.parse(response.getContentText());

    // Extract jobs_results array
    const jobsResults = data.jobs_results || [];

    // Map to a simplified format for Gemini processing
    return jobsResults.map(job => ({
      title: job.title || "",
      company_name: job.company_name || "",
      location: job.location || "",
      description: job.description || "",
      detected_extensions: job.detected_extensions || {},
      apply_options: job.apply_options || [],
      job_highlights: job.job_highlights || []
    }));

  } catch (error) {
    Logger.log(`❌ SerpApi fetch error: ${error.message}`);
    throw new Error(`Failed to fetch jobs from SerpApi: ${error.message}`);
  }
}


// ================================
// STEP 3: FILTER WITH GEMINI AI
// ================================

/**
 * Sends raw job data to Gemini API for intelligent filtering,
 * ranking, and formatting.
 */
function filterWithGemini(rawJobs, userPrefs) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // Build the prompt
  const prompt = buildGeminiPrompt(rawJobs, userPrefs);

  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
      responseMimeType: "application/json"
    }
  };

  try {
    const response = UrlFetchApp.fetch(geminiUrl, {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      Logger.log(`⚠️ Gemini returned status ${statusCode}: ${response.getContentText().substring(0, 300)}`);
      // If Gemini fails, return raw jobs in the expected format as fallback
      return formatRawJobsAsFallback(rawJobs, userPrefs);
    }

    const data = JSON.parse(response.getContentText());

    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!generatedText) {
      Logger.log("⚠️ Gemini returned empty response, using fallback");
      return formatRawJobsAsFallback(rawJobs, userPrefs);
    }

    // Parse the JSON response from Gemini
    try {
      const parsed = JSON.parse(generatedText);
      const jobs = parsed.jobs || parsed;

      // Validate and sanitize each job
      if (Array.isArray(jobs)) {
        return jobs.map(job => sanitizeJob(job)).filter(job => job.title);
      }

      Logger.log("⚠️ Gemini response was not an array, using fallback");
      return formatRawJobsAsFallback(rawJobs, userPrefs);

    } catch (parseErr) {
      Logger.log(`⚠️ Could not parse Gemini JSON: ${parseErr.message}`);
      return formatRawJobsAsFallback(rawJobs, userPrefs);
    }

  } catch (error) {
    Logger.log(`❌ Gemini API error: ${error.message}`);
    return formatRawJobsAsFallback(rawJobs, userPrefs);
  }
}


/**
 * Builds the prompt for Gemini to filter, rank, and format jobs.
 */
function buildGeminiPrompt(rawJobs, userPrefs) {
  // Limit to first 15 jobs to stay within token limits
  const jobsSubset = rawJobs.slice(0, 15);

  const jobsJson = JSON.stringify(jobsSubset, null, 2);

  return `You are a job matching AI for Findit.in, a platform that helps students and freshers find internships, freelance work, and entry-level jobs.

## User Profile:
- Name: ${userPrefs.name}
- Looking for: ${userPrefs.category}
- Skills: ${userPrefs.skills}
- Experience: ${userPrefs.experience}
- Preferred job type: ${userPrefs.jobType}
- Preferred location: ${userPrefs.location}

## Raw Job Listings from Google Jobs:
${jobsJson}

## Your Task:
1. Filter out irrelevant jobs that don't match the user's category, skills, or experience level.
2. Rank the remaining jobs by relevance to the user's profile (best match first).
3. For each job, provide a match score (X/10) and a brief explanation of why it matches.
4. Clean up job descriptions to be concise (2-3 sentences max).
5. Extract the key skills required for each job.
6. Find the best apply link from the apply_options array. Prefer direct company links over aggregator links.

## IMPORTANT — Output Format:
Return a JSON object with a "jobs" array. Each job object MUST have exactly these fields:
{
  "jobs": [
    {
      "title": "Job title",
      "company": "Company name",
      "location": "Job location (e.g., Remote, Mumbai, etc.)",
      "description": "Clean 2-3 sentence job summary",
      "whyMatch": "Brief explanation of why this job matches the user's profile",
      "skills": "Comma-separated list of key skills needed",
      "applyLink": "Best URL to apply",
      "matchScore": "X.X/10"
    }
  ]
}

Rules:
- Return between 5 and 15 jobs maximum.
- matchScore should be between 1.0 and 10.0 (one decimal place).
- If a job has no apply link, use "#" as the applyLink.
- Keep descriptions professional but friendly.
- The whyMatch field should be personalized — mention the user's specific skills or experience where relevant.
- Only return valid JSON, nothing else.`;
}


// ================================
// HELPERS
// ================================

/**
 * Sanitizes a job object to ensure all required fields exist.
 */
function sanitizeJob(job) {
  return {
    title: (job.title || "").toString().trim(),
    company: (job.company || "").toString().trim(),
    location: (job.location || "Not specified").toString().trim(),
    description: (job.description || "No description available.").toString().trim(),
    whyMatch: (job.whyMatch || "").toString().trim(),
    skills: (job.skills || "").toString().trim(),
    applyLink: (job.applyLink || "#").toString().trim(),
    matchScore: (job.matchScore || "5/10").toString().trim()
  };
}


/**
 * If Gemini fails, format the raw SerpApi jobs into the expected output format.
 * This is a basic fallback that doesn't do AI ranking.
 */
function formatRawJobsAsFallback(rawJobs, userPrefs) {
  return rawJobs.slice(0, 10).map(job => {
    // Try to find an apply link
    let applyLink = "#";
    if (job.apply_options && job.apply_options.length > 0) {
      applyLink = job.apply_options[0].link || "#";
    }

    // Try to extract skills from job highlights
    let skills = "";
    if (job.job_highlights && Array.isArray(job.job_highlights)) {
      const qualifications = job.job_highlights.find(h =>
        h.title && h.title.toLowerCase().includes("qualif")
      );
      if (qualifications && qualifications.items) {
        skills = qualifications.items.slice(0, 5).join(", ");
      }
    }

    // Truncate description
    let description = job.description || "No description available.";
    if (description.length > 250) {
      description = description.substring(0, 247) + "...";
    }

    return {
      title: job.title || "Untitled Position",
      company: job.company_name || "Unknown Company",
      location: job.location || "Not specified",
      description: description,
      whyMatch: `This job is in the ${userPrefs.category} field and may match your skills.`,
      skills: skills || userPrefs.skills || "Not specified",
      applyLink: applyLink,
      matchScore: "6.0/10"
    };
  });
}


/**
 * Builds a CORS-enabled JSON response.
 * Google Apps Script Web Apps handle CORS automatically,
 * but we set the content type explicitly.
 */
function buildCorsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
