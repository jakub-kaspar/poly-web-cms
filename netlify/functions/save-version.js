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

async function ghPut(path, content, message, sha) {
  const body = { message, content: Buffer.from(content).toString("base64") };
  if (sha) body.sha = sha;
  const resp = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`GitHub PUT ${path} → ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { id, state, offerVersion } = JSON.parse(event.body);
    if (!id || !state) return { statusCode: 400, body: JSON.stringify({ error: "Missing id or state" }) };

    const [metaFile, stateFile] = await Promise.all([
      ghGet(`offers/${id}.json`),
      ghGet(`offers/${id}-state.json`),
    ]);

    const meta = JSON.parse(Buffer.from(metaFile.content, "base64").toString("utf-8"));
    meta.offer_version = offerVersion;

    const commitMsg = `Nabídka ${id}: verze ${offerVersion}`;

    await Promise.all([
      ghPut(`offers/${id}.json`,       JSON.stringify(meta, null, 2),                                  commitMsg, metaFile.sha),
      ghPut(`offers/${id}-state.json`, JSON.stringify({ version: offerVersion, state }, null, 2), commitMsg, stateFile.sha),
    ]);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("save-version error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
