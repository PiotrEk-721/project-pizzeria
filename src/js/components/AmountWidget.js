import { select, settings } from "../settings.js";
import BaseWidget from "./BaseWidget.js";

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    // console.log("AmountWidget:v", thisWidget);
    // console.log("constructor argument: ", element);

    thisWidget.getElements();
    thisWidget.initActions();

    // thisWidget.setValue(thisWidget.input.value);
  }
  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }
  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }
  initActions() {
    const thisWidget = this;
    const inputTrigger = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    const linkDecreaseTrigger = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    const linkIncreaseTrigger = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
    inputTrigger.addEventListener("change", function () {
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.announce();
    });
    linkDecreaseTrigger.addEventListener("click", function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
      thisWidget.announce();
    });
    linkIncreaseTrigger.addEventListener("click", function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
      thisWidget.announce();
    });
  }
}

export default AmountWidget;
