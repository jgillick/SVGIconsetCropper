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

  toBase64() {
    return btoa(this.svg.outerHTML);
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
      return (
        elem.tagName &&
        !invisibleElems.includes(elem.tagName) &&
        (elem.getBoundingClientRect().width ||
          elem.getBoundingClientRect().height) &&
        !parentElement.hasAttribute("mask") &&
        parentElement.tagName !== "defs" &&
        (getComputedStyle(elem).stroke !== "none" ||
          getComputedStyle(elem).fill !== "none")
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
    this.svg.style.position = "fixed";
    this.svg.style.top = "0px";
    this.svg.style.left = "0px";

    this.removeAttributes();
    this.getCoords();
    this.setNewAttributes();

    this.svg.style.position = "static";
  }
}