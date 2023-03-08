# SVG Iconset Cropper

By default, icon sets like Material Design, have variable padding around their icons. This can make it challenging to create pixel perfect designs.

This tool will automatically trim the whitespace from around a batch of SVG icons, using the method developed by the awesome [svgcrop.com](https://svgcrop.com/) ([source](https://github.com/sdennett55/svg_crop/)).
There is also a helper command that will convert those SVG files into a font with an accompanying glyphmap file, using [svgtofont](https://github.com/jaywcjlove/svgtofont/).

## Usage

### 1. Get a batch of SVG files

For example, to trim the material design icons, clone their [@mdi/svg](https://github.com/Templarian/MaterialDesign-SVG) repo and you'll find all their SVG icons in the `svg` directory.

### 2. Setup the cropper

Clone this repo and install the dependencies:

```shell
git clone https://github.com/jgillick/IconsetCropper.git

cd IconsetCropper

yarn install
```

### 3. Start the cropper tool server

```shell
yarn cropper --out "<PATH TO OUTPUT>" "<PATH TO SVG DIRECTORY>"
```

### 4. Crop ALL THE SVG

Cropping happens in the browser, so open your browser to http://localhost:8080/ and then press the Start button.

Now sit back and wait for the cropped SVG icons to fill the output directory.

### 5. (optional) Make an icon font

Now that the SVGs have been generated, you can create an icon font and glyph map file.

```
yarn font --svg "<PATH TO CROPPED SVG DIRECTORY>" --out "<FONT OUTPUT DIRECTORY>" <FONT NAME>
```

This is just a wrapper around [svgtofont](https://github.com/jaywcjlove/svgtofont/), so if you need further customization, use that tool directly.
