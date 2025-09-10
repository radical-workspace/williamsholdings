// Sample transaction data
const transactions = [
    {
        id: 1,
        type: 'income',
        description: 'Salary Deposit',
        amount: 5500.00,
        date: '2024-08-10',
        status: 'completed'
    },
    {
        id: 2,
        type: 'expense',
        description: 'Grocery Store',
        amount: -125.50,
        date: '2024-08-09',
        status: 'completed'
    },
    {
        id: 3,
        type: 'transfer',
        description: 'Transfer to Savings',
        amount: -1000.00,
        date: '2024-08-08',
        status: 'completed'
    },
    {
        id: 4,
        type: 'expense',
        description: 'Gas Station',
        amount: -65.00,
        date: '2024-08-07',
        status: 'completed'
    },
    {
        id: 5,
        type: 'income',
        description: 'Freelance Payment',
        amount: 750.00,
        date: '2024-08-06',
        status: 'completed'
    },
    {
        id: 6,
        type: 'expense',
        description: 'Restaurant',
        amount: -85.25,
        date: '2024-08-05',
        status: 'completed'
    },
    {
        id: 7,
        type: 'transfer',
        description: 'International Wire',
        amount: -2500.00,
        date: '2024-08-04',
        status: 'pending'
    },
    {
        id: 8,
        type: 'income',
        description: 'Investment Return',
        amount: 320.75,
        date: '2024-08-03',
        status: 'completed'
    }
];

// DOM Elements
let currentSection = 'home';
let currentTransferType = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadTransactions();
});

function initializeApp() {
    // Show home section by default
    showSection('home');
    
    // Add click handlers to navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (!item.classList.contains('logout')) {
            item.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                if (section) {
                    showSection(section);
                    updateActiveNav(this);
                }
            });
        }
    });
}

function setupEventListeners() {
    // Local transfer form
    const localTransferForm = document.getElementById('local-transfer');
    if (localTransferForm) {
        localTransferForm.addEventListener('submit', handleLocalTransfer);
    }
    
    // International transfer form
    const intlTransferForm = document.getElementById('international-transfer');
    if (intlTransferForm) {
        intlTransferForm.addEventListener('submit', handleInternationalTransfer);
    }
    
    // Transaction filter
    const transactionFilter = document.getElementById('transaction-filter');
    if (transactionFilter) {
        transactionFilter.addEventListener('change', filterTransactions);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('imf-modal');
        if (event.target === modal) {
            closeIMFModal();
        }
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        currentSection = sectionId;
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });
}

function updateActiveNav(activeItem) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
}

function loadTransactions() {
    loadRecentTransactions();
    loadAllTransactions();
}

function loadRecentTransactions() {
    const container = document.getElementById('recent-transactions');
    if (!container) return;
    
    const recentTransactions = transactions.slice(0, 3);
    container.innerHTML = '';
    
    recentTransactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        container.appendChild(transactionElement);
    });
}

function loadAllTransactions() {
    const container = document.getElementById('all-transactions');
    if (!container) return;
    
    container.innerHTML = '';
    
    transactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        container.appendChild(transactionElement);
    });
}

