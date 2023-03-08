/**
 * Convenience script to convert the IcoMoon JSON file (selection.json) to a simplified glyph map for tools like react-native-vector-icons.
 *
 * @example
 * ```shell
 *   yarn icomoonToGlyphMap ./icomoon/selection.json
 * ```
 */
import { ArgumentParser } from "argparse";
import path from "path";
import { promises as fs } from "fs";

type IcoMoonIcon = {
  properties: {
    name: string;
    code: number;
  };
};
type IcoMoonJson = {
  icons: IcoMoonIcon[];
};

// Force exit
const forceExit = async () => {
  console.log("Script cancelled...\b");
  process.exit(0);
};
process.on("SIGTERM", forceExit);
process.on("SIGINT", forceExit);

function parseArgs(): { file: string } {
  const parser = new ArgumentParser({
    prog: "yarn icomoonToGlyphMap",
    description:
      "Convert the IcoMoon JSON file (selection.json) to a simplified glyph map for tools like react-native-vector-icons",
  });

  parser.add_argument("file", {
    help: "The IcoMoon JSON file (selection.json)",
  });

  return parser.parse_args();
}

async function main() {
  // Parse args
  const args = parseArgs();
  const inFilepath = path.resolve(args.file);
  const outFilepath = path.join(path.dirname(inFilepath), "glyphmap.json");

  // Read IcoMoon file
  console.log(`\n* Reading ${inFilepath}`);
  const file = await fs.open(inFilepath);
  const moonContent = await file.readFile();
  const icoMoon = JSON.parse(moonContent.toString()) as IcoMoonJson;
  await file.close();

  // Create glyphmap
  console.log(`* Building glyph map`);
  const glyphmap = icoMoon.icons.reduce<Record<string, number>>(
    (glyphs, icon) => {
      glyphs[icon.properties.name] = icon.properties.code;
      return glyphs;
    },
    {}
  );

  // Save glyph map
  console.log(`* Saving glyph map`);
  const outFile = await fs.open(outFilepath, "w");
  await outFile.writeFile(JSON.stringify(glyphmap));
  await outFile.close();

  console.log(`\nGlyph map saved to: ${outFilepath}\n`);
  process.exit(0);
}
main();
