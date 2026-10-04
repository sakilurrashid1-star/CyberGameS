/**
 * AvatarPicker.js
 * Preset cyberpunk avatars and custom photo upload handling.
 */

export const PRESET_AVATARS = [
  {
    id: 'avatar-1',
    name: 'Cipher',
    emoji: '🔐',
    color: '#67e8f9'
  },
  {
    id: 'avatar-2',
    name: 'Nexus',
    emoji: '🌐',
    color: '#6ee7b7'
  },
  {
    id: 'avatar-3',
    name: 'Ghost',
    emoji: '👻',
    color: '#a78bfa'
  },
  {
    id: 'avatar-4',
    name: 'Phantom',
    emoji: '🛡️',
    color: '#fbbf24'
  },
  {
    id: 'avatar-5',
    name: 'Vortex',
    emoji: '⚡',
    color: '#ff5c72'
  },
  {
    id: 'avatar-6',
    name: 'Echo',
    emoji: '🎯',
    color: '#f59e0b'
  },
  {
    id: 'avatar-7',
    name: 'Apex',
    emoji: '🚀',
    color: '#8b5cf6'
  },
  {
    id: 'avatar-8',
    name: 'Pixel',
    emoji: '🖥️',
    color: '#ec4899'
  }
];

/**
 * Convert image file to base64 string with compression.
 * @param {File} file - The image file
 * @returns {Promise<String>} Base64 encoded image string
 */
export function compressAndEncodeImage(file) {
  return new Promise((resolve, reject) => {
    // Validate file
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid file type. Please select an image.'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File too large. Maximum 5MB.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Target size: 256x256 (reasonable for avatar)
        const size = 256;
        canvas.width = size;
        canvas.height = size;

        // Draw and compress
        ctx.drawImage(img, 0, 0, size, size);
        const compressed = canvas.toDataURL('image/jpeg', 0.7); // 70% quality

        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Draw a circular avatar preview on a canvas.
 * @param {HTMLCanvasElement} canvas - The target canvas
 * @param {String} avatarData - Base64 image or preset avatar ID
 */
export function drawAvatarPreview(canvas, avatarData) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  const radius = size / 2 - 2;

  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  // Draw circular border
  ctx.strokeStyle = '#67e8f9';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Check if it's a preset avatar
  const preset = PRESET_AVATARS.find((a) => a.id === avatarData);

  if (preset) {
    // Draw emoji-based avatar
    ctx.fillStyle = preset.color;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(center, center, radius - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.font = `bold 60px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(preset.emoji, center, center);
  } else if (avatarData && avatarData.startsWith('data:image')) {
    // Draw uploaded image
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius - 3, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 2, 2, size - 4, size - 4);
      ctx.restore();
    };
    img.src = avatarData;
  } else {
    // Default placeholder
    ctx.fillStyle = '#67e8f9';
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(center, center, radius - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.font = `bold 40px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#67e8f9';
    ctx.fillText('?', center, center);
  }
}
