import { readFileSync } from "fs";
import { join } from "path";

function parseKeyFile(content: string) {
  return content.split(/\r?\n/).reduce<Record<string, string>>((keys, line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return keys;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      return keys;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (key && value) {
      keys[key] = value.replace(/^["']|["']$/g, "");
    }

    return keys;
  }, {});
}

function readVisibleKeyFile() {
  try {
    const content = readFileSync(join(process.cwd(), "CLES_API.txt"), "utf8");
    return parseKeyFile(content);
  } catch {
    return {};
  }
}

export function getServerApiKey(name: string) {
  return process.env[name] || readVisibleKeyFile()[name] || "";
}
