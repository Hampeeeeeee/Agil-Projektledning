document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const button = dropdown.querySelector('.dropdown-button');
    const content = dropdown.querySelector('.dropdown-content');

    button.addEventListener('click', () => {
      const isVisible = content.style.display === 'block';
      document.querySelectorAll('.dropdown-content').forEach(c => c.style.display = 'none');
      content.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) {
        content.style.display = 'none';
      }
    });
  });
});