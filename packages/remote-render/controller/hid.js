import { equals, complement } from "ramda";
import { attachRenderer } from "..";

const MOUSE_BUTTON_MAP = Object.freeze({
  // none, left, middle, right, back, forward
  0: "left",
  1: "right",
  2: "middle",
});

const TO_IGNORE = ["constructor", "initialize"];

export class HIDController {
  constructor(page, eventSource) {
    this.page = page;
    if (eventSource) {
      this.initialize(eventSource);
    }
  }

  initialize(eventSource) {
    this.eventSource = eventSource;
    Object.getOwnPropertyNames(HIDController.prototype)
      .filter(complement(equals("initialize")))
      .forEach((eventName) => {
        if (typeof this[eventName] === "function") {
          eventSource.on(`hid.${eventName}`, this[eventName].bind(this));
        }
      });
  }

  click({ x, y, button }) {
    this.page.mouse.click(x, y, { button: MOUSE_BUTTON_MAP[button] });
  }

  move({ x, y }) {
    this.page.mouse.move(x, y);
  }

  keydown({ key, text }) {
    this.page.keyboard.down(key, { options: text });
  }

  keyup({ key, text }) {
    this.page.keyboard.up(key, { options: text });
  }

  // TODO: Support Orientation for info and screen
  async info({ screen: { width, height } }) {
    await this.page.setViewport({ width, height });
    // TODO: May be reload before attach
    await attachRenderer(this.page);
  }

  async screen({ width, height }) {
    await this.page.setViewport({ width, height });
  }

  async scrollTo({ x, y }) {
    await this.page.evaluate(
      ({ x, y }) => {
        window.scrollTo(x, y);
      },
      { x, y }
    );
  }
}
