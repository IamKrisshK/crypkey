// CrypKey key generation logic
export async function deriveKEK(password, saltBase64) {
  const enc = new TextEncoder();
  const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function generateUEK() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function wrapUEK(uek, kek) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const rawUEK = await crypto.subtle.exportKey("raw", uek);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, kek, rawUEK);
  return { wrappedUEK: btoa(String.fromCharCode(...new Uint8Array(encrypted))), 
    ivBase64: btoa(String.fromCharCode(...iv)), };
}

export async function unwrapUEK(wrappedBase64, ivBase64, kek) {
  const wrapped = Uint8Array.from(atob(wrappedBase64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, kek, wrapped);
  return crypto.subtle.importKey("raw", decrypted, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
}
