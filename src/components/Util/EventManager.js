import throttle from 'lodash/throttle';

export default class EventManager {
  constructor(element, debug) {
    this.el = element;
    this.name = element.name || element.id || element.tagName;
    this.debug = debug;
    this.handlers = {
      tap: [],
      move: [],
      moveEnd: []
    };
    this.isClick = false;
    this.isDragging = false;
    if (this.debug) console.log(`EventManager(${this.name})`);

    this.setup();
  }

  setup = () => {
    this.el.addEventListener('mousedown', this._mousedown);
    window.addEventListener('mousemove', this._mousemove);
    window.addEventListener('mouseup', this._mouseup);
  };

  destroy = () => {
    this.el.removeEventListener('mousedown', this._mousedown);
    window.removeEventListener('mousemove', this._mousemove);
    window.removeEventListener('mouseup', this._mouseup);
  };

  debugEvent = e => {
    if (this.debug) console.log(`${this.name} : ${e.type}`);
  };

  addHandler = (eventName, fn) => {
    this.handlers[eventName].push(fn);
  };

  callHandler = (eventName, event) => {
    if (this.handlers[eventName].length) {
      this.handlers[eventName].forEach(fn => fn(event));
    }
  };

  _mousedown = event => {
    event.preventDefault();
    event.stopPropagation();
    this.debugEvent(event);
    this.mouseDown = true;
    this.isClick = true;
  };

  _mousemove = throttle(event => {
    event.preventDefault();
    event.stopPropagation();

    if (!this.mouseDown) return;

    this.debugEvent(event);

    if (!this.previousLocation) {
      this.previousLocation = { x: event.pageX, y: event.pageY };
    }
    const delta = {
      x: event.pageX - this.previousLocation.x,
      y: event.pageY - this.previousLocation.y
    };
    this.previousLocation = { x: event.pageX, y: event.pageY };

    // If we're not already dragging and the delta is 0 or 1, treat as possible click
    // (isClick evaluates on mouseUp, so it could be reset if mouse moves a bit more 
    //  and delta increases)
    if (!this.isDragging && Math.abs(delta.x) <= 1 && Math.abs(delta.y) <= 1) {
      this.isClick = true;
      return;
    }

    this.isDragging = true;
    this.isClick = false;
    const customEvent = new CustomEvent('move', {
      detail: {
        delta,
        x: event.pageX,
        y: event.pageY
      }
    });

    this.callHandler('move', customEvent);
  }, 1000/60);

  _mouseup = event => {
    event.preventDefault();
    event.stopPropagation();
    if (!this.mouseDown) return;
    this.debugEvent(event);
    this.mouseDown = false;
    this.previousLocation = null;

    // This was a click, trigger 'tap'
    if (this.isClick) {
      const customEvent = new CustomEvent('tap', {
        detail: {
          x: event.pageX,
          y: event.pageY
        }
      });
      this.callHandler('tap', customEvent);
    }

    // This was a 'move', trigger 'moveend'
    if (this.isDragging && !this.isClick){
      const customEvent = new CustomEvent('tap', {
        detail: {
          x: event.pageX,
          y: event.pageY
        }
      });
      this.callHandler('moveEnd', customEvent);
    }

    this.isClick = false;
    this.isDragging = false;
  };

  onTap = fn => {
    this.addHandler('tap', fn);
  };

  onMove = fn => {
    this.addHandler('move', fn);
  };

  onMoveEnd = fn => {
    this.addHandler('moveEnd', fn);
  };
}
