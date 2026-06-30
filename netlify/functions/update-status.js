const OWNER = "jakub-kaspar";
const REPO  = "poly-web-cms";
const VALID_STATUSES = ["new", "in-progress", "rejected", "done"];

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
    const { id, status } = JSON.parse(event.body);
    if (!id || !VALID_STATUSES.includes(status)) {
      return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Invalid id or status" }) };
    }

    const file = await ghGet(`offers/${id}.json`);
    const meta = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
    meta.status = status;

    const resp = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/offers/${id}.json`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: `Stav nabídky ${id}: ${status}`,
        content: Buffer.from(JSON.stringify(meta, null, 2)).toString("base64"),
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
    console.error("update-status error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
