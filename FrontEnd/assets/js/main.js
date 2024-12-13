async function getWorks(url) {
	try {
		const response = await fetch(url + '/works');
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		result = await response.json();
		return result;
	} catch (error) {
		console.error(error.message);
	}
}
async function getCategories(url) {
	try {
		const response = await fetch(url + '/categories');
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		result = await response.json();
		categoryList = new Set();
		result.forEach(cat =>{
			categoryList.add(cat.name);
		})
		return categoryList;
	} catch (error) {
		console.error(error.message);
	}

}

function createGalery(works, categoryFilter) {
	const portfolio = document.getElementById('portfolio').querySelector('.gallery');
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
		menu.appendChild(button);
	});

	var resetButton = document.createElement('button');
	resetButton.innerText = 'Tous';
	menu.prepend(resetButton);
}

function getFilter() {
	const categoryMenu = document.querySelector('.category-menu');
	var filter = new Set();
	categoryMenu.querySelectorAll('.selected').forEach(button => {
		filter.add(button.innerText);
	});
	if (filter.size == 0)
		filter.add('Tous');

	return filter;
}

async function setProjects(url) {
	var works = await getWorks(url);
	createGalery(works);	
	var categories = await getCategories(url);
	console.log('hello');

	const categoryMenu = document.querySelector('.category-menu');
	createCategoryMenu(categories, categoryMenu);
	categoryMenu.querySelectorAll('button').forEach(button => { // On le fait ici pour avoir accès à la variable works
		button.addEventListener('click', e => {
			categoryMenu.querySelectorAll('button').forEach(button =>{
				button.classList.remove('selected');
			});
			e.target.classList.toggle('selected');
			createGalery(works, getFilter());
		});	
	});
}

async function login(url, logins) {
	try {
		console.log(logins);
		const response = await fetch(url + '/users/login', {
			method : 'POST',
			headers: { "Content-Type": "application/json" },
			body: logins		
		});
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		result = await response.json();
		return result.token;
	} catch (error) {
		console.error(error.message);
	}

}

async function setLogin(url) {
	var loginForm = document.querySelector('#login');
	loginForm.addEventListener('submit', async function(event) {
		event.preventDefault();
		var logins = {
			email : event.target.querySelector('[name=email]').value,
			password : event.target.querySelector('[name=password]').value
		};
		var loginToken = await login(url, JSON.stringify(logins));
		window.sessionStorage.setItem('login-token', loginToken);
		window.sessionStorage.setItem('is-connected', 'true')
	});
}



/* Non utilisée : une fonction pour récupérer les catégories sans appel à l'API */
function getCategoriesNoAPICall(works){
	var categories = new Set();
	works.forEach(work =>{
		categories.add(work.category.name);
	})
	return categories;
}
