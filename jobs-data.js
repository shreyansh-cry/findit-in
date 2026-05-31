// FALLBACK DATA — used when no real jobs are fetched from Firestore yet
/* ===== FINDIT — Jobs Data (Google Sheets Schema) ===== */
/* 
 * This file contains sample job data matching the Google Sheets
 * automation output schema.
 *
 * In production, this data will come from:
 *   - Google Sheets API (via Make/Zapier automation)
 *   - Or Firebase Firestore (synced from Sheets)
 *
 * To connect to a Google Sheets API or Firestore later,
 * replace SAMPLE_JOBS with your fetched data array.
 *
 * Schema matches these Google Sheets columns:
 *   uid | jobTitle | source | snippet | link | platformSource |
 *   salaryOrStipend | experienceRequired | postedBy | matchScore | createdAt
 */

const SAMPLE_JOBS = [
  {
    uid: "job_001",
    jobTitle: "Video Editor for YouTube Channel — 500K+ Subs",
    source: "LinkedIn Jobs",
    snippet: "Looking for a creative video editor to join our YouTube content team. You'll be editing vlogs, tutorials, and short-form content. Must know Premiere Pro or DaVinci Resolve. Immediate joining.",
    link: "https://linkedin.com/jobs/view/123456",
    platformSource: "LinkedIn",
    salaryOrStipend: "₹15,000 – ₹25,000/month",
    experienceRequired: "0–1 years",
    postedBy: "Arjun Mehta",
    matchScore: 94,
    createdAt: "2026-05-28"
  },
  {
    uid: "job_002",
    jobTitle: "Social Media Manager — D2C Fashion Brand",
    source: "Instagram DM Outreach",
    snippet: "Manage social media accounts for a growing D2C fashion brand. Plan content calendars, create engaging posts, run paid campaigns, and track analytics across Instagram and Pinterest.",
    link: "https://instagram.com/p/sample123",
    platformSource: "Instagram",
    salaryOrStipend: "₹20,000 – ₹35,000/month",
    experienceRequired: "1–2 years",
    postedBy: "Priya Sharma",
    matchScore: 87,
    createdAt: "2026-05-26"
  },
  {
    uid: "job_003",
    jobTitle: "Frontend Developer — React.js / Next.js",
    source: "LinkedIn Jobs",
    snippet: "Join our engineering team to build modern web applications using React.js, Next.js, and TypeScript. You'll work on user-facing features for our SaaS platform serving 10K+ businesses.",
    link: "https://linkedin.com/jobs/view/789012",
    platformSource: "LinkedIn",
    salaryOrStipend: "₹30,000 – ₹50,000/month",
    experienceRequired: "1–2 years",
    postedBy: "Karan Patel",
    matchScore: 91,
    createdAt: "2026-05-28"
  },
  {
    uid: "job_004",
    jobTitle: "UI/UX Design Intern — Mobile App Project",
    source: "Internshala",
    snippet: "3-month design internship working on a mobile app for an edtech startup. You'll create wireframes, prototypes, and final UI designs in Figma. Certificate and PPO available.",
    link: "https://internshala.com/internship/detail/abc456",
    platformSource: "Internshala",
    salaryOrStipend: "₹8,000 – ₹12,000/month",
    experienceRequired: "Fresher",
    postedBy: "Not extracted",
    matchScore: 78,
    createdAt: "2026-05-25"
  },
  {
    uid: "job_005",
    jobTitle: "Freelance Thumbnail Designer for Gaming Channel",
    source: "Discord Server",
    snippet: "Need a thumbnail designer for a gaming YouTube channel. Must create eye-catching, clickable thumbnails. 10–15 thumbnails per month. Portfolio required.",
    link: "https://discord.com/channels/sample789",
    platformSource: "Discord",
    salaryOrStipend: "Not extracted",
    experienceRequired: "Not extracted",
    postedBy: "GamingBro Community",
    matchScore: 72,
    createdAt: "2026-05-27"
  },
  {
    uid: "job_006",
    jobTitle: "Content Writer — Tech & SaaS Blog",
    source: "Twitter/X Post",
    snippet: "Hiring a content writer for our B2B SaaS blog. 4-6 articles per month, SEO-optimized, 1500+ words each. Topics include AI, productivity, and remote work.",
    link: "https://x.com/techfoundr/status/123456789",
    platformSource: "Twitter/X",
    salaryOrStipend: "₹10,000 – ₹18,000/month",
    experienceRequired: "0–1 years",
    postedBy: "Rahul Verma",
    matchScore: 68,
    createdAt: "2026-05-24"
  },
  {
    uid: "job_007",
    jobTitle: "Data Analytics Intern — Remote",
    source: "LinkedIn Jobs",
    snippet: "Looking for a data analytics intern to help with dashboard creation, data cleaning, and reporting. Tools: Excel, Google Sheets, SQL basics. Flexible hours.",
    link: "https://linkedin.com/jobs/view/345678",
    platformSource: "LinkedIn",
    salaryOrStipend: "₹5,000 – ₹10,000/month",
    experienceRequired: "Fresher",
    postedBy: "Sneha Reddy",
    matchScore: 85,
    createdAt: "2026-05-28"
  },
  {
    uid: "job_008",
    jobTitle: "Part-time Math Tutor for O Levels (Online)",
    source: "WhatsApp Group",
    snippet: "Online math tutor needed for IGCSE/O-Level students. 2 hours per day, 5 days a week. Teaching experience preferred but not mandatory.",
    link: "https://wa.me/919876543210",
    platformSource: "WhatsApp",
    salaryOrStipend: "Not extracted",
    experienceRequired: "Not extracted",
    postedBy: "Not extracted",
    matchScore: 65,
    createdAt: "2026-05-23"
  },
  {
    uid: "job_009",
    jobTitle: "Graphic Designer — Branding & Social Media Posts",
    source: "Freelancer.com",
    snippet: "Need a graphic designer for brand identity work: logo refinement, social media templates, pitch deck design. Ongoing work for 2–3 months.",
    link: "https://freelancer.com/projects/graphic-design/sample",
    platformSource: "Freelancer",
    salaryOrStipend: "₹15,000 – ₹25,000 (project-based)",
    experienceRequired: "1–2 years",
    postedBy: "Amit Desai",
    matchScore: 80,
    createdAt: "2026-05-26"
  },
  {
    uid: "job_010",
    jobTitle: "Digital Marketing Executive — Performance Ads",
    source: "Naukri.com",
    snippet: "Run Google Ads and Meta Ads campaigns for an ecommerce company. Must have experience with ad budgets of ₹50K+ per month. ROAS-focused role.",
    link: "https://naukri.com/job-listings/sample456",
    platformSource: "Naukri",
    salaryOrStipend: "₹25,000 – ₹40,000/month",
    experienceRequired: "2–3 years",
    postedBy: "HR Team",
    matchScore: 76,
    createdAt: "2026-05-22"
  },
  {
    uid: "job_011",
    jobTitle: "Stock Market Research Intern",
    source: "Telegram Channel",
    snippet: "Join our fintech startup as a research intern. You'll analyze market trends, prepare daily reports, and assist with investment strategy. Stipend + performance bonus.",
    link: "https://t.me/fintech_jobs/1234",
    platformSource: "Telegram",
    salaryOrStipend: "₹8,000 – ₹15,000/month",
    experienceRequired: "Not extracted",
    postedBy: "FinAlpha Team",
    matchScore: 71,
    createdAt: "2026-05-27"
  },
  {
    uid: "job_012",
    jobTitle: "WordPress Developer — E-commerce Site",
    source: "Upwork",
    snippet: "Build a WooCommerce-based e-commerce site with payment gateway integration, product pages, and a responsive theme. Fixed-price project.",
    link: "https://upwork.com/jobs/~sample789",
    platformSource: "Upwork",
    salaryOrStipend: "₹20,000 – ₹35,000 (project-based)",
    experienceRequired: "1–3 years",
    postedBy: "Not extracted",
    matchScore: 82,
    createdAt: "2026-05-28"
  }
];


