$(document).ready(function () {
    // init dropify
    $('#product-image').dropify({
        messages: {
            'default': 'Arrastra y suelta un archivo aquí o haz clic',
            'replace': 'Arrastra y suelta o haz clic para reemplazar',
            'remove': 'Eliminar',
            'error': 'Ooops, algo salió mal.'
        }
    });

    const snowEditor = new Quill('#snow-editor', {
        theme: 'snow',
        placeholder: 'Escribe una descripción del producto...',
        modules: {
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ color: [] }, { background: [] }],
                ['clean']
            ]
        }
    });
});

const editProductRaw = localStorage.getItem('editProduct');
const editProduct = editProductRaw ? JSON.parse(editProductRaw) : null;

document.addEventListener('DOMContentLoaded', () => {

    const selectCategories = document.getElementById('select-category')
    const categories = JSON.parse(localStorage.getItem('categories')) || []

    const categoriesActive = categories.filter(c => c._status == 'activo')

    if (categoriesActive.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.disabled = true;
        option.selected = true;
        option.textContent = 'No hay categorías disponibles';
        selectCategories.appendChild(option);
    } else {
        categoriesActive.forEach((category) => {
            const option = document.createElement('option');
            option.value = category._name.toLowerCase();
            option.textContent = category._name;
            selectCategories.appendChild(option);
        });
    }

    if (editProduct) {
        document.getElementById('titleCategory').textContent = 'Editar Producto';
        document.getElementById('addBtn').textContent = 'Editar';
        document.getElementById('product-name').value = editProduct.name;
        document.querySelector(`input[name="radioInline"][value="${editProduct.status}"]`).checked = true;
        document.querySelector('#snow-editor').innerHTML = editProduct.description;
        document.getElementById('select-category').value = editProduct.category
        document.getElementById('price').value = editProduct.price
        document.getElementById('stock').value = editProduct.stock
        const $input = $('#product-image');
        $input.attr('data-default-file', editProduct.image);
    }


})

const snowEditor = document.getElementById('snow-editor');
let products = JSON.parse(localStorage.getItem('products')) || []
const form = document.getElementById('form-product')

form.addEventListener('submit', async (e) => {
    e.preventDefault()

    if (!validateForm()) {
        return
    }

    // Activar Ladda en el botón
    const laddaBtn = Ladda.create(document.querySelector('#addBtn'));
    laddaBtn.start();

    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('select-category').value
    const price = document.getElementById('price').value
    const stock = document.getElementById('stock').value
    const description = snowEditor.querySelector('.ql-editor').innerHTML.trim();
    const imageFile = document.getElementById('product-image').files[0];
    const status = document.querySelector('input[name="radioInline"]:checked').value;

    try {
        const product = await handleProductSubmit({ name, category, price, stock, description, status, imageFile });
        showToast(product, editProduct ? 'editado correctamente' : 'agregada correctamente');
        // showToast(product, 'agregado correctamente');
        resetForm();
    } catch (error) {
        console.error("Error al guardar la categoría:", error);
        alert("Hubo un problema al guardar la categoría. Intenta nuevamente.");
    } finally {
        laddaBtn.stop(); // Detener Ladda al finalizar
    }

})

async function handleProductSubmit({ name, category, price, stock, description, status, imageFile }) {
    let imageUrl = editProduct?.image || '';

    if (!editProduct || imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
    }
    if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
    }

    const product = new Product(name, category, price, stock, description, status, imageUrl);

    if (editProduct) {
        products[editProduct.index] = product;
        localStorage.removeItem('editProduct');
        Swal.fire({
            title: '¡Editado correctamente!',
            icon: 'success',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = 'products.html';
        });
    } else {
        products.push(product);
    }

    localStorage.setItem('products', JSON.stringify(products));
    return product;
}

