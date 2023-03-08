import express from "express";
import path from "path";
import { promises as fs } from "fs";
import Handlebars from "handlebars";
import open from "open";

const STATIC_DIR = path.resolve(path.join(__dirname, "static"));

/**
 * Load the list of SVG files
 */
const getSvgList = async (dir: string) => {
  const dirFiles = await fs.readdir(dir);
  const filelist = dirFiles.filter((name) => {
    const ext = path.extname(name);
    return ext.toLowerCase() === ".svg";
  });
  filelist.sort();

  console.log(`Found ${filelist.length} SVG files.\n`);
  return filelist;
};

/**
 * Get the SVG content
 */
const readSvg = async (svgDir: string, name: string) => {
  const filepath = path.join(svgDir, name);
  const file = await fs.open(filepath);
  const content = await file.readFile();
  file.close();
  return content.toString();
};

/**
 * Save a new SVG file
 */
const saveSvg = async (outDir: string, name: string, content: string) => {
  // unencode HTML
  content = content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

  const iconPath = path.join(outDir, name);
  const file = await fs.open(iconPath, "w");
  file.write(content);
  file.close();
};

/**
 * Compile a handlebars template
 */
const template = async (templateName: string) => {
  const templatePath = path.join(
    __dirname,
    "templates",
    `${templateName}.handlebars`
  );
  const file = await fs.open(templatePath);
  const contents = await file.readFile();
  const template = Handlebars.compile(contents.toString());

  file.close();
  return template;
};

/**
 * Start the express server
 */
export const runServer = async ({
  svgDir,
  outDir,
  port,
}: {
  svgDir: string;
  outDir: string;
  port: number;
}) => {
  let currentIdx = 0;
  let svgFiles = await getSvgList(svgDir);

  const app = express();
  app.use("/static", express.static(STATIC_DIR));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const welcomeTemplate = await template("index");
  const cropTemplate = await template("crop");
  const doneTemplate = await template("done");

  /**
   * Default welcome endpoint
   */
  app.get("/", (request, response) => {
    const html = welcomeTemplate({
      inputDirectory: svgDir,
      outputDirectory: outDir,
    });
    response.send(html);
  });

  /**
   * Crop endpoint
   */
  app.post("/crop", async (request, response) => {
    let { name, content, start } = request.body;

    if (typeof start === "undefined" && typeof content === "undefined") {
      return response.send(doneTemplate({ outputDirectory: outDir }));
    }

    // New cropping session
    if (typeof start !== "undefined") {
      // re-read the file list
      currentIdx = 0;
      svgFiles = await getSvgList(svgDir);
    }

    // Save icon content
    if (name && content) {
      console.log(` + Saving ${name}`);
      const svgContent = Buffer.from(content, "base64").toString("utf8");
      await saveSvg(outDir, name, svgContent);
    }

    // That was the last file
    if (currentIdx >= svgFiles.length) {
      response.send(doneTemplate({ outputDirectory: outDir }));

      console.log("\nGeneration complete!");
      console.log(
        "If you want to create a font from the SVG files, try the 'yarn font' command.\n"
      );

      process.exit(0);
    }

    // Crop the next icon
    const iconName = svgFiles[currentIdx];
    const svgContent = await readSvg(svgDir, iconName);
    console.log(`Cropping ${iconName}`);
    currentIdx++;
    return response.send(cropTemplate({ name: iconName, svg: svgContent }));
  });

  app.listen(port);
  console.log(
    `🚀 Goto http://localhost:${port} to start converting (CTL+C to exit)`
  );
  open(`http://localhost:${port}`);
};