function createTransactionElement(transaction) {
    const element = document.createElement('div');
    element.className = 'transaction-item';
    
    const isPositive = transaction.amount > 0;
    const amountClass = isPositive ? 'positive' : 'negative';
    const iconClass = transaction.type;
    const amountPrefix = isPositive ? '+' : '';
    
    element.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-icon ${iconClass}">
                <i class="fas ${getTransactionIcon(transaction.type)}"></i>
            </div>
            <div class="transaction-details">
                <h4>${transaction.description}</h4>
                <p>${formatDate(transaction.date)} • ${transaction.status}</p>
            </div>
        </div>
        <div class="transaction-amount ${amountClass}">
            ${amountPrefix}$${Math.abs(transaction.amount).toFixed(2)}
        </div>
    `;
    
    return element;
}

function getTransactionIcon(type) {
    switch (type) {
        case 'income':
            return 'fa-arrow-down';
        case 'expense':
            return 'fa-arrow-up';
        case 'transfer':
            return 'fa-exchange-alt';
        default:
            return 'fa-circle';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function filterTransactions() {
    const filter = document.getElementById('transaction-filter').value;
    const container = document.getElementById('all-transactions');
    
    if (!container) return;
    
    let filteredTransactions = transactions;
    
    if (filter !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === filter);
    }
    
    container.innerHTML = '';
    
    filteredTransactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        container.appendChild(transactionElement);
    });
}

function showTransferType(type) {
    // Hide all transfer forms
    const forms = document.querySelectorAll('.transfer-form');
    forms.forEach(form => {
        form.style.display = 'none';
    });
    
    // Show selected form
    const selectedForm = document.getElementById(`${type}-transfer-form`);
    if (selectedForm) {
        selectedForm.style.display = 'block';
        currentTransferType = type;
    }
}

function handleLocalTransfer(event) {
    event.preventDefault();
    
    const formData = {
        account: document.getElementById('local-account').value,
        name: document.getElementById('local-name').value,
        amount: parseFloat(document.getElementById('local-amount').value),
        description: document.getElementById('local-description').value
    };
    
    if (validateLocalTransfer(formData)) {
        processTransfer('local', formData);
    }
}

function handleInternationalTransfer(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('intl-name').value,
        iban: document.getElementById('intl-iban').value,
        swift: document.getElementById('intl-swift').value,
        bank: document.getElementById('intl-bank').value,
        amount: parseFloat(document.getElementById('intl-amount').value),
        purpose: document.getElementById('intl-purpose').value
    };
    
    if (validateInternationalTransfer(formData)) {
        // International transfers require IMF code for amounts over $1000
        if (formData.amount > 1000) {
            showIMFModal(formData);
        } else {
            processTransfer('international', formData);
        }
    }
}

function validateLocalTransfer(data) {
    if (!data.account || !data.name || !data.amount || data.amount <= 0) {
        showMessage('Please fill in all required fields with valid values.', 'error');
        return false;
    }
    
    if (data.amount > 50000) {
        showMessage('Local transfers are limited to $50,000 per transaction.', 'error');
        return false;
    }
    
    return true;
}

function validateInternationalTransfer(data) {
    if (!data.name || !data.iban || !data.swift || !data.bank || !data.amount || !data.purpose || data.amount <= 0) {
        showMessage('Please fill in all required fields with valid values.', 'error');
        return false;
    }
    
    if (data.amount > 100000) {
        showMessage('International transfers are limited to $100,000 per transaction.', 'error');
        return false;
    }
    
    // Basic IBAN validation (simplified)
    if (data.iban.length < 15) {
        showMessage('Please enter a valid IBAN.', 'error');
        return false;
    }
    
    // Basic SWIFT validation (simplified)
    if (data.swift.length < 8) {
        showMessage('Please enter a valid SWIFT code.', 'error');
        return false;
    }
    
    return true;
}

function processTransfer(type, data) {
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    submitBtn.disabled = true;
    
    // Simulate processing delay
    setTimeout(() => {
        // Add transaction to the list
        const newTransaction = {
            id: transactions.length + 1,
            type: 'transfer',
            description: type === 'local' ? `Transfer to ${data.name}` : `International Wire to ${data.name}`,
            amount: -data.amount,
            date: new Date().toISOString().split('T')[0],
            status: type === 'local' ? 'completed' : 'pending'
        };
        
        transactions.unshift(newTransaction);
        
        // Reload transactions
        loadTransactions();
        
        // Show success message
        showMessage(`${type === 'local' ? 'Local' : 'International'} transfer of $${data.amount.toFixed(2)} initiated successfully!`, 'success');
        
        // Reset form
        document.getElementById(`${type}-transfer`).reset();
        
        // Hide form
        document.getElementById(`${type}-transfer-form`).style.display = 'none';
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Update balance (simulate)
        updateBalance();
        
    }, 2000);
}

function showIMFModal(transferData) {
    const modal = document.getElementById('imf-modal');
    modal.style.display = 'block';
    
    // Store transfer data for later use
    modal.transferData = transferData;
}

function closeIMFModal() {
    const modal = document.getElementById('imf-modal');
    modal.style.display = 'none';
    document.getElementById('imf-code').value = '';
}

function verifyIMFCode() {
    const imfCode = document.getElementById('imf-code').value;
    const modal = document.getElementById('imf-modal');
    
    if (!imfCode) {
        showMessage('Please enter your IMF code.', 'error');
        return;
    }
    
    // Simulate IMF code verification
    if (imfCode.length >= 6) {
        // Close modal
        closeIMFModal();
        
        // Process the transfer
        const transferData = modal.transferData;
        processTransfer('international', transferData);
        
        showMessage('IMF code verified successfully. Processing international transfer...', 'success');
    } else {
        showMessage('Invalid IMF code. Please contact customer support for assistance.', 'error');
    }
}

function updateBalance() {
    // Simulate balance update
    const balanceElement = document.querySelector('.balance-amount');
    if (balanceElement) {
        const currentBalance = parseFloat(balanceElement.textContent.replace('$', '').replace(',', ''));
        // This is just for demonstration - in a real app, balance would come from the server
        balanceElement.textContent = `$${currentBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type} show`;
    messageElement.textContent = message;
    
    // Insert at the top of the current section
    const currentSectionElement = document.querySelector('.content-section.active');
    if (currentSectionElement) {
        currentSectionElement.insertBefore(messageElement, currentSectionElement.firstChild);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // In a real application, this would clear session data and redirect to login
        showMessage('Logging out...', 'success');
        setTimeout(() => {
            alert('Thank you for using Williams Holdings Online Banking!');
            // Simulate redirect to login page
            location.reload();
        }, 1500);
    }
}

// Utility functions for demo purposes
function simulateCardFreeze() {
    const statusElement = document.querySelector('.card-status');
    const statusDot = document.querySelector('.status-dot');
    
    if (statusElement.textContent.includes('Active')) {
        statusElement.innerHTML = '<span class="status-dot" style="background: #f44336;"></span><span>Frozen</span>';
        showMessage('Card has been frozen for security.', 'success');
    } else {
        statusElement.innerHTML = '<span class="status-dot" style="background: #4caf50;"></span><span>Active</span>';
        showMessage('Card has been activated.', 'success');
    }
}

function simulateViewPIN() {
    if (confirm('Are you sure you want to view your PIN? This action will be logged for security purposes.')) {
        alert('Your PIN is: 1234\n\nFor security reasons, please memorize and never share your PIN.');
    }
}

// Add event listeners for card actions
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for card action buttons
    const cardActionButtons = document.querySelectorAll('.card-actions .action-btn');
    cardActionButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            
            if (buttonText.includes('Freeze') || buttonText.includes('Active')) {
                simulateCardFreeze();
            } else if (buttonText.includes('View PIN')) {
                simulateViewPIN();
            } else if (buttonText.includes('Settings')) {
                showSection('settings');
            }
        });
    });
});

// Handle responsive navigation
function toggleMobileNav() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('mobile-open');
}

// Add some animation delays for better UX
function animateIn(element, delay = 0) {
    setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 50);
    }, delay);
}

// Initialize animations when sections are shown
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        currentSection = sectionId;
        
        // Animate cards in the section
        const cards = selectedSection.querySelectorAll('.card');
        cards.forEach((card, index) => {
            animateIn(card, index * 100);
        });
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });
}

// Demo data loading
function loadDemoData() {
    // This function can be used to load additional demo data
    console.log('Demo data loaded');
}

// Initialize demo data
document.addEventListener('DOMContentLoaded', loadDemoData);