// ================================
// FILTER OPTIONS
// ================================
const FILTER_OPTIONS = {
  platforms: [
    { value: 'all', label: 'All Platforms' },
    { value: 'LinkedIn', label: '💼 LinkedIn' },
    { value: 'Instagram', label: '📸 Instagram' },
    { value: 'Discord', label: '🎮 Discord' },
    { value: 'Twitter/X', label: '🐦 Twitter/X' },
    { value: 'WhatsApp', label: '📱 WhatsApp' },
    { value: 'Telegram', label: '✈️ Telegram' },
    { value: 'Internshala', label: '🎓 Internshala' },
    { value: 'Naukri', label: '📋 Naukri' },
    { value: 'Freelancer', label: '🌐 Freelancer' },
    { value: 'Upwork', label: '💚 Upwork' }
  ],

  matchScores: [
    { value: 'all', label: 'All Scores' },
    { value: '90', label: '90%+ Excellent' },
    { value: '80', label: '80%+ Great' },
    { value: '70', label: '70%+ Good' },
    { value: '60', label: '60%+ Fair' }
  ]
};


// ================================
// HELPER FUNCTIONS
// ================================

// Check if a field value is missing or "Not extracted"
function isFieldMissing(value) {
  if (!value) return true;
  const v = value.toString().trim().toLowerCase();
  return v === '' || v === 'not extracted' || v === 'n/a' || v === 'null' || v === 'undefined';
}

// Display salary honestly
function displaySalary(salaryOrStipend) {
  if (isFieldMissing(salaryOrStipend)) {
    return 'Not mentioned';
  }
  return salaryOrStipend;
}

// Display experience honestly
function displayExperience(experienceRequired) {
  if (isFieldMissing(experienceRequired)) {
    return 'Not mentioned';
  }
  return experienceRequired;
}

// Display postedBy honestly
function displayPostedBy(postedBy) {
  if (isFieldMissing(postedBy)) {
    return 'Not clear';
  }
  return postedBy;
}

// Get match score class for color-coding
function getMatchScoreClass(score) {
  const s = parseInt(score) || 0;
  if (s >= 90) return 'excellent';
  if (s >= 80) return 'great';
  if (s >= 70) return 'good';
  return 'fair';
}

// Get match score label
function getMatchScoreLabel(score) {
  const s = parseInt(score) || 0;
  if (s >= 90) return 'Excellent match';
  if (s >= 80) return 'Great match';
  if (s >= 70) return 'Good match';
  if (s >= 60) return 'Possible match';
  return 'Possible match';
}

// Get platform icon
function getPlatformIcon(platform) {
  const icons = {
    'LinkedIn': '💼',
    'Instagram': '📸',
    'Discord': '🎮',
    'Twitter/X': '🐦',
    'WhatsApp': '📱',
    'Telegram': '✈️',
    'Internshala': '🎓',
    'Naukri': '📋',
    'Freelancer': '🌐',
    'Upwork': '💚'
  };
  return icons[platform] || '🔗';
}

// Time ago from date string
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const posted = new Date(dateStr);
  const diffMs = now - posted;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
