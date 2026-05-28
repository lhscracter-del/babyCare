// 이미지 크롭 유틸리티

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = url
  })
}

/**
 * 원본 이미지에서 pixelCrop 영역을 잘라 JPEG Blob으로 반환합니다.
 * 출력 크기는 원본 픽셀 그대로(장변 1200px 제한)이며,
 * 서버에서 추가 압축 처리됩니다.
 */
export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)

  // 출력 크기 — 원본 크롭 픽셀 기준, 장변 1200px 이하로 제한
  const maxSide = 1200
  const scale = Math.min(1, maxSide / Math.max(pixelCrop.width, pixelCrop.height))
  const outW = Math.round(pixelCrop.width * scale)
  const outH = Math.round(pixelCrop.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH

  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    outW, outH,
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
  })
}
