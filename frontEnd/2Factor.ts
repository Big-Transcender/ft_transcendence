const qrcodeButton = document.getElementById("qrcode") as HTMLButtonElement;
const twoFASection = document.getElementById("twoFASection") as HTMLDivElement;
const qrImage = document.getElementById("qrImage") as HTMLImageElement;
const tokenInput = document.getElementById("twoFATokenInput") as HTMLInputElement;
const verify2FAButton = document.getElementById("verify2FAButton") as HTMLButtonElement;
const resultText = document.getElementById("twoFAResultText") as HTMLParagraphElement;

qrcodeButton.addEventListener("click", async () => {
    try {
        const response = await fetch(`${backendUrl}/2fa/setup`, {
            method: "GET",
            credentials: "include",
        });
        const data = await response.json();

        qrImage.src = data.qr;
        twoFASection.style.display = "block";
        resultText.textContent = "";
    } catch (error) {
        console.error("Failed to load 2FA QR code:", error);
        resultText.textContent = "Something went wrong.";
        resultText.style.color = "red";
    }
});

verify2FAButton.addEventListener("click", async () => {
    const token = tokenInput.value.trim();
    if (token.length !== 6) {
        resultText.textContent = "Please enter a 6-digit code.";
        resultText.style.color = "red";
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/2fa/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ token }),
        });
        const result = await response.json();

        if (result.success) {
            resultText.textContent = "✅ 2FA enabled successfully!";
            resultText.style.color = "green";
        } else {
            resultText.textContent = "❌ Invalid code. Please try again.";
            resultText.style.color = "red";
        }
    } catch (err) {
        console.error("Verification failed:", err);
        resultText.textContent = "Error verifying code.";
        resultText.style.color = "red";
    }
});
