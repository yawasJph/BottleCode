const categories = JSON.parse(localStorage.getItem('categories')) || [];
const tableCategory = document.getElementById('demo-foo-filtering')
const tbody = tableCategory.querySelector('tbody')

document.addEventListener('DOMContentLoaded', () => {
    renderTable()
});

const renderTable = () => {
    if (categories.length === 0) {
        renderEmptyMessage()
    } else {

        tbody.innerHTML = '';

        categories.forEach((category, index) => {
            const row = tbody.insertRow()
            row.setAttribute('data-index', index);
            row.insertCell().textContent = index + 1
            row.insertCell().innerHTML = `<img src="${category._image}" alt="Imagen de la categoria" class="rounded-circle avatar-sm">`
            row.insertCell().textContent = category._name
            row.insertCell().innerHTML = category._description
            if (category._status === 'activo') {
                row.insertCell().innerHTML = `<span class="badge bg-success">${category._status}</span>`

            } else {
                row.insertCell().innerHTML = `<span class="badge bg-warning">${category._status}</span>`
            }
            row.insertCell().innerHTML =
                `
                <div class="button-list" >
                    <button class="btn btn-sm btn-primary waves-effect waves-light" title="EDITAR" tabindex="0" data-plugin="tippy" data-tippy-theme="gradient" onClick='onEdit(${index})'>
                        <i class="mdi mdi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-primary waves-effect waves-light" title="ELIMINAR !" tabindex="0" data-plugin="tippy" data-tippy-theme="gradient" onClick='onDelete(${index})'>
                         <span class="mdi mdi-delete"></span>
                    </button>
                </div>    
             `;
        });

        tippy('[data-plugin="tippy"]');

    }

}

const renderEmptyMessage = () => {
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-5 fs-4 text-primary">
                 No hay categorías agregadas
            </td>
        /tr>`;
};

const onEdit = (index) => {
    console.log(index)
    const category = categories[index]
    const editCategory = {
        index: index,
        name: category._name,
        description: category._description,
        image: category._image,
        status: category._status,
        isEdit: true
    }
    localStorage.setItem('editCategory', JSON.stringify(editCategory))
    window.location.href = 'add-category.html'
}

const onDelete = (index) => {
    var $table = $('#demo-foo-filtering').footable();
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás deshacer esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
        if (result.isConfirmed) {
            const row = document.querySelector(`tr[data-index="${index}"]`);
            if (row) {
                row.classList.add('fade-out');

                setTimeout(() => {
                    categories.splice(index, 1);
                    localStorage.setItem('categories', JSON.stringify(categories));
                    //renderTable();
                    row.remove()

                    $table.data('footable').redraw();
                    if (products.length === 0) {
                        renderEmptyMessage();
                    }
                }, 400);
            }
        }
    })
};