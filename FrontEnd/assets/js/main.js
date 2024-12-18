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
function createGallery(works, categoryFilter) {
	var gallery = document.querySelector('.gallery');
	gallery.innerHTML = '';
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
			gallery.appendChild(newProjet)
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
	setMenu();

	var works = await getWorks(url);
	createGallery(works);	
	var categories = await getCategories(url);
	console.log(window.sessionStorage.getItem('is-connected'));
	console.log(window.sessionStorage.getItem('login-token'));

	const categoryMenu = document.querySelector('.category-menu');
	createCategoryMenu(categories, categoryMenu);
	categoryMenu.querySelectorAll('button').forEach(button => { // On le fait ici pour avoir accès à la variable works
		button.addEventListener('click', e => {
			categoryMenu.querySelectorAll('button').forEach(button =>{
				button.classList.remove('selected');
			});
			e.target.classList.toggle('selected');
			createGallery(works, getFilter());
		});	
	});
}

function handleError (error) {
	var errorField = document.querySelector('#error-field');
	var emailField = document.querySelector('form').querySelector('[name=email]');
	var passwordField = document.querySelector('form').querySelector('[name=password]');
	if(error.message == '404'){
		errorField.innerHTML = 'Utilisateur inconnu';
		emailField.value = '';
		passwordField.value = ''
	}
	else if (error.message == '401'){
		errorField.innerHTML = 'Mauvais mot de passe';
		passwordField.value = '';
	}
}

async function login(url, logins) {
	try {
		console.log(logins);
		const response = await fetch(url + '/users/login', {
			method : 'POST',
			headers: { "Content-Type": "application/json" },
			body: logins		
		});
		if (!response.ok)
			throw new Error(response.status);
		else {
			result = await response.json();
			window.sessionStorage.setItem('login-token', result.token);
			window.sessionStorage.setItem('is-connected', 'true');
			return true;
		}
	} catch (error) {
		handleError(error);
		return false;
	}
}

function logout(event) {
	event.preventDefault();
	window.sessionStorage.setItem('login-token', '');
	window.sessionStorage.setItem('is-connected', 'false');
	console.log(window.sessionStorage.getItem('is-connected'));
	setMenu();
}

async function setLogin(url) {
	setMenu();
	var loginForm = document.querySelector('#login');
	loginForm.addEventListener('submit', async function(event) {
		event.preventDefault();
		var logins = {
			email : event.target.querySelector('[name=email]').value,
			password : event.target.querySelector('[name=password]').value
		};
		var isLogged = await login(url, JSON.stringify(logins));
		setMenu();
		if (isLogged)
			window.location = './index.html'
	});
}

function setMenu() {
	var link = document.querySelector('#login-link');
	var modalOpener = document.querySelector('#modal-opener');
	if (window.sessionStorage.getItem('is-connected') == 'true'){
		link.addEventListener('click', logout);
		link.innerHTML = 'Logout';
		if (modalOpener)
			modalOpener.classList.add('show');
	}
	else {
		link.removeEventListener('click', logout);
		link.innerHTML = 'Login';
		if(modalOpener)
			modalOpener.classList.remove('show');
	}
}

function getLoginToken () {
	return window.sessionStorage.getItem('login-token');
}
function setLoginToken(value) {
	window.sessionStorage.setItem('login-token', value);
	return window.sessionStorage.getItem('login-token');
}	

/* Non utilisée : une fonction pour récupérer les catégories sans appel à l'API */
function getCategoriesNoAPICall(works){
	var categories = new Set();
	works.forEach(work =>{
		categories.add(work.category.name);
	})
	return categories;
}
