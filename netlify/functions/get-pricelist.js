const OWNER = "jakub-kaspar";
const REPO  = "poly-web-cms";
const PATH  = "_data/konfigurator_prices.json";

exports.handler = async () => {
  try {
    const resp = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!resp.ok) throw new Error(`GitHub GET ${PATH} → ${resp.status}`);
    const file = await resp.json();
    const prices = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
      body: JSON.stringify(prices),
    };
  } catch (err) {
    console.error("get-pricelist error:", err);
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: err.message }) };
  }
};
