import { select, templates } from "../settings.js";
import utils from "../utils.js";

class Home {
  constructor(element, data) {
    const thisHome = this;
    
    thisHome.data = data;
    thisHome.renderInMenu();
    thisHome.render(element);
  }
  renderInMenu() {
    const thisHome = this;
    const generatedHTML = templates.homePage(thisHome.data.homePageAssets);
    thisHome.element = utils.createDOMFromHTML(generatedHTML);
  }
  render(element) {
    const thisHome = this;

    const generatedHTML = templates.homePage();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    thisHome.dom.firstImageWrapper = thisHome.dom.wrapper.querySelector(
        select.home.firstImageWrapper
    );
  }
}

export default Home;
