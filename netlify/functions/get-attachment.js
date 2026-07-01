const OWNER = "jakub-kaspar";
const REPO  = "poly-web-cms";

const MIME = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  gif: "image/gif",  webp: "image/webp", svg: "image/svg+xml",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  dwg: "application/acad", dxf: "application/dxf",
};

exports.handler = async (event) => {
  const { id, file } = event.queryStringParameters || {};
  if (!id || !file) {
    return { statusCode: 400, body: "Missing id or file" };
  }

  const safeName = file.replace(/[/\\]/g, "_");
  const path = `offers/attachments/${id}/${safeName}`;

  const resp = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.raw+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!resp.ok) {
    return { statusCode: resp.status, body: `File not found: ${safeName}` };
  }

  const buffer = await resp.arrayBuffer();
  const ext = safeName.split(".").pop().toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${safeName}"`,
      "Cache-Control": "private, max-age=3600",
    },
    body: Buffer.from(buffer).toString("base64"),
    isBase64Encoded: true,
  };
};
