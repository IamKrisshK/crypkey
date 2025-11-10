import JSZip from "jszip";

// compress File -> Blob
export async function compressFile(file) {
  const zip = new JSZip();
  zip.file(file.name, file);
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  return blob;
}

// generate per-file CEK (AES-GCM)
export async function generateFileKey() {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // exportable (so we can wrap)
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );
}

// encrypt ArrayBuffer/Blob with AES-GCM key
export async function encryptBlobWithKey(blob, cek) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // file IV
  const buffer = await blob.arrayBuffer();
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cek, buffer);

  // Convert IV to base64 safely
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return { cipherBuffer, iv: ivBase64 };
}


// wrap CEK using UEK (UEK is an AES-GCM CryptoKey)
export async function wrapCekWithUek(cekKey, uekKey) {
  // export raw cek and encrypt it with uek (since subtle.wrapKey with AES-GCM is flaky cross-browser)
  const rawCek = await crypto.subtle.exportKey("raw", cekKey); // ArrayBuffer
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrapped = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, uekKey, rawCek);
  return { wrappedBase64: btoa(String.fromCharCode(...new Uint8Array(wrapped))), ivBase64: btoa(String.fromCharCode(...iv)) };
}
