// js/codec.js — Encode/decode character data as base64url strings
'use strict';

/**
 * Encode data to a prefixed base64url string.
 * @param {'c'|'r'} scope - 'c' for single character, 'r' for roster
 * @param {object} data - The character state or roster object
 * @returns {string} prefixed base64url string
 */
function encodeShareString(scope, data) {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  const b64 = uint8ToBase64url(bytes);
  return scope + b64;
}

/**
 * Decode a prefixed base64url string back to scope + data.
 * @param {string} str - The encoded string (with scope prefix)
 * @returns {{scope: string, data: object}}
 */
function decodeShareString(str) {
  if (!str || str.length < 2) throw new Error('Invalid share string');
  const scope = str[0];
  if (scope !== 'c' && scope !== 'r') throw new Error('Invalid scope prefix');
  const b64 = str.slice(1);
  const bytes = base64urlToUint8(b64);
  const json = new TextDecoder().decode(bytes);
  return { scope, data: JSON.parse(json) };
}

function uint8ToBase64url(uint8) {
  let binary = '';
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToUint8(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
