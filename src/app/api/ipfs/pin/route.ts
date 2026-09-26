import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const jwt = process.env.IPFS_JWT?.trim();
  const web3Token = process.env.WEB3_STORAGE_TOKEN?.trim();

  if (!jwt && !web3Token) {
    return NextResponse.json(
      {
        error:
          "IPFS is not configured. Set IPFS_JWT (Pinata) or WEB3_STORAGE_TOKEN.",
        status: "Needs configuration",
      },
      { status: 503 },
    );
  }

  try {
    const body = (await req.json()) as {
      name?: string;
      content?: string;
    };
    if (!body.content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 },
      );
    }

    if (jwt) {
      const form = new FormData();
      const blob = new Blob([body.content], { type: "application/octet-stream" });
      form.append("file", blob, body.name || "akiro-upload.txt");
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
          body: form,
        },
      );
      if (!res.ok) {
        const t = await res.text();
        return NextResponse.json(
          { error: `Pinata error ${res.status}`, detail: t.slice(0, 300) },
          { status: 502 },
        );
      }
      const data = (await res.json()) as { IpfsHash?: string };
      if (!data.IpfsHash) {
        return NextResponse.json(
          { error: "Pinata response missing IpfsHash" },
          { status: 502 },
        );
      }
      return NextResponse.json({
        cid: data.IpfsHash,
        claimKind: "Verified",
        provider: "pinata",
      });
    }

    // web3.storage
    const res = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${web3Token}`,
        "X-Name": body.name || "akiro-upload",
      },
      body: body.content,
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json(
        { error: `web3.storage error ${res.status}`, detail: t.slice(0, 300) },
        { status: 502 },
      );
    }
    const data = (await res.json()) as { cid?: string };
    if (!data.cid) {
      return NextResponse.json(
        { error: "web3.storage response missing cid" },
        { status: 502 },
      );
    }
    return NextResponse.json({
      cid: data.cid,
      claimKind: "Verified",
      provider: "web3.storage",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Pin failed" },
      { status: 500 },
    );
  }
}
