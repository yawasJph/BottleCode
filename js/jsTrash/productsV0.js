const products = JSON.parse(localStorage.getItem('products')) || [];
const tableProduct = document.getElementById('demo-foo-filtering')
const tbody = tableProduct.querySelector('tbody')

document.addEventListener('DOMContentLoaded', () => {
    renderTable()   
});

const renderTable = () => {
    if (products.length === 0) {
        renderEmptyMessage()
    } else {

        tbody.innerHTML = '';

        products.forEach((product, index) => {
            const row = tbody.insertRow()
            row.setAttribute('data-index', index);
            row.insertCell().textContent = index + 1
            row.insertCell().innerHTML = `<img src="${product._image}" alt="Imagen de la categoria" class="rounded-circle avatar-sm">`
            row.insertCell().textContent = product._name
            row.insertCell().textContent = product._category
            row.insertCell().textContent = product._price
            row.insertCell().textContent = product._stock
            row.insertCell().innerHTML = product._description

            if (product._status === 'activo') {
                row.insertCell().innerHTML = `<span class="badge bg-success">${product._status}</span>`
            } else {
                row.insertCell().innerHTML = `<span class="badge bg-warning">${product._status}</span>`
            }

            row.insertCell().innerHTML = `
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
        FooTable.init('#demo-foo-filtering');
    }
}

const renderEmptyMessage = () => {
    tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-5 fs-4 text-primary">
                         No hay Productos Agregados
                    </td>
                </tr>`;
};

const onEdit = (index) => {
    const product = products[index]
    const editProduct = {
        index: index,
        name: product._name,
        category: product._category,
        price: product._price,
        stock: product._stock,
        description: product._description,
        image: product._image,
        status: product._status,
        isEdit: true
    }

    localStorage.setItem('editProduct', JSON.stringify(editProduct))
    window.location.href = 'add-product.html'
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
                    products.splice(index, 1);
                    localStorage.setItem('products', JSON.stringify(products));
                    //renderTable();
                    row.remove()
                    $table.data('footable').redraw();

                    if (products.length === 0) {
                        renderEmptyMessage();
                    }
                }, 400);
            }
        }
    });
};