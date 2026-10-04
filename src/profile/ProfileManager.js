/**
 * ProfileManager.js
 * Handles all operator profile creation, persistence, switching, and analytics.
 * Stores profiles in localStorage under 'cybergame-profiles-v1' key.
 */

import { generateOperatorIDToken } from './TokenGenerator.js';

export class ProfileManager {
  constructor() {
    this.profiles = new Map();
    this.activeProfileId = null;
    this.storageKey = 'cybergame-profiles-v1';
    this.activeProfileKey = 'cybergame-active-profile';
    this.loadProfiles();
  }

  /**
   * Load all profiles from localStorage.
   */
  loadProfiles() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([id, profile]) => {
          this.profiles.set(id, profile);
        });
      }
    } catch (error) {
      console.warn('Failed to load profiles from localStorage:', error);
    }

    try {
      this.activeProfileId = localStorage.getItem(this.activeProfileKey);
    } catch (error) {
      console.warn('Failed to load active profile ID:', error);
    }
  }

  /**
   * Save all profiles to localStorage.
   */
  saveProfiles() {
    try {
      const data = Object.fromEntries(this.profiles);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save profiles:', error);
      throw new Error('Storage quota exceeded or localStorage unavailable');
    }
  }

  /**
   * Set the active profile ID in localStorage.
   */
  setActiveProfile(profileId) {
    if (!this.profiles.has(profileId)) {
      throw new Error(`Profile ${profileId} not found`);
    }
    this.activeProfileId = profileId;
    try {
      localStorage.setItem(this.activeProfileKey, profileId);
    } catch (error) {
      console.error('Failed to save active profile ID:', error);
    }
  }

  /**
   * Get the currently active profile object.
   * @returns {Object|null} The active profile or null if none is set
   */
  getActiveProfile() {
    if (!this.activeProfileId) return null;
    return this.profiles.get(this.activeProfileId) || null;
  }

  /**
   * Get all profiles.
   * @returns {Map} Map of profile IDs to profile objects
   */
  getAllProfiles() {
    return new Map(this.profiles);
  }

  /**
   * Create a new operator profile.
   * @param {Object} data - Profile data
   * @returns {Object} The created profile
   */
  createProfile(data) {
    const profileId = this.generateUUID();
    const now = Date.now();

    const profile = {
      id: profileId,
      callsign: this.sanitizeCallsign(data.callsign),
      fullName: this.sanitizeText(data.fullName),
      email: this.sanitizeEmail(data.email),
      phoneNumber: this.sanitizePhone(data.phoneNumber),
      roleTitle: this.sanitizeText(data.roleTitle || 'Cadet'),
      clearanceLevel: this.validateClearanceLevel(data.clearanceLevel || 'RESTRICTED'),
      avatar: data.avatar || null, // Base64 image string or preset avatar key
      operatorIDToken: generateOperatorIDToken({
        callsign: data.callsign,
        email: data.email,
        timestamp: now
      }),
      modulesCompleted: [],
      labsCleared: [],
      quizScores: {},
      totalXP: 0,
      credits: 0,
      cveMitigationsCounter: 0,
      accuracyRate: 0,
      createdAt: now,
      lastActiveTimestamp: now,
      skillMatrix: {
        'network-reconnaissance': 0,
        'web-security': 0,
        'malware-analysis': 0,
        'cryptography': 0,
        'incident-response': 0
      }
    };

    this.profiles.set(profileId, profile);
    this.saveProfiles();

    return profile;
  }

  /**
   * Update an existing profile.
   * @param {String} profileId - The profile ID
   * @param {Object} updates - Fields to update
   * @returns {Object} The updated profile
   */
  updateProfile(profileId, updates) {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    if (updates.callsign !== undefined) profile.callsign = this.sanitizeCallsign(updates.callsign);
    if (updates.fullName !== undefined) profile.fullName = this.sanitizeText(updates.fullName);
    if (updates.email !== undefined) profile.email = this.sanitizeEmail(updates.email);
    if (updates.phoneNumber !== undefined) profile.phoneNumber = this.sanitizePhone(updates.phoneNumber);
    if (updates.roleTitle !== undefined) profile.roleTitle = this.sanitizeText(updates.roleTitle);
    if (updates.clearanceLevel !== undefined) profile.clearanceLevel = this.validateClearanceLevel(updates.clearanceLevel);
    if (updates.avatar !== undefined) profile.avatar = updates.avatar;

    profile.lastActiveTimestamp = Date.now();
    this.saveProfiles();

    return profile;
  }

  /**
   * Delete a profile.
   * @param {String} profileId - The profile ID
   */
  deleteProfile(profileId) {
    if (!this.profiles.has(profileId)) {
      throw new Error(`Profile ${profileId} not found`);
    }
    this.profiles.delete(profileId);
    if (this.activeProfileId === profileId) {
      this.activeProfileId = null;
      try {
        localStorage.removeItem(this.activeProfileKey);
      } catch (error) {
        console.error('Failed to clear active profile:', error);
      }
    }
    this.saveProfiles();
  }

  /**
   * Record module completion.
   * @param {String} profileId - The profile ID
   * @param {String} moduleId - The module ID
   * @param {Number} xp - XP earned
   */
  completeModule(profileId, moduleId, xp = 100) {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    if (!profile.modulesCompleted.includes(moduleId)) {
      profile.modulesCompleted.push(moduleId);
      profile.totalXP += xp;
    }
    profile.lastActiveTimestamp = Date.now();
    this.saveProfiles();
  }

  /**
   * Record lab completion.
   * @param {String} profileId - The profile ID
   * @param {String} labId - The lab ID
   */
  clearLab(profileId, labId) {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    if (!profile.labsCleared.includes(labId)) {
      profile.labsCleared.push(labId);
    }
    profile.lastActiveTimestamp = Date.now();
    this.saveProfiles();
  }

  /**
   * Record quiz score.
   * @param {String} profileId - The profile ID
   * @param {String} quizId - The quiz ID
   * @param {Number} score - The score (0-100)
   */
  recordQuizScore(profileId, quizId, score) {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    profile.quizScores[quizId] = score;
    profile.lastActiveTimestamp = Date.now();
    this.saveProfiles();
  }

  /**
   * Award credits.
   * @param {String} profileId - The profile ID
   * @param {Number} amount - Amount to award
   */
  awardCredits(profileId, amount) {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    profile.credits += Math.max(0, amount);
    profile.lastActiveTimestamp = Date.now();
    this.saveProfiles();
  }

  /**
   * Increment CVE mitigation counter.
   * @param {String} profileId - The profile ID
   */
  recordCVEMitigation(profileId) {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    profile.cveMitigationsCounter += 1;
    profile.lastActiveTimestamp = Date.now();
    this.saveProfiles();
  }

  /**
   * Update accuracy rate.
   * @param {String} profileId - The profile ID
   * @param {Number} accuracy - Accuracy percentage (0-100)
   */
  updateAccuracy(profileId, accuracy) {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    profile.accuracyRate = Math.min(100, Math.max(0, accuracy));
    profile.lastActiveTimestamp = Date.now();
    this.saveProfiles();
  }

  /**
   * Update skill matrix for a specific domain.
   * @param {String} profileId - The profile ID
   * @param {String} skillKey - The skill key (e.g., 'network-reconnaissance')
   * @param {Number} points - Points to add
   */
  addSkillPoints(profileId, skillKey, points) {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    if (!profile.skillMatrix.hasOwnProperty(skillKey)) {
      console.warn(`Unknown skill key: ${skillKey}`);
      return;
    }

    profile.skillMatrix[skillKey] = Math.min(100, profile.skillMatrix[skillKey] + points);
    profile.lastActiveTimestamp = Date.now();
    this.saveProfiles();
  }

  /**
   * Export a profile as JSON.
   * @param {String} profileId - The profile ID
   * @returns {String} JSON string
   */
  exportProfile(profileId) {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);
    return JSON.stringify(profile, null, 2);
  }

  /**
   * Import a profile from JSON.
   * @param {String} jsonData - JSON string
   * @returns {Object} The imported profile
   */
  importProfile(jsonData) {
    try {
      const profile = JSON.parse(jsonData);
      if (!profile.id || !profile.callsign) {
        throw new Error('Invalid profile data');
      }
      this.profiles.set(profile.id, profile);
      this.saveProfiles();
      return profile;
    } catch (error) {
      throw new Error(`Failed to import profile: ${error.message}`);
    }
  }

  /**
   * Get profile statistics for analytics.
   * @param {String} profileId - The profile ID
   * @returns {Object} Statistics object
   */
  getProfileStats(profileId) {
    const profile = this.profiles.get(profileId);
    if (!profile) return null;

    return {
      modulesCount: profile.modulesCompleted.length,
      labsCount: profile.labsCleared.length,
      quizzesCount: Object.keys(profile.quizScores).length,
      averageQuizScore: this.calculateAverageQuizScore(profile),
      totalXP: profile.totalXP,
      credits: profile.credits,
      accuracyRate: profile.accuracyRate,
      skillMatrix: profile.skillMatrix,
      accountAgeHours: Math.floor((Date.now() - profile.createdAt) / 3600000)
    };
  }

  /**
   * Calculate average quiz score from profile.
   * @private
   */
  calculateAverageQuizScore(profile) {
    const scores = Object.values(profile.quizScores);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  /**
   * Sanitize callsign input.
   * @private
   */
  sanitizeCallsign(callsign) {
    if (!callsign || typeof callsign !== 'string') return '';
    return callsign.trim().substring(0, 16).replace(/[^a-zA-Z0-9_-]/g, '');
  }

  /**
   * Sanitize general text input.
   * @private
   */
  sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text.trim().substring(0, 128).replace(/[<>"']/g, '');
  }

  /**
   * Sanitize and validate email.
   * @private
   */
  sanitizeEmail(email) {
    if (!email || typeof email !== 'string') return '';
    email = email.trim().toLowerCase().substring(0, 128);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : '';
  }

  /**
   * Sanitize and format phone number.
   * @private
   */
  sanitizePhone(phone) {
    if (!phone || typeof phone !== 'string') return '';
    return phone.replace(/[^0-9+\-()\s]/g, '').substring(0, 20).trim();
  }

  /**
   * Validate clearance level.
   * @private
   */
  validateClearanceLevel(level) {
    const valid = ['RESTRICTED', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET'];
    return valid.includes(level) ? level : 'RESTRICTED';
  }

  /**
   * Generate a UUID v4.
   * @private
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
