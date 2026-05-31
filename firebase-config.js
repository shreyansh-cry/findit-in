/* ===== FINDIT — Firebase Configuration & Auth ===== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHC9KAhCcIxkH88DF_BSqRxy3dtk6qaPI",
  authDomain: "findit-891cc.firebaseapp.com",
  projectId: "findit-891cc",
  storageBucket: "findit-891cc.firebasestorage.app",
  messagingSenderId: "158252050458",
  appId: "1:158252050458:web:e319135595dc9ddb3009a3",
  measurementId: "G-TPGZVKFRR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ================================
// GOOGLE SIGN-IN
// ================================
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Store user data in localStorage
    const userData = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('findit_user', JSON.stringify(userData));

    return { success: true, user: userData };
  } catch (error) {
    console.error('Google Sign-In Error:', error);

    let message = 'Something went wrong. Please try again.';
    if (error.code === 'auth/popup-closed-by-user') {
      message = 'Sign-in cancelled. You closed the popup.';
    } else if (error.code === 'auth/popup-blocked') {
      message = 'Popup was blocked by your browser. Please allow popups.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Please check your internet connection.';
    }

    return { success: false, error: message };
  }
}

// ================================
// SIGN OUT
// ================================
export async function logoutUser() {
  try {
    await signOut(auth);
    localStorage.removeItem('findit_user');
    localStorage.removeItem('findit_preferences');
    console.log('✅ Logout successful — session cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Logout Error:', error);
    return { success: false, error: error.message };
  }
}

// ================================
// GET CURRENT USER FROM LOCALSTORAGE
// ================================
export function getCurrentUser() {
  const data = localStorage.getItem('findit_user');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

// ================================
// CHECK IF LOGGED IN
// ================================
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

// ================================
// AUTH STATE LISTENER
// ================================
export function onAuthChange(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('findit_user', JSON.stringify(userData));
      callback(userData);
    } else {
      localStorage.removeItem('findit_user');
      callback(null);
    }
  });
}

// ================================
// UPDATE NAVBAR WITH USER STATE
// ================================
export function updateNavbarAuth() {
  const user = getCurrentUser();
  const navActions = document.querySelector('.navbar-actions');
  if (!navActions) return;

  if (user) {
    // Get initials from name
    const initials = user.displayName
      ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : user.email[0].toUpperCase();

    const firstName = user.displayName
      ? user.displayName.split(' ')[0]
      : user.email.split('@')[0];

    navActions.innerHTML = `
      <span class="nav-user-greeting" style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">
        Hi, ${firstName}
      </span>
      <div class="nav-user-menu" id="userMenuTrigger" style="position: relative;">
        ${user.photoURL
          ? `<img src="${user.photoURL}" alt="${user.displayName}" class="nav-user-avatar" id="userAvatar" referrerpolicy="no-referrer">`
          : `<div class="nav-user-avatar-fallback" id="userAvatar">${initials}</div>`
        }
        <div class="nav-user-dropdown" id="userDropdown">
          <div class="dropdown-user-info">
            ${user.photoURL
              ? `<img src="${user.photoURL}" alt="${user.displayName}" class="dropdown-avatar" referrerpolicy="no-referrer">`
              : `<div class="dropdown-avatar-fallback">${initials}</div>`
            }
            <div>
              <div class="dropdown-name">${user.displayName || 'User'}</div>
              <div class="dropdown-email">${user.email}</div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <a href="preferences.html" class="dropdown-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Preferences
          </a>
          <a href="results.html" class="dropdown-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            My Matches
          </a>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item dropdown-logout" id="logoutBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>
    `;

    // Toggle dropdown
    const avatar = document.getElementById('userAvatar');
    const dropdown = document.getElementById('userDropdown');
    if (avatar && dropdown) {
      avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
      document.addEventListener('click', () => {
        dropdown.classList.remove('active');
      });
      dropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    // Logout handler
    const logoutBtnEl = document.getElementById('logoutBtn');
    if (logoutBtnEl) {
      logoutBtnEl.addEventListener('click', async () => {
        const result = await logoutUser();
        if (result.success) {
          window.location.href = 'index.html';
        }
      });
    }
  }
  // If not logged in, leave the default nav actions (Sign In / Get Started)
}

// ================================
// FIRESTORE — SAVE USER PROFILE
// ================================
export async function saveUserProfile(profileData) {
  const user = getCurrentUser();
  if (!user || !user.uid) {
    return { success: false, error: 'User not logged in.' };
  }

  try {
    const userRef = doc(db, 'users', user.uid);

    // Check if document already exists to set createdAt only once
    const existingDoc = await getDoc(userRef);
    const isNew = !existingDoc.exists();

    const dataToSave = {
      uid: user.uid,
      fullName: profileData.fullName || '',
      email: profileData.email || user.email || '',
      college: profileData.college || '',
      yearOfStudy: profileData.yearOfStudy || '',
      location: profileData.location || '',
      preferredJobStream: profileData.jobStream || '',
      skills: profileData.skills || [],
      qualificationExperience: profileData.qualification || '',
      portfolioLink: profileData.portfolioLink || '',
      linkedinProfile: profileData.linkedinLink || '',
      preferredWorkType: profileData.workType || '',
      expectedPay: profileData.stipend || '',
      resumeFileName: profileData.resumeFileName || null,
      updatedAt: serverTimestamp()
    };

    // Only set createdAt on first save
    if (isNew) {
      dataToSave.createdAt = serverTimestamp();
    }

    await setDoc(userRef, dataToSave, { merge: true });

    console.log(`✅ Firestore: User profile saved successfully — UID: ${user.uid}, Path: users/${user.uid}`);
    console.log('📄 Data saved:', dataToSave);

    return { success: true };
  } catch (error) {
    console.error('❌ Firestore Save Error:', error);
    console.error('Error code:', error.code || 'N/A');
    console.error('Error message:', error.message);
    return { success: false, error: error.message };
  }
}

// ================================
// FIRESTORE — GET USER PROFILE
// ================================
export async function getUserProfile() {
  const user = getCurrentUser();
  if (!user || !user.uid) return null;

  try {
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error('Firestore Read Error:', error);
    return null;
  }
}
// ================================
// FIRESTORE — SAVE JOB RESULTS
// ================================
export async function saveJobResults(uid, jobs) {
  try {
    const jobsRef = doc(db, 'jobs', uid);
    await setDoc(jobsRef, {
      listings: jobs,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Jobs saved to Firestore successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving jobs:', error);
    return { success: false, error: error.message };
  }
}

// ================================
// FIRESTORE — GET JOB RESULTS
// ================================
export async function getJobResults(uid) {
  try {
    const jobsRef = doc(db, 'jobs', uid);
    const snapshot = await getDoc(jobsRef);
    if (snapshot.exists()) {
      return snapshot.data().listings || [];
    }
    return [];
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    return [];
  }
}