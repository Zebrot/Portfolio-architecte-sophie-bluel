
async function getWorks(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		result = await response.json();
		return result;
	} catch (error) {
		console.error(error.message);
	}
}
function createGalery(works, categoryFilter) {
	const portfolio = document.getElementById('portfolio').getElementsByClassName('gallery')[0];
	portfolio.innerHTML = '';
	works.forEach((element, index) => {
		if (!categoryFilter || categoryFilter.has('Tous') || categoryFilter.has(element.category.name)){
			var newProjet = document.createElement('figure');

			var newImg = document.createElement('img');
			newImg.src = element.imageUrl;
			newImg.alt = element.title;

			var caption = document.createElement('figcaption')
			caption.innerHTML = element.title;

			newProjet.appendChild(newImg);
			newProjet.appendChild(caption);
			portfolio.appendChild(newProjet)
		}
	});
}
function createCategoryMenu(categories,menu) {
	categories.forEach(category =>{
		var button = document.createElement('button');
		button.innerHTML = category;
		button.addEventListener('click', e =>{
			menu.querySelectorAll('button').forEach(button =>{
				button.classList.remove('selected');
			});
			e.target.classList.toggle('selected');

		}); 
		menu.appendChild(button);
	});

	var resetButton = document.createElement('button');
	resetButton.innerText = 'Tous';
	resetButton.addEventListener('click', e =>{
		menu.querySelectorAll('button').forEach(button => {
			button.classList.remove('selected');
		});
		e.target.classList.toggle('selected');
	})
	menu.prepend(resetButton);
}

function getFilter() {
	const categoryMenu = document.getElementsByClassName('category-menu')[0];
	var filter = new Set();
	categoryMenu.querySelectorAll('.selected').forEach(button => {
		filter.add(button.innerText);
	});
	if (filter.size == 0)
		filter.add('Tous');

	return filter;
}

function getCategories(works){
	var categories = new Set();
	works.forEach(work =>{
		categories.add(work.category.name);
	})
	return categories;
}

async function setPage(url) {
	var works = await getWorks(url);
	const categoryMenu = document.getElementsByClassName('category-menu')[0];

	createGalery(works);
	createCategoryMenu(getCategories(works), categoryMenu);
	categoryMenu.addEventListener('click', e => {
		createGalery(works, getFilter());
	})
}