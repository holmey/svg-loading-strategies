// prototypal implementation ;)

window.addEventListener('load', function () {
  const icons = document.querySelectorAll('svg[data-url]');
  icons.forEach((icon) => {
    fetchAndEmbed(icon, icon.getAttribute('data-url'));
  });
});

const fetchAndEmbed = async function (element, url) {
  const iconResponse = await fetch(url);
  let iconData = await iconResponse.text();

  element.innerHTML = iconData.replace(/<svg.*?>/, '').replace(/<\/svg>/, '');
};
