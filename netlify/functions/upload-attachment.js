const OWNER = "jakub-kaspar";
const REPO  = "poly-web-cms";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { id, filename, data } = JSON.parse(event.body);
    if (!id || !filename || !data) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing id, filename or data" }) };
    }

    // Sanitise filename — strip path separators
    const safeName = filename.replace(/[/\\]/g, "_");
    const path = `offers/attachments/${id}/${safeName}`;

    const resp = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          message: `Příloha: ${safeName} (${id})`,
          content: data, // already base64 from browser FileReader
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`GitHub API error ${resp.status}: ${err}`);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        name: safeName,
        url: `/.netlify/functions/get-attachment?id=${encodeURIComponent(id)}&file=${encodeURIComponent(safeName)}`,
      }),
    };
  } catch (err) {
    console.error("upload-attachment error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
