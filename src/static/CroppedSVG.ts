/**
 * Remove the extra whitespace around an SVG.
 * Adapted from: https://github.com/sdennett55/svg_crop
 */

const invisibleElems = [
  "defs",
  "g",
  "foreignObject",
  "svg",
  "style",
  "title",
  "desc",
];

interface Coords {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

class CroppedSVG {
  coords: Coords;

  constructor(public svg: SVGElement) {
    this.coords = {
      top: Infinity,
      left: Infinity,
      bottom: -Infinity,
      right: -Infinity,
    };
    this.svg = svg;

    this.render();
  }

  /**
   * Convert the SVG to Base64 using js-base64
   * https://github.com/dankogai/js-base64
   */
  toBase64() {
    const content = this.svg.outerHTML;
    const Base64 = (window as any).Base64;
    return Base64.encode(content);
  }

  removeAttributes() {
    this.svg.removeAttribute("viewBox");
    this.svg.removeAttribute("width");
    this.svg.removeAttribute("height");
  }

  filterSVGToVisibleElements(svg: SVGElement) {
    function flatten(ops: SVGElement[], n: SVGElement) {
      ops.push(n);
      if (n.childNodes && n.childNodes.length) {
        // @ts-ignore: Unreachable code error
        [].reduce.call(n.childNodes, flatten, ops);
      }
      return ops;
    }

    const result = [svg].reduce(flatten, []).filter((elem: SVGElement) => {
      const parentElement = elem.parentElement as HTMLElement;

      // Invisible elements
      if (!elem.tagName || invisibleElems.includes(elem.tagName)) {
        return false;
      }

      // Get element properties
      const rect =
        typeof elem.getBoundingClientRect === "function"
          ? elem.getBoundingClientRect()
          : { height: 0, width: 0 };
      const computedStyle = getComputedStyle(elem);

      // Remove <rect /> that is just taking up space
      if (
        elem.tagName === "rect" &&
        !elem.childNodes.length &&
        computedStyle.stroke === "none" &&
        (computedStyle.fill === "none" ||
          computedStyle.fill === "rgb(255, 255, 255)")
      ) {
        return false;
      }

      return (
        (rect.width || rect.height) &&
        !parentElement.hasAttribute("mask") &&
        parentElement.tagName !== "defs" &&
        (computedStyle.stroke !== "none" || computedStyle.fill !== "none")
      );
    });

    return result;
  }

  getCoords() {
    this.filterSVGToVisibleElements(this.svg).forEach((x, index, arr) => {
      let {
        top: newTop,
        left: newLeft,
        bottom: newBottom,
        right: newRight,
      } = x.getBoundingClientRect();

      const stroke = getComputedStyle(x)["stroke"];
      const strokeWidth = Number(
        getComputedStyle(x).strokeWidth.replace("px", "")
      );

      if (stroke !== "none") {
        newTop = newTop - strokeWidth / 2;
        newLeft = newLeft - strokeWidth / 2;
        newBottom = newBottom + strokeWidth / 2;
        newRight = newRight + strokeWidth / 2;
      }

      if (newTop < this.coords.top) {
        this.coords.top = newTop;
      }
      if (newLeft < this.coords.left) {
        this.coords.left = newLeft;
      }
      if (newRight > this.coords.right) {
        this.coords.right = newRight;
      }
      if (newBottom > this.coords.bottom) {
        this.coords.bottom = newBottom;
      }
    });
  }

  static formatViewBoxNum(num: number) {
    return Number(num.toFixed(2)) * 1;
  }

  setNewAttributes() {
    this.svg.setAttribute(
      "viewBox",
      `${CroppedSVG.formatViewBoxNum(
        this.coords.left
      )} ${CroppedSVG.formatViewBoxNum(
        this.coords.top
      )} ${CroppedSVG.formatViewBoxNum(
        this.coords.right - this.coords.left
      )} ${CroppedSVG.formatViewBoxNum(this.coords.bottom - this.coords.top)}`
    );
  }

  render() {
    // Put the SVG into calculate mode
    this.svg.classList.add("calculate_svg");

    this.removeAttributes();
    this.getCoords();
    this.setNewAttributes();

    // Remove calculate mode
    this.svg.classList.remove("calculate_svg");
    if (!this.svg.classList.length) {
      this.svg.removeAttribute("class");
    }
  }
}
