const OWNER = "jakub-kaspar";
const REPO  = "poly-web-cms";
const PATH  = "_data/konfigurator_prices.json";

async function ghGet(path) {
  const resp = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!resp.ok) throw new Error(`GitHub GET ${path} → ${resp.status}`);
  return resp.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { prices } = JSON.parse(event.body);
    if (!prices || typeof prices !== "object") {
      return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Missing prices" }) };
    }

    const file = await ghGet(PATH);

    const resp = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: `Ceník konfigurátoru: verze ${prices.version || "?"}`,
        content: Buffer.from(JSON.stringify(prices, null, 2)).toString("base64"),
        sha: file.sha,
      }),
    });

    if (!resp.ok) throw new Error(`GitHub PUT → ${resp.status}: ${await resp.text()}`);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("save-pricelist error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
