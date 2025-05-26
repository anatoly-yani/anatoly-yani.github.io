document.addEventListener('DOMContentLoaded', () => {
  const modalHTML = `
    <div id="poem-modal-overlay"></div>
    <div id="poem-modal-content">
      <span id="poem-modal-close">&times;</span>
      <h2 id="poem-modal-title"></h2>
      <div id="poem-modal-body"></div>
      <div id="poem-modal-navigation">
        <button id="poem-modal-prev">Previous</button>
        <button id="poem-modal-next">Next</button>
      </div>
    </div>
  `;

  let modalAppended = false;
  const poemList = [];
  let currentPoemIndex = -1;

  const poemLinkElements = document.querySelectorAll('a.poem-link');
  poemLinkElements.forEach(link => {
    poemList.push({
      href: link.getAttribute('href'),
      title: link.textContent.trim()
    });
  });

  function updateButtonStates() {
    const prevButton = document.getElementById('poem-modal-prev');
    const nextButton = document.getElementById('poem-modal-next');

    if (!prevButton || !nextButton) return; // Buttons not in DOM yet

    prevButton.disabled = (currentPoemIndex <= 0);
    nextButton.disabled = (currentPoemIndex >= poemList.length - 1);
  }

  async function loadPoemInModal(index) {
    if (index < 0 || index >= poemList.length) {
      console.error("Index out of bounds for poemList:", index);
      return;
    }
    currentPoemIndex = index;
    const poemURL = poemList[index].href;

    document.getElementById('poem-modal-title').innerText = 'Loading...';
    document.getElementById('poem-modal-body').innerHTML = '<p>Loading content...</p>';
    updateButtonStates(); // Update button states early

    try {
      const response = await fetch(poemURL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const poemHtmlText = await response.text();
      
      const parser = new DOMParser();
      const poemDoc = parser.parseFromString(poemHtmlText, 'text/html');
      
      const title = poemDoc.querySelector('title')?.innerText || poemList[index].title || 'Poem';
      const postDiv = poemDoc.querySelector('#post');
      const bodyContent = postDiv ? postDiv.innerHTML : '<p>Content not found.</p>';
      
      document.getElementById('poem-modal-title').innerText = title;
      document.getElementById('poem-modal-body').innerHTML = bodyContent;
      
    } catch (error) {
      console.error('Error fetching poem:', error);
      document.getElementById('poem-modal-title').innerText = 'Error';
      document.getElementById('poem-modal-body').innerHTML = `<p>Could not load poem. ${error.message}</p>`;
    }
    updateButtonStates(); // Final update after loading
  }

  function showModal() {
    if (!modalAppended) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      modalAppended = true;
      document.getElementById('poem-modal-close').addEventListener('click', closeModal);
      document.getElementById('poem-modal-overlay').addEventListener('click', closeModal);
      document.getElementById('poem-modal-prev').addEventListener('click', () => {
        if (currentPoemIndex > 0) {
          loadPoemInModal(currentPoemIndex - 1);
        }
      });
      document.getElementById('poem-modal-next').addEventListener('click', () => {
        if (currentPoemIndex < poemList.length - 1) {
          loadPoemInModal(currentPoemIndex + 1);
        }
      });
    }
    document.getElementById('poem-modal-overlay').style.display = 'block';
    document.getElementById('poem-modal-content').style.display = 'block';
  }

  function closeModal() {
    document.getElementById('poem-modal-overlay').style.display = 'none';
    document.getElementById('poem-modal-content').style.display = 'none';
    document.getElementById('poem-modal-title').innerHTML = '';
    document.getElementById('poem-modal-body').innerHTML = '';
    currentPoemIndex = -1; // Reset index
  }

  poemLinkElements.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showModal();
      loadPoemInModal(index);
    });
  });
});
