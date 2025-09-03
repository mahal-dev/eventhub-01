export async function drawQr(canvas: HTMLCanvasElement, text: string) {
  const QR = await import("qrcode")
  // Render with accessible contrast: dark slate on white
  await QR.toCanvas(canvas, text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 144,
    color: { dark: "#111827", light: "#ffffff" },
  })
}
