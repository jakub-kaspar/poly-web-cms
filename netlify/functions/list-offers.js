const OWNER = "jakub-kaspar";
const REPO  = "poly-web-cms";

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

exports.handler = async () => {
  try {
    let files;
    try {
      files = await ghGet("offers");
    } catch (e) {
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: "[]" };
    }

    const metaFiles = files.filter(
      f => f.type === "file" && f.name.endsWith(".json") && !f.name.endsWith("-state.json") && f.name !== ".gitkeep"
    );

    const offers = await Promise.all(
      metaFiles.map(async (f) => {
        const file = await ghGet(f.path);
        return JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
      })
    );

    offers.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
      body: JSON.stringify(offers),
    };
  } catch (err) {
    console.error("list-offers error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
