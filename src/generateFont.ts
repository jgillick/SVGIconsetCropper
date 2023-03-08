import svgtofont, { InfoData } from "svgtofont";
import { ArgumentParser } from "argparse";
import path from "path";
import { promises as fs } from "fs";
import color from "colors-cli";

// Force exit
const forceExit = async () => {
  console.log("Script cancelled...\b");
  process.exit(0);
};
process.on("SIGTERM", forceExit);
process.on("SIGINT", forceExit);

const DEFAULT_OUT = `./font`;

function parseArgs(): { svg: string; out: string; fontName: string } {
  const parser = new ArgumentParser({
    prog: "yarn font",
    description: "Generate a font from a directory of SVG files.",
  });

  parser.add_argument("fontName", {
    help: "The name of the font to generate.",
  });
  parser.add_argument("--svg", {
    help: "The directory containing all the SVG files.",
  });
  parser.add_argument("--out", {
    default: DEFAULT_OUT,
    help: "The output directory",
  });

  return parser.parse_args();
}

async function generate(fontName: string, svgDir: string, out: string) {
  await svgtofont({
    fontName,
    src: svgDir,
    dist: out,
    css: false,
    generateInfoData: true,
  });

  // Read info data
  const infoData = await fs.open(path.join(out, "info.json"));
  const infoRaw = await infoData.readFile();
  await infoData.close();
  const info = JSON.parse(infoRaw.toString()) as InfoData;

  // Create glyphmap
  const glyphMapData = Object.entries(info).reduce<Record<string, string>>(
    (data, [name, info]) => {
      if (typeof info.encodedCode === "string") {
        data[name] = info.encodedCode;
      }
      return data;
    },
    {}
  );
  const glyphMapPath = path.join(out, "glyphmap.json");
  const glyphMapFile = await fs.open(glyphMapPath, "w");
  await glyphMapFile.writeFile(JSON.stringify(glyphMapData, null, "  "));
  await glyphMapFile.close();
  console.log(`${color.green("SUCCESS")} Created ${glyphMapPath} `);
}

async function main() {
  // Parse args
  const args = parseArgs();
  const fontName = args.fontName;
  const svgDir = path.resolve(args.svg);
  const out = path.resolve(args.out);

  if (svgDir === out) {
    console.log(
      "The SVG directory and the output directory cannot be the same."
    );
    process.exit(1);
  }

  console.log(`Generating a font named: ${fontName}`);
  generate(fontName, svgDir, out);
}
main();
