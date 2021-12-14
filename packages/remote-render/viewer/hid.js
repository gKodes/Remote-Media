import debounce from "debounce";
import { UAParser } from "ua-parser-js";

const DEBOUNCE_INTERVAL = 50;

const registerEvents = (target, events) => {
  Object.keys(events).forEach((eventName) => {
    target.addEventListener(eventName, events[eventName], true);
  });
}

// Use an existing lib to help with this
const getScreenDetails = () => ({
  height: window.innerHeight,
  width: window.innerWidth,
  orientation: screen?.orientation?.type || window?.orientation,
});

const registerOnTransport = (transport) => {
  const hid = (eventName, ...args) => {
    transport.emit(`hid.${eventName}`, ...args);
  };

  let ticking = false;

  const documentEvents = {
    // mousedown: ({ button }) => hid("mousedown", { button }),
    // mouseup: ({ button }) => hid("mouseup", { button }),
    click: ({ clientX: x, clientY: y, button }) =>
      hid("click", { x, y, button }),
    mousemove: debounce(({ clientX: x, clientY: y }) => {
      hid("move", { x, y });
    }, DEBOUNCE_INTERVAL),
    // TODO: Drag Events
    // keypress: ({ charCode }) => hid("click", { key: charCode }),
    keydown: ({ code, target }) => hid("keydown", { key: code, text: target?.value }),
    keyup: ({ code, target }) => hid("keyup", { key: code, text: target?.value  }),
    scroll: (event) => {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          console.info(event)
          hid("scrollTo", { x: window.scrollX, y: window.scrollY });
          ticking = false;
        });
    
        ticking = true;
      }
    }
  };

  const windowEvents = {
    orientationchange: () => { hid("screen", getScreenDetails()) },
    resize: () => { hid("screen", getScreenDetails()) },
  };

  registerEvents(document, documentEvents)
  registerEvents(window, windowEvents)

  transport.on("connect", () => {
    const uaParser = new UAParser();
    hid("info", {
      ...uaParser.getResult(),
      screen: getScreenDetails(),
    });
  });
};

export default registerOnTransport;
