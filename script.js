document.addEventListener('DOMContentLoaded', () => {

    const btnProductos = document.getElementById('btn-productos');
    const dropdownContent = document.getElementById('dropdown-productos');
    const btnVerPromos = document.getElementById('btn-ver-promos');
    const promosSection = document.getElementById('promos-section');

    // 1. Abrir/Cerrar la lista principal (PRODUCTOS)
    if (btnProductos && dropdownContent) {
        btnProductos.addEventListener('click', (e) => {
            e.stopPropagation(); 
            dropdownContent.classList.toggle('active');
            
            if (!dropdownContent.classList.contains('active')) {
                cerrarTodosLosSubmenus();
            }

            // [NUEVO] Si abrimos el menú, cerramos el carrito
            if (cartDrawer && cartDrawer.classList.contains('open')) {
                toggleCart();
            }
        });
    }

    // 2. Lógica para los submenús (Fotos y Stickers)
    const submenuBtns = document.querySelectorAll('.submenu-btn');

    submenuBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const currentSublist = btn.nextElementSibling;

            document.querySelectorAll('.submenu-list').forEach(list => {
                if (list !== currentSublist) {
                    list.classList.remove('active');
                }
            });

            if (currentSublist) {
                currentSublist.classList.toggle('active');
            }
        });
    });

    // 3. Scroll suave hacia la sección de combos
    if (btnVerPromos && promosSection) {
        btnVerPromos.addEventListener('click', () => {
            promosSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 4. Cerrar todo si el usuario hace click afuera
    document.addEventListener('click', (e) => {
        // [MODIFICADO] Evitamos que se cierre si clickeamos DENTRO del carrito
        if (cartDrawer && cartDrawer.contains(e.target)) return;

        if (dropdownContent) dropdownContent.classList.remove('active');
        cerrarTodosLosSubmenus();
    });

    function cerrarTodosLosSubmenus() {
        document.querySelectorAll('.submenu-list').forEach(list => {
            list.classList.remove('active');
        });
    }

    // ==========================================
    // 5. LÓGICA DEL CARRITO (Lia DISEGNO)
    // ==========================================
    let cart = JSON.parse(localStorage.getItem('lia_cart')) || [];

    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const addCartButtons = document.querySelectorAll('.btn-add-cart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total-price');
    const cartBadge = document.getElementById('cart-badge');
    const checkoutBtn = document.getElementById('checkout-btn');

    const toggleCart = () => {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.toggle('open');
            cartOverlay.classList.toggle('open');
            
            // Si abrimos el carrito, cerramos el menú
            if (cartDrawer.classList.contains('open')) {
                if (dropdownContent) dropdownContent.classList.remove('active');
                cerrarTodosLosSubmenus();
            }
        }
    };

    if (cartBtn) cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCart();
    });
    
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    if (addCartButtons.length > 0) {
        addCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const name = button.getAttribute('data-name');
                const price = parseInt(button.getAttribute('data-price').replace('.', '')); 

                const existingItem = cart.find(item => item.name === name);

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ name, price, quantity: 1 });
                }

                saveAndRenderCart();
                
                if (cartBtn) {
                    cartBtn.style.transform = 'scale(1.25)';
                    setTimeout(() => { cartBtn.style.transform = 'none'; }, 200);
                }
            });
        });
    }

    function saveAndRenderCart() {
        localStorage.setItem('lia_cart', JSON.stringify(cart));
        renderCart();
    }

    function renderCart() {
        if (!cartItemsContainer || !cartTotalElement || !cartBadge) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color:var(--color-text-muted); margin-top: 20px;">Tu carrito está vacío.</p>';
            cartTotalElement.innerText = '$0';
            cartBadge.innerText = '0';
            return;
        }

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            totalItems += item.quantity;

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <span>$${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="btn-qty btn-minus" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-qty btn-plus" data-index="${index}">+</button>
                    <button class="btn-remove-item" data-index="${index}">🗑️</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalElement.innerText = `$${total.toLocaleString('es-AR')}`;
        cartBadge.innerText = totalItems;

        document.querySelectorAll('.btn-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.getAttribute('data-index');
                if (cart[index].quantity > 1) cart[index].quantity -= 1;
                else cart.splice(index, 1);
                saveAndRenderCart();
            });
        });

        document.querySelectorAll('.btn-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.getAttribute('data-index');
                cart[index].quantity += 1;
                saveAndRenderCart();
            });
        });

        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.getAttribute('data-index');
                cart.splice(index, 1);
                saveAndRenderCart();
            });
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;

            let message = '¡Hola! Me gustaría hacer un pedido en Lia DISEGNO:\n\n';
            let total = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                message += `• ${item.quantity}x ${item.name} ($${itemTotal.toLocaleString('es-AR')})\n`;
            });

            message += `\n*Total: $${total.toLocaleString('es-AR')}*\n`;
            message += '¿Cómo coordinamos el pago y envío?';

            // REEMPLAZA CON TU NÚMERO
            const whatsappNumber = '5492215614689'; 
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
        });
    }

    // Inicializar
    renderCart();
});