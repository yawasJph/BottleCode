
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

    const snowEditor = new Quill('#snow-editor', {
        theme: 'snow',
        placeholder: 'Escribe una descripción de la categoria...',
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
    // Validar formulario
    if (!validateForm()) {
        return
    }
    // Activar Ladda en el botón
    const laddaBtn = Ladda.create(document.querySelector('#addBtn'));
    laddaBtn.start();

    const name = document.getElementById('category-name').value.trim();
    const description = snowEditor.querySelector('.ql-editor').innerHTML.trim();
    const imageFile = document.getElementById('category-image').files[0];
    const status = document.querySelector('input[name="radioInline"]:checked').value;

    try {
        const category = await handleCategorySubmit({ name, description, status, imageFile });
        showToast(category, editCategory ? 'editado' : 'agregada');
        resetForm();
    } catch (error) {
        console.error("Error al guardar la categoría:", error);
        alert("Hubo un problema al guardar la categoría. Intenta nuevamente.");
    } finally {
        laddaBtn.stop(); // Detener Ladda al finalizar
    }
});

// Acción del botón Cancelar
document.getElementById('btnCancel').addEventListener('click', () => {
    if (editCategory) {
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
                window.location.href = 'categories.html';
                localStorage.removeItem('editCategory');
            }
        });
    } else {
        // Si estás agregando, simplemente limpiar el formulario
        document.getElementById('form-category').reset();
        document.querySelector('#snow-editor .ql-editor').innerHTML = '';
        const dropifyInstance = $('#category-image').data('dropify');
        if (dropifyInstance) dropifyInstance.clearElement();

        // error message elements
        const errorName = document.getElementById('error-category-name');
        const errorStatus = document.getElementById('error-radio');
        const errorImage = document.getElementById('error-category-image');
        // clean error messages
        [errorName, errorStatus, errorImage].forEach((el, index) => {
            el.textContent = '';
        });
    }
});


async function handleCategorySubmit({ name, description, status, imageFile }) {
    let imageUrl = editCategory?.image || '';

    if (!editCategory || imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
    }

    const category = new Category(name, description, status, imageUrl);

    if (editCategory) {
        categories[editCategory.index] = category;
        localStorage.removeItem('editCategory');
        Swal.fire({
            title: '¡Editado correctamente!',
            icon: 'success',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = 'categories.html';
        });
    } else {
        categories.push(category);
    }

    localStorage.setItem('categories', JSON.stringify(categories));
    return category;
}


window.addEventListener('DOMContentLoaded', () => {
    if (editCategory) {
        document.getElementById('titleCategory').textContent = 'Editar Categoría';
        document.getElementById('addBtn').textContent = 'Editar';
        document.getElementById('category-name').value = editCategory.name;
        document.querySelector(`input[name="radioInline"][value="${editCategory.status}"]`).checked = true;
        document.querySelector('#snow-editor').innerHTML = editCategory.description;

        const $input = $('#category-image');
        $input.attr('data-default-file', editCategory.image);

        // const drEvent = $input.dropify();
        // const instance = drEvent.data('dropify');
        // if (instance) instance.resetPreview();
    }
});

function validateForm() {
    //start ladda on the button
    const laddaBtn = Ladda.create(document.querySelector('#addBtn'));
    laddaBtn.start();

    // init form validation variables
    let formValid = true;
    // array to hold error messages
    const errorMessages = [];

    // get form values
    const name = document.getElementById('category-name').value.trim();
    const imageInput = document.getElementById('category-image');
    const image = imageInput.files[0];
    const status = document.querySelector('input[name="radioInline"]:checked');

    // error message elements
    const errorName = document.getElementById('error-category-name');
    const errorStatus = document.getElementById('error-radio');
    const errorImage = document.getElementById('error-category-image');

    // verify if the category name alredy exists
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const editCategory = JSON.parse(localStorage.getItem('editCategory'));
    const isEdit = editCategory?.isEdit === true;
    const currentIndex = editCategory?.index;

    const nameAlreadyExists = categories.some((cat, idx) => {
        return cat._name.toLowerCase() === name.toLowerCase() && (!isEdit || idx !== currentIndex);
    });

    // Validate fields
    if (!name) {
        errorMessages[0] = 'Ingrese el nombre de la categoria.';
        formValid = false;
    } else if (nameAlreadyExists) {
        errorMessages[0] = 'Ya existe una categoría con ese nombre.';
        formValid = false;
    } else {
        errorMessages[0] = '';
    }

    if (!status) {
        errorMessages[1] = 'Seleccione el estado de la categoria.';
        formValid = false;
    } else {
        errorMessages[1] = '';
    }

    if (!image && !isEdit) {
        errorMessages[2] = 'Seleccione una imagen para la categoria.';
        formValid = false;
    } else {
        errorMessages[2] = '';
    }

    // show error messages
    [errorName, errorStatus, errorImage].forEach((el, index) => {
        el.textContent = errorMessages[index];
        el.classList.toggle('text-danger', !!errorMessages[index]);
    });

    // dinamic clear error messages
    document.getElementById('category-name').addEventListener('input', () => {
        if (document.getElementById('category-name').value.trim()) {
            errorName.textContent = '';
            errorName.classList.remove('text-danger');
        }
    });

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
