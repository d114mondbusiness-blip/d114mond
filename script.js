const GAME_PASS_ID = "1847230870";

const showOfferButton = document.querySelector("#showOffer");
const offer = document.querySelector("#offer");
const verifyForm = document.querySelector("#verifyForm");
const usernameInput = document.querySelector("#robloxUsername");
const verifyMessage = document.querySelector("#verifyMessage");
const premiumContent = document.querySelector("#premiumContent");
const lockedPreview = document.querySelector("#lockedPreview");

showOfferButton.addEventListener("click", () => {
  offer.classList.remove("hidden");
  offer.scrollIntoView({ behavior: "smooth", block: "start" });
});

verifyForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  if (!username) {
    setMessage("Enter your Roblox username first.", "error");
    return;
  }

  setMessage("Checking your purchase on Roblox...", "");

  try {
    const userId = await getRobloxUserId(username);
    const ownsPass = await checkGamePassOwnership(userId);

    if (!ownsPass) {
      setMessage("Purchase not found for this Roblox account yet.", "error");
      return;
    }

    localStorage.setItem("d114mondPassVerified", "true");
    unlockPremium();
    setMessage("Purchase verified. Steps unlocked.", "success");
  } catch (error) {
    setMessage(error.message || "Could not verify purchase right now.", "error");
  }
});

document.querySelectorAll(".result-card img").forEach((image) => {
  image.addEventListener("error", () => {
    image.closest(".result-card").classList.add("missing");
    image.replaceWith(createMissingImageNotice(image.alt));
  });
});

if (localStorage.getItem("d114mondPassVerified") === "true") {
  unlockPremium(false);
}

function unlockPremium(shouldScroll = true) {
  premiumContent.classList.remove("hidden");
  lockedPreview.classList.add("hidden");

  if (shouldScroll) {
    premiumContent.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setMessage(message, type) {
  verifyMessage.textContent = message;
  verifyMessage.className = `verify-message ${type}`.trim();
}

function createMissingImageNotice(label) {
  const notice = document.createElement("div");
  notice.className = "missing-image";
  notice.textContent = `${label} image file missing`;
  return notice;
}

async function getRobloxUserId(username) {
  const response = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usernames: [username],
      excludeBannedUsers: true,
    }),
  });

  if (!response.ok) {
    throw new Error("Roblox username lookup failed. Try again later.");
  }

  const payload = await response.json();
  const user = payload.data && payload.data[0];

  if (!user) {
    throw new Error("Roblox username not found.");
  }

  return user.id;
}

async function checkGamePassOwnership(userId) {
  const response = await fetch(
    `https://inventory.roblox.com/v1/users/${userId}/items/GamePass/${GAME_PASS_ID}/is-owned`
  );

  if (!response.ok) {
    throw new Error("Roblox purchase check failed. Try again later.");
  }

  return response.json();
}
