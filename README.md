# SVG Iconset Cropper

SVG icon sets, like [Material Design](https://github.com/Templarian/MaterialDesign-SVG), have variable padding around their icons, which can make it challenging to create pixel perfect designs.

This tool automatically trims the whitespace from around a batch of SVG icons, using the method developed by the awesome [svgcrop.com](https://svgcrop.com/) ([source](https://github.com/sdennett55/svg_crop/)).

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

# For example
yarn cropper --out ./cropped/ ./MaterialDesign-SVG/svg
```

### 4. Crop ALL THE SVG

Cropping happens in the browser, so open your browser to http://localhost:8080/ and then press the Start button.

Now sit back and wait for the cropped SVG icons to fill the output directory.

## Make an icon font

If you want to make an icon font with these SVGs, it's important that all SVGs are normalized to the same height; otherwise, pixel perfect designs can be challenging. I've found that [Fantasticon](https://github.com/tancredi/fantasticon) works really well for this.

For example, following along from our Material Design Icons example above (change `--font-types` to whatever font file format you need):

```shell
npm install -g fantasticon

mkdir ./font
fantasticon  --normalize \
             --font-types ttf \
             --asset-types json \
             --name MaterialDesignIconsCropped \
             --output ./font \
             ./cropped
```

You can also use [icomoon.io](https://icomoon.io/), however, it will not automatically normalize all icons to the same height -- which can affect pixel perfect designs.. Follow [these instructions](https://www.reactnative.guide/12-svg-icons-using-react-native-vector-icons/12.1-creating-custom-iconset.html) for icomoon.
