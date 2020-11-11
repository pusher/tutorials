export default () => {
  const menuButtons = [].slice.call(document.querySelectorAll(".menu-toggle"));
  const menu = document.getElementById("menu");

  if (menuButtons.length > 0) {
    console.log("Found a menu");
    menuButtons.forEach((menuButton) => {
      menuButton.addEventListener("click", (e) => {
        menu.classList.toggle("open");
        document.body.classList.toggle("overflow-hidden");
      });
    });
  }
};
