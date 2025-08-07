// Inicializar Dropify
$(document).ready(function () {
    $('.dropify').dropify({
        messages: {
            'default': 'Arrastra y suelta un archivo aquí o haz clic',
            'replace': 'Arrastra y suelta o haz clic para reemplazar',
            'remove': 'Eliminar',
            'error': 'Ooops, algo salió mal.'
        }
    });
});

const formCategory = document.getElementById('form-category');
const snowEditor = document.getElementById('snow-editor');
const editCategory = JSON.parse(localStorage.getItem('editCategory') || null)
let categories = JSON.parse(localStorage.getItem('categories')) || [];
formCategory.addEventListener('submit', async function (event) {
    event.preventDefault();

    //if (!validateForm()) return;

    const name = document.getElementById('category-name').value;
    const description = document.querySelector('#snow-editor .ql-editor').innerHTML;
    const imageFile = document.getElementById('category-image').files[0];
    const status = document.querySelector('input[name="radioInline"]:checked').value;

    if (editCategory == null) {
        const imageUrl = await uploadToCloudinary(imageFile);
        const category = new Category(name, description, status, imageUrl);
        categories.push(category);
        // Simular una llamada a la API
        setTimeout(() => {
            $.toast({
                heading: 'Exito',
                text: ` <img src="${category._image}" alt="Imagen de la categoria" class="rounded-circle avatar-sm"> ${category.name} agregada correctamente>`,
                showHideTransition: 'slide',
                icon: 'success',
                position: 'top-right'
            });
            formCategory.reset();
            snowEditor.querySelector('.ql-editor').innerHTML = ''; // Limpiar el editor de texto enriquecido
            // Reiniciar Dropify correctamente
            var drEvent = $('#category-image').dropify();
            drEvent = drEvent.data('dropify');
            drEvent.clearElement();
        }, 2000);
    } else {

        // Si estamos editando una categoría, usamos la imagen existente o la nueva si se ha cambiado
        let imageUrl = editCategory.image;
        if (imageFile) {
            imageUrl = await uploadToCloudinary(imageFile);
        }

        const category = new Category(name, description, status, imageUrl);
        categories[editCategory.index] = category
        console.log("categories: ", categories)
        // Simular una llamada a la API
        setTimeout(() => {
            $.toast({
                heading: 'Exito',
                text: `<img src="${category._image}" alt="Imagen de la categoria" class="rounded-circle avatar-sm"> ${category.name} editado correctamente>`,
                showHideTransition: 'slide',
                icon: 'success',
                position: 'top-right'
            });
            formCategory.reset();
            snowEditor.querySelector('.ql-editor').innerHTML = ''; // Limpiar el editor de texto enriquecido
            // Reiniciar Dropify correctamente
            var drEvent = $('#category-image').dropify();
            drEvent = drEvent.data('dropify');
            drEvent.clearElement();
        }, 2000);
        localStorage.removeItem('editCategory')
    }
    localStorage.setItem('categories', JSON.stringify(categories))
});

window.addEventListener('DOMContentLoaded', () => {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    console.log("categories: ", categories)
    const editCategory = JSON.parse(localStorage.getItem('editCategory') || null)
    console.log("editCategory: " + editCategory)
    if (editCategory != null) {

        document.getElementById('titleCategory').textContent = 'Editar Categoria';
        document.getElementById('addBtn').textContent = 'Editar';

        document.getElementById('category-name').value = editCategory.name;
        document.querySelector(`input[name = "radioInline"][value = "${editCategory.status}"]`).checked = true;
        document.querySelector('#snow-editor').innerHTML = editCategory.description;

        // Reiniciar Dropify sin destruir estilos
        const $drInput = $('#category-image');
        //$drInput.data('dropify').destroy();
        $drInput.attr('data-default-file', editCategory.image);
        $drInput.dropify();

    }
})



//class Category 
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

//valdate formCategory
function validateForm() {
    const categoryName = document.getElementById('category-name').value;
    const categoryDescription = document.querySelector('#snow-editor .ql-editor').innerHTML;
    const categoryImage = document.getElementById('category-image').files[0];
    const categoryStatus = document.querySelector('input[name="radioInline"]:checked');

    if (categoryName.trim() === '') {
        alert('El nombre de la categoría es obligatorio.');
        return false;
    }
    if (categoryDescription.trim() === '') {
        alert('La descripción de la categoría es obligatoria.');
        return false;
    }
    if (!categoryStatus) {
        alert('El estado de la categoría es obligatorio.');
        return false;
    }
    if (!categoryImage) {
        alert('La imagen de la categoría es obligatoria.');
        return false;
    }

    return true; // Si todas las validaciones pasan, retorna true
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
    return data.secure_url; // La URL pública de la imagen
}