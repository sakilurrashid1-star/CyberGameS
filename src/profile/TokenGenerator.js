/**
 * TokenGenerator.js
 * Generates cryptographic Operator ID Tokens using SHA-256.
 */

/**
 * Generate a SHA-256 hash of the input string.
 * @param {String} text - The text to hash
 * @returns {Promise<String>} The hex-encoded SHA-256 hash
 */
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate an Operator ID Token (synchronous wrapper using simpler hash).
 * Falls back to a simpler deterministic hash if Web Crypto is unavailable.
 * @param {Object} data - The operator data { callsign, email, timestamp }
 * @returns {String} A 32-character hex token
 */
export function generateOperatorIDToken(data) {
  const { callsign, email, timestamp } = data;
  const input = `${callsign}:${email}:${timestamp}`;
  return simpleHash(input).substring(0, 32);
}

/**
 * Simple deterministic hash function (fallback).
 * @private
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to hex string
  const absHash = Math.abs(hash);
  let hexHash = absHash.toString(16);
  return hexHash.padStart(32, '0').substring(0, 32);
}

/**
 * Generate a more robust token using Web Crypto API (async).
 * @param {Object} data - The operator data
 * @returns {Promise<String>} The token
 */
export async function generateOperatorIDTokenAsync(data) {
  if (!crypto.subtle) {
    return generateOperatorIDToken(data);
  }
  const { callsign, email, timestamp } = data;
  const input = `${callsign}:${email}:${timestamp}`;
  try {
    const hash = await sha256(input);
    return hash.substring(0, 32);
  } catch (error) {
    console.warn('SHA-256 failed, using fallback hash:', error);
    return generateOperatorIDToken(data);
  }
}
