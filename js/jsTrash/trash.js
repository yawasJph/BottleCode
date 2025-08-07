var quantitiy = 0;
$('.quantity-right-plus').click(function (e) {

	// Stop acting like a button
	e.preventDefault();
	// Get the field name

	var quantity = parseInt($('#quantity').val());

	// If is not undefined

	$('#quantity').val(quantity + 1);


	// Increment

});

$('.quantity-left-minus').click(function (e) {
	// Stop acting like a button
	e.preventDefault();
	// Get the field name
	var quantity = parseInt($('#quantity').val());

	// If is not undefined

	// Increment
	if (quantity > 0) {
		$('#quantity').val(quantity - 1);
	}
});

document.addEventListener('click', function (e) {
	const addBtn = e.target.closest('.add-to-cart');
	if (!addBtn) return;

	const productEl = addBtn.closest('.product');
	if (!productEl) return;

	const id = productEl.dataset.id;

	// Cargar datos de localStorage
	const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
	const products = JSON.parse(localStorage.getItem('products')) || [];

	// Buscar el producto en products por ID
	let product = products.find(p => p._id == id);

	// Si no está en products, tomar los datos manualmente del DOM
	if (!product) {
		const name = productEl.querySelector('h2')?.textContent?.trim() || 'Sin nombre';
		const priceText = productEl.querySelector('p .price-real')?.textContent?.replace('$', '').trim() || '0';
		const price = parseFloat(priceText);
		const bgImg = productEl.querySelector('.img')?.style?.backgroundImage || '';
		const image = bgImg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

		product = {
			_id: id,
			_name: name,
			_price: price,
			_image: image,
			quantity: 1
		};
	}

	// Verificar si ya existe en el carrito
	const existingItem = cartItems.find(item => item._id === product._id);
	if (existingItem) {
		existingItem.quantity += 1;
	} else {
		cartItems.push({
			_id: product._id,
			_name: product._name,
			_price: product._price,
			_image: product._image,
			quantity: 1
		});
	}

	// Guardar y renderizar
	localStorage.setItem('cartItems', JSON.stringify(cartItems));
	renderCart(); // Asegúrate de tener esta función definida
});

function applyTheme(theme) {
	document.documentElement.setAttribute('data-bs-theme', theme);
	localStorage.setItem('theme', theme);

	const toggleBtn = document.getElementById('themeToggle');
	const icon = toggleBtn.querySelector('i');
	const label = toggleBtn.querySelector('span');

	if (theme === 'dark') {
		icon.className = 'bi bi-sun';
		label.textContent = 'Modo Claro';
	} else {
		icon.className = 'bi bi-moon';
		label.textContent = 'Modo Oscuro';
	}
}


(() => {
	const storedTheme = localStorage.getItem('theme');
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	const defaultTheme = storedTheme || (prefersDark ? 'dark' : 'light');
	applyTheme(defaultTheme);
})();


document.getElementById('themeToggle').addEventListener('click', () => {
	const currentTheme = document.documentElement.getAttribute('data-bs-theme');
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
	applyTheme(newTheme);
});