async function uploadToCloudinary(file) {
    const url = `https://api.cloudinary.com/v1_1/dcrcl48si/upload`;
    const preset = "images";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const response = await fetch(url, {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    return data.secure_url;
}

const showToast = (product, message) => {
    $.toast({
        text: `<img src="${product.image}" alt="Imagen de la categoría" class="rounded-circle avatar-sm"> ${product.name} ${message}`,
        showHideTransition: 'slide',
        icon: 'success',
        position: 'top-right',
        loaderBg: '#5ba035',
        stack: false,
        beforeShow: function () {
            $('.jq-toast-single').addClass('toast-wide');
        }
    });
};

const resetForm = () => {
    form.reset();
    document.querySelector('#snow-editor .ql-editor').innerHTML = '';
    const dropifyInstance = $('#product-image').data('dropify');
    if (dropifyInstance) dropifyInstance.clearElement();

    // error message elements
    const errorName = document.getElementById('error-product-name');
    const errorCategory = document.getElementById('error-select-category');
    const errorPrice = document.getElementById('error-price');
    const errorStock = document.getElementById('error-stock');
    const errorStatus = document.getElementById('error-radio');
    const errorImage = document.getElementById('error-product-image');
    const errorId = document.getElementById('error-product-id');
    // clean error messages
    const errorElements = [errorName, errorCategory, errorPrice, errorStock, errorStatus, errorImage]
    errorElements.forEach((el) => {
        el.textContent = '';
        //el.classList.toggle('text-danger', !!errorMessages[index]);
    });
};

// Acción del botón Cancelar
document.getElementById('btnCancel').addEventListener('click', () => {
    if (editProduct) {
        // Si estás editando, preguntar antes de redirigir
        Swal.fire({
            title: '¿Cancelar edición?',
            text: 'Se perderán los cambios no guardados',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'No, continuar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'products.html';
                localStorage.removeItem('editProduct');
            }
        });
    } else {
        // Si estás agregando, simplemente limpiar el formulario
        resetForm()
    }
});

//class product
class Product {
    constructor(name, category, price, stock, description, status, image) {
        this._name = name,
            this._category = category,
            this._price = price,
            this._stock = stock,
            this._description = description,
            this._status = status,
            this._image = image
    }

    get name() { return this._name; }
    set name(value) { this._name = value; }
    get category() { return this._category; }
    set category(value) { this._category = value; }
    get price() { return this._price; }
    set price(value) { this._price = value; }
    get stock() { return this._stock; }
    set stock(value) { this._stock = value; }
    get description() { return this._description; }
    set description(value) { this._description = value; }
    get status() { return this._status; }
    set status(value) { this._status = value; }
    get image() { return this._image; }
    set image(value) { this._image = value; }
}

//validate form
const validateForm = () => {
    //start ladda on the button
    const laddaBtn = Ladda.create(document.querySelector('#addBtn'));
    laddaBtn.start();

    // init form validation variables
    let formValid = true;

    // array to hold error messages
    const errorMessages = [];

    // get  form values
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('select-category').value
    const price = document.getElementById('price').value
    const stock = document.getElementById('stock').value
    const imageInput = document.getElementById('product-image')
    const image = imageInput.files[0];
    const status = document.querySelector('input[name="radioInline"]:checked');

    // error message elements
    const errorName = document.getElementById('error-product-name');
    const errorCategory = document.getElementById('error-select-category');
    const errorPrice = document.getElementById('error-price');
    const errorStock = document.getElementById('error-stock');
    const errorStatus = document.getElementById('error-radio');
    const errorImage = document.getElementById('error-product-image');

    // verify if the category name alredy exists
    const isEdit = editProduct?.isEdit === true;
    const currentIndex = editProduct?.index;

    const nameAlreadyExists = products.some((pro, idx) => {
        return pro._name.toLowerCase() === name.toLowerCase() && (!isEdit || idx !== currentIndex);
    });

    // Validate fields
    if (!name) {
        errorMessages[0] = 'Ingrese el nombre del producto.';
        formValid = false;
    } else if (nameAlreadyExists) {
        errorMessages[0] = 'Ya existe un producto con ese nombre.';
        formValid = false;
    } else {
        errorMessages[0] = '';
    }
    if (!category) {
        errorMessages[1] = 'Seleccione la categoria'
        formValid = false;
    } else {
        errorMessages[1] = ''
    }
    if (!price) {
        errorMessages[2] = 'Ingrese el precio'
        formValid = false;
    } else {
        errorMessages[2] = ''
    }
    if (!stock) {
        errorMessages[3] = 'Ingrese el stock'
        formValid = false;
    } else {
        errorMessages[3] = ''
    }

    if (!status) {
        errorMessages[4] = 'Seleccione el estado de la categoria.';
        formValid = false;
    } else {
        errorMessages[4] = '';
    }

    if (!image && !isEdit) {
        errorMessages[5] = 'Seleccione una imagen para la categoria.';
        formValid = false;
    } else {
        errorMessages[5] = '';
    }

    // show error messages
    const errorElements = [errorName, errorCategory, errorPrice, errorStock, errorStatus, errorImage]
    errorElements.forEach((el, index) => {
        el.classList.add('text-danger')
        el.textContent = errorMessages[index];
    });

    // dinamic clear error messages

    document.getElementById('product-name').addEventListener('input', (e) => {
        if (e.target.value.trim()) {
            errorName.textContent = '';
            errorName.classList.remove('text-danger');
        }
    });
    document.getElementById('select-category').addEventListener('change', (e) => {
        if (e.target.value) {
            errorCategory.textContent = '';
            errorCategory.classList.remove('text-danger');
        }
    })
    document.getElementById('price').addEventListener('input', (e) => {
        if (e.target.value) {
            errorPrice.textContent = '';
            errorPrice.classList.remove('text-danger');
        }
    })
    document.getElementById('stock').addEventListener('input', (e) => {
        if (e.target.value) {
            errorStock.textContent = '';
            errorStock.classList.remove('text-danger');
        }
    })

    imageInput.addEventListener('change', () => {
        if (imageInput.files.length > 0) {
            errorImage.textContent = '';
            errorImage.classList.remove('text-danger');
        }
    });

    document.querySelectorAll('input[name="radioInline"]').forEach(radio => {
        radio.addEventListener('change', () => {
            errorStatus.textContent = '';
            errorStatus.classList.remove('text-danger');
        });
    });

    // stop ladda on the buton
    laddaBtn.stop();

    // return form validation status
    return formValid;
}
