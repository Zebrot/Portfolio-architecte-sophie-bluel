const apiUrl = 'http://localhost:5678/api';

// API Gets
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
		return result;
	} catch (error) {
		console.error(error.message);
	}
}

// Set Pages & elements
async function setProjects(url) {
	setMenu();
	const gallery = document.querySelector('.gallery');
	const works = await getWorks(url);
	createGallery(gallery, works);	

	if ((modal = document.querySelector('#modal')))
		setModal(modal, works);

	const categories = await getCategories(url);
	if ((projectForm = document.querySelector('#projects-form')))
		setProjectCreator(projectForm, categories);

	const categoryMenu = document.querySelector('.category-menu');
	createCategoryMenu(categoryMenu, categories);
	categoryMenu.querySelectorAll('button').forEach(button => { // On le fait ici pour avoir accès à la variable works
		button.addEventListener('click', e => {
			categoryMenu.querySelectorAll('button').forEach(button =>{
				button.classList.remove('selected');
			});
			e.target.classList.toggle('selected');
			createGallery(gallery, works, getFilter());
		});
	});
	if(getLoginToken())
		categoryMenu.classList.add('hide');
	else 
		categoryMenu.classList.remove('hide');
}
async function setLoginPage(url) {
	setMenu();
	const loginForm = document.querySelector('#login');
	loginForm.addEventListener('submit', async function(event) {
		event.preventDefault();
		var logins = {
			email : event.target.querySelector('[name=email]').value,
			password : event.target.querySelector('[name=password]').value
		};
		var isLogged = await login(url, JSON.stringify(logins));
		if (isLogged)
			window.location = './index.html'
	});
}
function setMenu() {
	var link = document.querySelector('#login-link');
	if (getLoginToken()){
		link.addEventListener('click', logout);
		link.innerHTML = 'Logout';
		if ((modalOpener = document.querySelector('#modal-opener')))
			modalOpener.classList.add('show');
	}
	else {
		link.removeEventListener('click', logout);
		link.innerHTML = 'Login';
		if((modalOpener = document.querySelector('#modal-opener')))
			modalOpener.classList.remove('show');
	}
}

function createGallery(gallery, works, categoryFilter) { 
	gallery.innerHTML = '';
	works.forEach((work) => {
		if (!categoryFilter || categoryFilter == 'Tous' || categoryFilter == work.category.name){
			var newProjet = document.createElement('figure');

			var newImg = document.createElement('img');
			newImg.src = work.imageUrl;
			newImg.alt = work.title;
			newProjet.appendChild(newImg);


			var caption = document.createElement('figcaption');
			caption.innerHTML = work.title;
			newProjet.appendChild(caption);
			gallery.appendChild(newProjet)
		}
	});
}
function createCategoryMenu(menu, categories) {
	menu.innerHTML = '';
	categories.forEach(category =>{
		var button = document.createElement('button');
		button.innerHTML = category.name;
		menu.appendChild(button);
	});

	var resetButton = document.createElement('button');
	resetButton.innerText = 'Tous';
	menu.prepend(resetButton);
}
function getFilter() {
	const categoryMenu = document.querySelector('.category-menu');
	if((filterValue = categoryMenu.querySelector('.selected').innerText))
		return filterValue;
	else
		return 'Tous';
}

// Login 

