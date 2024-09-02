import mime from "mime";
import { join } from "path";
import * as dateFn from "date-fns";
import { mkdir, stat, writeFile } from "fs/promises";
import config from "@/config/config";
import { NextRequest } from "next/server";

export interface ParsedFile {
  filename: string;
  mimetype: string;
  filepath: string;
  url: string;
}

export const parseForm = async (
  request: NextRequest,
): Promise<ParsedFile[]> => {
  const uploadDir = join(
    process.env.ROOT_DIR || process.cwd(),
    `${config.dataFolder}/uploads/${dateFn.format(Date.now(), "y-MM-dd")}`,
  );

  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true });
    } else {
      console.error(e);
      throw e;
    }
  }

  const formData = request.formData();
  const files = (await formData).getAll("media") as File[];

  const fileRes: ParsedFile[] = [];

  for (const file of files) {
    const mimetype = file.type;
    const datePrefix = `${dateFn.format(Date.now(), "y-MM-dd")}`;
    const uniqueSuffix = `${Math.round(Math.random() * 1e9)}`;
    const filename = `${datePrefix}-${file.name?.replace(/\s+/g, "-") || "unknown"}-${uniqueSuffix}.${
      mime.getExtension(mimetype || "") || "unknown"
    }`;
    const filepath = join(uploadDir, filename);
    const url = `/uploads/${dateFn.format(Date.now(), "y-MM-dd")}/${filename}`;
    fileRes.push({ filename, mimetype, filepath, url });

    const data = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(data));
  }
  return fileRes;
};
