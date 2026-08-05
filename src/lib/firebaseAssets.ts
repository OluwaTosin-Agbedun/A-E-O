import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const CHUNK_SIZE = 600000; // ~600KB per chunk to safely stay under Firestore's 1MB limit

/**
 * Saves a base64 string (PDF, image, logo) to Firestore, automatically chunking if > 600KB.
 */
export async function saveAssetToFirestore(assetType: 'pdf' | 'img' | 'logo', id: string, dataUrl: string): Promise<void> {
  if (!id || !dataUrl) return;
  const cleanId = id.replace(/[\/\s#?\[\]]/gi, '_');
  try {
    if (dataUrl.length <= CHUNK_SIZE) {
      await setDoc(doc(db, 'cms', `${assetType}_${cleanId}`), {
        id: cleanId,
        dataUrl,
        chunksCount: 1,
        updatedAt: Date.now()
      });
    } else {
      const totalChunks = Math.ceil(dataUrl.length / CHUNK_SIZE);
      for (let i = 0; i < totalChunks; i++) {
        const chunk = dataUrl.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await setDoc(doc(db, 'cms', `${assetType}_${cleanId}_chunk_${i}`), {
          chunk,
          index: i,
          totalChunks,
          id: cleanId
        });
      }
      await setDoc(doc(db, 'cms', `${assetType}_${cleanId}`), {
        id: cleanId,
        chunksCount: totalChunks,
        updatedAt: Date.now()
      });
    }
  } catch (err) {
    console.error(`Error saving ${assetType} asset for ${cleanId} to Firestore:`, err);
  }
}

/**
 * Loads a chunked or single base64 asset from Firestore.
 */
export async function loadAssetFromFirestore(assetType: 'pdf' | 'img' | 'logo', id: string): Promise<string | null> {
  if (!id) return null;
  const cleanId = id.replace(/[\/\s#?\[\]]/gi, '_');
  try {
    const mainRef = doc(db, 'cms', `${assetType}_${cleanId}`);
    const snap = await getDoc(mainRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    if (data.dataUrl) return data.dataUrl;
    if (data.logo) return data.logo;
    if (data.pdfUrl) return data.pdfUrl;

    if (data.chunksCount && data.chunksCount > 1) {
      const chunkPromises = [];
      for (let i = 0; i < data.chunksCount; i++) {
        chunkPromises.push(getDoc(doc(db, 'cms', `${assetType}_${cleanId}_chunk_${i}`)));
      }
      const chunkSnaps = await Promise.all(chunkPromises);
      let fullStr = '';
      for (const cSnap of chunkSnaps) {
        if (cSnap.exists()) {
          fullStr += cSnap.data().chunk || '';
        }
      }
      return fullStr || null;
    }
  } catch (err) {
    console.warn(`Error loading asset ${assetType}_${cleanId}:`, err);
  }
  return null;
}

/**
 * Sanitizes an array of CMS items before saving to main Firestore array doc.
 * Heavy base64 fields are saved to asset docs and replaced with reference keys.
 */
export async function sanitizeAndSyncItems(docName: string, items: any[]): Promise<void> {
  if (!Array.isArray(items)) return;

  const sanitizedItems = [];
  for (const item of items) {
    if (!item) continue;
    const itemCopy = { ...item };

    // Heavy PDF
    if (itemCopy.pdfUrl && itemCopy.pdfUrl.startsWith('data:')) {
      await saveAssetToFirestore('pdf', itemCopy.id, itemCopy.pdfUrl);
      itemCopy.pdfUrl = `ref:pdf_${itemCopy.id}`;
    }

    // Heavy Image
    if (itemCopy.image && itemCopy.image.startsWith('data:')) {
      await saveAssetToFirestore('img', itemCopy.id, itemCopy.image);
      itemCopy.image = `ref:img_${itemCopy.id}`;
    }

    sanitizedItems.push(itemCopy);
  }

  try {
    await setDoc(doc(db, 'cms', docName), { items: sanitizedItems, updatedAt: Date.now() });
  } catch (err) {
    console.error(`Error syncing ${docName} to Firestore:`, err);
  }
}

/**
 * Compresses an image file before reading to Base64 to keep file size optimal.
 */
export function compressImageFile(file: File, maxWidth = 800, maxHeight = 800, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(mimeType, quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