async function login(url, logins) {
	try {
		const response = await fetch(url + '/users/login', {
			method : 'POST',
			headers: { "Content-Type": "application/json" },
			body: logins
		});
		if (!response.ok)
			throw new Error(response.status);
		else {
			result = await response.json();
			setLoginToken(result.token)
			return true;
		}
	} catch (error) {
		handleError(error);
	}
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

function logout(event) {
	event.preventDefault();
	setLoginToken('');
	setMenu();
	setProjects(apiUrl);
}
function getLoginToken () {
	return window.sessionStorage.getItem('login-token');
}
function setLoginToken(value) {
	try {
		window.sessionStorage.setItem('login-token', value);
		window.sessionStorage.setItem('is-connected', 'true');
		return window.sessionStorage.getItem('login-token');
	}
	catch (error) {
		console.error(error.message);
	}
}
// Modal 

function setModal(modal, works) {
	const modalGallery = modal.querySelector('.gallery');
	window.addEventListener("keyup", function (e) {
		if (e.key === 'Escape')
			this.document.querySelector('.modal-bg').classList.add('hide');
	});

	createModalGallery(modalGallery, works);
}
function createModalGallery(gallery, works) {
	gallery.innerHTML = '';
	works.forEach((element, index) => {
		var newProjet = document.createElement('figure');

		var newImg = document.createElement('img');
		newImg.src = element.imageUrl;
		newImg.alt = element.title;
		newProjet.appendChild(newImg);

		var deleteButton = document.createElement('i');
		deleteButton.classList.add('fa-solid', 'fa-trash-can');
		newProjet.appendChild(deleteButton);
		deleteButton.addEventListener('click', () => deleteProject(element, index));

		gallery.appendChild(newProjet)
	});

}
function toggleModal() {
	document.querySelector('.modal-bg').classList.toggle('hide');
}
function changeModal() {
	const modal = document.querySelector('#modal');
	modal.querySelectorAll('div').forEach(modalDiv => {
		modalDiv.classList.toggle('hide')}
	);
}

// Create & Delete Projects 

function setProjectCreator(projectForm, categories) {
	const categoryList = projectForm.querySelector('[name=category]');
	categories.forEach((category) =>{
		var option = document.createElement('option');
		option.innerHTML = category.name;
		option.value = category.id;
		categoryList.appendChild(option);
	});

	projectForm.addEventListener('submit', function(event) {
		event.preventDefault();
		var projectOptions = {
			image : event.target.querySelector('[name=image]').files[0],
			title : event.target.querySelector('[name=title]').value,
			category : parseInt(event.target.querySelector('[name=category]').value)
		};
		if(validateProject(projectOptions, categories))
			createProject(projectOptions);
	});

	const imageInput = projectForm.querySelector('[name=image]');
	const inputButton = projectForm.querySelector('.file-input-button');

	imageInput.addEventListener('change', ()=>{ //Preview display
		const file = imageInput.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				var img = document.createElement('img');
				img.src = reader.result;
				inputButton.querySelectorAll('img').forEach(img => img.remove());
				inputButton.appendChild(img);
			};
			reader.readAsDataURL(file);
		} else {
			inputButton.querySelectorAll('img').forEach(img => img.remove());
		}
	});
	projectForm.addEventListener('reset', () => { 
		// reset() doesn't trigger onChange, so reset preview here 
		inputButton.querySelectorAll('img').forEach(img => img.remove());
		projectForm.querySelector('.error-field').innerText = '';
	});
}
async function deleteProject(project, projectID) {
	try {
		if(!confirm(`Are you sure you want to delete "${project.title}" ?`))
			return false;
		const loginToken = getLoginToken();
		const headers = new Headers({
			Authorization: `Bearer ${loginToken}`});

		const response = await fetch(`${apiUrl}/works/${project.id}`, {
			method : 'DELETE',
			headers
		})
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		document.querySelectorAll('.gallery').forEach(gallery => {
			removeProjectFromGallery(gallery, projectID)
		})
	} catch (error) {
		console.error(error.message);
	}
}
function removeProjectFromGallery(gallery, projectID) {
	gallery.querySelectorAll('figure')[projectID].classList.add('hide');
}
function validateProject(projectOptions, categories) {
	const title = projectOptions.title;
	const category = projectOptions.category;
	const image = projectOptions.image;
	categoryIdList = categories.map(cat => cat.id);
	try{
		if (typeof title != 'string' || title.length == 0)
			throw new Error('Le titre doit être une chaîne de caractères')
		if (typeof category != 'number')
			throw new Error("Le numéro de catégorie n'est pas un nombre")
		if (!image)
			throw new Error('Sélectionnez une image')
		if (!categoryIdList.includes(category))
			throw new Error('Sélectionnez une catégorie')
		if(image.size > '4000000')
			throw new Error ('Image trop large !')
		if (title == "oups")
			throw new Error ('oups')
		return true;	
	}catch(error) {
		handleCreationResult(error.message);
	}

}
async function createProject(projectOptions) {
	try {
		const formData = new FormData();
		formData.append('image', projectOptions.image);		
		formData.append('title', projectOptions.title);
		formData.append('category', projectOptions.category);

		token = getLoginToken();
		headers = new Headers({
			Authorization: `Bearer ${token}`,
		})
		response = await fetch(`${apiUrl}/works`, {
			method: 'POST',
			headers,
			body: formData
		});
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		handleCreationResult(`Projet ${projectOptions.title} créé !`, true)
		document.querySelector('#projects-form').reset();
		works = await getWorks(apiUrl);
		galleries = document.querySelectorAll('.gallery');
		createGallery(galleries[0], works);
		createModalGallery(galleries[1],works);
	} catch (error) {
		console.error(error);
	}
}
function handleCreationResult(message, greenFlag) {
	const textField = greenFlag ? document.querySelector('#creation-success') : document.querySelector('#creation-error') ;
	textField.innerText = message;
}

/* Non utilisées */

function getCategoriesNoAPICall(works){ // Obtenir les catégories sans appel à l'API
	var categories = new Set();
	works.forEach(work =>{
		categories.add(work.category.name);
	})
	return categories;
}
