let tabs = document.getElementsByClassName("tabs")[0].children;

window.addEventListener("load", function () {
  Object.values(tabs).forEach(tab => {
    if(tab.getAttribute("href") === document.location.pathname){
      tab.setAttribute("class", "tab-button-active");
    }
  });
});