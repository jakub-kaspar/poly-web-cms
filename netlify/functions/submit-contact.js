const OWNER = "jakub-kaspar";
const REPO  = "poly-web-cms";

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

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GitHub API error ${resp.status}: ${err}`);
  }
  return resp.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, company, email, phone, subject, message } = JSON.parse(event.body);

    const now   = new Date();
    const pad   = (n) => String(n).padStart(2, "0");
    const stamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const rand  = Math.random().toString(36).slice(2, 6).toUpperCase();
    const id    = `${stamp}-${rand}`;

    const meta = {
      id,
      source:          "contact",
      submitted_at:    now.toISOString(),
      contact_name:    name  || "",
      contact_company: company || "",
      contact_email:   email || "",
      contact_phone:   phone || "",
      contact_subject: subject || "",
      contact_note:    message || "",
      status:          "new",
    };

    await ghPut(
      `offers/${id}.json`,
      JSON.stringify(meta, null, 2),
      `Kontaktní formulář: ${name} <${email}>`
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, id }),
    };
  } catch (err) {
    console.error("submit-contact error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
