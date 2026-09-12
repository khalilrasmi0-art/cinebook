import QRCode from "qrcode";

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 280,
      color: {
        dark: "#0f172a", // slate-900
        light: "#ffffff",
      },
    });
    return dataUrl;
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return "";
  }
}
