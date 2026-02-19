// FAQ Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
    // CTA Button Click Handler
    const ctaButtons = document.querySelectorAll('.cta-button');
    const checkoutButtons = document.querySelectorAll('.checkout-button');
    
    console.log('Found checkout buttons:', checkoutButtons.length);
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const formSection = document.querySelector('.order-form-section');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    checkoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const formSection = document.querySelector('.order-form-section');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Size Selection
    const sizeButtons = document.querySelectorAll('.size-btn');
    const selectedSizeInput = document.getElementById('selectedSize');
    
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedSizeInput.value = button.dataset.size;
        });
    });

    // Color Selection
    const colorButtons = document.querySelectorAll('.color-btn');
    const selectedColorInput = document.getElementById('selectedColor');
    
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            colorButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedColorInput.value = button.dataset.color;
        });
    });

    // Offer Selection
    const offerButtons = document.querySelectorAll('.offer-btn');
    const quantityInput = document.getElementById('quantity');
    const discountRateInput = document.getElementById('discountRate');
    
    offerButtons.forEach(button => {
        button.addEventListener('click', () => {
            offerButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            quantityInput.value = button.dataset.quantity;
            discountRateInput.value = button.dataset.discount;
            updatePrice();
        });
    });
    
    // Set default offer (1 piece)
    offerButtons[0].classList.add('active');

    // Price Calculation
    const BASE_PRICE = 229;
    const OLD_PRICE = 299;
    
    function updatePrice() {
        const quantity = parseInt(quantityInput.value) || 1;
        const discountRate = parseFloat(discountRateInput.value) / 100 || 0;
        
        const oldPriceTotal = OLD_PRICE * quantity;
        const currentPriceTotal = BASE_PRICE * quantity;
        const discountAmount = currentPriceTotal * discountRate;
        const finalPrice = currentPriceTotal - discountAmount;
        
        document.getElementById('oldPrice').textContent = oldPriceTotal.toFixed(2) + ' درهم';
        document.getElementById('currentPrice').textContent = currentPriceTotal.toFixed(2) + ' درهم';
        document.getElementById('discountAmount').textContent = '-' + discountAmount.toFixed(2) + ' درهم';
        document.getElementById('finalPrice').textContent = finalPrice.toFixed(2) + ' درهم';
        
        // Show/hide discount row
        const discountRow = document.querySelector('.price-row.discount');
        if (discountRate > 0) {
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
    }
    
    updatePrice();

    // Form Submission to Google Sheets
    const orderForm = document.getElementById('orderForm');
    
    if (!orderForm) {
        console.error('Order form not found!');
        return;
    }
    
    console.log('Order form found:', orderForm);
    
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        console.log('Form submitted!');
        
        // Validate size selection
        if (!selectedSizeInput.value) {
            alert('الرجاء اختيار المقاس');
            return;
        }
        
        // Validate color selection
        const selectedColor = document.getElementById('selectedColor');
        if (!selectedColor || !selectedColor.value) {
            alert('الرجاء اختيار اللون');
            return;
        }
        
        console.log('Validation passed');
        
        const quantity = parseInt(document.getElementById('quantity').value);
        const discountRate = parseFloat(document.getElementById('discountRate').value) / 100 || 0;
        const oldPriceTotal = OLD_PRICE * quantity;
        const currentPriceTotal = BASE_PRICE * quantity;
        const discountAmount = currentPriceTotal * discountRate;
        const finalPrice = currentPriceTotal - discountAmount;
        
        // Get form values
        const orderData = {
            size: selectedSizeInput.value,
            color: selectedColor.value,
            quantity: quantity,
            discountRate: (discountRate * 100).toFixed(0) + '%',
            oldPrice: oldPriceTotal.toFixed(2),
            currentPrice: currentPriceTotal.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            finalPrice: finalPrice.toFixed(2),
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            city: document.getElementById('city').value,
            address: document.getElementById('address').value,
            comments: document.getElementById('comments').value || 'لا توجد ملاحظات'
        };
        
        console.log('Order data:', orderData);
        
        // Show loading message
        const submitBtn = document.querySelector('.submit-button');
        if (!submitBtn) {
            console.error('Submit button not found!');
            alert('تم إرسال طلبك بنجاح!');
            orderForm.reset();
            return;
        }
        
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'جاري الإرسال...';
        submitBtn.disabled = true;
        
        // Send to Google Sheets and show confirmation
        setTimeout(() => {
            // Show confirmation modal
            showConfirmationModal(orderData);
            
            // Reset form
            orderForm.reset();
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            colorButtons.forEach(btn => btn.classList.remove('active'));
            offerButtons.forEach(btn => btn.classList.remove('active'));
            offerButtons[0].classList.add('active');
            selectedSizeInput.value = '';
            selectedColor.value = '';
            quantityInput.value = '1';
            discountRateInput.value = '0';
            updatePrice();
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1000);
        
        // Send to Google Sheets in background
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxlPn-E-rJYY6AeXGMI-_jrvo-Tt9vZrId8Sqa3FMrG3Xp-JPLt-A1RQYJkqAFLHO2/exec';
        const params = new URLSearchParams(orderData).toString();
        const fullUrl = `${GOOGLE_SCRIPT_URL}?${params}`;
        
        fetch(fullUrl, {
            method: 'GET',
            mode: 'no-cors'
        }).catch(error => {
            console.error('Google Sheets error:', error);
        });
    });
});

// Modal functions
function showConfirmationModal(orderData) {
    const modal = document.getElementById('confirmationModal');
    const orderSummary = document.getElementById('orderSummary');
    
    orderSummary.innerHTML = `
        <p><strong>المقاس:</strong> ${orderData.size}</p>
        <p><strong>اللون:</strong> ${orderData.color}</p>
        <p><strong>الكمية:</strong> ${orderData.quantity}</p>
        <p><strong>السعر النهائي:</strong> ${orderData.finalPrice} درهم</p>
        <p><strong>الاسم:</strong> ${orderData.fullName}</p>
        <p><strong>الهاتف:</strong> ${orderData.phone}</p>
    `;
    
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('show');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('confirmationModal');
    if (event.target === modal) {
        closeModal();
    }
}
