
$(document).ready(function () {
    // Inicializar Dropify
    $('#category-image').dropify({
        messages: {
            'default': 'Arrastra y suelta un archivo aquí o haz clic',
            'replace': 'Arrastra y suelta o haz clic para reemplazar',
            'remove': 'Eliminar',
            'error': 'Ooops, algo salió mal.'
        }
    });
});

class Category {
    constructor(name, description, status, image) {
        this._name = name;
        this._description = description;
        this._status = status;
        this._image = image;
    }

    get name() { return this._name; }
    set name(value) { this._name = value; }
    get description() { return this._description; }
    set description(value) { this._description = value; }
    get status() { return this._status; }
    set status(value) { this._status = value; }
    get image() { return this._image; }
    set image(value) { this._image = value; }
}

const formCategory = document.getElementById('form-category');
const snowEditor = document.getElementById('snow-editor');
let categories = JSON.parse(localStorage.getItem('categories')) || [];

const editCategoryRaw = localStorage.getItem('editCategory');
const editCategory = editCategoryRaw ? JSON.parse(editCategoryRaw) : null;

const showToast = (category, message) => {
    $.toast({
        heading: 'Éxito',
        text: `<img src="${category.image}" alt="Imagen de la categoría" class="rounded-circle avatar-sm"> ${category.name} ${message}`,
        showHideTransition: 'slide',
        icon: 'success',
        position: 'top-right'
    });
};

const resetForm = () => {
    formCategory.reset();
    snowEditor.querySelector('.ql-editor').innerHTML = '';
    const dropifyInstance = $('#category-image').data('dropify');
    if (dropifyInstance) dropifyInstance.clearElement();
};

formCategory.addEventListener('submit', async function (event) {
    event.preventDefault();
    // if (!validateForm()) return;

    const name = document.getElementById('category-name').value.trim();
    const description = snowEditor.querySelector('.ql-editor').innerHTML.trim();
    const imageFile = document.getElementById('category-image').files[0];
    const status = document.querySelector('input[name="radioInline"]:checked').value;

    let imageUrl = editCategory?.image || '';
    if (!editCategory || imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
    }

    const category = new Category(name, description, status, imageUrl);

    if (editCategory) {
        categories[editCategory.index] = category;
        localStorage.removeItem('editCategory');
        showToast(category, 'editado correctamente');
    } else {
        categories.push(category);
        showToast(category, 'agregada correctamente');
    }

    localStorage.setItem('categories', JSON.stringify(categories));
    resetForm();
});

window.addEventListener('DOMContentLoaded', () => {
    if (editCategory) {
        document.getElementById('titleCategory').textContent = 'Editar Categoría';
        document.getElementById('addBtn').textContent = 'Editar';
        document.getElementById('category-name').value = editCategory.name;
        document.querySelector(`input[name="radioInline"][value="${editCategory.status}"]`).checked = true;
        snowEditor.querySelector('.ql-editor').innerHTML = editCategory.description;

        const $input = $('#category-image');
        $input.attr('data-default-file', editCategory.image);

        const drEvent = $input.dropify();
        const instance = drEvent.data('dropify');
        if (instance) instance.resetPreview();
    }
});

function validateForm() {
    const name = document.getElementById('category-name').value.trim();
    const description = snowEditor.querySelector('.ql-editor').innerHTML.trim();
    const image = document.getElementById('category-image').files[0];
    const status = document.querySelector('input[name="radioInline"]:checked');

    if (!name) return alert('El nombre es obligatorio.'), false;
    if (!description) return alert('La descripción es obligatoria.'), false;
    if (!status) return alert('El estado es obligatorio.'), false;
    if (!image) return alert('La imagen es obligatoria.'), false;

    return true;
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

